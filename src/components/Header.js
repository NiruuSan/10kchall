'use client'

import RankBadge from './RankBadge'
import { formatXP, getNextRank } from '@/lib/achievements'

export default function Header({ goal, leader }) {
  const progressPercent = Math.min((leader.followers / goal) * 100, 100)
  const nextRankInfo = getNextRank(leader.xp)
  
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Logo / Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-3">
            <span className="text-zinc-900 dark:text-white">10K</span>
            <span className="text-zinc-400 dark:text-zinc-500"> Challenge</span>
          </h1>
          <p className="text-zinc-500">Race to 10,000 TikTok followers</p>
        </div>
        
        {/* Leader highlight */}
        <div className="max-w-md mx-auto">
          <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Current Leader</span>
              <RankBadge rank={leader.rank} size="md" />
            </div>
            
            <div className="flex items-center gap-4 mb-5">
              {leader.avatar ? (
                <img 
                  src={leader.avatar} 
                  alt={leader.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-lg font-semibold text-zinc-600 dark:text-zinc-300">
                  {leader.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{leader.name}</h3>
                <p className="text-zinc-500 text-sm">@{leader.username}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{formatXP(leader.xp)}</p>
                <p className="text-xs text-zinc-500">XP</p>
              </div>
            </div>
            
            {/* Progress to next rank */}
            {nextRankInfo ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Next: {nextRankInfo.rank.name}</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{formatXP(nextRankInfo.xpNeeded)} XP needed</span>
                </div>
                <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full progress-bar"
                    style={{ 
                      width: `${nextRankInfo.progress}%`,
                      backgroundColor: nextRankInfo.rank.color
                    }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <span className="text-zinc-500 dark:text-zinc-400 text-sm">Max rank achieved!</span>
              </div>
            )}
            
            {/* Follower progress */}
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-500">Follower Goal</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{leader.followers.toLocaleString()} / {goal.toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-zinc-900 dark:bg-white rounded-full progress-bar"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-right text-xs text-zinc-500 dark:text-zinc-600 mt-1">{progressPercent.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
