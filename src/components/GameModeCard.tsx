import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import type { SvgIconComponent } from '@mui/icons-material'
import { Box, Card, CardActionArea, Stack, Typography } from '@mui/material'

interface GameModeCardProps {
  icon: SvgIconComponent
  label: string
  description: string
  isSelected: boolean
  onClick: () => void
}

export function GameModeCard({ icon: Icon, label, description, isSelected, onClick }: GameModeCardProps) {
  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          bgcolor: isSelected ? 'secondary.main' : 'background.paper',
          color: isSelected ? 'secondary.contrastText' : 'text.primary',
          boxShadow: isSelected ? 8 : 1,
          borderColor: isSelected ? 'secondary.main' : 'divider'
        }}
      >
        <CardActionArea onClick={onClick} sx={{ py: 2, px: 1.5, textAlign: 'center' }}>
          <Stack alignItems="center" spacing={1}>
            <Icon fontSize="large" color={isSelected ? 'inherit' : 'action'} />
            <Typography variant="subtitle1" fontWeight="bold">
              {label}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: isSelected ? 'inherit' : 'text.secondary', opacity: isSelected ? 0.85 : 1 }}
            >
              {description}
            </Typography>
          </Stack>
        </CardActionArea>
      </Card>
      {isSelected && (
        <CheckCircleIcon
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'secondary.contrastText',
            fontSize: 22
          }}
        />
      )}
    </Box>
  )
}
