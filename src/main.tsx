import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { App } from './App'
import { useDataStore } from './state/dataStore'
import { getTheme } from './theme/theme'
import { setupServiceWorker } from './utils/swUpdate'

setupServiceWorker()
useDataStore.getState().load()

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={getTheme(prefersDark ? 'dark' : 'light')}>
      <CssBaseline />
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
)
