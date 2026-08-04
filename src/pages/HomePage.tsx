import CasinoIcon from '@mui/icons-material/Casino'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import GroupIcon from '@mui/icons-material/Group'
import PersonIcon from '@mui/icons-material/Person'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  IconButton,
  Stack,
  Typography,
  useTheme
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppTopBar } from '../components/AppTopBar'
import { EmptyState } from '../components/EmptyState'
import type { Game } from '../domain/models'
import { displayPhasesString } from '../domain/gamePhase'
import { useDataStore } from '../state/dataStore'
import { feltColors as c } from '../theme/colors'

export function HomePage() {
  const navigate = useNavigate()
  const games = useDataStore((s) => s.db.games)
  const deleteGame = useDataStore((s) => s.deleteGame)
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <AppTopBar
        title="Apuntator"
        actions={
          <IconButton color="inherit" aria-label="Jugadores" onClick={() => navigate('/players')}>
            <PersonIcon />
          </IconButton>
        }
      />

      <Box sx={{ flexGrow: 1, px: 2, pb: 12 }}>
        {games.length === 0 ? (
          <EmptyState title="No hay partidas registradas" subtitle="Toca 'Nueva Partida' para comenzar el recuento en la mesa" />
        ) : (
          <Stack spacing={1.5} sx={{ py: 2 }}>
            <HeroHeaderCard gameCount={games.length} />
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => (game.isFinished ? navigate(`/game-over/${game.id}`) : navigate(`/game/${game.id}`))}
                onDelete={() => setGameToDelete(game)}
              />
            ))}
          </Stack>
        )}
      </Box>

      <Fab
        variant="extended"
        color="secondary"
        onClick={() => navigate('/new-game')}
        sx={{ position: 'fixed', bottom: 24, right: 24, fontWeight: 700 }}
      >
        <PlayArrowIcon sx={{ mr: 1 }} />
        Nueva Partida
      </Fab>

      <Dialog open={gameToDelete !== null} onClose={() => setGameToDelete(null)}>
        <DialogTitle fontWeight="bold">Eliminar partida</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar esta partida? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGameToDelete(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (gameToDelete) deleteGame(gameToDelete.id)
              setGameToDelete(null)
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function HeroHeaderCard({ gameCount }: { gameCount: number }) {
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3, bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'secondary.main', boxShadow: 4, px: 2.5, py: 2.5 }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="overline" color="secondary.main" fontWeight="bold">
            Anotador de Pocha
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            Tus Partidas
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {gameCount} {gameCount === 1 ? 'partida registrada' : 'partidas registradas'}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CasinoIcon />
        </Box>
      </Stack>
    </Card>
  )
}

function GameCard({ game, onClick, onDelete }: { game: Game; onClick: () => void; onDelete: () => void }) {
  const theme = useTheme()
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'background.paper', borderColor: 'divider', boxShadow: 3 }}>
      <CardActionArea onClick={onClick}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
              <Box
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: 12,
                  fontWeight: 700,
                  bgcolor: game.isFinished ? 'action.hover' : `${c.successGreen}2E`,
                  color: game.isFinished ? 'text.secondary' : c.successGreen
                }}
              >
                {game.isFinished ? 'Finalizada' : 'En curso'}
              </Box>
              {game.pochaX2 && (
                <Box sx={{ px: 0.75, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 700, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                  x2
                </Box>
              )}
            </Stack>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
              {displayPhasesString(game.phases)}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5, color: 'text.secondary' }}>
              <GroupIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" color="text.secondary">
                {game.numPlayers} jugadores
              </Typography>
            </Stack>
          </Box>
          <Stack direction="row" alignItems="center">
            <IconButton
              aria-label="Eliminar"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              sx={{ color: theme.palette.error.main, opacity: 0.8 }}
            >
              <DeleteOutlineIcon />
            </IconButton>
            <PlayArrowIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  )
}
