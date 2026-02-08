import { supabase } from '@/lib/supabase'
import { FOLLOWER_MILESTONES } from '@/lib/milestones'
import { checkAchievements, ACHIEVEMENTS } from '@/lib/achievements'

// Calculate gains for a participant
async function calculateGains(participantId, currentFollowers) {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const { data: snapshots } = await supabase
    .from('stats_snapshots')
    .select('followers, recorded_at')
    .eq('participant_id', participantId)
    .order('recorded_at', { ascending: true })
  
  if (!snapshots || snapshots.length === 0) {
    return { daily: 0, weekly: 0, monthly: 0 }
  }
  
  let dailyBase = currentFollowers
  let weeklyBase = currentFollowers
  
  for (const snap of snapshots) {
    const snapDate = new Date(snap.recorded_at)
    if (snapDate <= oneDayAgo) dailyBase = snap.followers
    if (snapDate <= oneWeekAgo) weeklyBase = snap.followers
  }
  
  const firstSnapshot = snapshots[0]
  const firstDate = new Date(firstSnapshot.recorded_at)
  
  if (firstDate > oneDayAgo) dailyBase = firstSnapshot.followers
  if (firstDate > oneWeekAgo) weeklyBase = firstSnapshot.followers
  
  return {
    daily: currentFollowers - dailyBase,
    weekly: currentFollowers - weeklyBase,
    monthly: 0 // Not needed for achievements
  }
}

// Vercel Cron Job - Refresh all participants
export async function GET(request) {
  try {
    // Verify cron secret (optional but recommended for security)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all participants
    const { data: participants, error: fetchError } = await supabase
      .from('participants')
      .select('*')
    
    if (fetchError) throw fetchError
    
    if (!participants || participants.length === 0) {
      return Response.json({ success: true, message: 'No participants to refresh' })
    }

    const results = []
    const updatedParticipants = []
    
    // First pass: Update all participants with TikTok data
    for (const participant of participants) {
      try {
        // Fetch TikTok data
        const tiktokRes = await fetch(`${getBaseUrl(request)}/api/tiktok?username=${encodeURIComponent(participant.username)}`)
        const tiktokJson = await tiktokRes.json()
        
        if (!tiktokJson.success) {
          results.push({ id: participant.id, username: participant.username, error: tiktokJson.error })
          updatedParticipants.push(participant) // Keep original data
          continue
        }
        
        const tiktokData = tiktokJson.data
        const previousFollowers = participant.followers
        
        // Update participant
        const updates = {
          followers: tiktokData.followers,
          likes: tiktokData.likes,
          videos: tiktokData.videos,
          avatar: tiktokData.avatar,
          max_video_views: Math.max(tiktokData.max_video_views || 0, participant.max_video_views || 0),
          updated_at: new Date().toISOString()
        }
        
        const { error: updateError } = await supabase
          .from('participants')
          .update(updates)
          .eq('id', participant.id)
        
        if (updateError) {
          results.push({ id: participant.id, username: participant.username, error: updateError.message })
          updatedParticipants.push(participant)
          continue
        }
        
        // Record snapshot for history
        await supabase
          .from('stats_snapshots')
          .insert({
            participant_id: participant.id,
            followers: tiktokData.followers,
            likes: tiktokData.likes,
            videos: tiktokData.videos,
            recorded_at: new Date().toISOString()
          })
        
        // Check for new follower milestones
        for (const milestone of FOLLOWER_MILESTONES) {
          if (tiktokData.followers >= milestone.count && previousFollowers < milestone.count) {
            const { data: existing } = await supabase
              .from('milestones')
              .select('id')
              .eq('participant_id', participant.id)
              .eq('type', 'follower')
              .eq('value', milestone.count)
              .single()
            
            if (!existing) {
              await supabase
                .from('milestones')
                .insert({
                  participant_id: participant.id,
                  type: 'follower',
                  value: milestone.count,
                  label: milestone.label
                })
            }
          }
        }
        
        // Store updated participant for second pass
        updatedParticipants.push({ ...participant, ...updates })
        
        results.push({ 
          id: participant.id, 
          username: participant.username, 
          success: true,
          followers: tiktokData.followers,
          change: tiktokData.followers - previousFollowers
        })
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (err) {
        results.push({ id: participant.id, username: participant.username, error: err.message })
        updatedParticipants.push(participant)
      }
    }
    
    // Sort participants by followers to determine positions
    updatedParticipants.sort((a, b) => b.followers - a.followers)
    
    // Get challenge start date for competition achievements
    const { data: settings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'challengeStartDate')
      .single()
    
    const challengeStartDate = settings?.value || '2026-02-07'
    
    // Second pass: Check achievements with position and gains data
    for (let i = 0; i < updatedParticipants.length; i++) {
      const participant = updatedParticipants[i]
      const position = i + 1
      
      try {
        // Calculate gains for growth achievements
        const gains = await calculateGains(participant.id, participant.followers)
        
        // Check for achievements with all data including competition requirements
        const qualifiedIds = checkAchievements(participant, { 
          gains, 
          position, 
          allParticipants: updatedParticipants, 
          challengeStartDate 
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
                  created_at: new Date().toISOString()
                })
              } catch (e) {
                // Ignore duplicate errors
              }
            }
          }
        }
      } catch (err) {
        console.error(`Failed to check achievements for ${participant.username}:`, err)
      }
    }
    
    return Response.json({ 
      success: true, 
      refreshedAt: new Date().toISOString(),
      results 
    })
    
  } catch (error) {
    console.error('Cron refresh error:', error)
    return Response.json({ error: 'Failed to refresh participants' }, { status: 500 })
  }
}

// Helper to get base URL for internal API calls
function getBaseUrl(request) {
  const host = request.headers.get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

// Configure as edge function with longer timeout for cron
export const maxDuration = 60 // 60 seconds max (Vercel Pro) or 10 seconds (Hobby)
