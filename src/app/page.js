'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Leaderboard from '@/components/Leaderboard'
import StatsGrid from '@/components/StatsGrid'

export default function Home() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-700 border-t-zinc-400"></div>
      </div>
    )
  }

  const { participants = [], goal = 10000, challengeStartDate = '2026-01-24' } = data || {}
  
  // Calculate total stats
  const totalFollowers = participants.reduce((sum, p) => sum + p.followers, 0)
  const totalLikes = participants.reduce((sum, p) => sum + p.likes, 0)
  const totalVideos = participants.reduce((sum, p) => sum + p.videos, 0)
  
  // Participants are already sorted by XP from the API
  const leader = participants[0]

  // Empty state
  if (participants.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 text-center">
          <span className="text-white">10K</span>
          <span className="text-zinc-500"> Challenge</span>
        </h1>
        <p className="text-zinc-500 mb-8 text-center">Race to 10,000 TikTok followers</p>
        <Link 
          href="/admin"
          className="px-5 py-2.5 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
        >
          Add Participants
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-20">
      <Header goal={goal} leader={leader} />
      
      {/* Stats Overview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <StatsGrid 
          totalFollowers={totalFollowers}
          totalLikes={totalLikes}
          totalVideos={totalVideos}
          participantCount={participants.length}
        />
      </section>
      
      {/* Leaderboard */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Leaderboard</h2>
          <div className="flex items-center gap-4">
            <Link 
              href="/achievements"
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
            >
              Achievements
            </Link>
            <Link 
              href="/admin"
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
            >
              Manage
            </Link>
          </div>
        </div>
        <Leaderboard participants={participants} goal={goal} />
      </section>
      
      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center text-zinc-600 text-sm">
        <p>Started {new Date(challengeStartDate).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })}</p>
      </footer>
    </main>
  )
}
