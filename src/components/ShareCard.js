'use client'

import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { formatXP, RANKS } from '@/lib/achievements'

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

const BACKGROUNDS = [
  { id: 'dark', name: 'Dark', value: '#09090b', type: 'solid' },
  { id: 'darker', name: 'Darker', value: '#000000', type: 'solid' },
  { id: 'zinc', name: 'Zinc', value: '#18181b', type: 'solid' },
  { id: 'slate', name: 'Slate', value: '#0f172a', type: 'solid' },
  { id: 'purple', name: 'Purple', value: 'linear-gradient(135deg, #1e1b4b 0%, #09090b 100%)', type: 'gradient' },
  { id: 'blue', name: 'Blue', value: 'linear-gradient(135deg, #0c4a6e 0%, #09090b 100%)', type: 'gradient' },
  { id: 'emerald', name: 'Emerald', value: 'linear-gradient(135deg, #064e3b 0%, #09090b 100%)', type: 'gradient' },
  { id: 'rose', name: 'Rose', value: 'linear-gradient(135deg, #4c0519 0%, #09090b 100%)', type: 'gradient' },
  { id: 'orange', name: 'Orange', value: 'linear-gradient(135deg, #7c2d12 0%, #09090b 100%)', type: 'gradient' },
  { id: 'cyber', name: 'Cyber', value: 'linear-gradient(135deg, #701a75 0%, #0891b2 100%)', type: 'gradient' },
  { id: 'sunset', name: 'Sunset', value: 'linear-gradient(135deg, #9f1239 0%, #c2410c 50%, #fbbf24 100%)', type: 'gradient' },
  { id: 'ocean', name: 'Ocean', value: 'linear-gradient(135deg, #0c4a6e 0%, #155e75 50%, #14b8a6 100%)', type: 'gradient' },
]

export default function ShareCard({ participant, goal, onClose }) {
  const cardRef = useRef(null)
  const fileInputRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0])
  const [customImage, setCustomImage] = useState(null)
  
  const xp = participant.xp || 0
  const progressPercent = Math.min((participant.followers / goal) * 100, 100)
  const currentRank = RANKS.find(r => r.id === participant.rank) || RANKS[0]

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCustomImage(event.target?.result)
        setSelectedBg(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSelectBg = (bg) => {
    setSelectedBg(bg)
    setCustomImage(null)
  }

  const getBackgroundStyle = () => {
    if (customImage) {
      return { backgroundColor: '#09090b' }
    }
    if (selectedBg) {
      if (selectedBg.type === 'gradient') {
        return { background: selectedBg.value }
      }
      return { backgroundColor: selectedBg.value }
    }
    return { backgroundColor: '#09090b' }
  }

  const handleDownload = async () => {
    if (!cardRef.current) return
    
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: selectedBg?.type === 'solid' ? selectedBg.value : '#09090b',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })
      
      const link = document.createElement('a')
      link.download = `${participant.username}-10k-challenge.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Failed to generate image:', error)
      alert('Failed to generate image. Please try a different background.')
    } finally {
      setDownloading(false)
    }
  }

  const handleCopyImage = async () => {
    if (!cardRef.current) return
    
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: selectedBg?.type === 'solid' ? selectedBg.value : '#09090b',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ])
            alert('Image copied to clipboard!')
          } catch (err) {
            console.error('Failed to copy:', err)
            alert('Failed to copy image. Try downloading instead.')
          }
        }
        setDownloading(false)
      }, 'image/png')
    } catch (error) {
      console.error('Failed to generate image:', error)
      alert('Failed to generate image. Please try a different background.')
      setDownloading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/90 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative flex flex-col items-center gap-4 max-w-lg w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-white transition-colors z-10 bg-white dark:bg-zinc-800 rounded-full p-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Background selector */}
        <div className="w-full bg-white dark:bg-transparent rounded-xl p-4 dark:p-0" style={{ maxWidth: '400px' }}>
          <p className="text-xs text-zinc-500 mb-2">Background</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => handleSelectBg(bg)}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  selectedBg?.id === bg.id ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent hover:border-zinc-400 dark:hover:border-zinc-600'
                }`}
                style={bg.type === 'gradient' ? { background: bg.value } : { backgroundColor: bg.value }}
                title={bg.name}
              />
            ))}
            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 ${
                customImage ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
              title="Upload image"
            >
              <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          {customImage && (
            <button
              onClick={() => {
                setCustomImage(null)
                setSelectedBg(BACKGROUNDS[0])
              }}
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Remove custom image
            </button>
          )}
        </div>

        {/* The Card */}
        <div 
          ref={cardRef}
          className="w-full rounded-2xl overflow-hidden relative"
          style={{ maxWidth: '400px', ...getBackgroundStyle() }}
        >
          {/* Custom image background */}
          {customImage && (
            <>
              <img 
                src={customImage} 
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}
          
          {/* Content wrapper */}
          <div className="relative z-10">
            {/* Header */}
            <div 
              className="p-6 text-center"
              style={{ 
                background: customImage ? 'transparent' : `linear-gradient(135deg, ${currentRank.color}20 0%, transparent 50%)` 
              }}
            >
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-4">
                10K Challenge
              </div>
              
              {/* Avatar */}
              {participant.avatar ? (
                <img 
                  src={participant.avatar} 
                  alt={participant.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4 ring-4"
                  style={{ ringColor: currentRank.color }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 ring-4"
                  style={{ 
                    backgroundColor: currentRank.color + '30',
                    color: currentRank.color,
                    ringColor: currentRank.color
                  }}
                >
                  {participant.name.charAt(0)}
                </div>
              )}
              
              <h2 className="text-xl font-bold text-white mb-1">{participant.name}</h2>
              <p className="text-zinc-400 text-sm">@{participant.username}</p>
              
              <div className="mt-3 inline-block">
                <div 
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ 
                    backgroundColor: currentRank.color + '30',
                    color: currentRank.color
                  }}
                >
                  {currentRank.name}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 pb-6">
              {/* Main stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-black/40 backdrop-blur rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white">{formatNumber(participant.followers)}</p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Followers</p>
                </div>
                <div className="bg-black/40 backdrop-blur rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white">{formatNumber(participant.likes)}</p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Likes</p>
                </div>
                <div className="bg-black/40 backdrop-blur rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white">{formatXP(xp)}</p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">XP</p>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-black/40 backdrop-blur rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400">Progress to 10K</span>
                  <span className="text-xs font-medium text-white">{progressPercent.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${progressPercent}%`,
                      backgroundColor: currentRank.color
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 text-center">
                <p className="text-[10px] text-zinc-500">
                  {participant.videos} videos posted
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full" style={{ maxWidth: '400px' }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-zinc-400 dark:border-zinc-400 border-t-white dark:border-t-zinc-900"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Download
          </button>
          <button
            onClick={handleCopyImage}
            disabled={downloading}
            className="flex-1 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-600 text-center">
          Share your progress on social media!
        </p>
      </div>
    </div>
  )
}
