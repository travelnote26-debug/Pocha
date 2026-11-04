import BackHandIcon from '@mui/icons-material/BackHand'
import CasinoIcon from '@mui/icons-material/Casino'
import { Avatar, Box, Tooltip, Typography } from '@mui/material'
import type { Player } from '../domain/models'
import { feltColors as c, playerColorFor } from '../theme/colors'

interface TablePreviewProps {
  players: Player[]
}

export function TablePreview({ players }: TablePreviewProps) {
  if (players.length === 0) return null

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 220,
        aspectRatio: '1',
        mx: 'auto',
        mt: 1.5,
        mb: 0.5
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '58%',
          height: '58%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${c.feltLight}, ${c.feltGreen} 65%, ${c.feltDark})`,
          border: '3px solid',
          borderColor: 'secondary.main',
          boxShadow:
            'inset 0 0 24px rgba(0,0,0,0.35), 0 6px 18px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 0.25
        }}
      >
        <CasinoIcon sx={{ color: 'secondary.main', fontSize: 28, opacity: 0.9 }} />
        <Typography
          variant="caption"
          sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: 1 }}
        >
          MESA
        </Typography>
      </Box>

      {players.map((player, index) => {
        const angle = (index / players.length) * Math.PI * 2 - Math.PI / 2
        const left = 50 + 42 * Math.cos(angle)
        const top = 50 + 42 * Math.sin(angle)
        const isDealer = index === 0

        return (
          <Tooltip
            key={player.id}
            title={isDealer ? `${player.name} · Reparte` : player.name}
            arrow
          >
            <Box
              sx={{
                position: 'absolute',
                left: `${left}%`,
                top: `${top}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 58
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: playerColorFor(player.id),
                    color: '#FFFFFF',
                    fontWeight: 700,
                    border: '2px solid',
                    borderColor: isDealer ? 'secondary.main' : 'background.paper',
                    boxShadow: 2
                  }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    right: -5,
                    bottom: -5,
                    minWidth: 16,
                    height: 16,
                    px: 0.5,
                    borderRadius: 8,
                    bgcolor: isDealer ? 'secondary.main' : 'background.paper',
                    color: isDealer ? 'secondary.contrastText' : 'text.primary',
                    border: '1px solid',
                    borderColor: 'divider',
                    fontSize: 10,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {index + 1}
                </Box>
                {isDealer && (
                  <BackHandIcon
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      fontSize: 16,
                      color: 'secondary.main',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="caption"
                noWrap
                sx={{ mt: 0.25, maxWidth: 58, fontSize: 10, fontWeight: 600, color: 'text.secondary' }}
              >
                {player.name}
              </Typography>
            </Box>
          </Tooltip>
        )
      })}
    </Box>
  )
}
