import SunCalc from 'suncalc'

/**
 * Get sun events for a given location and date.
 * Returns sunrise, sunset, goldenHour, dawn, dusk, etc.
 */
export function getSunEvents(lat, lon, date = new Date()) {
  const times = SunCalc.getTimes(date, lat, lon)
  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    goldenHour: times.goldenHour,
    goldenHourEnd: times.goldenHourEnd,
    dawn: times.dawn,
    dusk: times.dusk,
    nauticalDusk: times.nauticalDusk,
    nauticalDawn: times.nauticalDawn,
    night: times.night,
    nightEnd: times.nightEnd,
  }
}

/**
 * Get current sun position (altitude, azimuth).
 */
export function getSunPosition(lat, lon, date = new Date()) {
  const pos = SunCalc.getPosition(date, lat, lon)
  return {
    altitude: pos.altitude, // radians
    azimuth: pos.azimuth,   // radians
    altitudeDeg: pos.altitude * (180 / Math.PI),
    azimuthDeg: pos.azimuth * (180 / Math.PI),
  }
}

/**
 * Determine the current daylight phase.
 */
export function getDaylightPhase(sunEvents, now = new Date()) {
  if (now < sunEvents.dawn) return 'before_dawn'
  if (now < sunEvents.sunrise) return 'dawn'
  if (now < sunEvents.sunset) return 'day'
  if (now < sunEvents.dusk) return 'dusk'
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
  if (!sunset || isNaN(sunset.getTime())) return sunset
  if (!weather) return sunset

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
