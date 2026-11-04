import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'apuntator:themeMode'

function readInitialMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // almacenamiento no disponible: usar preferencia del sistema
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

function persistMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // almacenamiento no disponible: mantener solo en memoria
  }
}

interface ThemeModeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

export const useThemeMode = create<ThemeModeState>((set, get) => ({
  mode: readInitialMode(),

  setMode: (mode) => {
    persistMode(mode)
    set({ mode })
  },

  toggle: () => {
    const mode: ThemeMode = get().mode === 'dark' ? 'light' : 'dark'
    persistMode(mode)
    set({ mode })
  }
}))
