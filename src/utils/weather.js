/**
 * Weather code mapping (WMO standard used by Open-Meteo).
 */
export const WEATHER_CODES = {
  0: { label: 'Clear', icon: 'clear' },
  1: { label: 'Mainly Clear', icon: 'clear' },
  2: { label: 'Partly Cloudy', icon: 'partly-cloudy' },
  3: { label: 'Overcast', icon: 'overcast' },
  45: { label: 'Fog', icon: 'fog' },
  48: { label: 'Rime Fog', icon: 'fog' },
  51: { label: 'Light Drizzle', icon: 'drizzle' },
  53: { label: 'Drizzle', icon: 'drizzle' },
  55: { label: 'Dense Drizzle', icon: 'drizzle' },
  56: { label: 'Freezing Drizzle', icon: 'drizzle' },
  57: { label: 'Dense Freezing Drizzle', icon: 'drizzle' },
  61: { label: 'Light Rain', icon: 'rain' },
  63: { label: 'Rain', icon: 'rain' },
  65: { label: 'Heavy Rain', icon: 'rain' },
  66: { label: 'Freezing Rain', icon: 'rain' },
  67: { label: 'Heavy Freezing Rain', icon: 'rain' },
  71: { label: 'Light Snow', icon: 'snow' },
  73: { label: 'Snow', icon: 'snow' },
  75: { label: 'Heavy Snow', icon: 'snow' },
  77: { label: 'Snow Grains', icon: 'snow' },
  80: { label: 'Light Showers', icon: 'rain' },
  81: { label: 'Showers', icon: 'rain' },
  82: { label: 'Violent Showers', icon: 'rain' },
  85: { label: 'Snow Showers', icon: 'snow' },
  86: { label: 'Heavy Snow Showers', icon: 'snow' },
  95: { label: 'Thunderstorm', icon: 'thunderstorm' },
  96: { label: 'Thunderstorm + Hail', icon: 'thunderstorm' },
  99: { label: 'Severe Thunderstorm', icon: 'thunderstorm' },
}

export function getWeatherInfo(code) {
  return WEATHER_CODES[code] ?? { label: 'Unknown', icon: 'unknown' }
}

/**
 * Fetch current weather from Open-Meteo (free, no API key required).
 */
export async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: 'cloud_cover,precipitation,weather_code,visibility,temperature_2m',
    timezone: 'auto',
  })

  const url = `https://api.open-meteo.com/v1/forecast?${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`)
  const data = await res.json()

  const current = data.current ?? {}
  return {
    cloudCover: current.cloud_cover ?? 0,
    precipitation: current.precipitation ?? 0,
    weatherCode: current.weather_code ?? 0,
    visibility: current.visibility ?? 10000,
    temperature: current.temperature_2m ?? null,
  }
}

/**
 * Reverse geocode coordinates to a location name using BigDataCloud
 * (free, no API key, CORS-enabled).
 */
export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat.toFixed(6),
    longitude: lon.toFixed(6),
    localityLanguage: 'en',
  })

  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Geocoding error: ${res.status}`)
  const data = await res.json()

  const city = data.city || data.locality || data.principalSubdivision || null
  const country = (data.countryName || data.countryCode || null)?.replace(/\s*\(the\)\s*$/i, '')
  const region = data.principalSubdivision || null

  let label = city
  if (city && country) label = `${city}, ${country}`
  else if (city && region) label = `${city}, ${region}`
  else if (!city && region && country) label = `${region}, ${country}`
  else if (!city && country) label = country
  else label = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`

  return { label, city, country, region }
}
