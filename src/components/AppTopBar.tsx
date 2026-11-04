import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { ThemeToggleButton } from './ThemeToggleButton'

interface AppTopBarProps {
  title: string
  onBack?: () => void
  actions?: ReactNode
}

export function AppTopBar({ title, onBack, actions }: AppTopBarProps) {
  return (
    <AppBar position="sticky" color="primary" elevation={2}>
      <Toolbar sx={{ minHeight: 56 }}>
        {onBack && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Volver"
            onClick={onBack}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          {title}
        </Typography>
        {actions}
        <ThemeToggleButton />
      </Toolbar>
    </AppBar>
  )
}
