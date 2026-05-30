# lightleft

How much daylight is left — adjusted for weather.

A minimal, precise daylight tracker that detects your location, calculates remaining sunlight, and adjusts for weather conditions.

## Features

- **Location-based** — auto-detects your position for accurate sun timing
- **Weather-adjusted** — cloud cover and precipitation reduce effective daylight
- **Countdown clock** — hours and minutes until sunset or sunrise
- **Daylight bar** — visual progress with effective sunset indicator
- **Dark mode** — light, dark, and system themes via CSS variables
- **Typeface options** — Inter, Mono, Serif, System
- **Text size dial** — Rams-style progressive sizing (S/M/L/XL)
- **Accessibility** — high contrast, reduced motion, seconds toggle

## Tech

- React 18 + Vite
- Tailwind CSS (CSS variable theming)
- SunCalc for sun position calculations
- Open-Meteo API for weather data
- BigDataCloud for reverse geocoding

## Develop

```bash
npm install
npm run dev
```

## License

MIT
