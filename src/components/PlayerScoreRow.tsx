import { Box, Card, Stack, Typography } from '@mui/material'
import { feltColors as c } from '../theme/colors'

export enum ScorePhase {
  PREDICTION = 'PREDICTION',
  ACTUAL = 'ACTUAL',
  SCORED = 'SCORED'
}

interface PlayerScoreRowProps {
  playerName: string
  prediction: number | null
  actual: number | null
  roundScore: number | null
  totalScore: number
  phase: ScorePhase
}

function phaseColor(phase: ScorePhase, roundScore: number | null): string {
  if (phase === ScorePhase.PREDICTION) return 'primary.main'
  if (phase === ScorePhase.ACTUAL) return c.goldDark
  if (roundScore != null && roundScore > 0) return c.successGreen
  if (roundScore != null && roundScore < 0) return c.errorRed
  return 'primary.main'
}

export function PlayerScoreRow({
  playerName,
  prediction,
  actual,
  roundScore,
  totalScore,
  phase
}: PlayerScoreRowProps) {
  const actualDisplay = phase === ScorePhase.PREDICTION ? '—' : actual !== null ? String(actual) : '—'
  const roundDisplay =
    phase === ScorePhase.SCORED && roundScore != null
      ? roundScore >= 0
        ? `+${roundScore}`
        : String(roundScore)
      : '—'

  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 2.5, bgcolor: 'background.paper', borderColor: 'divider', boxShadow: 1, px: 1, py: 0.75 }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ width: 10, height: 10, minWidth: 10, borderRadius: '50%', bgcolor: phaseColor(phase, roundScore) }} />
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {playerName}
          </Typography>
        </Stack>

        <StatColumn label="Pred" value={prediction !== null ? String(prediction) : '—'} strong={prediction !== null} color="primary.main" />
        <StatColumn label="Bazas" value={actualDisplay} strong={actual !== null && phase !== ScorePhase.PREDICTION} color="secondary.main" />
        <StatColumn
          label="Pts"
          value={roundDisplay}
          strong={phase === ScorePhase.SCORED && roundScore != null}
          color={
            phase === ScorePhase.SCORED && roundScore != null
              ? roundScore > 0
                ? c.successGreen
                : roundScore < 0
                  ? c.errorRed
                  : 'text.primary'
              : 'text.secondary'
          }
        />
        <StatColumn label="Total" value={String(totalScore)} strong boldLabel color="text.primary" />
      </Stack>
    </Card>
  )
}

function StatColumn({
  label,
  value,
  strong,
  color,
  boldLabel
}: {
  label: string
  value: string
  strong: boolean
  color: string
  boldLabel?: boolean
}) {
  return (
      <Box sx={{ textAlign: 'center', px: 0.75 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={boldLabel ? 700 : 400} lineHeight={1}>
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={strong ? 700 : 400} sx={{ color, fontSize: 16, lineHeight: 1.1 }}>
          {value}
        </Typography>
      </Box>
  )
}
