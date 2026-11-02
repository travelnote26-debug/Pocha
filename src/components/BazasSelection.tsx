import { Avatar, Box, Button, Card, Chip, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { feltColors as c } from '../theme/colors'
import { hapticTick } from '../utils/haptic'

interface BazasSelectionProps {
  headerPrefix: string
  confirmText: string
  turnOrder: number[]
  playerName: (index: number) => string
  getValue: (index: number) => number | null
  onValueChange: (index: number, value: number) => void
  isChipEnabled: (index: number, value: number) => boolean
  maxChips: number
  summaryText: string
  isSummaryValid: boolean
  confirmEnabled: boolean
  onConfirm: () => void
}

export function BazasSelection({
  headerPrefix,
  confirmText,
  turnOrder,
  playerName,
  getValue,
  onValueChange,
  isChipEnabled,
  maxChips,
  summaryText,
  isSummaryValid,
  confirmEnabled,
  onConfirm
}: BazasSelectionProps) {
  const [focusedPosition, setFocusedPosition] = useState(0)
  if (turnOrder.length === 0) return null

  const clampedPosition = Math.min(focusedPosition, turnOrder.length - 1)
  const focusedPlayerIndex = turnOrder[clampedPosition]
  const focusedValue = getValue(focusedPlayerIndex)
  const chipSize = maxChips > 12 ? 40 : 46

  const selectValue = (value: number) => {
    hapticTick()
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    onValueChange(focusedPlayerIndex, value)
    const next = Array.from({ length: turnOrder.length }, (_, i) => (clampedPosition + i + 1) % turnOrder.length).find(
      (pos) => {
        const playerIndex = turnOrder[pos]
        return playerIndex !== focusedPlayerIndex && getValue(playerIndex) === null
      }
    )
    if (next !== undefined) setFocusedPosition(next)
  }

  return (
    <Stack spacing={1} sx={{ flexGrow: 1, minHeight: 0 }}>
      <Card
        variant="outlined"
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderColor: 'secondary.main',
          boxShadow: 4,
          borderRadius: 3,
          px: 1.5,
          py: 1
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                fontWeight: 700,
                width: 34,
                height: 34,
                fontSize: 15
              }}
            >
              {playerName(focusedPlayerIndex).charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.85, display: 'block' }}>
                {headerPrefix}
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.1}>
                {playerName(focusedPlayerIndex)}
              </Typography>
            </Box>
          </Stack>

          <Box key={focusedPlayerIndex} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Array.from({ length: maxChips + 1 }, (_, value) => {
              const enabled = isChipEnabled(focusedPlayerIndex, value)
              const selected = focusedValue === value
              const invalidSelected = selected && !enabled
              return (
                <Chip
                  key={value}
                  label={value}
                  onClick={() => selectValue(value)}
                  disabled={!enabled}
                  variant={selected ? 'filled' : 'outlined'}
                  color={selected ? 'secondary' : undefined}
                  sx={{
                    width: chipSize,
                    height: chipSize,
                    borderRadius: '50%',
                    fontWeight: 700,
                    fontSize: selected ? 17 : 15,
                    ...(invalidSelected && {
                      bgcolor: c.errorRed,
                      color: 'white',
                      borderColor: c.errorRed,
                      textDecoration: 'line-through'
                    }),
                    ...(enabled && !selected && { bgcolor: 'background.paper', color: 'text.primary' })
                  }}
                />
              )
            })}
          </Box>
        </Stack>
      </Card>

      <Paper
        variant={isSummaryValid ? 'outlined' : 'elevation'}
        elevation={isSummaryValid ? 0 : 1}
        sx={{
          px: 1.5,
          py: 0.5,
          bgcolor: isSummaryValid ? 'action.hover' : `${c.errorRed}26`,
          borderColor: isSummaryValid ? 'divider' : c.errorRed,
          borderRadius: 1.5
        }}
      >
        <Typography
          variant="body2"
          fontWeight={isSummaryValid ? 500 : 700}
          color={isSummaryValid ? 'text.secondary' : c.errorRed}
        >
          {summaryText}
        </Typography>
      </Paper>

      <Stack spacing={0.75} sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
        {turnOrder.map((playerIndex, position) => (
          <PlayerBazasRow
            key={playerIndex}
            name={playerName(playerIndex)}
            value={getValue(playerIndex)}
            isFocused={position === clampedPosition}
            onClick={() => setFocusedPosition(position)}
          />
        ))}
      </Stack>

      <Button
        variant="contained"
        color="secondary"
        disabled={!confirmEnabled}
        onClick={() => {
          hapticTick()
          onConfirm()
        }}
        sx={{ fontWeight: 700, py: 1, fontSize: 15, borderRadius: 2.5 }}
      >
        {confirmText}
      </Button>
    </Stack>
  )
}

function PlayerBazasRow({
  name,
  value,
  isFocused,
  onClick
}: {
  name: string
  value: number | null
  isFocused: boolean
  onClick: () => void
}) {
  return (
    <Card
      variant={isFocused ? 'elevation' : 'outlined'}
      elevation={isFocused ? 4 : 0}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        bgcolor: isFocused ? 'primary.main' : 'background.paper',
        color: isFocused ? 'primary.contrastText' : 'text.primary',
        borderColor: isFocused ? 'secondary.main' : 'divider',
        px: 1,
        py: 0.5,
        cursor: 'pointer'
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: isFocused ? 'secondary.main' : 'primary.main',
              color: isFocused ? 'secondary.contrastText' : 'primary.contrastText',
              fontWeight: 700,
              fontSize: 13
            }}
          >
            {name.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body1" fontWeight={600} noWrap>
            {name}
          </Typography>
        </Stack>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: value !== null ? 'secondary.main' : 'action.hover',
            color: value !== null ? 'secondary.contrastText' : 'text.secondary',
            fontWeight: 700,
            fontSize: 14
          }}
        >
          {value !== null ? value : '—'}
        </Box>
      </Stack>
    </Card>
  )
}
