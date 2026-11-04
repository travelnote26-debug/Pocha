import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { IconButton } from '@mui/material'
import { useThemeMode } from '../state/themeMode'

export function ThemeToggleButton() {
  const mode = useThemeMode((s) => s.mode)
  const toggle = useThemeMode((s) => s.toggle)
  const isDark = mode === 'dark'

  return (
    <IconButton
      color="inherit"
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      onClick={toggle}
    >
      {isDark ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  )
}
