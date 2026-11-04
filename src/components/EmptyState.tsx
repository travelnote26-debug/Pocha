import CasinoIcon from '@mui/icons-material/Casino'
import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  subtitle: string
  action?: ReactNode
}

export function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
      <Stack alignItems="center" spacing={1} sx={{ p: 3, textAlign: 'center' }}>
        <CasinoIcon sx={{ fontSize: 64, color: 'secondary.dark', opacity: 0.9 }} />
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
        {action && <Box sx={{ pt: 1 }}>{action}</Box>}
      </Stack>
    </Box>
  )
}
