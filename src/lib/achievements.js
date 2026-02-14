// Achievement definitions
export const ACHIEVEMENTS = [
  // Follower milestones
  { id: 'followers_50', name: 'Baby Steps', description: 'Reach 50 followers', xp_reward: 250, icon: '👶', category: 'followers', threshold: 50 },
  { id: 'followers_100', name: 'First Steps', description: 'Reach 100 followers', xp_reward: 500, icon: '👣', category: 'followers', threshold: 100 },
  { id: 'followers_250', name: 'Quarter K', description: 'Reach 250 followers', xp_reward: 750, icon: '🔢', category: 'followers', threshold: 250 },
  { id: 'followers_500', name: 'Getting Traction', description: 'Reach 500 followers', xp_reward: 1000, icon: '📈', category: 'followers', threshold: 500 },
  { id: 'followers_750', name: 'Three Quarters', description: 'Reach 750 followers', xp_reward: 1500, icon: '📊', category: 'followers', threshold: 750 },
  { id: 'followers_1k', name: 'Thousand Club', description: 'Reach 1,000 followers', xp_reward: 2000, icon: '🎯', category: 'followers', threshold: 1000 },
  { id: 'followers_2500', name: 'Making Waves', description: 'Reach 2,500 followers', xp_reward: 3000, icon: '🌊', category: 'followers', threshold: 2500 },
  { id: 'followers_5k', name: 'Halfway There', description: 'Reach 5,000 followers', xp_reward: 5000, icon: '⭐', category: 'followers', threshold: 5000 },
  { id: 'followers_7500', name: 'So Close', description: 'Reach 7,500 followers', xp_reward: 7500, icon: '🎪', category: 'followers', threshold: 7500 },
  { id: 'followers_10k', name: 'The Goal', description: 'Reach 10,000 followers', xp_reward: 10000, icon: '🏆', category: 'followers', threshold: 10000 },
  
  // Likes milestones
  { id: 'likes_1k', name: 'First Love', description: 'Reach 1,000 total likes', xp_reward: 500, icon: '💗', category: 'likes', threshold: 1000 },
  { id: 'likes_5k', name: 'Liked', description: 'Reach 5,000 total likes', xp_reward: 1000, icon: '👍', category: 'likes', threshold: 5000 },
  { id: 'likes_10k', name: 'Heart Collector', description: 'Reach 10,000 total likes', xp_reward: 2000, icon: '❤️', category: 'likes', threshold: 10000 },
  { id: 'likes_25k', name: 'Super Liked', description: 'Reach 25,000 total likes', xp_reward: 2500, icon: '💝', category: 'likes', threshold: 25000 },
  { id: 'likes_50k', name: 'Fan Favorite', description: 'Reach 50,000 total likes', xp_reward: 3000, icon: '🥰', category: 'likes', threshold: 50000 },
  { id: 'likes_100k', name: 'Love Magnet', description: 'Reach 100,000 total likes', xp_reward: 5000, icon: '💕', category: 'likes', threshold: 100000 },
  { id: 'likes_500k', name: 'Heartbreaker', description: 'Reach 500,000 total likes', xp_reward: 7500, icon: '💘', category: 'likes', threshold: 500000 },
  { id: 'likes_1m', name: 'Million Hearts', description: 'Reach 1,000,000 total likes', xp_reward: 10000, icon: '💖', category: 'likes', threshold: 1000000 },
  
  // Video milestones
  { id: 'videos_1', name: 'First Upload', description: 'Post your first video', xp_reward: 250, icon: '🎉', category: 'videos', threshold: 1 },
  { id: 'videos_5', name: 'Warming Up', description: 'Post 5 videos', xp_reward: 500, icon: '🎞️', category: 'videos', threshold: 5 },
  { id: 'videos_10', name: 'Content Machine', description: 'Post 10 videos', xp_reward: 1000, icon: '🎬', category: 'videos', threshold: 10 },
  { id: 'videos_25', name: 'Consistent Creator', description: 'Post 25 videos', xp_reward: 2500, icon: '📹', category: 'videos', threshold: 25 },
  { id: 'videos_50', name: 'Prolific Creator', description: 'Post 50 videos', xp_reward: 5000, icon: '🎥', category: 'videos', threshold: 50 },
  { id: 'videos_100', name: 'Century', description: 'Post 100 videos', xp_reward: 10000, icon: '💯', category: 'videos', threshold: 100 },
  
  // Views milestones (best video)
  { id: 'views_1k', name: 'First Spark', description: 'Get a video with 1K+ views', xp_reward: 500, icon: '✨', category: 'views', threshold: 1000 },
  { id: 'views_10k', name: 'Getting Noticed', description: 'Get a video with 10K+ views', xp_reward: 1000, icon: '👀', category: 'views', threshold: 10000 },
  { id: 'views_100k', name: 'Viral Moment', description: 'Get a video with 100K+ views', xp_reward: 3000, icon: '🔥', category: 'views', threshold: 100000 },
  { id: 'views_500k', name: 'Going Viral', description: 'Get a video with 500K+ views', xp_reward: 5000, icon: '⚡', category: 'views', threshold: 500000 },
  { id: 'views_1m', name: 'Million Club', description: 'Get a video with 1M+ views', xp_reward: 10000, icon: '🚀', category: 'views', threshold: 1000000 },
  
  // Ratio-based achievements (likes per video)
  { id: 'ratio_100', name: 'Engaged Audience', description: 'Average 100+ likes per video', xp_reward: 2000, icon: '📊', category: 'ratio', threshold: 100 },
  { id: 'ratio_500', name: 'High Performer', description: 'Average 500+ likes per video', xp_reward: 3500, icon: '🎖️', category: 'ratio', threshold: 500 },
  { id: 'ratio_1000', name: 'Quality Creator', description: 'Average 1,000+ likes per video', xp_reward: 5000, icon: '💎', category: 'ratio', threshold: 1000 },
  
  // Growth achievements (daily gains)
  { id: 'growth_daily_50', name: 'Hot Day', description: 'Gain 50+ followers in a single day', xp_reward: 1000, icon: '☀️', category: 'growth_daily', threshold: 50 },
  { id: 'growth_daily_100', name: 'Speed Demon', description: 'Gain 100+ followers in a single day', xp_reward: 1500, icon: '⚡', category: 'growth_daily', threshold: 100 },
  { id: 'growth_daily_250', name: 'Explosive Growth', description: 'Gain 250+ followers in a single day', xp_reward: 3000, icon: '💣', category: 'growth_daily', threshold: 250 },
  { id: 'growth_weekly_250', name: 'Steady Climb', description: 'Gain 250+ followers in 7 days', xp_reward: 2000, icon: '🧗', category: 'growth_weekly', threshold: 250 },
  { id: 'growth_weekly_500', name: 'Week Warrior', description: 'Gain 500+ followers in 7 days', xp_reward: 3000, icon: '🗓️', category: 'growth_weekly', threshold: 500 },
  
  // Competition achievements
  { id: 'position_1', name: 'Frontrunner', description: 'Be #1 on the leaderboard', xp_reward: 5000, icon: '🥇', category: 'position', threshold: 1 },
  { id: 'position_top3', name: 'Podium Finish', description: 'Be in top 3 on the leaderboard', xp_reward: 2000, icon: '🏅', category: 'position', threshold: 3 },
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
// Extra params: 
//   - gains (for growth achievements)
//   - position (for leaderboard achievements)
//   - allParticipants (for competition achievements - need to check if everyone has posted)
//   - challengeStartDate (to check if 24h has passed since challenge started)
export function checkAchievements(participant, options = {}) {
  const { gains, position, allParticipants, challengeStartDate } = options
  const qualified = []
  
  for (const achievement of ACHIEVEMENTS) {
    let value = 0
    let qualifies = false
    
    switch (achievement.category) {
      case 'followers':
        value = participant.followers || 0
        qualifies = value >= achievement.threshold
        break
      case 'likes':
        value = participant.likes || 0
        qualifies = value >= achievement.threshold
        break
      case 'videos':
        value = participant.videos || 0
        qualifies = value >= achievement.threshold
        break
      case 'views':
        value = participant.max_video_views || 0
        qualifies = value >= achievement.threshold
        break
      case 'ratio':
        // Average likes per video
        if (participant.videos && participant.videos > 0) {
          value = (participant.likes || 0) / participant.videos
          qualifies = value >= achievement.threshold
        }
        break
      case 'growth_daily':
        // Check daily follower gain
        if (gains && gains.daily !== undefined) {
          value = gains.daily
          qualifies = value >= achievement.threshold
        }
        break
      case 'growth_weekly':
        // Check weekly follower gain
        if (gains && gains.weekly !== undefined) {
          value = gains.weekly
          qualifies = value >= achievement.threshold
        }
        break
      case 'position':
        // Check leaderboard position
        // Competition achievements require:
        // 1. Everyone has posted at least 1 video
        // 2. At least 24 hours have passed since challenge start
        if (position !== undefined) {
          let competitionReady = true
          
          // Check if all participants have posted at least 1 video
          if (allParticipants && allParticipants.length > 0) {
            const everyoneHasPosted = allParticipants.every(p => (p.videos || 0) >= 1)
            if (!everyoneHasPosted) {
              competitionReady = false
            }
          } else {
            // If no allParticipants data, don't unlock competition achievements yet
            competitionReady = false
          }
          
          // Check if at least 24h has passed since challenge start
          if (competitionReady && challengeStartDate) {
            const startDate = new Date(challengeStartDate)
            const now = new Date()
            const hoursSinceStart = (now - startDate) / (1000 * 60 * 60)
            if (hoursSinceStart < 24) {
              competitionReady = false
            }
          }
          
          if (competitionReady) {
            if (achievement.id === 'position_1') {
              qualifies = position === 1
            } else if (achievement.id === 'position_top3') {
              qualifies = position <= 3
            }
          }
        }
        break
    }
    
    if (qualifies) {
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
