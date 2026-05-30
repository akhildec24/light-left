import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'lightleft-settings'

export const FONT_STYLES = [
  { id: 'inter', label: 'Inter', stack: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { id: 'mono', label: 'Mono', stack: "'SF Mono', 'Menlo', 'Consolas', monospace" },
  { id: 'serif', label: 'Serif', stack: "'Georgia', 'Times New Roman', serif" },
  { id: 'system', label: 'System', stack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
]

export const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
]

export const TEXT_SIZES = [
  { id: 'sm', label: 'S' },
  { id: 'regular', label: 'M' },
  { id: 'large', label: 'L' },
  { id: 'xl', label: 'XL' },
]

const DEFAULTS = {
  theme: 'system',
  fontStyle: 'inter',
  textSize: 'regular',
  highContrast: false,
  reducedMotion: false,
  showSeconds: true,
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return DEFAULTS
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {}
  }, [settings])

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement
    const applyTheme = (isDark) => {
      if (isDark) root.classList.add('dark')
      else root.classList.remove('dark')
    }

    if (settings.theme === 'dark') {
      applyTheme(true)
    } else if (settings.theme === 'light') {
      applyTheme(false)
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mq.matches)
      const handler = (e) => applyTheme(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [settings.theme])

  // Apply font family to body (body has its own font-family in CSS that overrides html)
  useEffect(() => {
    const font = FONT_STYLES.find(f => f.id === settings.fontStyle)
    if (font) document.body.style.fontFamily = font.stack
  }, [settings.fontStyle])

  // Apply accessibility classes
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('high-contrast', settings.highContrast)
    root.classList.toggle('reduced-motion', settings.reducedMotion)
    // Text size: remove all, add current
    root.classList.remove('text-sm', 'text-regular', 'text-large', 'text-xl')
    if (settings.textSize !== 'regular') {
      root.classList.add(`text-${settings.textSize}`)
    }
  }, [settings.highContrast, settings.reducedMotion, settings.textSize])

  const update = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => setSettings(DEFAULTS), [])

  return { settings, update, reset }
}
