import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import StarIcon from '@mui/icons-material/Star'
import {
  Box,
  Card,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppTopBar } from '../components/AppTopBar'
import { LoadingContent } from '../components/LoadingContent'
import { RankBadge } from '../components/RankBadge'
import { getPlayerIdList } from '../domain/models'
import { useDataStore } from '../state/dataStore'
import { feltColors as c } from '../theme/colors'

interface PlayerFinalScore {
  playerName: string
  totalScore: number
}

interface RoundScoreDetail {
  playerName: string
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
  const theme = useTheme()

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

  const winner = results.playerScores[0]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <AppTopBar title="Resultados" onBack={() => navigate('/')} />

      <Box sx={{ flexGrow: 1, px: 2, py: 2 }}>
        <Stack spacing={1.5}>
          {winner && (
            <Card
              sx={{
                borderRadius: 3,
                bgcolor: c.winnerAmber,
                boxShadow: 8,
                px: 3,
                py: 3,
                textAlign: 'center'
              }}
            >
              <StarIcon sx={{ fontSize: 52, color: 'black' }} />
              <Typography variant="overline" fontWeight="bold" color="rgba(0,0,0,0.7)" sx={{ letterSpacing: 1, display: 'block' }}>
                ¡CAMPEÓN DE LA POCHA!
              </Typography>
              <Typography variant="h4" fontWeight={900} color="black">
                {winner.playerName}
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="rgba(0,0,0,0.85)">
                {winner.totalScore} puntos
              </Typography>
            </Card>
          )}

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
                py: 1.5
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
    </Box>
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
            <Stack key={i} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
              <Typography variant="body2">{score.playerName}</Typography>
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
