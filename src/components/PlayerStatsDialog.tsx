import { Avatar, Box, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import type { Player } from '../domain/models'
import { useDataStore } from '../state/dataStore'
import { playerColorFor } from '../theme/colors'

export function PlayerStatsDialog({ player, onClose }: { player: Player | null; onClose: () => void }) {
  const scores = useDataStore((s) => s.db.scores)

  const stats = useMemo(() => {
    if (!player) return null
    const playerScores = scores.filter((s) => s.playerId === player.id)
    if (playerScores.length === 0) return null

    let good = 0
    let chips = 0
    let gapSum = 0
    let pointsSum = 0
    for (const s of playerScores) {
      const gap = Math.abs(s.predictedTricks - s.actualTricks)
      if (gap === 0) good++
      else chips++
      gapSum += gap
      pointsSum += s.roundScore
    }
    const n = playerScores.length
    return {
      rounds: n,
      good,
      chips,
      avgGap: gapSum / n,
      totalPoints: pointsSum,
      avgPoints: pointsSum / n
    }
  }, [player, scores])

  if (!player) return null

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: playerColorFor(player.id), color: '#FFFFFF', fontWeight: 700 }}>
          {player.name.charAt(0).toUpperCase()}
        </Avatar>
        {player.name}
      </DialogTitle>
      <DialogContent>
        {stats ? (
          <Stack direction="row" flexWrap="wrap" useFlexGap sx={{ gap: 1, pt: 0.5 }}>
            <StatTile label="Rondas" value={String(stats.rounds)} />
            <StatTile label="Aciertos" value={`${stats.good}`} sub={`${Math.round((stats.good / stats.rounds) * 100)}%`} />
            <StatTile label="Pocchas" value={`${stats.chips}`} sub={`${Math.round((stats.chips / stats.rounds) * 100)}%`} />
            <StatTile label="Gap medio" value={stats.avgGap.toFixed(1)} sub="Pred vs bazas" />
            <StatTile label="Puntos" value={String(stats.totalPoints)} />
            <StatTile
              label="Media"
              value={stats.avgPoints.toFixed(1)}
              sub="puntos/ronda"
              color={stats.avgPoints >= 0 ? 'success.main' : 'error.main'}
            />
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            Sin partidas puntuadas todavía.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  )
}

function StatTile({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <Box
      sx={{
        flex: '1 1 calc(50% - 8px)',
        minWidth: 0,
        bgcolor: 'action.hover',
        borderRadius: 2,
        px: 1.5,
        py: 1
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={900} lineHeight={1.1} sx={{ color: color ?? 'text.primary' }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      )}
    </Box>
  )
}
