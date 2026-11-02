import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import CasinoIcon from '@mui/icons-material/Casino'
import StarIcon from '@mui/icons-material/Star'
import { Box, Card, Fab, Stack, Switch, Typography } from '@mui/material'
import type { SvgIconComponent } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { AppTopBar } from '../components/AppTopBar'
import { GameModeCard } from '../components/GameModeCard'
import { BAJADA, RONDA_ARRIBA, SUBIDA, type GamePhase } from '../domain/gamePhase'
import { useNewGame } from '../state/newGame'

interface PhaseInfo {
  phase: GamePhase
  icon: SvgIconComponent
  label: string
  description: string
}

const phaseInfos: PhaseInfo[] = [
  { phase: SUBIDA, icon: ArrowUpwardIcon, label: 'Subida', description: '1 → N cartas' },
  { phase: RONDA_ARRIBA, icon: StarIcon, label: 'Ronda arriba', description: 'Todos reparten todas las cartas' },
  { phase: BAJADA, icon: ArrowDownwardIcon, label: 'Bajada', description: 'N → 1 cartas' }
]

export function NewGamePage() {
  const navigate = useNavigate()
  const selectedPhases = useNewGame((s) => s.selectedPhases)
  const pochaX2 = useNewGame((s) => s.pochaX2)
  const togglePhase = useNewGame((s) => s.togglePhase)
  const togglePochaX2 = useNewGame((s) => s.togglePochaX2)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <AppTopBar title="Nueva Partida" onBack={() => navigate(-1)} />

      <Box sx={{ flexGrow: 1, px: 2, pb: 12 }}>
        <Box sx={{ py: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Seleccionar fases
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {selectedPhases.length} seleccionadas
          </Typography>

          <Stack spacing={1.5}>
            {phaseInfos.map((info) => (
              <GameModeCard
                key={info.phase.name}
                icon={info.icon}
                label={info.label}
                description={info.description}
                isSelected={selectedPhases.some((p) => p.name === info.phase.name)}
                onClick={() => togglePhase(info.phase)}
              />
            ))}
          </Stack>

          <Card
            variant="outlined"
            onClick={togglePochaX2}
            sx={{ mt: 2, borderRadius: 3, cursor: 'pointer', boxShadow: 1, px: 2, py: 1.25 }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CasinoIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Pocha x2
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Duplica puntos si se cogen todas las bazas
                </Typography>
              </Box>
              <Switch checked={pochaX2} />
            </Stack>
          </Card>
        </Box>
      </Box>

      {selectedPhases.length > 0 && (
        <Fab
          variant="extended"
          color="secondary"
          onClick={() => navigate('/new-game/players')}
          sx={{ position: 'fixed', bottom: 24, right: 24, fontWeight: 700 }}
        >
          Siguiente
          <ArrowForwardIcon sx={{ ml: 1 }} />
        </Fab>
      )}
    </Box>
  )
}
