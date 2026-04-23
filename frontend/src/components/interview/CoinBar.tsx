type CoinBarProps = {
  infiniteCoins: boolean
  onToggle: () => void
  coinsCopy: { remaining: string; unlimited: string; toggle: string }
}

export function CoinBar({ infiniteCoins, onToggle, coinsCopy }: CoinBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
      <span className="rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 font-pixel text-[10px] text-slate-300">
        {infiniteCoins ? coinsCopy.unlimited : coinsCopy.remaining}
      </span>
      <button
        type="button"
        onClick={onToggle}
        className="group flex items-center gap-3 rounded-full border border-slate-700/60 bg-slate-900/50 px-4 py-2 font-pixel text-[10px] uppercase tracking-[0.35em] text-slate-300 transition-colors hover:border-highlight/50 hover:text-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        aria-pressed={infiniteCoins}
      >
        <span>{coinsCopy.toggle}</span>
        <span
          className={`relative flex h-5 w-10 items-center rounded-full border transition-colors duration-200 ${
            infiniteCoins
              ? 'border-highlight/80 bg-highlight/30'
              : 'border-slate-600 bg-slate-800/70'
          }`}
        >
          <span
            className={`absolute left-0.5 h-4 w-4 rounded-full transition-transform duration-200 ${
              infiniteCoins ? 'translate-x-5 bg-highlight' : 'bg-slate-400'
            }`}
          />
        </span>
      </button>
    </div>
  )
}
