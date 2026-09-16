type CoinBarProps = {
  infiniteCoins: boolean
  onToggle: () => void
  coinsCopy: { remaining: string; unlimited: string; toggle: string }
}

export function CoinBar({ infiniteCoins, onToggle, coinsCopy }: CoinBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-wide text-charcoal/60">
      <span className="rounded-full border border-[#d8c39a] bg-creamPanel/70 px-3 py-1 font-sans text-[10px] font-semibold text-charcoal/70">
        {infiniteCoins ? coinsCopy.unlimited : coinsCopy.remaining}
      </span>
      <button
        type="button"
        onClick={onToggle}
        className="group flex items-center gap-3 rounded-full border border-[#d8c39a] bg-creamPanel/60 px-4 py-2 font-sans text-[10px] font-semibold uppercase tracking-wide text-charcoal/70 transition-colors duration-300 hover:border-highlight/50 hover:text-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        aria-pressed={infiniteCoins}
      >
        <span>{coinsCopy.toggle}</span>
        <span
          className={`relative flex h-5 w-10 items-center rounded-full border transition-colors duration-300 ${
            infiniteCoins
              ? 'border-highlight/80 bg-highlight/30'
              : 'border-[#d8c39a] bg-cream'
          }`}
        >
          <span
            className={`absolute left-0.5 h-4 w-4 rounded-full transition-transform duration-300 ${
              infiniteCoins ? 'translate-x-5 bg-highlight' : 'bg-[#b3a082]'
            }`}
          />
        </span>
      </button>
    </div>
  )
}
