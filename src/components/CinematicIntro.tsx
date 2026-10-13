import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'

interface CinematicIntroProps {
  onComplete: () => void
  reducedMotion?: boolean
}

// ─── Petal component ────────────────────────────────────────────────────────
function Petal({ delay, duration, startX, endX, size }: {
  delay: number; duration: number; startX: number; endX: number; size: number
}) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        top: '-40px',
        left: `${startX}%`,
        width: `${size}px`,
        height: `${size * 0.6}px`,
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        background: `radial-gradient(ellipse at 30% 30%, #FF9DBB, #D7265E, #350B24)`,
        opacity: 0,
        filter: 'blur(0.5px)',
        boxShadow: '0 0 6px rgba(215,38,94,0.4)',
      }}
      animate={{
        y: ['0px', '110vh'],
        x: [`0px`, `${endX - startX}%`],
        rotate: [0, 360 + Math.random() * 200 - 100],
        opacity: [0, 0.7, 0.5, 0],
      }}
      transition={{
        duration,
        delay,
        ease: 'linear',
        repeat: Infinity,
        repeatDelay: Math.random() * 4,
      }}
    />
  )
}

// ─── SVG Heart ──────────────────────────────────────────────────────────────
function AnimatedHeart({
  scale = 1,
  glow = 0,
  beating = false,
  opacity = 1,
}: {
  scale?: number
  glow?: number
  beating?: boolean
  opacity?: number
}) {
  const heartControls = useAnimation()

  useEffect(() => {
    if (beating) {
      heartControls.start({
        scale: [1, 1.08, 0.97, 1.05, 1],
        transition: {
          duration: 0.9,
          times: [0, 0.2, 0.4, 0.6, 1],
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 0.2,
        },
      })
    } else {
      heartControls.stop()
    }
  }, [beating, heartControls])

  const glowRadius = glow * 80
  const glowColor = `rgba(215, 38, 94, ${glow * 0.7})`
  const outerGlow = glow * 120

  return (
    <motion.div
      animate={heartControls}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Outer glow layers */}
      {glow > 0 && (
        <>
          <div style={{
            position: 'absolute',
            width: `${outerGlow * 2}px`,
            height: `${outerGlow * 2}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(215,38,94,${glow * 0.15}) 0%, transparent 70%)`,
            filter: `blur(${outerGlow * 0.3}px)`,
          }} />
          <div style={{
            position: 'absolute',
            width: `${glowRadius * 2}px`,
            height: `${glowRadius * 2}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(245,213,138,${glow * 0.12}) 0%, rgba(215,38,94,${glow * 0.2}) 40%, transparent 70%)`,
            filter: `blur(${glowRadius * 0.4}px)`,
          }} />
        </>
      )}

      <motion.svg
        viewBox="0 0 100 90"
        style={{
          width: `${120 * scale}px`,
          height: `${108 * scale}px`,
          filter: glow > 0
            ? `drop-shadow(0 0 ${glow * 20}px ${glowColor}) drop-shadow(0 0 ${glow * 8}px rgba(245,213,138,${glow * 0.6}))`
            : 'none',
          opacity,
        }}
      >
        <defs>
          <radialGradient id="heartGrad" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FF9DBB" />
            <stop offset="35%" stopColor="#D7265E" />
            <stop offset="70%" stopColor="#8B1535" />
            <stop offset="100%" stopColor="#350B24" />
          </radialGradient>
          <radialGradient id="heartShine" cx="35%" cy="25%" r="40%">
            <stop offset="0%" stopColor="rgba(255,248,252,0.45)" />
            <stop offset="100%" stopColor="rgba(255,248,252,0)" />
          </radialGradient>
          <filter id="heartBlur">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
        </defs>
        {/* Base heart shape */}
        <path
          d="M50 85 C50 85 5 55 5 28 C5 14 16 5 28 5 C36 5 44 9 50 16 C56 9 64 5 72 5 C84 5 95 14 95 28 C95 55 50 85 50 85 Z"
          fill="url(#heartGrad)"
        />
        {/* 3D shine overlay */}
        <path
          d="M50 85 C50 85 5 55 5 28 C5 14 16 5 28 5 C36 5 44 9 50 16 C56 9 64 5 72 5 C84 5 95 14 95 28 C95 55 50 85 50 85 Z"
          fill="url(#heartShine)"
        />
        {/* Inner depth shadow */}
        <path
          d="M50 75 C50 75 15 52 15 30 C15 20 22 13 30 13 C37 13 44 17 50 24"
          fill="none"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </motion.svg>
    </motion.div>
  )
}

// ─── Main CinematicIntro ─────────────────────────────────────────────────────
export default function CinematicIntro({ onComplete, reducedMotion }: CinematicIntroProps) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4 | 5>(0)
  // 0: darkness, 1: heart forms (3-6s), 2: world of romance (6-9s),
  // 3: message (9-12s), 4: finale (12-15s), 5: complete
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  // ── Reduced motion: skip to main scene quickly
  useEffect(() => {
    if (reducedMotion) {
      const t = setTimeout(onComplete, 1500)
      return () => clearTimeout(t)
    }
  }, [reducedMotion, onComplete])

  // ── Phase timeline
  useEffect(() => {
    if (reducedMotion) return
    startTimeRef.current = Date.now()

    const timers = [
      setTimeout(() => setPhase(1), 3000),
      setTimeout(() => setPhase(2), 6000),
      setTimeout(() => setPhase(3), 9000),
      setTimeout(() => setPhase(4), 12000),
      setTimeout(() => { setPhase(5); onComplete() }, 15200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [reducedMotion, onComplete])

  // ── Canvas particle system
  useEffect(() => {
    if (reducedMotion) return
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

    interface CP {
      x: number; y: number; vx: number; vy: number
      size: number; color: string; alpha: number
      life: number; maxLife: number; type: string
      angle?: number; radius?: number; speed?: number
    }

    const colors = ['#F5D58A', '#FF9DBB', '#FFF8FC', '#D7265E', '#FFB7CC', '#FFFFFF']
    const particles: CP[] = []

    const spawnFloat = () => {
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -Math.random() * 0.5 - 0.1,
          size: Math.random() * 2 + 0.3,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0,
          life: Math.random() * 200,
          maxLife: 250 + Math.random() * 150,
          type: 'float',
        })
      }
    }

    const spawnOrbit = () => {
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      for (let i = 0; i < 30; i++) {
        const a = (i / 30) * Math.PI * 2
        const r = 70 + Math.random() * 60
        particles.push({
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
          vx: 0, vy: 0,
          size: Math.random() * 2.5 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0,
          life: 0, maxLife: 400,
          type: 'orbit',
          angle: a, radius: r,
          speed: 0.005 + Math.random() * 0.008,
        })
      }
    }

    const spawnBurst = (count: number) => {
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 6 + 2
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 0, maxLife: 90 + Math.random() * 50,
          type: 'burst',
        })
      }
    }

    spawnFloat()

    let lastPhase = -1

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cx = canvas.width / 2
      const cy = canvas.height / 2

      // Spawn based on time
      if (elapsed > 3 && elapsed < 12 && lastPhase < 1) {
        spawnOrbit()
        lastPhase = 1
      }
      if (elapsed > 11.5 && lastPhase < 2) {
        spawnBurst(120)
        lastPhase = 2
      }

      // Update & draw
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++

        if (p.type === 'float') {
          const prog = p.life / p.maxLife
          p.alpha = prog < 0.15 ? prog / 0.15 * 0.6
            : prog > 0.8 ? (1 - prog) / 0.2 * 0.6
            : 0.6
          p.x += p.vx
          p.y += p.vy
          if (p.life >= p.maxLife) {
            p.life = 0
            p.x = Math.random() * canvas.width
            p.y = canvas.height + 10
            p.vy = -Math.random() * 0.5 - 0.1
          }
        } else if (p.type === 'orbit') {
          p.angle = (p.angle ?? 0) + (p.speed ?? 0.005)
          p.x = cx + Math.cos(p.angle) * (p.radius ?? 80)
          p.y = cy + Math.sin(p.angle) * (p.radius ?? 80)
          const prog = p.life / p.maxLife
          p.alpha = prog < 0.2 ? prog / 0.2 * 0.9
            : prog > 0.7 ? (1 - prog) / 0.3 * 0.9
            : 0.9
          if (p.life >= p.maxLife) particles.splice(i, 1)
        } else if (p.type === 'gather') {
          const dx = cx - p.x
          const dy = cy - p.y
          p.x += dx * 0.04
          p.y += dy * 0.04
          const prog = p.life / p.maxLife
          p.alpha = 1 - prog
          if (p.life >= p.maxLife) particles.splice(i, 1)
        } else if (p.type === 'burst') {
          p.x += p.vx
          p.y += p.vy
          p.vx *= 0.96
          p.vy *= 0.96
          p.vy += 0.04
          const prog = p.life / p.maxLife
          p.alpha = 1 - prog
          if (p.life >= p.maxLife) particles.splice(i, 1)
        }

        if (p.alpha <= 0) continue

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = p.size * 4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [reducedMotion])

  if (reducedMotion) {
    return (
      <motion.div
        style={{ position: 'fixed', inset: 0, background: '#08070D', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <AnimatedHeart scale={1.5} glow={0.8} beating opacity={1} />
      </motion.div>
    )
  }

  const petals = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    delay: Math.random() * 12,
    duration: 8 + Math.random() * 6,
    startX: Math.random() * 100,
    endX: Math.random() * 100,
    size: 10 + Math.random() * 16,
  }))

  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Canvas particles */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />

      {/* Phase 0: Deep darkness */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          background: phase >= 4
            ? 'radial-gradient(ellipse at center, #350B24 0%, #1a0412 30%, #08070D 100%)'
            : phase >= 2
            ? 'radial-gradient(ellipse at center, #200712 0%, #120208 40%, #08070D 100%)'
            : 'radial-gradient(ellipse at center, #120208 0%, #08070D 60%, #000000 100%)',
        }}
        animate={{ opacity: 1 }}
      />

      {/* Radial light glow */}
      <AnimatePresence>
        <motion.div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, rgba(215,38,94,0.12) 0%, transparent 60%)',
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: phase === 0 ? [0, 0.4, 0.2, 0.5, 0.3] : phase >= 3 ? 1 : 0.6,
            scale: phase >= 3 ? 1.3 : 1,
          }}
          transition={{ duration: 3, ease: 'easeInOut', repeat: phase === 0 ? Infinity : 0 }}
        />
      </AnimatePresence>

      {/* Petals - phase 2+ */}
      <AnimatePresence>
        {phase >= 2 && petals.map(p => (
          <Petal key={p.id} {...p} />
        ))}
      </AnimatePresence>

      {/* ── HEART ── */}
      <div style={{
        position: 'absolute',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        width: '100%',
        top: '50%', transform: 'translateY(-50%)',
        zIndex: 2,
      }}>

        {/* Heart container */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}
          animate={{
            y: phase >= 2 ? '-8vh' : '0vh',
          }}
          transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Heart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{
              opacity: phase >= 1 ? (phase >= 4 ? [1, 1, 0] : 1) : phase === 0 ? [0, 0.08, 0.04] : 0,
              scale: phase >= 4
                ? [1, 2.5, 0.3]
                : phase >= 1
                ? [0.1, 0.6, 0.8, 1, 1]
                : [0, 0.05, 0.03],
            }}
            transition={
              phase >= 4
                ? { duration: 2, times: [0, 0.4, 1], ease: 'easeInOut' }
                : phase >= 1
                ? { duration: 1.8, ease: [0.34, 1.56, 0.64, 1] }
                : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <AnimatedHeart
              scale={1.6}
              glow={phase >= 1 ? (phase >= 4 ? 1.5 : phase >= 3 ? 1.2 : 0.9) : 0.2}
              beating={phase >= 1 && phase < 4}
              opacity={1}
            />
          </motion.div>

          {/* Phase 3+: Text messages */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                style={{ textAlign: 'center', padding: '0 24px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 4 ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <TypewriterText
                  text="Two Months…"
                  delay={0}
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(28px, 7vw, 52px)',
                    fontWeight: 600,
                    fontStyle: 'italic',
                    background: 'linear-gradient(135deg, #F5D58A 0%, #FFF8FC 50%, #F5D58A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.02em',
                    display: 'block',
                    filter: 'drop-shadow(0 0 12px rgba(245,213,138,0.6))',
                    marginBottom: '12px',
                  }}
                />
                <TypewriterText
                  text="Of Love, Laughter & Us"
                  delay={1.2}
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(16px, 4.5vw, 28px)',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    color: '#FF9DBB',
                    letterSpacing: '0.08em',
                    display: 'block',
                    filter: 'drop-shadow(0 0 8px rgba(255,157,187,0.5))',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Phase 4: Flash overlay */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div
            style={{
              position: 'absolute', inset: 0, zIndex: 10,
              background: 'radial-gradient(ellipse at center, rgba(255,157,187,0.9) 0%, rgba(245,213,138,0.5) 30%, rgba(215,38,94,0.2) 60%, transparent 80%)',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0.4, 0] }}
            transition={{ duration: 3, times: [0, 0.2, 0.6, 1], ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Final fade to black overlay */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div
            style={{
              position: 'absolute', inset: 0, zIndex: 20,
              background: '#08070D',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5, delay: 1.5, ease: 'easeIn' }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Typewriter text ─────────────────────────────────────────────────────────
function TypewriterText({
  text,
  delay,
  style,
}: {
  text: string
  delay: number
  style: React.CSSProperties
}) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let i = 0
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) clearInterval(interval)
      }, 55)
      return () => clearInterval(interval)
    }, delay * 1000)
    return () => clearTimeout(t)
  }, [text, delay])

  return <span style={style}>{displayed}</span>
}
