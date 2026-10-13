import { useState, useEffect } from 'react'
import CinematicIntro from './components/CinematicIntro'
import MainScene from './components/MainScene'

export default function App() {
  const [introComplete, setIntroComplete] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div
      style={{
        width: '100%',
        height: '100dvh',
        overflow: 'hidden',
        background: '#08070D',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      {!introComplete && (
        <CinematicIntro
          onComplete={() => setIntroComplete(true)}
          reducedMotion={reducedMotion}
        />
      )}
      {introComplete && <MainScene />}
    </div>
  )
}
