export default function RadioDial({ options, value, onChange, label }) {
  const selectedIndex = options.findIndex(o => o.id === value)

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-wide-lg text-charcoal/40 font-medium">
        {label}
      </span>
      <div className="relative flex items-center justify-between px-1">
        {/* Track line */}
        <div className="absolute left-3 right-3 h-px bg-mist" />

        {/* Filled portion up to selection */}
        {selectedIndex > 0 && (
          <div
            className="absolute left-3 h-px bg-amber transition-all duration-300"
            style={{ width: `calc((100% - 1.5rem) * ${selectedIndex / (options.length - 1)})` }}
          />
        )}

        {/* Dots */}
        <div className="relative flex justify-between w-full">
          {options.map((opt, i) => {
            const isActive = i === selectedIndex
            const isPassed = i < selectedIndex
            return (
              <button
                key={opt.id}
                onClick={() => onChange(opt.id)}
                className="flex flex-col items-center gap-1.5 group"
                aria-label={opt.label}
              >
                <div
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-3 h-3 bg-amber ring-4 ring-amber/15'
                      : isPassed
                        ? 'w-2 h-2 bg-amber/60'
                        : 'w-2 h-2 bg-mist group-hover:bg-charcoal/30'
                  }`}
                />
                <span
                  className={`text-[9px] uppercase tracking-wide-lg font-medium transition-colors ${
                    isActive
                      ? 'text-charcoal'
                      : 'text-charcoal/30 group-hover:text-charcoal/50'
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
