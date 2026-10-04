import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'

/**
 * Full-screen animated backdrop shared by every view:
 *  - a three-layer pixel starfield that drifts and parallaxes with the pointer
 *  - occasional shooting stars
 *  - a synthwave sun + perspective grid at the bottom (pure CSS)
 *  - CRT scanlines and vignette on top
 *
 * `showGrid` hides the sun/grid on views where it would compete with content.
 */
type Star = { x: number; y: number; z: number; size: number; twinkle: number; color: string }
type Shooting = { x: number; y: number; vx: number; vy: number; life: number }

const STAR_COLORS = ['#ffffff', '#22e4ff', '#ff3ea5', '#ffd23f', '#b9a8ff']

export function ArcadeBackground({ showGrid = true }: { showGrid?: boolean }) {
  const prefersReducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let stars: Star[] = []
    const shooting: Shooting[] = []
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    let frame = 0
    let time = 0

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Density scales with screen area so phones don't render thousands of stars
      const count = Math.round((width * height) / 5200)
      stars = Array.from({ length: count }, () => {
        const z = Math.random()
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          size: z > 0.85 ? 3 : z > 0.5 ? 2 : 1,
          twinkle: Math.random() * Math.PI * 2,
          color: Math.random() > 0.8 ? STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)] : '#ffffff',
        }
      })
    }

    const onMove = (event: PointerEvent) => {
      pointer.tx = (event.clientX / width - 0.5) * 2
      pointer.ty = (event.clientY / height - 0.5) * 2
    }

    const draw = () => {
      time += 1
      // Smoothly ease the parallax offset towards the pointer
      pointer.x += (pointer.tx - pointer.x) * 0.05
      pointer.y += (pointer.ty - pointer.y) * 0.05
      ctx.clearRect(0, 0, width, height)

      for (const star of stars) {
        if (!prefersReducedMotion) {
          star.y += 0.05 + star.z * 0.35
          if (star.y > height) {
            star.y = 0
            star.x = Math.random() * width
          }
        }
        const px = star.x - pointer.x * star.z * 24
        const py = star.y - pointer.y * star.z * 16
        const alpha = prefersReducedMotion ? 0.8 : 0.45 + Math.sin(time * 0.04 + star.twinkle) * 0.35 + star.z * 0.2
        ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha))
        ctx.fillStyle = star.color
        ctx.fillRect(Math.round(px), Math.round(py), star.size, star.size)
      }

      if (!prefersReducedMotion) {
        if (Math.random() < 0.006 && shooting.length < 2) {
          shooting.push({
            x: Math.random() * width * 0.8,
            y: Math.random() * height * 0.35,
            vx: 9 + Math.random() * 5,
            vy: 3 + Math.random() * 2,
            life: 60,
          })
        }
        for (let i = shooting.length - 1; i >= 0; i -= 1) {
          const s = shooting[i]
          s.x += s.vx
          s.y += s.vy
          s.life -= 1
          const gradient = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 8, s.y - s.vy * 8)
          gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
          gradient.addColorStop(1, 'rgba(34,228,255,0)')
          ctx.globalAlpha = Math.min(1, s.life / 20)
          ctx.strokeStyle = gradient
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(s.x, s.y)
          ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8)
          ctx.stroke()
          if (s.life <= 0) shooting.splice(i, 1)
        }
      }

      ctx.globalAlpha = 1
      if (!prefersReducedMotion) {
        frame = requestAnimationFrame(draw)
      }
    }

    build()
    draw()
    window.addEventListener('resize', build)
    window.addEventListener('pointermove', onMove)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', build)
      window.removeEventListener('pointermove', onMove)
    }
  }, [prefersReducedMotion])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Deep-space gradient with colored nebula blobs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2a0f5c_0%,#0b0620_55%,#070314_100%)]" />
      <div className="absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-neonPurple/25 blur-[120px]" />
      <div className="absolute -right-32 top-1/3 h-[24rem] w-[24rem] rounded-full bg-neonPink/20 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 h-[20rem] w-[30rem] rounded-full bg-neonCyan/10 blur-[120px]" />

      <canvas ref={canvasRef} className="absolute inset-0" />

      {showGrid ? (
        <>
          {/* Striped synthwave sun sitting on the horizon */}
          <div className="absolute bottom-[26vh] left-1/2 h-[30vmin] w-[30vmin] -translate-x-1/2 translate-y-[40%] rounded-full opacity-40 [background:linear-gradient(180deg,#ffd23f_0%,#ff8a3d_40%,#ff3ea5_75%)] [mask-image:repeating-linear-gradient(180deg,#000_0_10px,transparent_10px_14px)] blur-[0.5px]" />
          <div className="absolute inset-x-0 bottom-[26vh] h-px bg-neonPink shadow-[0_0_20px_4px_rgba(255,62,165,0.7)]" />
          <div className="absolute inset-x-[-50%] bottom-0 h-[26vh] overflow-hidden">
            <div className={`synth-grid absolute inset-0 ${prefersReducedMotion ? '' : 'animate-gridMove'}`} />
          </div>
        </>
      ) : null}

      <div className="crt-scanlines absolute inset-0 opacity-60" />
      {!prefersReducedMotion ? (
        <div className="absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />
      ) : null}
      <div className="crt-vignette absolute inset-0" />
    </div>
  )
}
