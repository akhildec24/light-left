# lightleft

How much daylight is left — adjusted for weather.

A minimal, precise daylight tracker that detects your location, calculates remaining sunlight, and adjusts for weather conditions.

## Features

- **Location-based** — auto-detects your position for accurate sun timing
- **NREL SPA accuracy** — ±0.0003° solar position, ±30s for rise/set times (includes nutation, aberration, dynamic refraction, and elevation correction via GPS altitude)
- **Weather-adjusted** — cloud cover, precipitation, fog, and visibility reduce effective daylight
- **Auto-refresh** — weather and air quality poll every 30 minutes, keeping effective sunset accurate as conditions change
- **Phase-aware countdown** — counts down to sunrise (night), effective sunset (day), or dusk (twilight) depending on current phase
- **Air quality** — European AQI from Copernicus Atmosphere Monitoring Service (CAMS)
- **Today's high & low** — current temperature with daily minimum
- **Countdown clock** — hours and minutes until sunset or sunrise
- **Daylight bar** — visual progress with effective sunset indicator
- **Instant tooltips** — CSS-based hover tooltips on all controls
- **Dark mode** — light, dark, and system themes via CSS variables
- **Typeface options** — Inter, Mono, Serif, System
- **Text size dial** — Rams-style progressive sizing (S/M/L/XL)
- **Accessibility** — high contrast, reduced motion, seconds toggle, Escape-to-close modals

## Tech

- React 18 + Vite
- Tailwind CSS (CSS variable theming)
- NREL Solar Position Algorithm (SPA) via sunrise-sunset-js — replaces SunCalc for higher accuracy
- Open-Meteo API for weather data and air quality (CAMS)
- BigDataCloud for reverse geocoding

## Develop

```bash
npm install
npm run dev
```

## License

MIT
