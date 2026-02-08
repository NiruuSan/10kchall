'use client'

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function StatCard({ label, value }) {
  return (
    <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
      <p className="text-zinc-500 text-sm mb-1">{label}</p>
      <p className="text-2xl font-semibold text-zinc-900 dark:text-white">{formatNumber(value)}</p>
    </div>
  )
}

export default function StatsGrid({ totalFollowers, totalLikes, totalVideos, participantCount }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="Total Followers" value={totalFollowers} />
      <StatCard label="Total Likes" value={totalLikes} />
      <StatCard label="Videos Posted" value={totalVideos} />
      <StatCard label="Participants" value={participantCount} />
    </div>
  )
}
