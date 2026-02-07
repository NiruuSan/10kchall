'use client'

import RankBadge from './RankBadge'
import { formatXP } from '@/lib/achievements'

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

function ParticipantRow({ participant, rank, goal }) {
  const progressPercent = Math.min((participant.followers / goal) * 100, 100)
  
  return (
    <a 
      href={`https://tiktok.com/@${participant.username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-zinc-900/50 rounded-xl p-4 sm:p-5 border border-zinc-800 card-hover cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* Position */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
          rank === 1 ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-400'
        }`}>
          {rank}
        </div>
        
        {/* Avatar */}
        {participant.avatar ? (
          <img 
            src={participant.avatar} 
            alt={participant.name}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-zinc-800 flex items-center justify-center text-base font-semibold text-zinc-400 shrink-0">
            {participant.name.charAt(0)}
          </div>
        )}
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white truncate">{participant.name}</h3>
            <RankBadge rank={participant.rank} size="sm" />
          </div>
          <p className="text-zinc-500 text-sm">@{participant.username}</p>
          
          {/* Progress bar */}
          <div className="mt-2.5 hidden sm:block">
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full progress-bar"
                style={{ 
                  width: `${progressPercent}%`,
                  backgroundColor: participant.rankColor || '#71717a'
                }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* XP - Main stat */}
          <div className="text-right">
            <p className="text-xl sm:text-2xl font-semibold text-white">{formatXP(participant.xp)}</p>
            <p className="text-xs text-zinc-600 uppercase tracking-wider">XP</p>
          </div>
          
          {/* Secondary stats - hidden on mobile */}
          <div className="hidden md:flex items-center gap-5">
            <div className="text-right">
              <p className="text-base font-medium text-zinc-300">{formatNumber(participant.followers)}</p>
              <p className="text-xs text-zinc-600 uppercase tracking-wider">Followers</p>
            </div>
            <div className="text-right">
              <p className="text-base font-medium text-zinc-300">{formatNumber(participant.likes)}</p>
              <p className="text-xs text-zinc-600 uppercase tracking-wider">Likes</p>
            </div>
            <div className="text-right">
              <p className="text-base font-medium text-zinc-300">{participant.videos}</p>
              <p className="text-xs text-zinc-600 uppercase tracking-wider">Videos</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile stats row */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800 sm:hidden text-sm text-zinc-500">
        <span>{formatNumber(participant.followers)} followers</span>
        <span>{formatNumber(participant.likes)} likes</span>
        <span>{progressPercent.toFixed(1)}%</span>
      </div>
    </a>
  )
}

export default function Leaderboard({ participants, goal }) {
  return (
    <div className="space-y-3">
      {participants.map((participant, index) => (
        <ParticipantRow 
          key={participant.id} 
          participant={participant} 
          rank={index + 1}
          goal={goal}
        />
      ))}
    </div>
  )
}
