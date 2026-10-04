import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Ref } from 'react'

import { PixelCoin } from '../fx/PixelCoin'

type HudBarProps = {
  answered: number
  total: number
  totalCoins: number
  infiniteCoins: boolean
  onToggle: () => void
  coinRef: Ref<HTMLSpanElement>
  /** Increments every time a coin is spent — used to replay the counter bump */
  coinBump: number
  /** True right after the visitor ran out of coins: the toggle pulses to hint at it */
  highlightToggle: boolean
  coinsCopy: { remaining: string; toggle: string }
  hudCopy: { player: string; progress: string; level: string }
}

/**
 * Game-style heads-up display: player card with level + XP bar,
 * global coin counter and the infinite-coins switch.
 */
export function HudBar({
  answered,
  total,
  totalCoins,
  infiniteCoins,
  onToggle,
  coinRef,
  coinBump,
  highlightToggle,
  coinsCopy,
  hudCopy,
}: HudBarProps) {
  const prefersReducedMotion = useReducedMotion()
  const pct = total > 0 ? (answered / total) * 100 : 0
  // One level every 3 answered questions
  const level = 1 + Math.floor(answered / 3)

  return (
    <div className="panel-neon flex w-full flex-wrap items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4">
      {/* Player card */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 border-neonCyan bg-gradient-to-b from-neonPurple/50 to-neonPink/30 shadow-neon">
          <img src="/imgs/main_caracter/LK_defrente.png" alt="" className="pixelated h-full w-full object-cover object-top" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="hidden truncate font-pixel text-[10px] text-ink sm:inline">LUIS DA SILVA</span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={level}
                initial={prefersReducedMotion ? undefined : { scale: 2, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                className="shrink-0 rounded bg-neonPink px-1.5 py-0.5 font-pixel text-[8px] text-ink"
              >
                {hudCopy.level} {level}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="relative h-3 flex-1 overflow-hidden rounded-full border border-line bg-abyss">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#22e4ff,#9b5cff,#ff3ea5)] shadow-[0_0_10px_rgba(255,62,165,0.7)]"
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
              {/* Moving shine on the XP bar */}
              <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] bg-[length:50%_100%] bg-no-repeat motion-reduce:animate-none" />
            </div>
            <span className="shrink-0 font-mono text-lg leading-none text-muted" aria-label={hudCopy.progress}>
              {answered}/{total}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Coin counter */}
        <motion.div
          key={coinBump}
          className="flex items-center gap-2 rounded-xl border-2 border-coin/60 bg-abyss/80 px-3 py-2"
          animate={prefersReducedMotion || coinBump === 0 ? undefined : { scale: [1, 1.18, 1], rotate: [0, -4, 0] }}
          transition={{ duration: 0.35 }}
          aria-label={`${coinsCopy.remaining}: ${infiniteCoins ? '∞' : totalCoins}`}
        >
          <PixelCoin ref={coinRef} size={22} spinning />
          {infiniteCoins ? (
            <span className="min-w-[2ch] font-sans text-2xl font-bold leading-none text-coin text-neon">∞</span>
          ) : (
            <span className="min-w-[2ch] font-pixel text-sm text-coin text-neon">{totalCoins}</span>
          )}
        </motion.div>

        {/* Infinite coins switch */}
        <motion.button
          type="button"
          onClick={onToggle}
          aria-pressed={infiniteCoins}
          className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 font-pixel text-[8px] uppercase transition-colors duration-300 ${
            infiniteCoins ? 'border-neonLime bg-neonLime/15 text-neonLime' : 'border-line bg-abyss/80 text-muted hover:border-neonCyan hover:text-ink'
          }`}
          animate={
            highlightToggle && !prefersReducedMotion
              ? { scale: [1, 1.12, 1], boxShadow: ['0 0 0 rgba(124,255,107,0)', '0 0 26px rgba(124,255,107,0.9)', '0 0 0 rgba(124,255,107,0)'] }
              : { scale: 1 }
          }
          transition={highlightToggle ? { duration: 0.7, repeat: 3 } : { duration: 0.2 }}
        >
          <span className="hidden sm:inline">{coinsCopy.toggle}</span>
          <span aria-hidden className="text-base leading-none">♾️</span>
          <span
            className={`relative flex h-5 w-9 items-center rounded-full border-2 transition-colors duration-300 ${
              infiniteCoins ? 'border-neonLime bg-neonLime/30' : 'border-line bg-abyss'
            }`}
          >
            <motion.span
              className={`absolute h-3 w-3 rounded-full ${infiniteCoins ? 'bg-neonLime shadow-[0_0_8px_#7cff6b]' : 'bg-muted'}`}
              animate={{ x: infiniteCoins ? 18 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </span>
        </motion.button>
      </div>
    </div>
  )
}
