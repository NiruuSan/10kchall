'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import RankBadge from '@/components/RankBadge'
import { formatXP } from '@/lib/achievements'
import ThemeToggle from '@/components/ThemeToggle'

export default function AdminPage() {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [fetching, setFetching] = useState(false)
  const [refreshing, setRefreshing] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchParticipants()
  }, [])

  const fetchParticipants = async () => {
    try {
      const res = await fetch('/api/participants')
      const data = await res.json()
      setParticipants(data.participants || [])
    } catch (error) {
      console.error('Failed to fetch participants:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTikTokData = async (tiktokUsername) => {
    const res = await fetch(`/api/tiktok?username=${encodeURIComponent(tiktokUsername)}`)
    const data = await res.json()
    
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch TikTok data')
    }
    
    return data.data
  }

  const addParticipant = async (e) => {
    e.preventDefault()
    setError('')
    setFetching(true)
    
    try {
      // Fetch real TikTok data
      const tiktokData = await fetchTikTokData(username)
      
      // Add participant with fetched data
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: displayName || tiktokData.nickname || username,
          username: tiktokData.username,
          avatar: tiktokData.avatar,
          followers: tiktokData.followers,
          likes: tiktokData.likes,
          videos: tiktokData.videos,
          max_video_views: tiktokData.max_video_views || 0,
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setParticipants(prev => [...prev, data.participant])
        setUsername('')
        setDisplayName('')
        setShowAddForm(false)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to add participant')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setFetching(false)
    }
  }

  const refreshParticipant = async (participant) => {
    setRefreshing(participant.id)
    
    try {
      const tiktokData = await fetchTikTokData(participant.username)
      const previousFollowers = participant.followers
      
      // Update all stats at once
      const res = await fetch('/api/participants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: participant.id,
          avatar: tiktokData.avatar,
          followers: tiktokData.followers,
          likes: tiktokData.likes,
          videos: tiktokData.videos,
          max_video_views: tiktokData.max_video_views || participant.max_video_views || 0,
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setParticipants(prev => 
          prev.map(p => p.id === participant.id ? data.participant : p)
        )
        
        // Check for new milestones
        await fetch('/api/milestones', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: participant.id,
            participantName: participant.name,
            followers: tiktokData.followers,
            previousFollowers: previousFollowers,
          })
        })
      }
    } catch (err) {
      alert(`Failed to refresh: ${err.message}`)
    } finally {
      setRefreshing(null)
    }
  }

  const refreshAll = async () => {
    for (const participant of participants) {
      await refreshParticipant(participant)
    }
  }

  const deleteParticipant = async (id) => {
    if (!confirm('Remove this participant?')) return
    
    try {
      const res = await fetch(`/api/participants?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setParticipants(prev => prev.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return (num || 0).toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-600 dark:border-t-zinc-400"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-6 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-down">
          <div>
            <Link href="/" className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm mb-2 inline-block transition-colors">
              &larr; Back
            </Link>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Manage Participants</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {participants.length > 0 && (
              <button
                onClick={refreshAll}
                disabled={refreshing !== null}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                Refresh All
              </button>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Add Participant
            </button>
          </div>
        </div>

        {/* Add participant form */}
        {showAddForm && (
          <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 mb-6 animate-fade-in-up">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">Add TikTok Account</h2>
            <form onSubmit={addParticipant} className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="TikTok username (e.g. @username)"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="flex-1 min-w-[200px] px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                  required
                />
                <input
                  type="text"
                  placeholder="Display name (optional)"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="flex-1 min-w-[160px] px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                />
              </div>
              
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={fetching || !username}
                  className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetching ? 'Fetching...' : 'Add from TikTok'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setError('')
                    setUsername('')
                    setDisplayName('')
                  }}
                  className="px-4 py-2 text-zinc-500 dark:text-zinc-400 text-sm hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empty state */}
        {participants.length === 0 && !showAddForm && (
          <div className="text-center py-16">
            <p className="text-zinc-500 mb-4">No participants yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Add your first participant
            </button>
          </div>
        )}

        {/* Participants list */}
        <div className="space-y-3 animate-fade-in-up animate-delay-1">
          {participants.map(participant => (
            <div 
              key={participant.id}
              className="bg-zinc-100 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 stagger-item"
            >
              <div className="flex items-center gap-3 mb-4">
                {participant.avatar ? (
                  <img 
                    src={participant.avatar} 
                    alt={participant.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {participant.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-zinc-900 dark:text-white truncate">{participant.name}</h3>
                    {participant.rank && <RankBadge rank={participant.rank} size="sm" />}
                  </div>
                  <a 
                    href={`https://tiktok.com/@${participant.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 text-sm hover:text-zinc-700 dark:hover:text-zinc-400 transition-colors"
                  >
                    @{participant.username}
                  </a>
                </div>
                {participant.xp !== undefined && (
                  <div className="text-right mr-2">
                    <p className="text-lg font-semibold text-zinc-900 dark:text-white">{formatXP(participant.xp)}</p>
                    <p className="text-zinc-500 text-xs">XP</p>
                  </div>
                )}
                <button
                  onClick={() => refreshParticipant(participant)}
                  disabled={refreshing === participant.id}
                  className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm transition-colors disabled:opacity-50"
                >
                  {refreshing === participant.id ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  onClick={() => deleteParticipant(participant.id)}
                  className="text-zinc-400 dark:text-zinc-600 hover:text-red-500 text-sm transition-colors"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white dark:bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Followers</p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white">{formatNumber(participant.followers)}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Likes</p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white">{formatNumber(participant.likes)}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Videos</p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white">{formatNumber(participant.videos)}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Best Views</p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white">{formatNumber(participant.max_video_views)}</p>
                </div>
              </div>
              
              {participant.unlockedAchievements?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-zinc-500 text-xs">{participant.unlockedAchievements.length} achievements unlocked</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
