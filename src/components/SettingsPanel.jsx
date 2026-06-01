import { useEffect } from 'react'
import { CloseIcon } from './Icons.jsx'
import RadioDial from './RadioDial.jsx'
import { THEMES, FONT_STYLES, TEXT_SIZES } from '../hooks/useSettings.js'

function SegmentedControl({ options, value, onChange, label }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-wide-lg text-charcoal/40 font-medium">
        {label}
      </span>
      <div className="flex gap-0 rounded-lg bg-mist/50 p-0.5">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              value === opt.id
                ? 'bg-canvas text-charcoal shadow-sm'
                : 'text-charcoal/40 hover:text-charcoal/70'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-2.5 text-left group"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-charcoal">
          {label}
        </span>
        {description && (
          <span className="text-[10px] text-charcoal/40">
            {description}
          </span>
        )}
      </div>
      <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
        checked
          ? 'bg-charcoal justify-end'
          : 'bg-mist justify-start'
      }`}>
        <div className={`w-4 h-4 rounded-full transition-colors ${
          checked
            ? 'bg-canvas'
            : 'bg-canvas/60'
        }`} />
      </div>
    </button>
  )
}

export default function SettingsPanel({ open, onClose, settings, onUpdate, onReset }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-matte/20 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 animate-fade-in">
        <div className="bg-canvas border-t sm:border border-mist rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md mx-auto w-full max-h-[90dvh] sm:max-h-[85dvh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-mist shrink-0">
            <h2 className="text-xs uppercase tracking-wide-xl font-semibold text-charcoal">
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-charcoal/30 hover:text-charcoal hover:bg-panel transition-colors"
              aria-label="Close settings"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex flex-col gap-6 flex-1 overflow-y-auto overscroll-contain">
            {/* Appearance */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-wide-lg text-charcoal/30 font-semibold">
                Appearance
              </span>
              <SegmentedControl
                label="Theme"
                options={THEMES}
                value={settings.theme}
                onChange={(v) => onUpdate('theme', v)}
              />
              <SegmentedControl
                label="Typeface"
                options={FONT_STYLES}
                value={settings.fontStyle}
                onChange={(v) => onUpdate('fontStyle', v)}
              />
              <RadioDial
                label="Text Size"
                options={TEXT_SIZES}
                value={settings.textSize}
                onChange={(v) => onUpdate('textSize', v)}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-mist" />

            {/* Accessibility */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide-lg text-charcoal/30 font-semibold mb-2">
                Accessibility
              </span>
              <Toggle
                label="High Contrast"
                description="Increase text and element contrast"
                checked={settings.highContrast}
                onChange={(v) => onUpdate('highContrast', v)}
              />
              <Toggle
                label="Reduced Motion"
                description="Minimize animations and transitions"
                checked={settings.reducedMotion}
                onChange={(v) => onUpdate('reducedMotion', v)}
              />
              <Toggle
                label="Show Seconds"
                description="Display the seconds counter on the clock"
                checked={settings.showSeconds}
                onChange={(v) => onUpdate('showSeconds', v)}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-mist" />

            {/* Reset */}
            <button
              onClick={onReset}
              className="text-[11px] uppercase tracking-wide-lg text-charcoal/40 hover:text-signal transition-colors font-medium py-1"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
