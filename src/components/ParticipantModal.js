'use client'

import { useEffect, useState } from 'react'
import RankBadge from './RankBadge'
import ShareCard from './ShareCard'
import { formatXP, getNextRank, RANKS } from '@/lib/achievements'

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

export default function ParticipantModal({ participant, goal, onClose }) {
  const [showShareCard, setShowShareCard] = useState(false)
  
  const xp = participant.xp || 0
  const progressPercent = Math.min((participant.followers / goal) * 100, 100)
  const nextRankData = getNextRank(xp)
  const currentRank = RANKS.find(r => r.id === participant.rank) || RANKS[0]
  
  // Calculate XP progress to next rank
  let xpProgress = 0
  let xpToNextRank = 0
  let nextRankName = ''
  if (nextRankData) {
    xpProgress = nextRankData.progress
    xpToNextRank = nextRankData.xpNeeded
    nextRankName = nextRankData.rank.name
  }

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showShareCard) {
          setShowShareCard(false)
        } else {
          onClose()
        }
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose, showShareCard])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Show share card
  if (showShareCard) {
    return (
      <ShareCard 
        participant={participant} 
        goal={goal} 
        onClose={() => setShowShareCard(false)} 
      />
    )
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-white transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with avatar */}
        <div className="pt-8 pb-6 px-6 text-center border-b border-zinc-200 dark:border-zinc-800">
          {participant.avatar ? (
            <img 
              src={participant.avatar} 
              alt={participant.name}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-zinc-200 dark:ring-zinc-800"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-600 dark:text-zinc-400 mx-auto mb-4 ring-4 ring-zinc-200 dark:ring-zinc-700">
              {participant.name.charAt(0)}
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">{participant.name}</h2>
          <p className="text-zinc-500">@{participant.username}</p>
          
          <div className="mt-3">
            <RankBadge rank={participant.rank} size="md" />
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-6">
          {/* Main stats grid */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-4">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{formatNumber(participant.followers)}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Followers</p>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-4">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{formatNumber(participant.likes)}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Likes</p>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-4">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{participant.videos}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Videos</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">XP Progress</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-white">{formatXP(xp)} XP</span>
            </div>
            <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${xpProgress}%`,
                  backgroundColor: currentRank.color
                }}
              />
            </div>
            {nextRankData && (
              <p className="text-xs text-zinc-500 mt-2">
                {formatXP(xpToNextRank)} XP to {nextRankName}
              </p>
            )}
            {!nextRankData && (
              <p className="text-xs text-zinc-500 mt-2">Max rank achieved!</p>
            )}
          </div>

          {/* Goal progress */}
          <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Goal Progress</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-white">{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              {formatNumber(participant.followers)} / {formatNumber(goal)} followers
            </p>
          </div>

          {/* Growth stats if available */}
          {participant.gains && (participant.gains.daily !== 0 || participant.gains.weekly !== 0 || participant.gains.monthly !== 0) && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className={`text-lg font-semibold ${participant.gains.daily > 0 ? 'text-emerald-500' : participant.gains.daily < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                  {participant.gains.daily >= 0 ? '+' : ''}{participant.gains.daily}
                </p>
                <p className="text-xs text-zinc-500">24h</p>
              </div>
              <div>
                <p className={`text-lg font-semibold ${participant.gains.weekly > 0 ? 'text-emerald-500' : participant.gains.weekly < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                  {participant.gains.weekly >= 0 ? '+' : ''}{participant.gains.weekly}
                </p>
                <p className="text-xs text-zinc-500">7d</p>
              </div>
              <div>
                <p className={`text-lg font-semibold ${participant.gains.monthly > 0 ? 'text-emerald-500' : participant.gains.monthly < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                  {participant.gains.monthly >= 0 ? '+' : ''}{participant.gains.monthly}
                </p>
                <p className="text-xs text-zinc-500">30d</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <a
              href={`https://tiktok.com/@${participant.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-center font-medium rounded-xl hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              View on TikTok
            </a>
            <button
              onClick={() => setShowShareCard(true)}
              className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
