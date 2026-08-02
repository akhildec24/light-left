import { useState, useEffect, useCallback, useRef } from 'react'

const CACHE_KEY = 'lightleft:coords'

function loadCachedCoords() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed.lat !== 'number' || typeof parsed.lon !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function saveCachedCoords(coords) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(coords))
  } catch {
    // ignore
  }
}

/**
 * Hook for accessing the browser Geolocation API.
 * - Instantly loads cached coords from localStorage (no spinner on revisit)
 * - Uses watchPosition to detect location changes silently
 * - Falls back to getCurrentPosition if watchPosition is unavailable
 */
export function useGeolocation() {
  const [state, setState] = useState(() => {
    const cached = loadCachedCoords()
    return {
      coords: cached,
      error: null,
      loading: !cached,
    }
  })

  const watchIdRef = useRef(null)

  const handlePosition = useCallback((position) => {
    const coords = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude ?? null,
    }
    saveCachedCoords(coords)
    setState({ coords, error: null, loading: false })
  }, [])

  const handleError = useCallback((err) => {
    let message = 'Unable to get location'
    if (err.code === 1) message = 'Location access denied'
    else if (err.code === 2) message = 'Location unavailable'
    else if (err.code === 3) message = 'Location request timed out'
    setState(prev => ({ ...prev, error: message, loading: false }))
  }, [])

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        coords: prev.coords,
        error: 'Geolocation not supported',
        loading: false,
      }))
      return
    }

    const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }

    // Try watchPosition for continuous monitoring (detects movement)
    if (typeof navigator.geolocation.watchPosition === 'function') {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        options,
      )
    } else {
      // Fallback to one-shot
      navigator.geolocation.getCurrentPosition(handlePosition, handleError, options)
    }
  }, [handlePosition, handleError])

  const request = useCallback(() => {
    // Manual refresh — clear existing watch and re-acquire
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setState(prev => ({ ...prev, loading: true, error: null }))
    start()
  }, [start])

  useEffect(() => {
    start()
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [start])

  return { ...state, request }
}
