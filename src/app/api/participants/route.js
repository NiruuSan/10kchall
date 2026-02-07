import { supabase } from '@/lib/supabase'
import { ACHIEVEMENTS, calculateXP, getRank, checkAchievements } from '@/lib/achievements'

// Helper to enrich participant with XP and rank
function enrichParticipant(participant, unlockedIds = []) {
  const xp = calculateXP(participant, unlockedIds)
  const rank = getRank(xp)
  return {
    ...participant,
    xp,
    rank: rank.id,
    rankName: rank.name,
    rankColor: rank.color,
    unlockedAchievements: unlockedIds
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
    
    // Enrich participants with XP and rank
    const enrichedParticipants = (participants || []).map(p => 
      enrichParticipant(p, achievementsByParticipant[p.id] || [])
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
      challengeStartDate: settingsObj.challengeStartDate || '2026-01-24',
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
    
    // Auto-unlock achievements
    const unlockedIds = await unlockAchievements(participantId, data)
    
    return Response.json({ 
      success: true, 
      participant: enrichParticipant(data, unlockedIds)
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
    
    // Auto-unlock achievements
    const unlockedIds = await unlockAchievements(data.id, data)
    
    return Response.json({ 
      success: true, 
      participant: enrichParticipant(data, unlockedIds)
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
