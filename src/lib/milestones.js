// Follower milestones to track
export const FOLLOWER_MILESTONES = [
  { count: 100, label: '100 followers' },
  { count: 500, label: '500 followers' },
  { count: 1000, label: '1K followers' },
  { count: 2500, label: '2.5K followers' },
  { count: 5000, label: '5K followers' },
  { count: 7500, label: '7.5K followers' },
  { count: 10000, label: '10K followers' },
]

// Check which follower milestones have been reached
export function getReachedMilestones(followers) {
  return FOLLOWER_MILESTONES.filter(m => followers >= m.count)
}

// Check for new milestones since last check
export function checkNewMilestones(currentFollowers, previousFollowers) {
  const currentMilestones = getReachedMilestones(currentFollowers)
  const previousMilestones = getReachedMilestones(previousFollowers)
  
  return currentMilestones.filter(
    m => !previousMilestones.some(pm => pm.count === m.count)
  )
}

// Generate notification object
export function createNotification(type, title, message) {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString()
  }
}
