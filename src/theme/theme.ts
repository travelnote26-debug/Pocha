import { createTheme } from '@mui/material/styles'
import { feltColors as c } from './colors'

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: c.feltGreen, light: c.feltLight, dark: c.feltDark, contrastText: c.cardWhite },
    secondary: { main: c.goldPrimary, dark: c.goldTextLight, contrastText: c.cardBlack },
    background: { default: c.feltSurfaceLight, paper: c.cardWhite },
    text: { primary: c.inkLight, secondary: c.onSurfaceVariantLight },
    divider: c.outlineLight,
    error: { main: c.errorRed, contrastText: c.cardWhite },
    success: { main: c.successGreen },
    warning: { main: c.winnerAmber },
    info: { main: c.feltGreen }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { fontVariantNumeric: 'tabular-nums' }
      }
    }
  }
})

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: c.feltLight, dark: c.feltGreen, contrastText: c.cardWhite },
    secondary: { main: c.goldPrimary, dark: c.goldDark, contrastText: c.cardBlack },
    background: { default: c.feltDark, paper: c.cardDarkSurface },
    text: { primary: c.cardWhite, secondary: c.onSurfaceVariantDark },
    divider: c.outlineDark,
    error: { main: c.errorRed, contrastText: c.cardWhite },
    success: { main: c.successGreen },
    warning: { main: c.winnerAmber },
    info: { main: c.feltLight }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { fontVariantNumeric: 'tabular-nums' }
      }
    }
  }
})

export function getTheme(mode: 'light' | 'dark') {
  return mode === 'dark' ? darkTheme : lightTheme
}
