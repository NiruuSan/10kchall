'use client'

import { useEffect } from 'react'
import RankBadge from './RankBadge'
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
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with avatar */}
        <div className="pt-8 pb-6 px-6 text-center border-b border-zinc-800">
          {participant.avatar ? (
            <img 
              src={participant.avatar} 
              alt={participant.name}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-zinc-800"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-400 mx-auto mb-4 ring-4 ring-zinc-700">
              {participant.name.charAt(0)}
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-white mb-1">{participant.name}</h2>
          <p className="text-zinc-500">@{participant.username}</p>
          
          <div className="mt-3">
            <RankBadge rank={participant.rank} size="md" />
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-6">
          {/* Main stats grid */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{formatNumber(participant.followers)}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Followers</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{formatNumber(participant.likes)}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Likes</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{participant.videos}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Videos</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">XP Progress</span>
              <span className="text-sm font-medium text-white">{formatXP(xp)} XP</span>
            </div>
            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
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
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Goal Progress</span>
              <span className="text-sm font-medium text-white">{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all"
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
                <p className={`text-lg font-semibold ${participant.gains.daily > 0 ? 'text-emerald-400' : participant.gains.daily < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                  {participant.gains.daily >= 0 ? '+' : ''}{participant.gains.daily}
                </p>
                <p className="text-xs text-zinc-500">24h</p>
              </div>
              <div>
                <p className={`text-lg font-semibold ${participant.gains.weekly > 0 ? 'text-emerald-400' : participant.gains.weekly < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                  {participant.gains.weekly >= 0 ? '+' : ''}{participant.gains.weekly}
                </p>
                <p className="text-xs text-zinc-500">7d</p>
              </div>
              <div>
                <p className={`text-lg font-semibold ${participant.gains.monthly > 0 ? 'text-emerald-400' : participant.gains.monthly < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                  {participant.gains.monthly >= 0 ? '+' : ''}{participant.gains.monthly}
                </p>
                <p className="text-xs text-zinc-500">30d</p>
              </div>
            </div>
          )}

          {/* TikTok button */}
          <a
            href={`https://tiktok.com/@${participant.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 bg-white text-zinc-900 text-center font-medium rounded-xl hover:bg-zinc-200 transition-colors"
          >
            View on TikTok
          </a>
        </div>
      </div>
    </div>
  )
}
