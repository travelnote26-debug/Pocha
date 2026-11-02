import CloseIcon from '@mui/icons-material/Close'
import { Dialog, DialogContent, IconButton, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface FullscreenDialogProps {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function FullscreenDialog({ title, open, onClose, children }: FullscreenDialogProps) {
  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <Stack
        direction="row"
        alignItems="center"
        sx={{ pt: 2, pr: 1, pb: 1, px: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <IconButton edge="end" color="inherit" aria-label="Cerrar" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Stack>
      <DialogContent sx={{ px: 1.5, pb: 4 }}>{children}</DialogContent>
    </Dialog>
  )
}
