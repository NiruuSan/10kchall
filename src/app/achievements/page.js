'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { formatXP } from '@/lib/achievements'
import ThemeToggle from '@/components/ThemeToggle'

export default function AchievementsPage() {
  const [participants, setParticipants] = useState([])
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedParticipant) {
      fetchAchievements(selectedParticipant)
    } else {
      // Show all achievements without unlock status
      setAchievements(ACHIEVEMENTS.map(a => ({ ...a, unlocked: false })))
    }
  }, [selectedParticipant])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/participants')
      const data = await res.json()
      setParticipants(data.participants || [])
      
      // Default to first participant if available
      if (data.participants?.length > 0) {
        setSelectedParticipant(data.participants[0].id)
      } else {
        setAchievements(ACHIEVEMENTS.map(a => ({ ...a, unlocked: false })))
      }
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAchievements = async (participantId) => {
    try {
      const res = await fetch(`/api/achievements?participantId=${participantId}`)
      const data = await res.json()
      setAchievements(data.achievements || [])
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    }
  }

  const selectedParticipantData = participants.find(p => p.id === selectedParticipant)

  const categories = [
    { id: 'followers', name: 'Followers', icon: '👥' },
    { id: 'likes', name: 'Likes', icon: '❤️' },
    { id: 'videos', name: 'Videos', icon: '🎬' },
    { id: 'views', name: 'Views', icon: '👁️' },
    { id: 'ratio', name: 'Engagement', icon: '📊' },
    { id: 'growth_daily', name: 'Daily Growth', icon: '⚡' },
    { id: 'growth_weekly', name: 'Weekly Growth', icon: '🗓️' },
    { id: 'position', name: 'Competition', icon: '🏅' },
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalXPEarned = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp_reward, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-600 dark:border-t-zinc-400"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm mb-2 inline-block transition-colors">
              &larr; Back to Leaderboard
            </Link>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Achievements</h1>
            <p className="text-zinc-500 mt-1">Complete challenges to earn XP and rank up</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Participant selector */}
        {participants.length > 0 && (
          <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-zinc-500 dark:text-zinc-400 text-sm">View achievements for:</span>
              <div className="flex gap-2 flex-wrap">
                {participants.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedParticipant(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedParticipant === p.id
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            
            {selectedParticipantData && (
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                {selectedParticipantData.avatar ? (
                  <img 
                    src={selectedParticipantData.avatar} 
                    alt={selectedParticipantData.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {selectedParticipantData.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-zinc-900 dark:text-white">{selectedParticipantData.name}</p>
                  <p className="text-zinc-500 text-sm">{unlockedCount} / {achievements.length} achievements</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white">{formatXP(totalXPEarned)}</p>
                  <p className="text-zinc-500 text-xs">XP from achievements</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Achievement categories */}
        {categories.map(category => {
          const categoryAchievements = achievements.filter(a => a.category === category.id)
          if (categoryAchievements.length === 0) return null
          
          return (
            <div key={category.id} className="mb-8">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <span>{category.icon}</span>
                {category.name}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {categoryAchievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`rounded-xl p-4 border transition-all ${
                      achievement.unlocked
                        ? 'bg-zinc-100 dark:bg-zinc-900/80 border-zinc-300 dark:border-zinc-700'
                        : 'bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                        {achievement.icon}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${achievement.unlocked ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                            {achievement.name}
                          </h3>
                          {achievement.unlocked && (
                            <span className="text-green-500 text-xs">✓</span>
                          )}
                        </div>
                        <p className="text-zinc-500 text-sm mt-0.5">{achievement.description}</p>
                        <p className={`text-sm mt-2 font-medium ${achievement.unlocked ? 'text-yellow-500' : 'text-zinc-500 dark:text-zinc-600'}`}>
                          +{achievement.xp_reward.toLocaleString()} XP
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
