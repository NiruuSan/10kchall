import { supabase } from '@/lib/supabase'
import { checkAchievements, ACHIEVEMENTS } from '@/lib/achievements'
import { FOLLOWER_MILESTONES } from '@/lib/milestones'

const REFRESH_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour in milliseconds

async function fetchTikTokData(username) {
  const cleanUsername = username.replace('@', '')
  const url = `https://www.tiktok.com/@${cleanUsername}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch TikTok page')
    }
    
    const html = await response.text()
    
    const scriptMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([^<]+)<\/script>/)
    
    if (!scriptMatch) {
      throw new Error('Could not find user data')
    }
    
    const jsonData = JSON.parse(scriptMatch[1])
    const userInfo = jsonData?.['__DEFAULT_SCOPE__']?.['webapp.user-detail']?.userInfo
    
    if (!userInfo) {
      throw new Error('User not found')
    }
    
    const { user, stats } = userInfo
    
    return {
      username: user.uniqueId,
      nickname: user.nickname,
      avatar: user.avatarLarger || user.avatarMedium || user.avatarThumb,
      followers: stats.followerCount || 0,
      likes: stats.heartCount || stats.heart || 0,
      videos: stats.videoCount || 0,
    }
  } catch (error) {
    console.error(`Failed to fetch TikTok data for ${username}:`, error)
    return null
  }
}

export async function POST(request) {
  try {
    // Check if refresh is allowed (cooldown check)
    const { data: lastRefreshSetting, error: settingError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'lastAutoRefresh')
      .maybeSingle() // Use maybeSingle to avoid error if not found
    
    const lastRefresh = lastRefreshSetting?.value ? new Date(lastRefreshSetting.value) : null
    const now = new Date()
    
    console.log('Auto-refresh check:', { lastRefresh: lastRefresh?.toISOString(), now: now.toISOString() })
    
    if (lastRefresh) {
      const timeSinceLastRefresh = now - lastRefresh
      console.log('Time since last refresh:', timeSinceLastRefresh, 'ms, cooldown:', REFRESH_COOLDOWN_MS, 'ms')
      
      if (timeSinceLastRefresh < REFRESH_COOLDOWN_MS) {
        const remainingMs = REFRESH_COOLDOWN_MS - timeSinceLastRefresh
        const remainingMins = Math.ceil(remainingMs / 60000)
        return Response.json({ 
          success: false, 
          reason: 'cooldown',
          message: `Refresh on cooldown. Try again in ${remainingMins} minutes.`,
          lastRefresh: lastRefresh.toISOString(),
          nextRefreshAvailable: new Date(lastRefresh.getTime() + REFRESH_COOLDOWN_MS).toISOString()
        })
      }
    }
    
    // Get all participants
    const { data: participants, error: fetchError } = await supabase
      .from('participants')
      .select('*')
    
    if (fetchError) {
      throw fetchError
    }
    
    if (!participants || participants.length === 0) {
      return Response.json({ success: true, message: 'No participants to refresh', refreshed: 0 })
    }
    
    // Update the last refresh time immediately to prevent race conditions
    // First try to update, if no rows affected, insert
    const { error: upsertError } = await supabase
      .from('settings')
      .upsert(
        { key: 'lastAutoRefresh', value: now.toISOString() },
        { onConflict: 'key' }
      )
    
    if (upsertError) {
      console.error('Failed to update lastAutoRefresh setting:', upsertError)
    } else {
      console.log('Updated lastAutoRefresh to:', now.toISOString())
    }
    
    let refreshedCount = 0
    const errors = []
    
    // Refresh each participant
    for (const participant of participants) {
      try {
        const tiktokData = await fetchTikTokData(participant.username)
        
        if (!tiktokData) {
          errors.push(`Failed to fetch data for ${participant.username}`)
          continue
        }
        
        const previousFollowers = participant.followers
        
        // Update participant (preserve max_video_views - it's manually entered)
        const { error: updateError } = await supabase
          .from('participants')
          .update({
            avatar: tiktokData.avatar,
            followers: tiktokData.followers,
            likes: tiktokData.likes,
            videos: tiktokData.videos,
            updated_at: now.toISOString()
          })
          .eq('id', participant.id)
        
        if (updateError) {
          errors.push(`Failed to update ${participant.username}: ${updateError.message}`)
          continue
        }
        
        // Record snapshot
        await supabase.from('stats_snapshots').insert({
          participant_id: participant.id,
          followers: tiktokData.followers,
          likes: tiktokData.likes,
          videos: tiktokData.videos,
          recorded_at: now.toISOString()
        })
        
        // Check for follower milestones
        for (const milestone of FOLLOWER_MILESTONES) {
          if (previousFollowers < milestone.count && tiktokData.followers >= milestone.count) {
            try {
              await supabase.from('milestones').insert({
                participant_id: participant.id,
                type: 'follower',
                value: milestone.count,
                label: milestone.label,
                created_at: now.toISOString()
              })
            } catch (e) {
              // Ignore duplicate errors
            }
          }
        }
        
        // Check for new achievements
        const qualifiedIds = checkAchievements({
          ...participant,
          followers: tiktokData.followers,
          likes: tiktokData.likes,
          videos: tiktokData.videos,
        })
        
        const { data: existingAchievements } = await supabase
          .from('participant_achievements')
          .select('achievement_id')
          .eq('participant_id', participant.id)
        
        const existingIds = (existingAchievements || []).map(e => e.achievement_id)
        const newAchievementIds = qualifiedIds.filter(id => !existingIds.includes(id))
        
        if (newAchievementIds.length > 0) {
          const inserts = newAchievementIds.map(achievement_id => ({
            participant_id: participant.id,
            achievement_id
          }))
          
          await supabase.from('participant_achievements').insert(inserts)
          
          // Record milestones for new achievements
          for (const achievementId of newAchievementIds) {
            const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
            if (achievement) {
              try {
                await supabase.from('milestones').insert({
                  participant_id: participant.id,
                  type: 'achievement',
                  value: achievement.xp_reward,
                  label: achievement.name,
                  created_at: now.toISOString()
                })
              } catch (e) {
                // Ignore duplicate errors
              }
            }
          }
        }
        
        refreshedCount++
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (err) {
        errors.push(`Error refreshing ${participant.username}: ${err.message}`)
      }
    }
    
    return Response.json({ 
      success: true, 
      message: `Refreshed ${refreshedCount} of ${participants.length} participants`,
      refreshed: refreshedCount,
      total: participants.length,
      errors: errors.length > 0 ? errors : undefined,
      lastRefresh: now.toISOString()
    })
    
  } catch (error) {
    console.error('Auto-refresh error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

// GET endpoint to check refresh status
export async function GET() {
  try {
    const { data: lastRefreshSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'lastAutoRefresh')
      .maybeSingle() // Use maybeSingle to avoid error if not found
    
    const lastRefresh = lastRefreshSetting?.value ? new Date(lastRefreshSetting.value) : null
    const now = new Date()
    
    let canRefresh = true
    let remainingMs = 0
    
    if (lastRefresh) {
      const timeSinceLastRefresh = now - lastRefresh
      if (timeSinceLastRefresh < REFRESH_COOLDOWN_MS) {
        canRefresh = false
        remainingMs = REFRESH_COOLDOWN_MS - timeSinceLastRefresh
      }
    }
    
    return Response.json({
      canRefresh,
      lastRefresh: lastRefresh?.toISOString() || null,
      nextRefreshAvailable: lastRefresh ? new Date(lastRefresh.getTime() + REFRESH_COOLDOWN_MS).toISOString() : now.toISOString(),
      remainingMinutes: canRefresh ? 0 : Math.ceil(remainingMs / 60000)
    })
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
