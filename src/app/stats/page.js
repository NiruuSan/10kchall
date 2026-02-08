'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import ThemeToggle from '@/components/ThemeToggle'

const COLORS = [
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#22c55e', // green
  '#f59e0b', // amber
  '#ec4899', // pink
]

export default function StatsPage() {
  const [participants, setParticipants] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [chartType, setChartType] = useState('followers')

  useEffect(() => {
    fetchData()
  }, [days])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [participantsRes, snapshotsRes] = await Promise.all([
        fetch('/api/participants'),
        fetch(`/api/snapshots?days=${days}`)
      ])
      
      const participantsData = await participantsRes.json()
      const snapshotsData = await snapshotsRes.json()
      
      setParticipants(participantsData.participants || [])
      setSnapshots(snapshotsData.snapshots || [])
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  // Transform snapshots into chart data
  const chartData = () => {
    if (!snapshots.length) return []
    
    // Group snapshots by date
    const byDate = {}
    
    for (const snap of snapshots) {
      const date = new Date(snap.recorded_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
      
      if (!byDate[date]) {
        byDate[date] = { date }
      }
      
      // Find participant name
      const participant = participants.find(p => p.id === snap.participant_id)
      if (participant) {
        byDate[date][participant.name] = snap[chartType]
      }
    }
    
    return Object.values(byDate).sort((a, b) => {
      const dateA = new Date(a.date + ', 2026')
      const dateB = new Date(b.date + ', 2026')
      return dateA - dateB
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-600 dark:border-t-zinc-400"></div>
      </div>
    )
  }

  const data = chartData()

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/"
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm transition-colors"
          >
            &larr; Back
          </Link>
          <ThemeToggle />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="text-zinc-900 dark:text-white">Growth</span>
          <span className="text-zinc-400 dark:text-zinc-500"> History</span>
        </h1>
        <p className="text-zinc-500 mt-2">Track follower growth over time</p>
      </header>

      {/* Controls */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          {/* Time range */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Period:</span>
            <div className="flex gap-1">
              {[7, 14, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    days === d 
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white' 
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Chart type */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Metric:</span>
            <div className="flex gap-1">
              {['followers', 'likes', 'videos'].map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                    chartType === type 
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white' 
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Chart */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-xl p-4 sm:p-6 border border-zinc-200 dark:border-zinc-800">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                <XAxis 
                  dataKey="date" 
                  tick={{ className: 'fill-zinc-500', fontSize: 12 }}
                  axisLine={{ className: 'stroke-zinc-300 dark:stroke-zinc-700' }}
                />
                <YAxis 
                  tick={{ className: 'fill-zinc-500', fontSize: 12 }}
                  axisLine={{ className: 'stroke-zinc-300 dark:stroke-zinc-700' }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
                    if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
                    return value
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg, #18181b)', 
                    border: '1px solid var(--tooltip-border, #3f3f46)',
                    borderRadius: '8px',
                    color: 'var(--tooltip-color, #fff)'
                  }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                {participants.map((p, i) => (
                  <Line
                    key={p.id}
                    type="monotone"
                    dataKey={p.name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={{ fill: COLORS[i % COLORS.length], strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-zinc-500">
              <div className="text-center">
                <p className="mb-2">No history data yet</p>
                <p className="text-sm">Stats will appear here after refreshing participant data</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats Summary */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Growth Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {participants.map((p, i) => (
            <div 
              key={p.id}
              className="bg-zinc-100 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="font-medium text-zinc-900 dark:text-white">{p.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className={`font-medium ${
                    p.gains?.daily > 0 ? 'text-emerald-500' : 'text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {p.gains?.daily >= 0 ? '+' : ''}{p.gains?.daily || 0}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-600 text-xs">24h</p>
                </div>
                <div>
                  <p className={`font-medium ${
                    p.gains?.weekly > 0 ? 'text-emerald-500' : 'text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {p.gains?.weekly >= 0 ? '+' : ''}{p.gains?.weekly || 0}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-600 text-xs">7d</p>
                </div>
                <div>
                  <p className={`font-medium ${
                    p.gains?.monthly > 0 ? 'text-emerald-500' : 'text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {p.gains?.monthly >= 0 ? '+' : ''}{p.gains?.monthly || 0}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-600 text-xs">30d</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
