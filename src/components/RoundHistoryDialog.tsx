import HistoryIcon from '@mui/icons-material/History'
import {
  Avatar,
  Box,
  IconButton,
  Stack,
  Typography
} from '@mui/material'
import { useMemo, useState } from 'react'
import type { Game, RoundPlayerScore } from '../domain/models'
import { getPlayerIdList } from '../domain/models'
import { useDataStore } from '../state/dataStore'
import { playerColorFor } from '../theme/colors'
import { FullscreenDialog } from './FullscreenDialog'

export function RoundHistoryAction({ game }: { game: Game }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <IconButton color="inherit" aria-label="Historial de rondas" onClick={() => setOpen(true)}>
        <HistoryIcon />
      </IconButton>
      <RoundHistoryDialog game={game} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function RoundHistoryDialog({ game, open, onClose }: { game: Game; open: boolean; onClose: () => void }) {
  const rounds = useDataStore((s) => s.db.rounds)
  const scores = useDataStore((s) => s.db.scores)
  const players = useDataStore((s) => s.db.players)

  const gameRounds = useMemo(
    () =>
      rounds
        .filter((r) => r.gameId === game.id)
        .sort((a, b) => a.roundNumber - b.roundNumber),
    [rounds, game.id]
  )

  const scoresByRound = useMemo(() => {
    const map = new Map<number, RoundPlayerScore[]>()
    for (const score of scores) {
      const list = map.get(score.roundId)
      if (list) list.push(score)
      else map.set(score.roundId, [score])
    }
    return map
  }, [scores])

  const playerNameById = useMemo(() => {
    const map = new Map(players.map((p) => [p.id, p.name]))
    return (id: number) => map.get(id) ?? '?'
  }, [players])

  const seatOrder = getPlayerIdList(game)
  const playersCount = seatOrder.length

  return (
    <FullscreenDialog title="Historial de rondas" open={open} onClose={onClose}>
      {gameRounds.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            Aún no hay rondas completadas.
          </Typography>
        ) : (
          <Stack spacing={1.5} sx={{ pt: 1.5 }}>
            {gameRounds.map((round) => {
              const roundScores = scoresByRound.get(round.id) ?? []
              const byPlayer = new Map(roundScores.map((s) => [s.playerId, s]))
              const dealerIndex = (round.roundNumber - 1) % Math.max(playersCount, 1)
              const dealerName = playerNameById(seatOrder[dealerIndex])
              return (
                <Box key={round.id}>
                  <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ pb: 0.5 }}>
                    Ronda {round.roundNumber} · {round.numCards} {round.numCards === 1 ? 'carta' : 'cartas'}
                    {dealerName !== '?' && ` · Reparte ${dealerName}`}
                  </Typography>
                  <Stack spacing={0.75}>
                    {seatOrder.map((playerId) => {
                      const score = byPlayer.get(playerId)
                      const scoreText =
                        score == null
                          ? null
                          : score.roundScore >= 0
                            ? `+${score.roundScore}`
                            : String(score.roundScore)
                      return (
                        <Stack
                          key={playerId}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{
                            bgcolor: 'background.paper',
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2,
                            px: 1,
                            py: 0.5
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar
                              sx={{ width: 26, height: 26, fontSize: 12, bgcolor: playerColorFor(playerId), color: '#FFFFFF', fontWeight: 700 }}
                            >
                              {playerNameById(playerId).charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body1" fontWeight={600} noWrap>
                              {playerNameById(playerId)}
                            </Typography>
                          </Stack>
                          {score ? (
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Typography variant="body2" fontWeight="bold" color="text.primary">
                                {score.predictedTricks}/{score.actualTricks}
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{ minWidth: 34, textAlign: 'right', color: score.roundScore > 0 ? 'success.main' : score.roundScore < 0 ? 'error.main' : 'text.secondary' }}
                              >
                                {scoreText}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              Sin puntuar
                            </Typography>
                          )}
                        </Stack>
                      )
                    })}
                  </Stack>
                </Box>
              )
            })}
          </Stack>
        )}
    </FullscreenDialog>
  )
}
