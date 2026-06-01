import { getSunTimes, getSolarPosition } from 'sunrise-sunset-js'

/**
 * Get sun events for a given location and date.
 * Uses NREL's Solar Position Algorithm (SPA) for high-precision calculations
 * (±0.0003° accuracy, ±30 seconds for rise/set times).
 *
 * @param {number} lat - Latitude in decimal degrees
 * @param {number} lon - Longitude in decimal degrees
 * @param {Date} date - Date to calculate for (defaults to now)
 * @param {number} elevation - Observer elevation in meters (default: 0)
 * @returns {object} Sun events: sunrise, sunset, goldenHour, dawn, dusk, etc.
 */
export function getSunEvents(lat, lon, date = new Date(), elevation = 0) {
  const options = { elevation }
  const times = getSunTimes(lat, lon, date, options)

  if (!times) {
    return {
      sunrise: null,
      sunset: null,
      goldenHour: null,
      goldenHourEnd: null,
      dawn: null,
      dusk: null,
      nauticalDusk: null,
      nauticalDawn: null,
      night: null,
      nightEnd: null,
    }
  }

  const tw = times.twilight || {}

  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    goldenHour: tw.goldenHour?.evening?.start ?? null,
    goldenHourEnd: tw.goldenHour?.morning?.end ?? null,
    dawn: tw.civilDawn ?? null,
    dusk: tw.civilDusk ?? null,
    nauticalDusk: tw.nauticalDusk ?? null,
    nauticalDawn: tw.nauticalDawn ?? null,
    night: tw.astronomicalDusk ?? null,
    nightEnd: tw.astronomicalDawn ?? null,
  }
}

/**
 * Get current sun position (altitude, azimuth).
 * Uses NREL SPA for high-precision solar position.
 *
 * @param {number} lat - Latitude in decimal degrees
 * @param {number} lon - Longitude in decimal degrees
 * @param {Date} date - Date to calculate for (defaults to now)
 * @param {number} elevation - Observer elevation in meters (default: 0)
 * @returns {object} Sun position: altitude (radians), azimuth (radians), altitudeDeg, azimuthDeg
 */
export function getSunPosition(lat, lon, date = new Date(), elevation = 0) {
  const pos = getSolarPosition(lat, lon, date, { elevation })
  if (!pos) {
    return { altitude: 0, azimuth: 0, altitudeDeg: 0, azimuthDeg: 0 }
  }
  return {
    altitude: pos.elevation * (Math.PI / 180),
    azimuth: pos.azimuth * (Math.PI / 180),
    altitudeDeg: pos.elevation,
    azimuthDeg: pos.azimuth,
  }
}

/**
 * Determine the current daylight phase.
 * Uses civil dawn/dusk (sun at -6°) as the boundary for dawn/dusk phases.
 *
 * @param {object} sunEvents - Sun events from getSunEvents()
 * @param {Date} now - Current time (defaults to now)
 * @returns {string} Phase: 'before_dawn', 'dawn', 'day', 'dusk', 'night'
 */
export function getDaylightPhase(sunEvents, now = new Date()) {
  if (sunEvents.dawn && now < sunEvents.dawn) return 'before_dawn'
  if (sunEvents.sunrise && now < sunEvents.sunrise) return 'dawn'
  if (sunEvents.sunset && now < sunEvents.sunset) return 'day'
  if (sunEvents.dusk && now < sunEvents.dusk) return 'dusk'
  return 'night'
}

/**
 * Format a duration in milliseconds as "Xh Ym" or "Ym" or "Ys".
 */
export function formatDuration(ms) {
  if (ms <= 0) return '0m'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return { hours, minutes, seconds, label: `${hours}h ${minutes}m` }
  }
  if (minutes > 0) {
    return { hours: 0, minutes, seconds, label: `${minutes}m` }
  }
  return { hours: 0, minutes: 0, seconds, label: `${seconds}s` }
}

/**
 * Format a Date as HH:MM in local time.
 */
export function formatTime(date) {
  if (!date || isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

/**
 * Calculate the progress (0-1) of the current time between two dates.
 */
export function getProgress(start, end, now = new Date()) {
  const total = end - start
  if (total <= 0) return 0
  const elapsed = now - start
  return Math.max(0, Math.min(1, elapsed / total))
}

/**
 * Calculate effective sunset time adjusted for weather conditions.
 * Cloud cover, precipitation, fog, and low visibility all reduce
 * the usable daylight before the actual sunset.
 */
export function calculateEffectiveSunset(sunset, weather) {
  if (!sunset || isNaN(sunset.getTime())) return null
  if (!weather) return { time: sunset, adjustmentMinutes: 0 }

  let adjustmentMinutes = 0

  // Cloud cover (non-linear — thicker clouds block more light near horizon)
  const cloudCover = weather.cloudCover ?? 0
  if (cloudCover > 95) adjustmentMinutes -= 32
  else if (cloudCover > 85) adjustmentMinutes -= 24
  else if (cloudCover > 70) adjustmentMinutes -= 16
  else if (cloudCover > 50) adjustmentMinutes -= 10
  else if (cloudCover > 30) adjustmentMinutes -= 5
  else if (cloudCover > 15) adjustmentMinutes -= 2

  // Precipitation
  const precip = weather.precipitation ?? 0
  if (precip > 5) adjustmentMinutes -= 15
  else if (precip > 2) adjustmentMinutes -= 10
  else if (precip > 0.5) adjustmentMinutes -= 7
  else if (precip > 0) adjustmentMinutes -= 3

  // Weather code specific conditions
  const code = weather.weatherCode ?? 0
  if (code >= 95) adjustmentMinutes -= 10      // Thunderstorm
  else if (code >= 45 && code <= 48) adjustmentMinutes -= 12  // Fog
  else if (code >= 71 && code <= 77) adjustmentMinutes -= 8   // Snow

  // Visibility
  const visibility = weather.visibility ?? 10000
  if (visibility < 1000) adjustmentMinutes -= 10
  else if (visibility < 5000) adjustmentMinutes -= 5

  const effective = new Date(sunset.getTime() + adjustmentMinutes * 60000)
  return { time: effective, adjustmentMinutes }
}
