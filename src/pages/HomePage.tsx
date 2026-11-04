import CasinoIcon from '@mui/icons-material/Casino'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PersonIcon from '@mui/icons-material/Person'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import {
  Avatar,
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
  LinearProgress,
  Menu,
  MenuItem,
  Stack,
  Typography
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppTopBar } from '../components/AppTopBar'
import { EmptyState } from '../components/EmptyState'
import { getPlayerIdList, type Game, type Player } from '../domain/models'
import { displayPhasesString, parsePhases } from '../domain/gamePhase'
import { generateRounds } from '../domain/roundGenerator'
import { useDataStore } from '../state/dataStore'
import { feltColors as c, playerColorFor } from '../theme/colors'

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

      <Box sx={{ flexGrow: 1, px: 2, pb: 'calc(96px + env(safe-area-inset-bottom))' }}>
        {games.length === 0 ? (
          <EmptyState
            title="No hay partidas registradas"
            subtitle="Toca 'Nueva Partida' para comenzar el recuento en la mesa"
            action={
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PlayArrowIcon />}
                onClick={() => navigate('/new-game')}
                sx={{ fontWeight: 700, borderRadius: 2.5, px: 2.5 }}
              >
                Nueva Partida
              </Button>
            }
          />
        ) : (
          <Stack spacing={1.5} sx={{ py: 2 }}>
            <HeroHeaderCard gameCount={games.length} />
            {sortedGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                players={players}
                summary={summaries.get(game.id)}
                onClick={() => (game.isFinished ? navigate(`/game-over/${game.id}`) : navigate(`/game/${game.id}`))}
                onDelete={() => setGameToDelete(game)}
              />
            ))}
          </Stack>
        )}
      </Box>

      {games.length > 0 && (
        <Fab
          variant="extended"
          color="secondary"
          onClick={() => navigate('/new-game')}
          sx={{ position: 'fixed', bottom: 'calc(24px + env(safe-area-inset-bottom))', right: 24, fontWeight: 700 }}
        >
          <PlayArrowIcon sx={{ mr: 1 }} />
          Nueva Partida
        </Fab>
      )}

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
  players,
  summary,
  onClick,
  onDelete
}: {
  game: Game
  players: Player[]
  summary?: GameSummary
  onClick: () => void
  onDelete: () => void
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const gamePlayers = getPlayerIdList(game)
    .map((playerId) => players.find((player) => player.id === playerId))
    .filter((player): player is Player => player !== undefined)
  const progressRounds = summary
    ? game.isFinished
      ? summary.playedRounds
      : Math.min(summary.playedRounds + 1, summary.totalRounds)
    : 0
  const progress = summary && summary.totalRounds > 0
    ? Math.min(100, Math.round((progressRounds / summary.totalRounds) * 100))
    : 0
  const progressText = summary && summary.totalRounds > 0
    ? game.isFinished
      ? `${summary.playedRounds} de ${summary.totalRounds} rondas`
      : `Ronda ${Math.min(summary.playedRounds + 1, summary.totalRounds)} de ${summary.totalRounds}`
    : 'Sin rondas jugadas'
  const leaderText =
    summary?.leaderName !== null && summary?.leaderName !== undefined && summary.leaderScore !== null
      ? `Líder: ${summary.leaderName} (${summary.leaderScore} pts)`
      : null

  return (
    <Card
      variant="outlined"
      sx={{ position: 'relative', borderRadius: 3, bgcolor: 'background.paper', borderColor: 'divider', boxShadow: 3 }}
    >
      <CardActionArea onClick={onClick}>
        <Box sx={{ px: 2, pr: 9, py: 1.75 }}>
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

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75, minWidth: 0 }}>
            <PlayerAvatarStack players={gamePlayers} />
            <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ minWidth: 0 }}>
              {displayPhasesString(game.phases)}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
            {game.numPlayers} jugadores · {formatGameDate(game.startTime)}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mt: 1,
              height: 5,
              borderRadius: 3,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                bgcolor: game.isFinished ? 'success.main' : 'secondary.main'
              }
            }}
          />

          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ minWidth: 0 }}>
              {progressText}
            </Typography>
            {leaderText && (
              <Typography variant="caption" fontWeight={700} color="secondary.dark" noWrap sx={{ minWidth: 0 }}>
                {leaderText}
              </Typography>
            )}
          </Stack>
        </Box>
      </CardActionArea>

      <Stack
        direction="row"
        alignItems="center"
        sx={{ position: 'absolute', top: 6, right: 6, pointerEvents: 'none' }}
      >
        <IconButton
          aria-label="Más opciones"
          onClick={(event) => setMenuAnchor(event.currentTarget)}
          sx={{ color: 'text.secondary', pointerEvents: 'auto' }}
        >
          <MoreVertIcon />
        </IconButton>
        <PlayArrowIcon sx={{ color: 'secondary.dark', fontSize: 28 }} />
      </Stack>

      <Menu anchorEl={menuAnchor} open={menuAnchor !== null} onClose={() => setMenuAnchor(null)}>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null)
            onDelete()
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar partida
        </MenuItem>
      </Menu>
    </Card>
  )
}

function PlayerAvatarStack({ players }: { players: Player[] }) {
  if (players.length === 0) return null
  const visible = players.slice(0, 3)
  const extra = players.length - visible.length

  return (
    <Stack direction="row" alignItems="center" sx={{ flexShrink: 0 }}>
      {visible.map((player, index) => (
        <Avatar
          key={player.id}
          sx={{
            width: 24,
            height: 24,
            fontSize: 11,
            fontWeight: 700,
            bgcolor: playerColorFor(player.id),
            color: '#FFFFFF',
            border: '2px solid',
            borderColor: 'background.paper',
            ml: index === 0 ? 0 : -0.75,
            zIndex: visible.length - index
          }}
        >
          {player.name.charAt(0).toUpperCase()}
        </Avatar>
      ))}
      {extra > 0 && (
        <Avatar
          sx={{
            width: 24,
            height: 24,
            fontSize: 10,
            fontWeight: 700,
            bgcolor: 'action.selected',
            color: 'text.secondary',
            border: '2px solid',
            borderColor: 'background.paper',
            ml: -0.75
          }}
        >
          +{extra}
        </Avatar>
      )}
    </Stack>
  )
}
