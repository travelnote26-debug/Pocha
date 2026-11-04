import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { App } from './App'
import { useDataStore } from './state/dataStore'
import { useThemeMode } from './state/themeMode'
import { getTheme } from './theme/theme'
import { setupServiceWorker } from './utils/swUpdate'

setupServiceWorker()
useDataStore.getState().load()

function Root() {
  const mode = useThemeMode((s) => s.mode)
  const theme = getTheme(mode)

  useEffect(() => {
    document.documentElement.style.colorScheme = mode
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme.palette.primary.main)
  }, [mode, theme])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
