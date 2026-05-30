import { LocationIcon } from './Icons.jsx'

export default function LocationHeader({ location, coords, accuracy }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="flex items-center gap-1.5 text-charcoal/60">
        <LocationIcon className="w-3 h-3" />
        <span className="text-[11px] uppercase tracking-wide-lg font-medium">
          Location
        </span>
      </div>
      <h1 className="text-base sm:text-lg font-medium text-charcoal tracking-wide">
        {location ?? 'Acquiring…'}
      </h1>
      {coords && (
        <p className="text-[11px] text-charcoal/40 tabular-nums tracking-wide">
          {Math.abs(coords.lat).toFixed(3)}°{coords.lat >= 0 ? 'N' : 'S'}
          {' · '}
          {Math.abs(coords.lon).toFixed(3)}°{coords.lon >= 0 ? 'E' : 'W'}
        </p>
      )}
    </div>
  )
}
