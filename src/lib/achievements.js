// Achievement definitions
export const ACHIEVEMENTS = [
  // Follower milestones
  { id: 'followers_100', name: 'First Steps', description: 'Reach 100 followers', xp_reward: 500, icon: '👣', category: 'followers', threshold: 100 },
  { id: 'followers_500', name: 'Getting Traction', description: 'Reach 500 followers', xp_reward: 1000, icon: '📈', category: 'followers', threshold: 500 },
  { id: 'followers_1k', name: 'Thousand Club', description: 'Reach 1,000 followers', xp_reward: 2000, icon: '🎯', category: 'followers', threshold: 1000 },
  { id: 'followers_5k', name: 'Rising Star', description: 'Reach 5,000 followers', xp_reward: 5000, icon: '⭐', category: 'followers', threshold: 5000 },
  { id: 'followers_10k', name: 'The Goal', description: 'Reach 10,000 followers', xp_reward: 10000, icon: '🏆', category: 'followers', threshold: 10000 },
  
  // Likes milestones
  { id: 'likes_10k', name: 'Heart Collector', description: 'Reach 10,000 total likes', xp_reward: 2000, icon: '❤️', category: 'likes', threshold: 10000 },
  { id: 'likes_100k', name: 'Love Magnet', description: 'Reach 100,000 total likes', xp_reward: 5000, icon: '💕', category: 'likes', threshold: 100000 },
  { id: 'likes_1m', name: 'Million Hearts', description: 'Reach 1,000,000 total likes', xp_reward: 10000, icon: '💖', category: 'likes', threshold: 1000000 },
  
  // Video milestones
  { id: 'videos_10', name: 'Content Machine', description: 'Post 10 videos', xp_reward: 1000, icon: '🎬', category: 'videos', threshold: 10 },
  { id: 'videos_50', name: 'Prolific Creator', description: 'Post 50 videos', xp_reward: 5000, icon: '🎥', category: 'videos', threshold: 50 },
  
  // Views milestones (best video)
  { id: 'views_100k', name: 'Viral Moment', description: 'Get a video with 100K+ views', xp_reward: 3000, icon: '🔥', category: 'views', threshold: 100000 },
  { id: 'views_1m', name: 'Million Club', description: 'Get a video with 1M+ views', xp_reward: 10000, icon: '🚀', category: 'views', threshold: 1000000 },
  { id: 'views_10m', name: 'Internet Famous', description: 'Get a video with 10M+ views', xp_reward: 25000, icon: '👑', category: 'views', threshold: 10000000 },
]

// Rank definitions (sorted by minXP ascending)
export const RANKS = [
  { id: 'iron', name: 'Iron', minXP: 0, color: '#71717a', bgColor: 'bg-zinc-500', textColor: 'text-zinc-400' },
  { id: 'bronze', name: 'Bronze', minXP: 1000, color: '#cd7f32', bgColor: 'bg-amber-700', textColor: 'text-amber-600' },
  { id: 'silver', name: 'Silver', minXP: 5000, color: '#c0c0c0', bgColor: 'bg-gray-400', textColor: 'text-gray-300' },
  { id: 'gold', name: 'Gold', minXP: 15000, color: '#ffd700', bgColor: 'bg-yellow-500', textColor: 'text-yellow-400' },
  { id: 'platinum', name: 'Platinum', minXP: 35000, color: '#06b6d4', bgColor: 'bg-cyan-500', textColor: 'text-cyan-400' },
  { id: 'diamond', name: 'Diamond', minXP: 75000, color: '#3b82f6', bgColor: 'bg-blue-500', textColor: 'text-blue-400' },
  { id: 'goat', name: 'GOAT', minXP: 150000, color: '#a855f7', bgColor: 'bg-purple-500', textColor: 'text-purple-400' },
]

// Get rank from XP
export function getRank(xp) {
  // Find the highest rank the user qualifies for
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) {
      return RANKS[i]
    }
  }
  return RANKS[0] // Default to Iron
}

// Get next rank info
export function getNextRank(xp) {
  const currentRank = getRank(xp)
  const currentIndex = RANKS.findIndex(r => r.id === currentRank.id)
  
  if (currentIndex >= RANKS.length - 1) {
    return null // Already at max rank
  }
  
  const nextRank = RANKS[currentIndex + 1]
  const xpNeeded = nextRank.minXP - xp
  const progress = ((xp - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100
  
  return {
    rank: nextRank,
    xpNeeded,
    progress: Math.min(100, Math.max(0, progress))
  }
}

// Calculate total XP from stats and achievements
export function calculateXP(participant, unlockedAchievementIds = []) {
  // Base XP from followers (1:1)
  let xp = participant.followers || 0
  
  // Add XP from unlocked achievements
  for (const achievementId of unlockedAchievementIds) {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (achievement) {
      xp += achievement.xp_reward
    }
  }
  
  return xp
}

// Check which achievements a participant qualifies for
export function checkAchievements(participant) {
  const qualified = []
  
  for (const achievement of ACHIEVEMENTS) {
    let value = 0
    
    switch (achievement.category) {
      case 'followers':
        value = participant.followers || 0
        break
      case 'likes':
        value = participant.likes || 0
        break
      case 'videos':
        value = participant.videos || 0
        break
      case 'views':
        value = participant.max_video_views || 0
        break
    }
    
    if (value >= achievement.threshold) {
      qualified.push(achievement.id)
    }
  }
  
  return qualified
}

// Format XP number for display
export function formatXP(xp) {
  if (xp >= 1000000) {
    return (xp / 1000000).toFixed(1) + 'M'
  }
  if (xp >= 1000) {
    return (xp / 1000).toFixed(1) + 'K'
  }
  return xp.toLocaleString()
}
