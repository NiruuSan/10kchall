import Link from 'next/link'
import Header from '@/components/Header'
import Leaderboard from '@/components/Leaderboard'
import StatsGrid from '@/components/StatsGrid'
import { supabase } from '@/lib/supabase'

export const revalidate = 0 // Disable caching, always fetch fresh data

async function getData() {
  // Fetch participants
  const { data: participants, error: participantsError } = await supabase
    .from('participants')
    .select('*')
    .order('followers', { ascending: false })
  
  if (participantsError) {
    console.error('Error fetching participants:', participantsError)
    return { participants: [], goal: 10000, challengeStartDate: '2026-01-24' }
  }
  
  // Fetch settings
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
  
  const settingsObj = (settings || []).reduce((acc, { key, value }) => {
    acc[key] = key === 'goal' ? parseInt(value) : value
    return acc
  }, {})
  
  return {
    participants: participants || [],
    goal: settingsObj.goal || 10000,
    challengeStartDate: settingsObj.challengeStartDate || '2026-01-24'
  }
}

export default async function Home() {
  const { participants, goal, challengeStartDate } = await getData()
  
  // Sort participants by followers for leaderboard
  const sortedParticipants = [...participants].sort((a, b) => b.followers - a.followers)
  
  // Calculate total stats
  const totalFollowers = participants.reduce((sum, p) => sum + p.followers, 0)
  const totalLikes = participants.reduce((sum, p) => sum + p.likes, 0)
  const totalVideos = participants.reduce((sum, p) => sum + p.videos, 0)
  
  // Find the leader
  const leader = sortedParticipants[0]

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
          <Link 
            href="/admin"
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            Manage
          </Link>
        </div>
        <Leaderboard participants={sortedParticipants} goal={goal} />
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
