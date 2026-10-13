import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Floating petal ──────────────────────────────────────────────────────────
function FloatingPetal({ index }: { index: number }) {
  const startX = Math.random() * 100
  const delay = Math.random() * 8
  const duration = 10 + Math.random() * 8
  const size = 10 + Math.random() * 14
  const drift = (Math.random() - 0.5) * 30

  return (
    <motion.div
      key={index}
      style={{
        position: 'absolute',
        top: '-30px',
        left: `${startX}%`,
        width: `${size}px`,
        height: `${size * 0.6}px`,
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        background: `radial-gradient(ellipse at 30% 30%, #FF9DBB, #D7265E 60%, #350B24)`,
        boxShadow: '0 0 8px rgba(215,38,94,0.3)',
        zIndex: 1,
      }}
      animate={{
        y: ['0px', '110dvh'],
        x: [`0px`, `${drift}vw`],
        rotate: [0, 180 + Math.random() * 360],
        opacity: [0, 0.75, 0.6, 0],
      }}
      transition={{
        duration,
        delay,
        ease: 'linear',
        repeat: Infinity,
        repeatDelay: Math.random() * 3 + 1,
      }}
    />
  )
}

// ─── 3D Heart ────────────────────────────────────────────────────────────────
function BeatingHeart({ glowing }: { glowing: boolean }) {
  return (
    <motion.div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
      animate={{ scale: [1, 1.07, 0.97, 1.04, 1] }}
      transition={{ duration: 1, times: [0, 0.2, 0.4, 0.6, 1], ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.3 }}
    >
      {/* Glow rings */}
      <motion.div
        style={{
          position: 'absolute',
          width: '200px', height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(215,38,94,0.25) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {glowing && (
        <motion.div
          style={{
            position: 'absolute',
            width: '280px', height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,213,138,0.15) 0%, rgba(215,38,94,0.1) 40%, transparent 70%)',
            filter: 'blur(30px)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
      )}

      <svg viewBox="0 0 100 90" style={{ width: '130px', height: '117px', filter: 'drop-shadow(0 0 20px rgba(215,38,94,0.7)) drop-shadow(0 0 8px rgba(245,213,138,0.4))' }}>
        <defs>
          <radialGradient id="hg2" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FF9DBB" />
            <stop offset="35%" stopColor="#D7265E" />
            <stop offset="70%" stopColor="#8B1535" />
            <stop offset="100%" stopColor="#350B24" />
          </radialGradient>
          <radialGradient id="hs2" cx="35%" cy="25%" r="40%">
            <stop offset="0%" stopColor="rgba(255,248,252,0.5)" />
            <stop offset="100%" stopColor="rgba(255,248,252,0)" />
          </radialGradient>
        </defs>
        <path d="M50 85 C50 85 5 55 5 28 C5 14 16 5 28 5 C36 5 44 9 50 16 C56 9 64 5 72 5 C84 5 95 14 95 28 C95 55 50 85 50 85 Z" fill="url(#hg2)" />
        <path d="M50 85 C50 85 5 55 5 28 C5 14 16 5 28 5 C36 5 44 9 50 16 C56 9 64 5 72 5 C84 5 95 14 95 28 C95 55 50 85 50 85 Z" fill="url(#hs2)" />
        <path d="M25 20 Q20 30 22 40" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
  )
}

// ─── Gold particles canvas ───────────────────────────────────────────────────
function GoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    interface P { x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number; maxLife: number }
    const particles: P[] = []
    const COLORS = ['#F5D58A', '#FFE4A3', '#FFF8FC', '#FFD700', '#FF9DBB']

    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.05,
        size: Math.random() * 1.5 + 0.3,
        alpha: 0,
        life: Math.random() * 200,
        maxLife: 200 + Math.random() * 150,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const color = COLORS[0]

      particles.forEach(p => {
        p.life++
        p.x += p.vx
        p.y += p.vy
        const prog = p.life / p.maxLife
        p.alpha = prog < 0.15 ? prog / 0.15 * 0.5
          : prog > 0.8 ? (1 - prog) / 0.2 * 0.5
          : 0.5

        if (p.life >= p.maxLife) {
          p.life = 0
          p.x = Math.random() * canvas.width
          p.y = canvas.height + 10
          p.vy = -Math.random() * 0.4 - 0.05
        }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = p.size * 5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      rafRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />
}

// ─── Burst hearts effect ─────────────────────────────────────────────────────
function BurstHearts({ active }: { active: boolean }) {
  const hearts = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (i / 20) * 360,
    distance: 80 + Math.random() * 120,
    size: 10 + Math.random() * 20,
    delay: Math.random() * 0.4,
    duration: 1 + Math.random() * 0.8,
  }))

  return (
    <AnimatePresence>
      {active && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {hearts.map(h => (
            <motion.div
              key={h.id}
              style={{
                position: 'absolute',
                fontSize: `${h.size}px`,
                zIndex: 10,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: Math.cos((h.angle * Math.PI) / 180) * h.distance,
                y: Math.sin((h.angle * Math.PI) / 180) * h.distance - 40,
                opacity: [0, 1, 1, 0],
                scale: [0, 1.2, 1, 0.5],
              }}
              transition={{ duration: h.duration, delay: h.delay, ease: 'easeOut' }}
            >
              ❤️
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── Main MainScene ──────────────────────────────────────────────────────────
const messages = [
  {
    uz: 'Happy 2 Months, My Love ❤️',
    style: 'heading' as const,
  },
  {
    uz: 'Hayotimga kirib kelganing uchun rahmat, sevgilim.',
    style: 'sub' as const,
  },
  {
    uz: 'Bu ikki oy — bizning go\'zal hikoyamizning boshlanishi. Oldinda seni yanada ko\'proq sevishim, birga kulishimiz va eng chiroyli xotiralarni yaratishimiz uchun butun bir umr bor.',
    style: 'body' as const,
  },
  {
    uz: 'Sen bilan har bir kunim o\'zgacha. Seni sevaman! ❤️',
    style: 'sub' as const,
  },
  {
    uz: 'Forever Yours ♡',
    style: 'signature' as const,
  },
]

export default function MainScene() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [heartButtonActive, setHeartButtonActive] = useState(false)
  const [showBonusMessage, setShowBonusMessage] = useState(false)
  const [burstActive, setBurstActive] = useState(false)

  // Stagger text appearance
  useEffect(() => {
    const timers = messages.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), 600 + i * 900)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  const handleHeartButton = () => {
    if (heartButtonActive) return
    setHeartButtonActive(true)
    setBurstActive(true)
    setTimeout(() => {
      setShowBonusMessage(true)
      setBurstActive(false)
    }, 1500)
  }

  const petals = Array.from({ length: 14 }, (_, i) => i)

  const getTextStyle = (style: 'heading' | 'sub' | 'body' | 'signature'): React.CSSProperties => {
    if (style === 'heading') return {
      fontFamily: "'Playfair Display', serif",
      fontSize: 'clamp(20px, 5.5vw, 36px)',
      fontWeight: 700,
      fontStyle: 'italic',
      background: 'linear-gradient(135deg, #F5D58A 0%, #FFF8FC 45%, #FF9DBB 70%, #F5D58A 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '0.01em',
      lineHeight: 1.3,
      textAlign: 'center',
      filter: 'drop-shadow(0 0 10px rgba(245,213,138,0.5))',
    }
    if (style === 'sub') return {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 'clamp(14px, 3.8vw, 20px)',
      fontWeight: 400,
      fontStyle: 'italic',
      color: '#FF9DBB',
      textAlign: 'center',
      letterSpacing: '0.03em',
      lineHeight: 1.5,
      filter: 'drop-shadow(0 0 6px rgba(255,157,187,0.4))',
    }
    if (style === 'body') return {
      fontFamily: "'EB Garamond', serif",
      fontSize: 'clamp(12px, 3.2vw, 16px)',
      fontWeight: 400,
      color: 'rgba(255,248,252,0.82)',
      textAlign: 'center',
      letterSpacing: '0.02em',
      lineHeight: 1.75,
    }
    return {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 'clamp(16px, 4.5vw, 24px)',
      fontWeight: 300,
      fontStyle: 'italic',
      background: 'linear-gradient(90deg, #F5D58A, #FFF8FC, #F5D58A)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textAlign: 'center',
      letterSpacing: '0.12em',
      filter: 'drop-shadow(0 0 8px rgba(245,213,138,0.5))',
    }
  }

  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      {/* Background */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          background: heartButtonActive
            ? 'radial-gradient(ellipse at center, #4a0f2a 0%, #200812 40%, #08070D 100%)'
            : 'radial-gradient(ellipse at center, #200812 0%, #120208 40%, #08070D 100%)',
        }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* Gold particles */}
      <GoldParticles />

      {/* Petals */}
      {petals.map(i => <FloatingPetal key={i} index={i} />)}

      {/* Burst hearts */}
      <BurstHearts active={burstActive} />

      {/* Main content card */}
      <motion.div
        style={{
          position: 'relative', zIndex: 5,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          width: '100%', maxWidth: '440px',
          padding: '0 20px',
          gap: '0',
        }}
      >
        {/* Heart */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
          style={{ marginBottom: '20px', position: 'relative' }}
        >
          <BeatingHeart glowing={heartButtonActive} />
        </motion.div>

        {/* Text messages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          {messages.map((msg, i) => (
            <AnimatePresence key={i}>
              {i < visibleCount && (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={getTextStyle(msg.style)}
                >
                  {msg.uz}
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Divider */}
        <AnimatePresence>
          {visibleCount >= 5 && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              style={{
                width: '120px', height: '1px', marginTop: '18px', marginBottom: '18px',
                background: 'linear-gradient(90deg, transparent, rgba(245,213,138,0.6), transparent)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Heart button */}
        <AnimatePresence>
          {visibleCount >= 5 && !showBonusMessage && (
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
              onClick={handleHeartButton}
              style={{
                background: heartButtonActive
                  ? 'linear-gradient(135deg, rgba(215,38,94,0.5), rgba(139,21,53,0.4))'
                  : 'linear-gradient(135deg, rgba(215,38,94,0.2), rgba(53,11,36,0.4))',
                border: '1px solid rgba(215,38,94,0.5)',
                borderRadius: '50px',
                padding: '14px 28px',
                cursor: heartButtonActive ? 'default' : 'pointer',
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(14px, 4vw, 17px)',
                fontStyle: 'italic',
                color: '#FF9DBB',
                letterSpacing: '0.05em',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 0 20px rgba(215,38,94,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                transition: 'box-shadow 0.3s',
                WebkitTapHighlightColor: 'transparent',
              }}
              whileHover={{ boxShadow: '0 0 30px rgba(215,38,94,0.4), inset 0 1px 0 rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.96 }}
            >
              Yuragimni och ❤️
            </motion.button>
          )}
        </AnimatePresence>

        {/* Bonus message */}
        <AnimatePresence>
          {showBonusMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                background: 'linear-gradient(135deg, rgba(215,38,94,0.12) 0%, rgba(53,11,36,0.3) 100%)',
                border: '1px solid rgba(245,213,138,0.25)',
                borderRadius: '16px',
                padding: '18px 22px',
                textAlign: 'center',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 0 30px rgba(215,38,94,0.15)',
                marginTop: '4px',
              }}
            >
              <p style={{
                fontFamily: "'EB Garamond', serif",
                fontSize: 'clamp(13px, 3.5vw, 16px)',
                color: '#FF9DBB',
                fontStyle: 'italic',
                lineHeight: 1.7,
                letterSpacing: '0.02em',
              }}>
                Yuragimdagi eng go'zal joy doim seniki.<br />
                <span style={{ color: '#F5D58A' }}>Alloh oilamizni mustahkam qilsin, Xotin! ❤️</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
