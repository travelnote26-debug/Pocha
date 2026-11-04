import { Box } from '@mui/material'
import type { ReactNode } from 'react'

export function BottomActionBar({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        flexShrink: 0,
        position: 'sticky',
        bottom: 0,
        zIndex: 4,
        pt: 1,
        pb: 'calc(8px + env(safe-area-inset-bottom))',
        bgcolor: 'background.default',
        boxShadow: '0 -8px 16px -14px rgba(0, 0, 0, 0.45)'
      }}
    >
      {children}
    </Box>
  )
}
