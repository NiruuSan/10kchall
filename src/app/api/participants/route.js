import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Fetch participants
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .order('followers', { ascending: false })
    
    if (participantsError) throw participantsError
    
    // Fetch settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
    
    if (settingsError) throw settingsError
    
    // Convert settings array to object
    const settingsObj = settings.reduce((acc, { key, value }) => {
      acc[key] = key === 'goal' ? parseInt(value) : value
      return acc
    }, {})
    
    return Response.json({
      goal: settingsObj.goal || 10000,
      challengeStartDate: settingsObj.challengeStartDate || '2026-01-24',
      participants: participants || []
    })
  } catch (error) {
    console.error('GET error:', error)
    return Response.json({ error: 'Failed to load data' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { participantId, followers, likes, videos, avatar } = body
    
    const updates = {}
    if (followers !== undefined) updates.followers = followers
    if (likes !== undefined) updates.likes = likes
    if (videos !== undefined) updates.videos = videos
    if (avatar !== undefined) updates.avatar = avatar
    updates.updated_at = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('participants')
      .update(updates)
      .eq('id', participantId)
      .select()
      .single()
    
    if (error) throw error
    
    return Response.json({ success: true, participant: data })
  } catch (error) {
    console.error('PUT error:', error)
    return Response.json({ error: 'Failed to update data' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, username, followers = 0, likes = 0, videos = 0, avatar = null } = body
    
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
        videos
      })
      .select()
      .single()
    
    if (error) throw error
    
    return Response.json({ success: true, participant: data })
  } catch (error) {
    console.error('POST error:', error)
    return Response.json({ error: 'Failed to add participant' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('id')
    
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
