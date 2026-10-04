import { forwardRef } from 'react'

/**
 * Pixel-art coin drawn as an SVG grid so it stays crisp at any size.
 * `spinning` adds a continuous Y-axis flip.
 */
export const PixelCoin = forwardRef<HTMLSpanElement, { size?: number; spinning?: boolean; className?: string }>(
  function PixelCoin({ size = 20, spinning = false, className = '' }, ref) {
    return (
      <span
        ref={ref}
        aria-hidden
        className={`inline-block [perspective:200px] ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 10 10"
          width={size}
          height={size}
          shapeRendering="crispEdges"
          className={`drop-shadow-[0_0_6px_rgba(255,210,63,0.8)] ${spinning ? 'animate-coinSpin motion-reduce:animate-none' : ''}`}
        >
          <rect x="3" y="0" width="4" height="1" fill="#7a4d00" />
          <rect x="1" y="1" width="8" height="8" fill="#7a4d00" />
          <rect x="0" y="3" width="10" height="4" fill="#7a4d00" />
          <rect x="3" y="9" width="4" height="1" fill="#7a4d00" />
          <rect x="2" y="1" width="6" height="8" fill="#ffd23f" />
          <rect x="1" y="2" width="8" height="6" fill="#ffd23f" />
          <rect x="4" y="2" width="2" height="6" fill="#c98a00" />
          <rect x="2" y="2" width="1" height="2" fill="#fff6c2" />
          <rect x="3" y="1" width="2" height="1" fill="#fff6c2" />
        </svg>
      </span>
    )
  },
)
