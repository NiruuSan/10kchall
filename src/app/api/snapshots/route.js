import { supabase } from '@/lib/supabase'

// Record a snapshot for a participant
export async function POST(request) {
  try {
    const body = await request.json()
    const { participantId, followers, likes, videos } = body
    
    const { data, error } = await supabase
      .from('stats_snapshots')
      .insert({
        participant_id: participantId,
        followers,
        likes,
        videos,
        recorded_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    
    return Response.json({ success: true, snapshot: data })
  } catch (error) {
    console.error('POST snapshot error:', error)
    return Response.json({ error: 'Failed to record snapshot' }, { status: 500 })
  }
}

// Get snapshots for a participant (for charts)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('participantId')
    const days = parseInt(searchParams.get('days') || '30')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    let query = supabase
      .from('stats_snapshots')
      .select('*')
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: true })
    
    if (participantId) {
      query = query.eq('participant_id', participantId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return Response.json({ snapshots: data || [] })
  } catch (error) {
    console.error('GET snapshots error:', error)
    return Response.json({ error: 'Failed to fetch snapshots' }, { status: 500 })
  }
}
