import { formatTime } from '../utils/daylight.js'

/**
 * Horizontal progress bar showing the daylight period.
 * - Charcoal: elapsed (sunrise → now)
 * - Amber: remaining usable daylight (now → effective sunset)
 * - Mist: diminished light (effective sunset → actual sunset)
 * - Red tick: current time
 * - Yellow tick: effective sunset
 */
export default function DaylightBar({
  sunrise,
  sunset,
  effectiveSunset,
  now,
  phase,
}) {
  if (!sunrise || !sunset) return null

  const dayLength = sunset - sunrise
  if (dayLength <= 0) return null

  const nowTime = now.getTime()
  const sunriseTime = sunrise.getTime()
  const sunsetTime = sunset.getTime()

  // Clamp now to bar bounds
  const nowClamped = Math.max(sunriseTime, Math.min(sunsetTime, nowTime))
  const nowPct = ((nowClamped - sunriseTime) / dayLength) * 100

  const isNight = phase === 'night' || phase === 'before_dawn'

  // Effective sunset position
  let effSunsetPct = 100
  let hasAdjustment = false
  if (effectiveSunset && !isNaN(effectiveSunset.getTime())) {
    const effTime = effectiveSunset.getTime()
    effSunsetPct = Math.max(0, Math.min(100, ((effTime - sunriseTime) / dayLength) * 100))
    hasAdjustment = effSunsetPct < 100 - 0.5
  }

  const elapsedPct = isNight ? 100 : Math.max(0, nowPct)
  const remainingPct = isNight ? 0 : Math.max(0, effSunsetPct - nowPct)
  const diminishedPct = isNight ? 0 : Math.max(0, 100 - effSunsetPct)

  return (
    <div className="w-full max-w-md">
      {/* Bar */}
      <div className="relative h-2 rounded-full bg-mist overflow-hidden">
        {/* Elapsed */}
        <div
          className="absolute inset-y-0 left-0 bg-charcoal transition-all duration-1000 ease-linear"
          style={{ width: `${elapsedPct}%` }}
        />
        {/* Remaining usable daylight */}
        <div
          className="absolute inset-y-0 bg-amber/70 transition-all duration-1000 ease-linear"
          style={{ left: `${elapsedPct}%`, width: `${remainingPct}%` }}
        />
        {/* Diminished light (effective → actual sunset) */}
        {hasAdjustment && (
          <div
            className="absolute inset-y-0 bg-mist/60 border-l border-amber/40 transition-all duration-1000 ease-linear"
            style={{ left: `${effSunsetPct}%`, width: `${diminishedPct}%` }}
          />
        )}

        {/* Now indicator */}
        {!isNight && (
          <div
            className="absolute inset-y-0 w-px bg-signal transition-all duration-1000 ease-linear"
            style={{ left: `${nowPct}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-signal" />
          </div>
        )}

        {/* Effective sunset tick */}
        {hasAdjustment && (
          <div
            className="absolute -top-2 bottom-[-6px] w-1 bg-amber rounded-full"
            style={{ left: `${effSunsetPct}%` }}
          />
        )}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2.5 text-[10px] uppercase tracking-wide-lg text-charcoal/40 tabular-nums">
        <span>{formatTime(sunrise)}</span>
        <span className="text-charcoal/30">sunrise</span>
        <span>{formatTime(sunset)}</span>
      </div>

      {/* Effective sunset label */}
      {hasAdjustment && (
        <div className="flex justify-between mt-1 text-[10px] tabular-nums">
          <span className="text-transparent">.</span>
          <span className="text-amber/80 font-medium">
            effective {formatTime(effectiveSunset)}
          </span>
          <span className="text-transparent">.</span>
        </div>
      )}
    </div>
  )
}
