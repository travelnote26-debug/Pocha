import CasinoIcon from '@mui/icons-material/Casino'
import { Box, Stack, Typography } from '@mui/material'

interface EmptyStateProps {
  title: string
  subtitle: string
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
      <Stack alignItems="center" spacing={1} sx={{ p: 3, textAlign: 'center' }}>
        <CasinoIcon sx={{ fontSize: 64, color: 'secondary.main', opacity: 0.8 }} />
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Stack>
    </Box>
  )
}
