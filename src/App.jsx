import { useState, useEffect, useMemo } from 'react'
import { useGeolocation } from './hooks/useGeolocation.js'
import { useNow } from './hooks/useNow.js'
import {
  getSunEvents,
  getDaylightPhase,
  formatDuration,
  calculateEffectiveSunset,
  formatTime,
} from './utils/daylight.js'
import { fetchWeather, reverseGeocode } from './utils/weather.js'
import LocationHeader from './components/LocationHeader.jsx'
import DaylightClock from './components/DaylightClock.jsx'
import DaylightBar from './components/DaylightBar.jsx'
import WeatherPanel from './components/WeatherPanel.jsx'
import { RefreshIcon, MoonIcon, GearIcon } from './components/Icons.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import { useSettings } from './hooks/useSettings.js'

export default function App() {
  const now = useNow(1000)
  const { settings, update: updateSetting, reset: resetSettings } = useSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { coords, error: geoError, loading: geoLoading, request: requestGeo } = useGeolocation()

  const [weather, setWeather] = useState(null)
  const [location, setLocation] = useState(null)
  const [dataError, setDataError] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)

  // Fetch weather + reverse geocode when coords change
  useEffect(() => {
    if (!coords) return

    let cancelled = false
    setDataLoading(true)
    setDataError(null)

    Promise.all([
      fetchWeather(coords.lat, coords.lon),
      reverseGeocode(coords.lat, coords.lon),
    ])
      .then(([w, loc]) => {
        if (cancelled) return
        setWeather(w)
        setLocation(loc.label)
      })
      .catch((err) => {
        if (cancelled) return
        setDataError(err.message)
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false)
      })

    return () => { cancelled = true }
  }, [coords])

  // Only recalculate sun events when the date changes (not every second)
  const dateKey = now.toDateString()
  const sunEvents = useMemo(() => {
    if (!coords) return null
    return getSunEvents(coords.lat, coords.lon, now, coords.altitude ?? 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, dateKey])

  const effectiveSunsetData = useMemo(() => {
    if (!sunEvents?.sunset) return null
    return calculateEffectiveSunset(sunEvents.sunset, weather)
  }, [sunEvents, weather])

  const effectiveSunset = effectiveSunsetData?.time ?? sunEvents?.sunset
  const adjustmentMinutes = effectiveSunsetData?.adjustmentMinutes ?? 0

  const phase = useMemo(() => {
    if (!sunEvents) return 'night'
    return getDaylightPhase(sunEvents, now)
  }, [sunEvents, now])

  // What time are we counting down to?
  const targetTime = useMemo(() => {
    if (!sunEvents) return null
    if (phase === 'before_dawn') {
      // Before dawn but after midnight — today's sunrise hasn't happened yet
      return sunEvents.sunrise
    }
    if (phase === 'night') {
      // After dusk — today's sunrise has passed, count down to tomorrow's
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowEvents = getSunEvents(coords.lat, coords.lon, tomorrow, coords.altitude ?? 0)
      return tomorrowEvents.sunrise ?? null
    }
    if (phase === 'dawn' || phase === 'day' || phase === 'dusk') {
      return effectiveSunset
    }
    return sunEvents.sunset
  }, [sunEvents, phase, effectiveSunset, now, coords])

  const remaining = useMemo(() => {
    if (!targetTime) return null
    return formatDuration(targetTime - now)
  }, [targetTime, now])

  const handleRefresh = () => {
    requestGeo()
  }

  // --- Loading state ---
  if (geoLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-canvas px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-charcoal/40 animate-pulse-dot" />
          <p className="text-xs uppercase tracking-wide-xl text-charcoal/40 font-medium">
            Acquiring location
          </p>
        </div>
      </div>
    )
  }

  // --- Error state ---
  if (geoError) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-canvas px-6">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
          <div className="w-10 h-10 rounded-full border border-signal/30 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-signal" />
          </div>
          <div>
            <p className="text-sm font-medium text-charcoal">{geoError}</p>
            <p className="mt-2 text-xs text-charcoal/50 leading-relaxed">
              Lightleft needs your precise location to calculate remaining daylight.
              Please enable location access and try again.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal text-canvas text-xs uppercase tracking-wide-lg font-medium hover:bg-matte transition-colors"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  // --- Main display ---
  const isNight = phase === 'night' || phase === 'before_dawn'

  return (
    <div className="min-h-[100dvh] flex flex-col bg-canvas">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 pt-6 sm:pt-8">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isNight ? 'bg-steel' : 'bg-amber'} animate-pulse-dot`} />
          <span className="text-[11px] uppercase tracking-wide-xl font-semibold text-charcoal/70">
            lightleft
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full text-charcoal/30 hover:text-charcoal/60 hover:bg-panel transition-colors"
            aria-label="Refresh location"
          >
            <RefreshIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-full text-charcoal/30 hover:text-charcoal/60 hover:bg-panel transition-colors"
            aria-label="Open settings"
          >
            <GearIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8 sm:gap-12 px-6 py-8">
        <LocationHeader
          location={location}
          coords={coords}
          accuracy={coords?.accuracy}
        />

        {/* Clock or night display */}
        {isNight ? (
          <div className="flex flex-col items-center gap-4">
            <MoonIcon className="w-8 h-8 text-steel/60" />
            <DaylightClock duration={remaining} phase={phase} showSeconds={settings.showSeconds} />
          </div>
        ) : (
          <DaylightClock duration={remaining} phase={phase} showSeconds={settings.showSeconds} />
        )}

        {/* Progress bar */}
        {sunEvents && (
          <DaylightBar
            sunrise={sunEvents.sunrise}
            sunset={sunEvents.sunset}
            effectiveSunset={effectiveSunset}
            now={now}
            phase={phase}
          />
        )}

        {/* Weather */}
        {weather && (
          <WeatherPanel
            weather={weather}
            adjustmentMinutes={adjustmentMinutes}
          />
        )}

        {/* Data loading indicator */}
        {dataLoading && !weather && (
          <div className="flex items-center gap-2 text-[11px] text-charcoal/30">
            <div className="w-1.5 h-1.5 rounded-full bg-charcoal/30 animate-pulse-dot" />
            <span className="uppercase tracking-wide-lg">Fetching weather</span>
          </div>
        )}

        {/* Data error (non-blocking) */}
        {dataError && (
          <p className="text-[11px] text-charcoal/30">
            Weather data unavailable
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 pb-6 sm:pb-8 flex justify-center">
        <p className="text-[10px] text-charcoal/25 uppercase tracking-wide-lg">
          {isNight
            ? `Sunrise at ${sunEvents ? formatTime(phase === 'before_dawn' ? sunEvents.sunrise : getSunEvents(coords.lat, coords.lon, new Date(now.getTime() + 86400000), coords.altitude ?? 0).sunrise) : '--:--'}`
            : `Sunset at ${sunEvents ? formatTime(sunEvents.sunset) : '--:--'}`
          }
        </p>
      </footer>

      {/* Settings */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSetting}
        onReset={resetSettings}
      />
    </div>
  )
}
