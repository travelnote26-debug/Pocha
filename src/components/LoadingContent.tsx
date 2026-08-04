import { Box, Stack, Typography } from '@mui/material'

interface LoadingContentProps {
  message?: string
}

export function LoadingContent({ message = 'Cargando...' }: LoadingContentProps) {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '3px solid',
            borderColor: 'divider',
            borderTopColor: 'secondary.main',
            animation: 'spin 0.8s linear infinite',
            '@keyframes spin': { to: { transform: 'rotate(360deg)' } }
          }}
        />
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </Stack>
    </Box>
  )
}
