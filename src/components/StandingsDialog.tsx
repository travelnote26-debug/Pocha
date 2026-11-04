import { Avatar, Box, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import type { Game } from '../domain/models'
import { getPlayerIdList } from '../domain/models'
import { RankBadge } from './RankBadge'
import { useDataStore } from '../state/dataStore'
import { playerColorFor } from '../theme/colors'
import { FullscreenDialog } from './FullscreenDialog'

export function StandingsDialog({ game, open, onClose }: { game: Game; open: boolean; onClose: () => void }) {
  const rounds = useDataStore((s) => s.db.rounds)
  const scores = useDataStore((s) => s.db.scores)
  const players = useDataStore((s) => s.db.players)

  const nameById = useMemo(() => {
    const map = new Map(players.map((p) => [p.id, p.name]))
    return (id: number) => map.get(id) ?? '?'
  }, [players])

  const standings = useMemo(() => {
    const roundIds = new Set(rounds.filter((r) => r.gameId === game.id).map((r) => r.id))
    const totals = new Map<number, number>()
    const roundCounts = new Map<number, number>()
    for (const s of scores) {
      if (!roundIds.has(s.roundId)) continue
      totals.set(s.playerId, (totals.get(s.playerId) ?? 0) + s.roundScore)
      roundCounts.set(s.playerId, (roundCounts.get(s.playerId) ?? 0) + 1)
    }
    return getPlayerIdList(game)
      .map((id) => ({
        id,
        name: nameById(id),
        total: totals.get(id) ?? 0,
        rounds: roundCounts.get(id) ?? 0
      }))
      .sort((a, b) => b.total - a.total)
  }, [rounds, scores, nameById, game])

  return (
    <FullscreenDialog title="Clasificación general" open={open} onClose={onClose}>
      <Stack spacing={1} sx={{ pt: 1.5 }}>
          {standings.map((entry, rank) => {
            const isLeader = rank === 0 && standings.length > 1
            return (
              <Stack
                key={entry.id}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: isLeader ? 'secondary.main' : 'divider',
                  borderRadius: 2,
                  px: 1,
                  py: 0.75,
                  boxShadow: isLeader ? 2 : 0
                }}
              >
                <RankBadge rank={rank} />
                <Avatar
                  sx={{ width: 30, height: 30, fontSize: 13, bgcolor: playerColorFor(entry.id), color: '#FFFFFF', fontWeight: 700 }}
                >
                  {entry.name.charAt(0).toUpperCase()}
                </Avatar>
                <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {entry.name}
                    {isLeader && (
                      <Typography component="span" variant="caption" fontWeight="bold" color="secondary.main" sx={{ ml: 0.5 }}>
                        👑
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entry.rounds} {entry.rounds === 1 ? 'ronda jugada' : 'rondas jugadas'}
                  </Typography>
                </Stack>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    lineHeight={1.1}
                    sx={{ color: entry.total > 0 ? 'success.main' : entry.total < 0 ? 'error.main' : 'text.primary' }}
                  >
                    {entry.total > 0 ? `+${entry.total}` : entry.total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    puntos
                  </Typography>
                </Box>
              </Stack>
            )
           })}
        </Stack>
    </FullscreenDialog>
  )
}
