'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Leaderboard from '@/components/Leaderboard'
import StatsGrid from '@/components/StatsGrid'
import MilestoneToast from '@/components/MilestoneToast'
import ActivityFeed from '@/components/ActivityFeed'
import ThemeToggle from '@/components/ThemeToggle'

export default function Home() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Try to auto-refresh first, then fetch data
    tryAutoRefresh()
  }, [])

  const tryAutoRefresh = async () => {
    try {
      // Check if we can refresh
      const statusRes = await fetch('/api/auto-refresh')
      const status = await statusRes.json()
      
      console.log('Auto-refresh status:', status)
      
      if (status.canRefresh) {
        setRefreshing(true)
        console.log('Starting auto-refresh...')
        // Trigger refresh
        const refreshRes = await fetch('/api/auto-refresh', { method: 'POST' })
        const refreshResult = await refreshRes.json()
        console.log('Auto-refresh result:', refreshResult)
      } else {
        console.log('Auto-refresh on cooldown, remaining:', status.remainingMinutes, 'minutes')
      }
    } catch (error) {
      console.error('Auto-refresh check failed:', error)
    } finally {
      setRefreshing(false)
      // Always fetch data after refresh attempt
      fetchData()
      fetchRecentMilestones()
    }
  }

  const fetchData = async () => {
    try {
      const res = await fetch('/api/participants')
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentMilestones = async () => {
    try {
      const res = await fetch('/api/milestones')
      const json = await res.json()
      
      // Get already shown notifications from session storage
      const shownIds = JSON.parse(sessionStorage.getItem('shownNotifications') || '[]')
      
      // Convert milestones to notifications (show only ones from last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const recentMilestones = (json.milestones || [])
        .filter(m => new Date(m.created_at) > oneHourAgo)
        .filter(m => !shownIds.includes(m.id)) // Filter out already shown
        .slice(0, 3) // Only show up to 3
      
      const newNotifications = recentMilestones.map(m => ({
        id: m.id,
        type: m.type,
        title: m.type === 'follower' 
          ? `${m.participants?.name || 'Someone'} hit ${m.label}!`
          : m.type === 'achievement'
          ? `${m.participants?.name || 'Someone'} unlocked an achievement!`
          : `${m.participants?.name || 'Someone'} ranked up!`,
        message: m.type === 'follower'
          ? `@${m.participants?.username || 'unknown'} reached a new milestone`
          : m.label
      }))
      
      // Mark these as shown in session storage
      if (newNotifications.length > 0) {
        const newShownIds = [...shownIds, ...newNotifications.map(n => n.id)]
        sessionStorage.setItem('shownNotifications', JSON.stringify(newShownIds))
      }
      
      setNotifications(newNotifications)
    } catch (error) {
      console.error('Failed to fetch milestones:', error)
    }
  }

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-700 border-t-zinc-400"></div>
        {refreshing && (
          <p className="text-zinc-500 text-sm animate-pulse">Refreshing stats...</p>
        )}
      </div>
    )
  }

  const { participants = [], goal = 10000, challengeStartDate = '2026-02-07', lastUpdated } = data || {}
  
  // Format relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }
  
  // Calculate total stats
  const totalFollowers = participants.reduce((sum, p) => sum + p.followers, 0)
  const totalLikes = participants.reduce((sum, p) => sum + p.likes, 0)
  const totalVideos = participants.reduce((sum, p) => sum + p.videos, 0)
  
  // Participants are already sorted by followers from the API
  const leader = participants[0]

  // Empty state
  if (participants.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 text-center">
          <span className="text-zinc-900 dark:text-white">10K</span>
          <span className="text-zinc-400 dark:text-zinc-500"> Challenge</span>
        </h1>
        <p className="text-zinc-500 mb-8 text-center">Race to 10,000 TikTok followers</p>
        <Link 
          href="/admin"
          className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
        >
          Add Participants
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Milestone Notifications */}
      <MilestoneToast 
        notifications={notifications} 
        onDismiss={dismissNotification} 
      />
      
      <div className="animate-fade-in-down">
        <Header goal={goal} leader={leader} />
      </div>
      
      {/* Stats Overview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 animate-fade-in-up animate-delay-1">
        <StatsGrid 
          totalFollowers={totalFollowers}
          totalLikes={totalLikes}
          totalVideos={totalVideos}
          participantCount={participants.length}
        />
      </section>
      
      {/* Leaderboard & Activity Feed */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 animate-fade-in-up animate-delay-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Leaderboard</h2>
          <div className="flex items-center gap-4">
            <Link 
              href="/stats"
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm transition-colors"
            >
              Stats
            </Link>
            <Link 
              href="/achievements"
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm transition-colors"
            >
              Achievements
            </Link>
            <Link 
              href="/admin"
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm transition-colors"
            >
              Manage
            </Link>
            <ThemeToggle />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard - takes 2 columns on large screens */}
          <div className="lg:col-span-2 animate-fade-in-up animate-delay-3">
            <Leaderboard participants={participants} goal={goal} />
          </div>
          
          {/* Activity Feed - takes 1 column on large screens */}
          <div className="lg:col-span-1 animate-fade-in-up animate-delay-4">
            <ActivityFeed />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center text-zinc-500 dark:text-zinc-600 text-sm space-y-1 animate-fade-in animate-delay-5">
        {lastUpdated && (
          <p className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Stats updated {getRelativeTime(lastUpdated)}
          </p>
        )}
        <p>Started {new Date(challengeStartDate).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })}</p>
      </footer>
    </main>
  )
}
