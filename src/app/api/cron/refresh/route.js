import { supabase } from '@/lib/supabase'
import { FOLLOWER_MILESTONES } from '@/lib/milestones'
import { checkAchievements } from '@/lib/achievements'

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
    
    for (const participant of participants) {
      try {
        // Fetch TikTok data
        const tiktokRes = await fetch(`${getBaseUrl(request)}/api/tiktok?username=${encodeURIComponent(participant.username)}`)
        const tiktokJson = await tiktokRes.json()
        
        if (!tiktokJson.success) {
          results.push({ id: participant.id, username: participant.username, error: tiktokJson.error })
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
            // Check if already recorded
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
        
        // Check for new achievements
        const qualifiedIds = checkAchievements({ ...participant, ...updates })
        
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
        }
        
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
