import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio('/audio.mp3')
    audio.loop = true
    audio.volume = 0.75
    audio.preload = 'auto'
    audioRef.current = audio

    // Try autoplay
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true)
          setHasInteracted(true)
        })
        .catch(() => {
          // Autoplay blocked by browser policy until user gesture
          setIsPlaying(false)
        })
    }

    // Auto-start on first user interaction
    const handleFirstGesture = () => {
      if (audio && audio.paused) {
        audio
          .play()
          .then(() => {
            setIsPlaying(true)
            setHasInteracted(true)
          })
          .catch(() => {})
      }
    }

    window.addEventListener('click', handleFirstGesture, { once: true })
    window.addEventListener('touchstart', handleFirstGesture, { once: true })
    window.addEventListener('keydown', handleFirstGesture, { once: true })

    return () => {
      audio.pause()
      audio.src = ''
      window.removeEventListener('click', handleFirstGesture)
      window.removeEventListener('touchstart', handleFirstGesture)
      window.removeEventListener('keydown', handleFirstGesture)
    }
  }, [])

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
          setHasInteracted(true)
        })
        .catch(err => {
          console.warn('Audio play failed:', err)
        })
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Track Title Badge */}
      <AnimatePresence>
        {(showTooltip || (!hasInteracted && !isPlaying)) && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(53, 11, 36, 0.75)',
              border: '1px solid rgba(245, 213, 138, 0.3)',
              backdropFilter: 'blur(10px)',
              color: '#FFF8FC',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '13px',
              letterSpacing: '0.04em',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {isPlaying ? (
              <span style={{ color: '#F5D58A' }}>♪ Billie Eilish — Lovely</span>
            ) : (
              <span style={{ color: '#FF9DBB' }}>Musiqani yoqish 🎵</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Glassmorphic Audio Button */}
      <motion.button
        onClick={togglePlay}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={isPlaying ? "Musiqani to'xtatish" : 'Musiqani tinglash'}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: isPlaying
            ? 'linear-gradient(135deg, rgba(215, 38, 94, 0.4), rgba(53, 11, 36, 0.7))'
            : 'rgba(8, 7, 13, 0.65)',
          border: isPlaying
            ? '1px solid rgba(245, 213, 138, 0.6)'
            : '1px solid rgba(215, 38, 94, 0.4)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          boxShadow: isPlaying
            ? '0 0 16px rgba(215, 38, 94, 0.45), 0 0 8px rgba(245, 213, 138, 0.3)'
            : '0 2px 10px rgba(0, 0, 0, 0.5)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Pulsing ring when active */}
        {isPlaying && (
          <motion.div
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              border: '1px solid rgba(245, 213, 138, 0.4)',
            }}
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Equalizer Wave / Icon */}
        {isPlaying ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2.5px',
              height: '16px',
            }}
          >
            {[0.5, 1, 0.7, 0.9].map((heightScale, i) => (
              <motion.span
                key={i}
                style={{
                  width: '2px',
                  backgroundColor: '#F5D58A',
                  borderRadius: '1px',
                }}
                animate={{
                  height: ['4px', `${14 * heightScale}px`, '4px'],
                }}
                transition={{
                  duration: 0.8 + i * 0.15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        ) : (
          <span
            style={{
              fontSize: '16px',
              color: '#FF9DBB',
              filter: 'drop-shadow(0 0 4px rgba(215, 38, 94, 0.5))',
            }}
          >
            🔇
          </span>
        )}
      </motion.button>
    </div>
  )
}
