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
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppTopBar } from '../components/AppTopBar'
import { EmptyState } from '../components/EmptyState'
import type { Game } from '../domain/models'
import { displayPhasesString, parsePhases } from '../domain/gamePhase'
import { generateRounds } from '../domain/roundGenerator'
import { useDataStore } from '../state/dataStore'
import { feltColors as c } from '../theme/colors'

interface GameSummary {
  totalRounds: number
  playedRounds: number
  leaderName: string | null
  leaderScore: number | null
}

function formatGameDate(timestamp: number): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' })
  }).format(date)
}

export function HomePage() {
  const navigate = useNavigate()
  const games = useDataStore((s) => s.db.games)
  const rounds = useDataStore((s) => s.db.rounds)
  const scores = useDataStore((s) => s.db.scores)
  const players = useDataStore((s) => s.db.players)
  const deleteGame = useDataStore((s) => s.deleteGame)
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null)

  const summaries = useMemo(() => {
    const roundById = new Map(rounds.map((round) => [round.id, round]))
    const nameById = new Map(players.map((player) => [player.id, player.name]))
    const totalsByGame = new Map<number, Map<number, number>>()
    const scoredRoundsByGame = new Map<number, Set<number>>()

    for (const score of scores) {
      const round = roundById.get(score.roundId)
      if (!round) continue

      let totals = totalsByGame.get(round.gameId)
      if (!totals) {
        totals = new Map()
        totalsByGame.set(round.gameId, totals)
      }
      totals.set(score.playerId, (totals.get(score.playerId) ?? 0) + score.roundScore)

      let scoredRounds = scoredRoundsByGame.get(round.gameId)
      if (!scoredRounds) {
        scoredRounds = new Set()
        scoredRoundsByGame.set(round.gameId, scoredRounds)
      }
      scoredRounds.add(round.id)
    }

    const result = new Map<number, GameSummary>()
    for (const game of games) {
      let leaderName: string | null = null
      let leaderScore: number | null = null
      const totals = totalsByGame.get(game.id)
      if (totals) {
        for (const [playerId, score] of totals) {
          if (leaderScore === null || score > leaderScore) {
            leaderScore = score
            leaderName = nameById.get(playerId) ?? null
          }
        }
      }

      result.set(game.id, {
        totalRounds: generateRounds(game.numPlayers, parsePhases(game.phases)).length,
        playedRounds: scoredRoundsByGame.get(game.id)?.size ?? 0,
        leaderName,
        leaderScore
      })
    }
    return result
  }, [games, rounds, scores, players])

  const sortedGames = [...games].sort((a, b) => b.startTime - a.startTime)

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
            {sortedGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                summary={summaries.get(game.id)}
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

function GameCard({
  game,
  summary,
  onClick,
  onDelete
}: {
  game: Game
  summary?: GameSummary
  onClick: () => void
  onDelete: () => void
}) {
  const theme = useTheme()
  const progressText = summary && summary.totalRounds > 0
    ? game.isFinished
      ? `${summary.playedRounds} de ${summary.totalRounds} rondas`
      : `Ronda ${Math.min(summary.playedRounds + 1, summary.totalRounds)} de ${summary.totalRounds}`
    : null
  const leaderText =
    summary?.leaderName !== null && summary?.leaderName !== undefined && summary.leaderScore !== null
      ? `Líder: ${summary.leaderName} (${summary.leaderScore} pts)`
      : null
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
              <Typography variant="body2" color="text.secondary">
                · {formatGameDate(game.startTime)}
              </Typography>
            </Stack>
            {(progressText || leaderText) && (
              <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.25 }}>
                {[progressText, leaderText].filter(Boolean).join(' · ')}
              </Typography>
            )}
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
