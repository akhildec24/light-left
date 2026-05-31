import { useState, useEffect, useCallback } from 'react'

/**
 * Hook for accessing the browser Geolocation API.
 * Requests precise location (high accuracy).
 */
export function useGeolocation() {
  const [state, setState] = useState({
    coords: null,
    error: null,
    loading: true,
  })

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ coords: null, error: 'Geolocation not supported', loading: false })
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? null,
          },
          error: null,
          loading: false,
        })
      },
      (err) => {
        let message = 'Unable to get location'
        if (err.code === 1) message = 'Location access denied'
        else if (err.code === 2) message = 'Location unavailable'
        else if (err.code === 3) message = 'Location request timed out'
        setState({ coords: null, error: message, loading: false })
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 },
    )
  }, [])

  useEffect(() => {
    request()
  }, [request])

  return { ...state, request }
}
