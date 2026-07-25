import { WeatherIcon } from './Icons.jsx'
import { getWeatherInfo } from '../utils/weather.js'

const AQI_LABELS = [
  { max: 20, label: 'Good' },
  { max: 40, label: 'Fair' },
  { max: 60, label: 'Moderate' },
  { max: 80, label: 'Poor' },
  { max: 100, label: 'Very Poor' },
  { max: Infinity, label: 'Extremely Poor' },
]

function getAQILabel(value) {
  if (value == null) return null
  return AQI_LABELS.find(t => value <= t.max)?.label ?? 'Unknown'
}

export default function WeatherPanel({ weather, airQuality, adjustmentMinutes }) {
  if (!weather) return null

  const info = getWeatherInfo(weather.weatherCode)
  const hasAdjustment = adjustmentMinutes !== 0 && adjustmentMinutes < 0
  const aqiLabel = airQuality ? getAQILabel(airQuality.europeanAQI) : null

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Current conditions */}
      <div className="flex items-center gap-3 text-charcoal/60">
        <WeatherIcon name={info.icon} className="w-5 h-5" />
        <span className="text-sm font-medium">{info.label}</span>
        {weather.temperature != null && (
          <>
            <span className="text-charcoal/20">·</span>
            <span className="text-sm tabular-nums">{Math.round(weather.temperature)}°</span>
          </>
        )}
        {weather.tempMin != null && (
          <>
            <span className="text-charcoal/20">·</span>
            <span className="text-sm tabular-nums text-charcoal/40">
              {Math.round(weather.tempMin)}°
            </span>
          </>
        )}
      </div>

      {/* Cloud cover bar */}
      <div className="flex items-center gap-2 text-[11px] text-charcoal/40">
        <span className="uppercase tracking-wide-lg">Cloud</span>
        <div className="w-24 h-1 rounded-full bg-mist overflow-hidden">
          <div
            className="h-full bg-charcoal/40 rounded-full transition-all duration-700"
            style={{ width: `${weather.cloudCover ?? 0}%` }}
          />
        </div>
        <span className="tabular-nums font-medium text-charcoal/60">
          {weather.cloudCover ?? 0}%
        </span>
      </div>

      {/* Air quality */}
      {airQuality?.europeanAQI != null && (
        <div className="flex items-center gap-2 text-[11px] text-charcoal/40">
          <span className="uppercase tracking-wide-lg">Air</span>
          <span className="tabular-nums font-medium text-charcoal/60">
            {airQuality.europeanAQI}
          </span>
          <span className="text-charcoal/30">·</span>
          <span className="font-medium text-charcoal/50">{aqiLabel}</span>
        </div>
      )}

      {/* Adjustment notice */}
      {hasAdjustment && (
        <div className="flex items-center gap-1.5 text-[11px] text-charcoal/50">
          <span className="w-1 h-1 rounded-full bg-amber animate-pulse-dot" />
          <span>
            Daylight reduced by{' '}
            <span className="text-charcoal/80 font-medium tabular-nums">
              {Math.abs(adjustmentMinutes)} min
            </span>{' '}
            due to conditions
          </span>
        </div>
      )}
    </div>
  )
}
