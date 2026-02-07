export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')
  
  if (!username) {
    return Response.json({ error: 'Username is required' }, { status: 400 })
  }
  
  // Clean username (remove @ if present)
  const cleanUsername = username.replace('@', '').trim()
  
  try {
    // Fetch TikTok profile page
    const response = await fetch(`https://www.tiktok.com/@${cleanUsername}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })
    
    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch TikTok profile' }, { status: 404 })
    }
    
    const html = await response.text()
    
    // Extract data from the HTML
    // TikTok embeds user data in a script tag as JSON
    const scriptMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([^<]+)<\/script>/)
    
    if (scriptMatch) {
      try {
        const jsonData = JSON.parse(scriptMatch[1])
        const userInfo = jsonData?.['__DEFAULT_SCOPE__']?.['webapp.user-detail']?.userInfo
        
        if (userInfo) {
          const stats = userInfo.stats || {}
          const user = userInfo.user || {}
          
          return Response.json({
            success: true,
            data: {
              username: user.uniqueId || cleanUsername,
              nickname: user.nickname || cleanUsername,
              followers: stats.followerCount || 0,
              likes: stats.heartCount || stats.heart || 0,
              videos: stats.videoCount || 0,
              avatar: user.avatarMedium || user.avatarThumb || null,
            }
          })
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
      }
    }
    
    // Fallback: try to extract from meta tags or other patterns
    const followerMatch = html.match(/"followerCount"\s*:\s*(\d+)/)
    const likeMatch = html.match(/"heartCount"\s*:\s*(\d+)/) || html.match(/"heart"\s*:\s*(\d+)/)
    const videoMatch = html.match(/"videoCount"\s*:\s*(\d+)/)
    const nicknameMatch = html.match(/"nickname"\s*:\s*"([^"]+)"/)
    
    if (followerMatch) {
      return Response.json({
        success: true,
        data: {
          username: cleanUsername,
          nickname: nicknameMatch ? nicknameMatch[1] : cleanUsername,
          followers: parseInt(followerMatch[1]) || 0,
          likes: likeMatch ? parseInt(likeMatch[1]) : 0,
          videos: videoMatch ? parseInt(videoMatch[1]) : 0,
          avatar: null,
        }
      })
    }
    
    return Response.json({ 
      error: 'Could not parse TikTok profile data. The account may be private or not exist.' 
    }, { status: 404 })
    
  } catch (error) {
    console.error('TikTok fetch error:', error)
    return Response.json({ 
      error: 'Failed to fetch TikTok data. Please try again or enter stats manually.' 
    }, { status: 500 })
  }
}
