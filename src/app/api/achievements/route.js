import { supabase } from '@/lib/supabase'
import { ACHIEVEMENTS } from '@/lib/achievements'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const participantId = searchParams.get('participantId')
  
  try {
    // Get all unlocked achievements
    let unlockedMap = {}
    
    if (participantId) {
      // Get unlocked for specific participant
      const { data } = await supabase
        .from('participant_achievements')
        .select('achievement_id, unlocked_at')
        .eq('participant_id', participantId)
      
      for (const item of (data || [])) {
        unlockedMap[item.achievement_id] = item.unlocked_at
      }
    } else {
      // Get all unlocked achievements grouped by participant
      const { data } = await supabase
        .from('participant_achievements')
        .select('participant_id, achievement_id, unlocked_at')
      
      // This returns all unlocks - useful for showing who has what
      for (const item of (data || [])) {
        if (!unlockedMap[item.achievement_id]) {
          unlockedMap[item.achievement_id] = []
        }
        unlockedMap[item.achievement_id].push({
          participantId: item.participant_id,
          unlockedAt: item.unlocked_at
        })
      }
    }
    
    // Combine with achievement definitions
    const achievements = ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: participantId 
        ? !!unlockedMap[a.id] 
        : (unlockedMap[a.id] || []).length > 0,
      unlockedAt: participantId ? unlockedMap[a.id] : null,
      unlockedBy: !participantId ? (unlockedMap[a.id] || []) : undefined
    }))
    
    return Response.json({ achievements })
  } catch (error) {
    console.error('GET achievements error:', error)
    return Response.json({ error: 'Failed to load achievements' }, { status: 500 })
  }
}
