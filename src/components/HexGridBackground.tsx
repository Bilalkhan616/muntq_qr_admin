import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { Container, ISourceOptions } from '@tsparticles/engine'

export const HexGridBackground = memo(function HexGridBackground() {
  const [init, setInit] = useState(false)

  // Initialize particles engine once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setInit(true))
  }, [])

  // High-performance mouse tracking (NO React state)
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight

      document.documentElement.style.setProperty('--mouse-x', x.toString())
      document.documentElement.style.setProperty('--mouse-y', y.toString())
    }

    window.addEventListener('mousemove', handleMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMove)
    }
  }, [])

  const particlesLoaded = useCallback(async (_container?: Container) => {}, [])

  // Memoized options (prevents re-creation)
  const options = useMemo<ISourceOptions>(
    () => ({
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      fullScreen: { enable: false },
      particles: {
        number: {
          value: 150,
          density: { enable: true, width: 1920, height: 1080 },
        },
        color: { value: '#FF0000' },
        shape: { type: 'circle' },
        opacity: {
          value: { min: 0.15, max: 0.4 },
        },
        size: {
          value: { min: 1, max: 2.5 },
        },
        links: {
          enable: true,
          distance: 140,
          color: '#FF0000',
          opacity: 0.12,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.3,
          direction: 'none',
          random: true,
          straight: false,
          outModes: { default: 'bounce' },
        },
      },
      interactivity: {
        detectsOn: 'window',
        events: {
          onHover: {
            enable: true,
            mode: 'grab',
          },
          onClick: {
            enable: true,
            mode: 'push',
          },
        },
        modes: {
          grab: {
            distance: 160,
            links: { opacity: 0.35 },
          },
          push: {
            quantity: 3,
          },
        },
      },
      detectRetina: true,
    }),
    []
  )

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgb(248 250 252) 0%, rgb(255 255 255) 45%, rgb(238 242 255) 100%)',
        }}
      />

      {/* Particles layer */}
      <div className="pointer-events-auto absolute inset-0">
        {init && (
          <Particles
            id="tsparticles-hexgrid"
            className="absolute inset-0"
            particlesLoaded={particlesLoaded}
            options={options}
          />
        )}
      </div>

      {/* Mouse-following radial glow (CSS variable powered) */}
      <div
        className="absolute pointer-events-none transition-opacity duration-200 ease-out"
        style={{
          left: 'calc(var(--mouse-x, 0.5) * 100%)',
          top: 'calc(var(--mouse-y, 0.5) * 100%)',
          width: 'min(90vmax, 520px)',
          height: 'min(90vmax, 520px)',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(99 102 241 / 0.06) 0%, rgba(99 102 241 / 0.02) 40%, transparent 65%)',
        }}
      />
    </div>
  )
})
