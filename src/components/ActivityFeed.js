'use client'

import { useState, useEffect } from 'react'

function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ActivityItem({ activity }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'follower':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        )
      case 'achievement':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        )
      case 'rank':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  return (
    <div className="flex items-start gap-3 py-3 stagger-item">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          <span className="font-medium text-zinc-900 dark:text-white">{activity.participantName}</span>
          {' '}{activity.message}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-0.5">{formatRelativeTime(activity.timestamp)}</p>
      </div>
    </div>
  )
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/milestones?limit=10')
      const json = await res.json()
      
      const formattedActivities = (json.milestones || []).map(m => ({
        id: m.id,
        type: m.type,
        participantName: m.participants?.name || 'Someone',
        message: getActivityMessage(m),
        timestamp: m.created_at
      }))
      
      setActivities(formattedActivities)
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityMessage = (milestone) => {
    switch (milestone.type) {
      case 'follower':
        return `reached ${milestone.label}!`
      case 'achievement':
        return `unlocked "${milestone.label}"`
      case 'rank':
        return `ranked up to ${milestone.label}!`
      default:
        return milestone.label
    }
  }

  if (loading) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div>
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Recent Activity</h3>
        <p className="text-zinc-500 dark:text-zinc-600 text-sm text-center py-6">No activity yet</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Recent Activity</h3>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
        {activities.map(activity => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  )
}
