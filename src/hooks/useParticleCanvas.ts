import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  alpha: number
  targetX?: number
  targetY?: number
  mode: 'float' | 'orbit' | 'gather' | 'burst'
  angle?: number
  radius?: number
  speed?: number
}

interface UseParticleCanvasOptions {
  mode: 'float' | 'orbit' | 'gather' | 'burst'
  count?: number
  centerX?: number
  centerY?: number
  active?: boolean
}

const COLORS = ['#F5D58A', '#FF9DBB', '#FFF8FC', '#D7265E', '#FFB7CC']

function createParticle(
  canvas: HTMLCanvasElement,
  mode: Particle['mode'],
  centerX: number,
  centerY: number
): Particle {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]

  if (mode === 'float') {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.6 - 0.1,
      life: 0,
      maxLife: 180 + Math.random() * 200,
      size: Math.random() * 2.5 + 0.5,
      color,
      alpha: 0,
      mode,
    }
  }

  if (mode === 'orbit') {
    const angle = Math.random() * Math.PI * 2
    const radius = 60 + Math.random() * 80
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 300,
      size: Math.random() * 2 + 0.5,
      color,
      alpha: 0,
      mode,
      angle,
      radius,
      speed: (Math.random() * 0.008 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
    }
  }

  if (mode === 'gather') {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 120,
      size: Math.random() * 3 + 1,
      color,
      alpha: Math.random() * 0.8 + 0.2,
      mode,
      targetX: centerX,
      targetY: centerY,
    }
  }

  // burst
  const angle = Math.random() * Math.PI * 2
  const speed = Math.random() * 5 + 2
  return {
    x: centerX,
    y: centerY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    maxLife: 80 + Math.random() * 40,
    size: Math.random() * 3 + 1,
    color,
    alpha: 1,
    mode,
  }
}

export function useParticleCanvas(options: UseParticleCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || options.active === false) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const count = options.count ?? 60
    const getCx = () => options.centerX ?? canvas.width / 2
    const getCy = () => options.centerY ?? canvas.height / 2

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(canvas, options.mode, getCx(), getCy())
    )

    let frame = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = getCx()
      const cy = getCy()

      particlesRef.current.forEach((p, i) => {
        p.life++

        if (p.mode === 'float') {
          const progress = p.life / p.maxLife
          p.alpha = progress < 0.2
            ? progress / 0.2 * 0.7
            : progress > 0.8
            ? (1 - progress) / 0.2 * 0.7
            : 0.7
          p.x += p.vx
          p.y += p.vy

          if (p.life >= p.maxLife) {
            particlesRef.current[i] = createParticle(canvas, 'float', cx, cy)
          }
        } else if (p.mode === 'orbit') {
          p.angle = (p.angle ?? 0) + (p.speed ?? 0.005)
          p.x = cx + Math.cos(p.angle) * (p.radius ?? 80)
          p.y = cy + Math.sin(p.angle) * (p.radius ?? 80)
          const progress = p.life / p.maxLife
          p.alpha = progress < 0.3
            ? progress / 0.3 * 0.9
            : progress > 0.7
            ? (1 - progress) / 0.3 * 0.9
            : 0.9
          if (p.life >= p.maxLife) {
            particlesRef.current[i] = createParticle(canvas, 'orbit', cx, cy)
          }
        } else if (p.mode === 'gather') {
          const dx = cx - p.x
          const dy = cy - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > 2) {
            const eased = 0.04 + (1 - dist / (canvas.width)) * 0.06
            p.x += dx * eased
            p.y += dy * eased
          }
          const progress = p.life / p.maxLife
          p.alpha = progress < 0.3
            ? p.alpha
            : (1 - progress) / 0.7 * 0.8
          if (p.life >= p.maxLife) {
            particlesRef.current[i] = createParticle(canvas, 'gather', cx, cy)
          }
        } else if (p.mode === 'burst') {
          p.x += p.vx
          p.y += p.vy
          p.vx *= 0.96
          p.vy *= 0.96
          p.vy += 0.05 // gentle gravity
          const progress = p.life / p.maxLife
          p.alpha = 1 - progress
          if (p.life >= p.maxLife) {
            particlesRef.current[i] = createParticle(canvas, 'burst', cx, cy)
          }
        }

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = p.size * 3
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      frame++
      rafRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [options.mode, options.count, options.active])

  return canvasRef
}
