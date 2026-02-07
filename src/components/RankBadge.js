'use client'

import { RANKS } from '@/lib/achievements'

export default function RankBadge({ rank, size = 'md', showName = true }) {
  const rankData = RANKS.find(r => r.id === rank) || RANKS[0]
  
  const sizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  }
  
  return (
    <span 
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${sizes[size]}`}
      style={{ 
        backgroundColor: `${rankData.color}20`,
        color: rankData.color,
        border: `1px solid ${rankData.color}40`
      }}
    >
      {showName && rankData.name}
    </span>
  )
}

export function RankIcon({ rank, size = 20 }) {
  const rankData = RANKS.find(r => r.id === rank) || RANKS[0]
  
  // Simple rank icons
  const icons = {
    iron: '⬡',
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '💠',
    goat: '🐐'
  }
  
  return (
    <span style={{ fontSize: size, lineHeight: 1 }}>
      {icons[rank] || icons.iron}
    </span>
  )
}
