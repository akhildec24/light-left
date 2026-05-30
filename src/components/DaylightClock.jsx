/**
 * Large countdown display showing time remaining.
 * Hours and minutes in charcoal, seconds in amber (like a seconds hand).
 */
export default function DaylightClock({ duration, phase, showSeconds = true }) {
  if (!duration) return null

  const { hours, minutes, seconds } = duration
  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  const isNight = phase === 'night' || phase === 'before_dawn'
  const isTwilight = phase === 'dawn' || phase === 'dusk'

  return (
    <div className="flex flex-col items-center">
      <div
        className="flex items-baseline justify-center tabular-nums select-none"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        <span className="text-6xl sm:text-7xl md:text-8xl font-light text-charcoal leading-none tracking-tight">
          {hh}
        </span>
        <span className="text-5xl sm:text-6xl md:text-7xl font-extralight text-charcoal/30 leading-none mx-1">
          :
        </span>
        <span className="text-6xl sm:text-7xl md:text-8xl font-light text-charcoal leading-none tracking-tight">
          {mm}
        </span>
        {showSeconds && (
          <>
            <span className="text-5xl sm:text-6xl md:text-7xl font-extralight text-charcoal/30 leading-none mx-1">
              :
            </span>
            <span className="text-3xl sm:text-4xl md:text-5xl font-light text-amber leading-none tracking-tight self-end mb-1 sm:mb-2">
              {ss}
            </span>
          </>
        )}
      </div>

      <p className="mt-3 text-xs sm:text-sm uppercase tracking-wide-xl font-medium text-charcoal/50">
        {isNight
          ? 'until sunrise'
          : isTwilight
            ? 'of twilight left'
            : 'of daylight left'}
      </p>
    </div>
  )
}
