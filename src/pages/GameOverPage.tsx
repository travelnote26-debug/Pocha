import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import ReplayIcon from '@mui/icons-material/Replay'
import ShareIcon from '@mui/icons-material/Share'
import StarIcon from '@mui/icons-material/Star'
import {
  Avatar,
  Box,
  Button,
  Card,
  Collapse,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  Typography,
  useTheme
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppTopBar } from '../components/AppTopBar'
import { LoadingContent } from '../components/LoadingContent'
import { RankBadge } from '../components/RankBadge'
import { displayPhasesString } from '../domain/gamePhase'
import { getPlayerIdList } from '../domain/models'
import { useDataStore } from '../state/dataStore'
import { feltColors as c, playerColorFor } from '../theme/colors'

interface PlayerFinalScore {
  playerId: number
  playerName: string
  totalScore: number
}

interface RoundScoreDetail {
  playerName: string
  playerColor: string
  predicted: number
  actual: number
  score: number
}

interface RoundDetail {
  roundNumber: number
  numCards: number
  scores: RoundScoreDetail[]
}

export function GameOverPage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const id = Number(gameId)
  const db = useDataStore((s) => s.db)
  const createGame = useDataStore((s) => s.createGame)
  const theme = useTheme()
  const [shareMessage, setShareMessage] = useState<string | null>(null)

  const results = useMemo(() => {
    const game = db.games.find((g) => g.id === id)
    if (!game) return null
    const playerIds = getPlayerIdList(game)
    const players = playerIds
      .map((pid) => db.players.find((p) => p.id === pid))
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
    const rounds = db.rounds
      .filter((r) => r.gameId === id)
      .sort((a, b) => a.roundNumber - b.roundNumber)
    const roundIds = new Set(rounds.map((r) => r.id))

    const scoreMap: Record<number, number> = {}
    for (const score of db.scores) {
      if (!roundIds.has(score.roundId)) continue
      scoreMap[score.playerId] = (scoreMap[score.playerId] ?? 0) + score.roundScore
    }

    const playerScores: PlayerFinalScore[] = players
      .map((player) => ({
        playerId: player.id,
        playerName: player.name,
        totalScore: scoreMap[player.id] ?? 0
      }))
      .sort((a, b) => b.totalScore - a.totalScore)

    const roundDetails: RoundDetail[] = rounds.map((round) => {
      const scores = db.scores
        .filter((s) => s.roundId === round.id)
        .map((score) => {
          const player = players.find((p) => p.id === score.playerId)
          return player
            ? {
                playerName: player.name,
                playerColor: playerColorFor(player.id),
                predicted: score.predictedTricks,
                actual: score.actualTricks,
                score: score.roundScore
              }
            : null
        })
        .filter((s): s is RoundScoreDetail => s !== null)
      return {
        roundNumber: round.roundNumber,
        numCards: round.numCards,
        scores
      }
    })

    return { playerScores, roundDetails }
  }, [db, id])

  if (!results) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        <AppTopBar title="Resultados" onBack={() => navigate('/')} />
        <LoadingContent />
      </Box>
    )
  }

  const game = db.games.find((entry) => entry.id === id) ?? null
  const isTie =
    results.playerScores.length > 1 &&
    results.playerScores[0].totalScore === results.playerScores[1].totalScore

  const buildShareText = (): string => {
    const lines = ['Clasificación final · Pocha']
    if (game) {
      lines.push(`${displayPhasesString(game.phases)} · ${game.numPlayers} jugadores`)
    }
    lines.push('')
    results.playerScores.forEach((player, rank) => {
      lines.push(`${rank + 1}. ${player.playerName}: ${player.totalScore} pts`)
    })
    return lines.join('\n')
  }

  const handleShare = async () => {
    const text = buildShareText()
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Resultados de la Pocha', text })
        return
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      setShareMessage('Resultado copiado al portapapeles')
    } catch {
      setShareMessage('No se pudo compartir el resultado')
    }
  }

  const handleRematch = () => {
    if (!game) return
    const newGameId = createGame(
      game.phases,
      game.pochaX2,
      game.numPlayers,
      game.playerIds
    )
    navigate(`/game/${newGameId}`)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <AppTopBar title="Resultados" onBack={() => navigate('/')} />

      <Box sx={{ flexGrow: 1, px: 2, py: 2 }}>
        <Stack spacing={1.5}>
          <Podium players={results.playerScores} isTie={isTie} />

          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<ShareIcon />}
              onClick={handleShare}
              sx={{ fontWeight: 700 }}
            >
              Compartir
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              startIcon={<ReplayIcon />}
              onClick={handleRematch}
              disabled={!game}
              sx={{ fontWeight: 700 }}
            >
              Revancha
            </Button>
          </Stack>

          <Typography variant="h6" fontWeight="bold">
            Clasificación Final
          </Typography>

          {results.playerScores.map((player, rank) => (
            <Card
              key={rank}
              variant="outlined"
              sx={{
                borderRadius: 2.5,
                bgcolor: rank === 0 ? c.rankGoldLight : 'background.paper',
                borderColor: rank === 0 ? c.winnerAmber : 'divider',
                boxShadow: rank === 0 ? 6 : 2,
                px: 2,
                py: 1.5,
                borderLeft: `4px solid ${playerColorFor(player.playerId)}`
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <RankBadge rank={rank} />
                <Typography variant="subtitle1" fontWeight="bold" color="black" sx={{ flex: 1 }}>
                  {player.playerName}
                </Typography>
                <Typography variant="h6" fontWeight="bold" color={rank === 0 ? 'black' : 'primary.main'}>
                  {player.totalScore} pts
                </Typography>
              </Stack>
            </Card>
          ))}

          {results.roundDetails.length > 0 && (
            <>
              <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                Detalle por rondas
              </Typography>
              {results.roundDetails.map((round) => (
                <RoundDetailCard key={round.roundNumber} round={round} themeIsDark={theme.palette.mode === 'dark'} />
              ))}
            </>
          )}
        </Stack>
      </Box>

      <Snackbar
        open={shareMessage !== null}
        autoHideDuration={3000}
        onClose={() => setShareMessage(null)}
        message={shareMessage ?? ''}
      />
    </Box>
  )
}

const PODIUM_ORDER = [1, 0, 2]
const PODIUM_HEIGHTS = [104, 82, 66]

function Podium({ players, isTie }: { players: PlayerFinalScore[]; isTie: boolean }) {
  const slots =
    players.length === 1 ? [0] : players.length === 2 ? [1, 0] : PODIUM_ORDER

  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        border: '1px solid',
        borderColor: 'secondary.main',
        boxShadow: 8,
        px: 2,
        pt: 2,
        pb: 0,
        textAlign: 'center',
        overflow: 'hidden'
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
        <StarIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
        <Typography
          variant="overline"
          fontWeight="bold"
          color="secondary.main"
          sx={{ letterSpacing: 1, lineHeight: 1.2 }}
        >
          {isTie ? 'EMPATE EN LA POCHA' : '¡CAMPEÓN DE LA POCHA!'}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="flex-end" justifyContent="center" spacing={1} sx={{ mt: 1 }}>
        {slots
          .filter((rank) => rank < players.length)
          .map((rank) => {
            const player = players[rank]
            const isWinner = rank === 0
            return (
              <Stack
                key={player.playerId}
                alignItems="center"
                spacing={0.5}
                sx={{ flex: 1, maxWidth: 110, minWidth: 0 }}
              >
                <Avatar
                  sx={{
                    width: isWinner ? 52 : 42,
                    height: isWinner ? 52 : 42,
                    bgcolor: playerColorFor(player.playerId),
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: isWinner ? 20 : 16,
                    border: '2px solid',
                    borderColor: isWinner ? 'secondary.main' : 'rgba(255,255,255,0.5)',
                    boxShadow: isWinner ? 4 : 1
                  }}
                >
                  {player.playerName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: '100%' }}>
                  {player.playerName}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {player.totalScore} pts
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: PODIUM_HEIGHTS[rank],
                    mt: 0.5,
                    borderRadius: '10px 10px 0 0',
                    bgcolor: isWinner ? 'secondary.main' : 'rgba(255,255,255,0.16)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    pt: 0.5
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{
                      color: isWinner ? 'secondary.contrastText' : 'primary.contrastText',
                      opacity: isWinner ? 1 : 0.8
                    }}
                  >
                    {rank + 1}
                  </Typography>
                </Box>
              </Stack>
            )
          })}
      </Stack>
    </Card>
  )
}

function RoundDetailCard({ round, themeIsDark }: { round: RoundDetail; themeIsDark: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 2 }}>
      <Box
        onClick={() => setExpanded((e) => !e)}
        sx={{ px: 2, py: 1.5, cursor: 'pointer' }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            Ronda {round.roundNumber}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {round.numCards} cartas
            </Typography>
            <IconButton size="small">
              {expanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Divider sx={{ mb: 1 }} />
          {round.scores.map((score, i) => (
            <Stack key={i} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 8, height: 8, minWidth: 8, borderRadius: '50%', bgcolor: score.playerColor }} />
                <Typography variant="body2">{score.playerName}</Typography>
              </Stack>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  color:
                    score.score > 0
                      ? c.successGreen
                      : score.score < 0
                        ? c.errorRed
                        : themeIsDark
                          ? 'text.primary'
                          : 'text.secondary'
                }}
              >
                {score.predicted}→{score.actual}  {score.score >= 0 ? '+' : ''}{score.score}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Collapse>
    </Card>
  )
}
