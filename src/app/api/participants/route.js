import { supabase } from '@/lib/supabase'
import { ACHIEVEMENTS, calculateXP, getRank, checkAchievements } from '@/lib/achievements'

// Helper to enrich participant with XP and rank
function enrichParticipant(participant, unlockedIds = [], gains = null) {
  const xp = calculateXP(participant, unlockedIds)
  const rank = getRank(xp)
  return {
    ...participant,
    xp,
    rank: rank.id,
    rankName: rank.name,
    rankColor: rank.color,
    unlockedAchievements: unlockedIds,
    gains: gains || { daily: 0, weekly: 0, monthly: 0 }
  }
}

// Calculate gains for a participant based on snapshots
async function calculateGains(participantId, currentFollowers) {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  // Get the oldest snapshot within each time period
  const { data: snapshots } = await supabase
    .from('stats_snapshots')
    .select('followers, recorded_at')
    .eq('participant_id', participantId)
    .order('recorded_at', { ascending: true })
  
  if (!snapshots || snapshots.length === 0) {
    return { daily: 0, weekly: 0, monthly: 0 }
  }
  
  // Find closest snapshot to each time boundary
  let dailyBase = currentFollowers
  let weeklyBase = currentFollowers
  let monthlyBase = currentFollowers
  
  for (const snap of snapshots) {
    const snapDate = new Date(snap.recorded_at)
    if (snapDate <= oneDayAgo) dailyBase = snap.followers
    if (snapDate <= oneWeekAgo) weeklyBase = snap.followers
    if (snapDate <= oneMonthAgo) monthlyBase = snap.followers
  }
  
  // If no snapshot older than time period, use first available
  const firstSnapshot = snapshots[0]
  const firstDate = new Date(firstSnapshot.recorded_at)
  
  if (firstDate > oneDayAgo) dailyBase = firstSnapshot.followers
  if (firstDate > oneWeekAgo) weeklyBase = firstSnapshot.followers
  if (firstDate > oneMonthAgo) monthlyBase = firstSnapshot.followers
  
  return {
    daily: currentFollowers - dailyBase,
    weekly: currentFollowers - weeklyBase,
    monthly: currentFollowers - monthlyBase
  }
}

// Record a snapshot for a participant
async function recordSnapshot(participantId, followers, likes, videos) {
  try {
    // Check if we already have a snapshot today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data: existing } = await supabase
      .from('stats_snapshots')
      .select('id')
      .eq('participant_id', participantId)
      .gte('recorded_at', today.toISOString())
      .limit(1)
    
    if (existing && existing.length > 0) {
      // Update today's snapshot
      await supabase
        .from('stats_snapshots')
        .update({ followers, likes, videos, recorded_at: new Date().toISOString() })
        .eq('id', existing[0].id)
    } else {
      // Create new snapshot
      await supabase
        .from('stats_snapshots')
        .insert({
          participant_id: participantId,
          followers,
          likes,
          videos,
          recorded_at: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Failed to record snapshot:', error)
  }
}

// Auto-unlock achievements for a participant
async function unlockAchievements(participantId, participant) {
  const qualifiedIds = checkAchievements(participant)
  
  if (qualifiedIds.length === 0) return []
  
  // Get already unlocked achievements
  const { data: existing } = await supabase
    .from('participant_achievements')
    .select('achievement_id')
    .eq('participant_id', participantId)
  
  const existingIds = (existing || []).map(e => e.achievement_id)
  const newIds = qualifiedIds.filter(id => !existingIds.includes(id))
  
  // Insert new achievements
  if (newIds.length > 0) {
    const inserts = newIds.map(achievement_id => ({
      participant_id: participantId,
      achievement_id
    }))
    
    await supabase.from('participant_achievements').insert(inserts)
  }
  
  return [...existingIds, ...newIds]
}

export async function GET() {
  try {
    // Fetch participants
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .order('followers', { ascending: false })
    
    if (participantsError) throw participantsError
    
    // Fetch all unlocked achievements
    const { data: allUnlocked } = await supabase
      .from('participant_achievements')
      .select('participant_id, achievement_id')
    
    // Group achievements by participant
    const achievementsByParticipant = {}
    for (const item of (allUnlocked || [])) {
      if (!achievementsByParticipant[item.participant_id]) {
        achievementsByParticipant[item.participant_id] = []
      }
      achievementsByParticipant[item.participant_id].push(item.achievement_id)
    }
    
    // Enrich participants with XP, rank, and gains
    const enrichedParticipants = await Promise.all(
      (participants || []).map(async (p) => {
        const gains = await calculateGains(p.id, p.followers)
        return enrichParticipant(p, achievementsByParticipant[p.id] || [], gains)
      })
    )
    
    // Sort by XP (descending)
    enrichedParticipants.sort((a, b) => b.xp - a.xp)
    
    // Fetch settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
    
    const settingsObj = (settings || []).reduce((acc, { key, value }) => {
      acc[key] = key === 'goal' ? parseInt(value) : value
      return acc
    }, {})
    
    return Response.json({
      goal: settingsObj.goal || 10000,
      challengeStartDate: settingsObj.challengeStartDate || '2026-02-07',
      participants: enrichedParticipants
    })
  } catch (error) {
    console.error('GET error:', error)
    return Response.json({ error: 'Failed to load data' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { participantId, followers, likes, videos, avatar, max_video_views } = body
    
    const updates = {}
    if (followers !== undefined) updates.followers = followers
    if (likes !== undefined) updates.likes = likes
    if (videos !== undefined) updates.videos = videos
    if (avatar !== undefined) updates.avatar = avatar
    if (max_video_views !== undefined) updates.max_video_views = max_video_views
    updates.updated_at = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('participants')
      .update(updates)
      .eq('id', participantId)
      .select()
      .single()
    
    if (error) throw error
    
    // Record snapshot for history tracking
    await recordSnapshot(participantId, data.followers, data.likes, data.videos)
    
    // Auto-unlock achievements
    const unlockedIds = await unlockAchievements(participantId, data)
    
    // Calculate gains
    const gains = await calculateGains(participantId, data.followers)
    
    return Response.json({ 
      success: true, 
      participant: enrichParticipant(data, unlockedIds, gains)
    })
  } catch (error) {
    console.error('PUT error:', error)
    return Response.json({ error: 'Failed to update data' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, username, followers = 0, likes = 0, videos = 0, avatar = null, max_video_views = 0 } = body
    
    // Check if username already exists
    const { data: existing } = await supabase
      .from('participants')
      .select('id')
      .ilike('username', username)
      .single()
    
    if (existing) {
      return Response.json({ error: 'This TikTok account is already added' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('participants')
      .insert({
        name,
        username,
        avatar,
        followers,
        likes,
        videos,
        max_video_views
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Record initial snapshot
    await recordSnapshot(data.id, data.followers, data.likes, data.videos)
    
    // Auto-unlock achievements
    const unlockedIds = await unlockAchievements(data.id, data)
    
    return Response.json({ 
      success: true, 
      participant: enrichParticipant(data, unlockedIds, { daily: 0, weekly: 0, monthly: 0 })
    })
  } catch (error) {
    console.error('POST error:', error)
    return Response.json({ error: 'Failed to add participant' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('id')
    
    // Delete achievements first (foreign key)
    await supabase
      .from('participant_achievements')
      .delete()
      .eq('participant_id', participantId)
    
    // Delete snapshots
    await supabase
      .from('stats_snapshots')
      .delete()
      .eq('participant_id', participantId)
    
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', participantId)
    
    if (error) throw error
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('DELETE error:', error)
    return Response.json({ error: 'Failed to delete participant' }, { status: 500 })
  }
}
