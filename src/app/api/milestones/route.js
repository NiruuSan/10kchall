import { supabase } from '@/lib/supabase'
import { FOLLOWER_MILESTONES } from '@/lib/milestones'

// Get recent milestones
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const hours = parseInt(searchParams.get('hours') || '168') // Default 7 days
    
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - hours)
    
    const { data, error } = await supabase
      .from('milestones')
      .select(`
        *,
        participants (name, username, avatar)
      `)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return Response.json({ milestones: data || [] })
  } catch (error) {
    console.error('GET milestones error:', error)
    return Response.json({ milestones: [] })
  }
}

// Record a new milestone
export async function POST(request) {
  try {
    const body = await request.json()
    const { participantId, type, value, label } = body
    
    // Check if this milestone already exists
    const { data: existing } = await supabase
      .from('milestones')
      .select('id')
      .eq('participant_id', participantId)
      .eq('type', type)
      .eq('value', value)
      .single()
    
    if (existing) {
      return Response.json({ success: true, exists: true })
    }
    
    // Insert new milestone
    const { data, error } = await supabase
      .from('milestones')
      .insert({
        participant_id: participantId,
        type,
        value,
        label
      })
      .select()
      .single()
    
    if (error) throw error
    
    return Response.json({ success: true, milestone: data })
  } catch (error) {
    console.error('POST milestone error:', error)
    return Response.json({ error: 'Failed to record milestone' }, { status: 500 })
  }
}

// Check and record milestones for a participant
export async function PUT(request) {
  try {
    const body = await request.json()
    const { participantId, participantName, followers, previousFollowers = 0 } = body
    
    const newMilestones = []
    
    // Check follower milestones
    for (const milestone of FOLLOWER_MILESTONES) {
      if (followers >= milestone.count && previousFollowers < milestone.count) {
        // Check if already recorded
        const { data: existing } = await supabase
          .from('milestones')
          .select('id')
          .eq('participant_id', participantId)
          .eq('type', 'follower')
          .eq('value', milestone.count)
          .single()
        
        if (!existing) {
          const { data } = await supabase
            .from('milestones')
            .insert({
              participant_id: participantId,
              type: 'follower',
              value: milestone.count,
              label: milestone.label
            })
            .select()
            .single()
          
          if (data) {
            newMilestones.push({
              ...data,
              participantName
            })
          }
        }
      }
    }
    
    return Response.json({ success: true, newMilestones })
  } catch (error) {
    console.error('PUT milestones error:', error)
    return Response.json({ error: 'Failed to check milestones' }, { status: 500 })
  }
}
