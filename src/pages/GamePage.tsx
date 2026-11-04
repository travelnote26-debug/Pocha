import CheckIcon from '@mui/icons-material/Check'
import FlagIcon from '@mui/icons-material/Flag'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grow,
  LinearProgress,
  Stack,
  Typography
} from '@mui/material'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppTopBar } from '../components/AppTopBar'
import { BazasSelection } from '../components/BazasSelection'
import { LoadingContent } from '../components/LoadingContent'
import { PlayerScoreRow, ScorePhase } from '../components/PlayerScoreRow'
import { RankBadge } from '../components/RankBadge'
import { RoundHistoryAction } from '../components/RoundHistoryDialog'
import { StandingsAction } from '../components/StandingsDialog'
import { displayPhasesString } from '../domain/gamePhase'
import { calculateScore } from '../domain/scoreCalculator'
import { feltColors as c, playerColorFor } from '../theme/colors'
import { hapticSuccess } from '../utils/haptic'
import { RoundPhase, useGameSession, type GameSessionState } from '../state/gameSession'

export function GamePage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const state = useGameSession()
  const [showFinishDialog, setShowFinishDialog] = useState(false)
  const id = Number(gameId)

  useEffect(() => {
    if (!Number.isNaN(id)) state.loadGame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (state.isFinished && state.game && state.game.id === id) {
      navigate(`/game-over/${state.game.id}`, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isFinished, state.game, id])

  useEffect(() => {
    if (state.phase === RoundPhase.ROUND_SCORED) hapticSuccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <AppTopBar
        title="Partida"
        onBack={() => setShowFinishDialog(true)}
        actions={state.game ? (
          <>
            <StandingsAction game={state.game} />
            <RoundHistoryAction game={state.game} />
          </>
        ) : undefined}
      />

      <Box sx={{ flexGrow: 1, px: 2, py: 1.5, display: 'flex', flexDirection: 'column' }}>
        {state.isLoading ? (
          <LoadingContent />
        ) : (
          <GameContent state={state} />
        )}
      </Box>

      <Dialog open={showFinishDialog} onClose={() => setShowFinishDialog(false)}>
        <DialogTitle fontWeight="bold">Salir de la partida</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Si guardas y sales, podrás retomar la partida desde el listado principal.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button
            onClick={() => setShowFinishDialog(false)}
            sx={{ fontWeight: 700 }}
          >
            Seguir jugando
          </Button>
          <Button
            onClick={() => {
              setShowFinishDialog(false)
              navigate(-1)
            }}
          >
            Guardar y salir
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowFinishDialog(false)
              state.game && state.finishGame(state.game.id)
            }}
            sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
          >
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function GameContent({ state }: { state: GameSessionState }) {
  const currentCards = state.rounds[state.currentRoundIndex] ?? 0
  const totalRounds = state.rounds.length
  const phasesDisplayText = state.game ? displayPhasesString(state.game.phases) : ''
  const pochaX2 = state.game?.pochaX2 === true

  return (
    <Stack spacing={1} sx={{ flexGrow: 1, minHeight: 0 }}>
      {state.isEditingRound && (
        <Alert severity="warning" sx={{ py: 0, borderRadius: 2, '& .MuiAlert-message': { py: 0.5 } }}>
          Corrigiendo la última ronda. Los puntos se recalcularán al guardar.
        </Alert>
      )}

      <RoundInfoHeader
        phasesDisplay={phasesDisplayText}
        pochaX2={pochaX2}
        currentCards={currentCards}
        roundNumber={state.currentRoundIndex + 1}
        totalRounds={totalRounds}
        dealerName={state.dealerName}
        phase={state.phase}
      />

      <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {state.phase === RoundPhase.SHOWING_ROUND_INFO && (
          <RoundInfoContent state={state} currentCards={currentCards} onStart={state.startPredictions} />
        )}
        {state.phase === RoundPhase.COLLECTING_PREDICTIONS && (
          <PredictionsContent state={state} currentCards={currentCards} />
        )}
        {state.phase === RoundPhase.PREDICTIONS_CONFIRMED && (
          <PredictionsSummaryContent state={state} currentCards={currentCards} onContinue={state.continueToActuals} />
        )}
        {state.phase === RoundPhase.COLLECTING_ACTUALS && (
          <ActualsContent state={state} currentCards={currentCards} />
        )}
        {state.phase === RoundPhase.ROUND_SCORED && (
          <ScoredContent
            state={state}
            currentCards={currentCards}
            isLastRound={state.currentRoundIndex + 1 >= totalRounds}
            onNextRound={state.nextRound}
          />
        )}
      </Box>
    </Stack>
  )
}

function RoundInfoHeader({
  phasesDisplay,
  pochaX2,
  currentCards,
  roundNumber,
  totalRounds,
  dealerName,
  phase
}: {
  phasesDisplay: string
  pochaX2: boolean
  currentCards: number
  roundNumber: number
  totalRounds: number
  dealerName: string
  phase: RoundPhase
}) {
  return (
    <Card
      variant="outlined"
      sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'secondary.main', boxShadow: 4, borderRadius: 3, px: 1.5, py: 0.75 }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" fontWeight="bold" color="secondary.main">
          {pochaX2 ? `${phasesDisplay} (x2)` : phasesDisplay}
        </Typography>
        <Typography variant="caption" fontWeight="bold">
          Ronda {roundNumber}/{totalRounds}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={(roundNumber / totalRounds) * 100}
        sx={{ mt: 0.75, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main' } }}
      />
      <RoundPhaseStepper phase={phase} />
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 0.75 }}>
        <Typography variant="h5" fontWeight={900} lineHeight={1.1}>
          {currentCards}
        </Typography>
        <Box>
          <Typography variant="caption" fontWeight={600} lineHeight={1.1}>
            {currentCards === 1 ? 'carta' : 'cartas'}
          </Typography>
          {dealerName && (
            <Typography variant="caption" fontWeight="bold" color="secondary.main" lineHeight={1.1}>
              · Reparte {dealerName}
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  )
}

const ROUND_STEPS = ['Pred', 'Bazas', 'Puntos'] as const

function RoundPhaseStepper({ phase }: { phase: RoundPhase }) {
  const stepState = (index: number): 'upcoming' | 'active' | 'done' => {
    switch (phase) {
      case RoundPhase.COLLECTING_PREDICTIONS:
        return index === 0 ? 'active' : 'upcoming'
      case RoundPhase.PREDICTIONS_CONFIRMED:
        return index === 0 ? 'done' : index === 1 ? 'active' : 'upcoming'
      case RoundPhase.COLLECTING_ACTUALS:
        return index === 0 ? 'done' : index === 1 ? 'active' : 'upcoming'
      case RoundPhase.ROUND_SCORED:
        return 'done'
      default:
        return 'upcoming'
    }
  }

  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mt: 0.75 }}>
      {ROUND_STEPS.map((label, index) => {
        const state = stepState(index)
        return (
          <Fragment key={label}>
            {index > 0 && (
              <Box sx={{ width: 10, height: 2, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.35)' }} />
            )}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                px: 0.75,
                height: 18,
                borderRadius: 9,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.3,
                ...(state === 'active' && { bgcolor: 'secondary.main', color: 'secondary.contrastText' }),
                ...(state === 'done' && { bgcolor: 'rgba(255,255,255,0.25)', color: 'primary.contrastText' }),
                ...(state === 'upcoming' && { border: 1, borderColor: 'rgba(255,255,255,0.35)', color: 'primary.contrastText', opacity: 0.7 })
              }}
            >
              {state === 'done' ? '✓' : ''}
              {label}
            </Box>
          </Fragment>
        )
      })}
    </Stack>
  )
}

function RoundInfoContent({ state, currentCards, onStart }: { state: GameSessionState; currentCards: number; onStart: () => void }) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ flexGrow: 1, textAlign: 'center' }}>
      <Typography variant="subtitle1" color="text.secondary">
        Preparados para la ronda
      </Typography>
      <Typography variant="h4" fontWeight="bold" color="primary.main" lineHeight={1.1}>
        {currentCards}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {currentCards === 1 ? 'carta' : 'cartas'} · {state.players.length} jugadores
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={onStart}
        sx={{ mt: 1, fontWeight: 700, py: 1, px: 3, borderRadius: 3 }}
      >
        <CheckIcon sx={{ mr: 1 }} />
        Introducir predicciones
      </Button>
    </Stack>
  )
}

function rememberTurnOrder(state: GameSessionState): number[] {
  return useMemo(() => {
    if (state.players.length === 0) return []
    const size = state.players.length
    const start = (state.currentRoundIndex + 1) % size
    return Array.from({ length: size }, (_, i) => (start + i) % size)
  }, [state.currentRoundIndex, state.players])
}

function PredictionsContent({ state, currentCards }: { state: GameSessionState; currentCards: number }) {
  const turnOrder = rememberTurnOrder(state)
  const totalPredicted = state.playerData.reduce((sum, pd) => sum + (pd.prediction ?? 0), 0)
  const allSet = state.playerData.every((pd) => pd.prediction !== null)
  const isInvalid = allSet && totalPredicted === currentCards

  const isChipEnabled = (playerIndex: number, value: number) => {
    const others = state.playerData.filter((_, index) => index !== playerIndex)
    const othersSet = others.filter((pd) => pd.prediction !== null)
    if (othersSet.length !== state.players.length - 1) return true
    return value !== currentCards - othersSet.reduce((sum, pd) => sum + (pd.prediction ?? 0), 0)
  }

  return (
    <BazasSelection
      headerPrefix="Predicción de"
      confirmText="Confirmar predicciones"
      turnOrder={turnOrder}
      playerName={(i) => state.playerData[i]?.playerName ?? ''}
      playerColor={(i) => playerColorFor(state.playerData[i]?.playerId)}
      getValue={(i) => state.playerData[i]?.prediction ?? null}
      onValueChange={state.updatePrediction}
      isChipEnabled={isChipEnabled}
      maxChips={currentCards}
      summaryText={`Total predicho: ${totalPredicted} / ${currentCards} bazas`}
      isSummaryValid={!isInvalid}
      confirmEnabled={allSet && !isInvalid}
      onConfirm={state.confirmPredictions}
    />
  )
}

function PredictionsSummaryContent({
  state,
  currentCards,
  onContinue
}: {
  state: GameSessionState
  currentCards: number
  onContinue: () => void
}) {
  const turnOrder = rememberTurnOrder(state)
  const totalPredicted = state.playerData.reduce((sum, pd) => sum + (pd.prediction ?? 0), 0)

  return (
    <Stack sx={{ flexGrow: 1, minHeight: 0 }}>
      <Typography variant="body2" fontWeight="bold" color="text.secondary">
        Total: {totalPredicted} / {currentCards}
      </Typography>
      <Stack spacing={0.75} sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', py: 0.75 }}>
        {turnOrder.map((playerIndex) => {
          const pd = state.playerData[playerIndex]
          return (
            <PlayerScoreRow
              key={pd.playerId}
              playerName={pd.playerName}
              playerColor={playerColorFor(pd.playerId)}
              prediction={pd.prediction}
              actual={pd.actual}
              roundScore={pd.roundScore}
              totalScore={pd.totalScore}
              phase={ScorePhase.PREDICTION}
            />
          )
        })}
      </Stack>
      <Button variant="contained" color="primary" onClick={onContinue} sx={{ fontWeight: 700, py: 1, borderRadius: 2.5 }}>
        <CheckIcon sx={{ mr: 1 }} />
        Continuar con bazas reales
      </Button>
    </Stack>
  )
}

function ActualsContent({ state, currentCards }: { state: GameSessionState; currentCards: number }) {
  const [showSummary, setShowSummary] = useState(false)
  const turnOrder = rememberTurnOrder(state)
  const assigned = state.playerData.reduce((sum, pd) => sum + (pd.actual ?? 0), 0)
  const allSet = state.playerData.every((pd) => pd.actual !== null)
  const isValid = allSet && assigned === currentCards
  const remaining = currentCards - assigned
  const excess = assigned - currentCards
  const pochaX2 = state.game?.pochaX2 === true

  const isChipEnabled = (playerIndex: number, value: number) => {
    const others = state.playerData.filter((_, index) => index !== playerIndex)
    const othersAssigned = others.reduce((sum, pd) => sum + (pd.actual ?? 0), 0)
    const remainingForPlayer = currentCards - othersAssigned
    if (others.every((pd) => pd.actual !== null)) return value === remainingForPlayer
    return value <= remainingForPlayer
  }

  const preview = turnOrder.map((playerIndex) => {
    const pd = state.playerData[playerIndex]
    return {
      pd,
      isHit: pd.prediction === pd.actual,
      score: calculateScore(
        pd.prediction ?? 0,
        pd.actual ?? 0,
        currentCards,
        pochaX2
      )
    }
  })

  return (
    <>
      <BazasSelection
        headerPrefix="Bazas de"
        confirmText="Confirmar bazas"
        turnOrder={turnOrder}
        playerName={(i) => state.playerData[i]?.playerName ?? ''}
        playerColor={(i) => playerColorFor(state.playerData[i]?.playerId)}
        getValue={(i) => state.playerData[i]?.actual ?? null}
        onValueChange={state.updateActual}
        isChipEnabled={isChipEnabled}
        maxChips={currentCards}
        summaryText={
          assigned > currentCards
            ? `Bazas asignadas: ${assigned} / ${currentCards} · Se exceden ${excess}`
            : `Bazas asignadas: ${assigned} / ${currentCards} · Quedan ${remaining}`
        }
        isSummaryValid={assigned <= currentCards}
        confirmEnabled={allSet && isValid}
        onConfirm={() => setShowSummary(true)}
      />

      <Dialog open={showSummary} onClose={() => setShowSummary(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold">Confirmar ronda</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1.5 }}>
            Revisa las bazas y los puntos antes de guardar la ronda.
          </DialogContentText>
          <Stack spacing={1}>
            {preview.map(({ pd, isHit, score }) => (
              <Stack
                key={pd.playerId}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ border: 1, borderColor: 'divider', borderRadius: 2, px: 1.25, py: 0.75 }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      fontSize: 13,
                      bgcolor: playerColorFor(pd.playerId),
                      color: '#FFFFFF',
                      fontWeight: 700
                    }}
                  >
                    {pd.playerName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {pd.playerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pred {pd.prediction} · Bazas {pd.actual}
                    </Typography>
                  </Box>
                </Stack>
                <Stack alignItems="flex-end">
                  <Typography
                    variant="subtitle1"
                    fontWeight={900}
                    lineHeight={1.1}
                    sx={{
                      color:
                        score > 0 ? 'success.main' : score < 0 ? 'error.main' : 'text.primary'
                    }}
                  >
                    {score >= 0 ? `+${score}` : score}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color={isHit ? 'success.main' : 'error.main'}
                  >
                    {isHit ? 'Acierto' : 'Fallo'}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Total de bazas: {assigned} / {currentCards}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSummary(false)}>Volver</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setShowSummary(false)
              state.confirmActuals()
            }}
          >
            Guardar puntos
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function ScoredContent({
  state,
  currentCards,
  isLastRound,
  onNextRound
}: {
  state: GameSessionState
  currentCards: number
  isLastRound: boolean
  onNextRound: () => void
}) {
  const sorted = [...state.playerData].sort((a, b) => b.totalScore - a.totalScore)
  const pochaPlayers = state.playerData.filter(
    (pd) =>
      currentCards > 1 &&
      pd.prediction !== null &&
      pd.prediction === pd.actual &&
      pd.actual === currentCards
  )

  return (
    <Stack sx={{ flexGrow: 1, minHeight: 0, position: 'relative' }}>
      {pochaPlayers.length > 0 && <PochaConfetti />}

      {pochaPlayers.length > 0 && (
        <Card
          sx={{
            position: 'relative',
            zIndex: 2,
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            borderRadius: 2.5,
            textAlign: 'center',
            px: 2,
            py: 0.75,
            boxShadow: 6,
            animation: 'pochaGlow 700ms ease-out both',
            '@keyframes pochaGlow': {
              '0%': { transform: 'scale(0.85)', opacity: 0 },
              '65%': { transform: 'scale(1.04)', opacity: 1 },
              '100%': { transform: 'scale(1)' }
            }
          }}
        >
          <Typography variant="subtitle1" fontWeight={900} lineHeight={1.2}>
            ¡POCHA! {pochaPlayers.map((pd) => pd.playerName).join(', ')}
          </Typography>
        </Card>
      )}

      <Typography
        variant="body2"
        fontWeight="bold"
        color="text.secondary"
        sx={{ position: 'relative', zIndex: 2 }}
      >
        Resultado de la ronda
      </Typography>
      <Stack spacing={0.75} sx={{ flexGrow: 1, overflowY: 'auto', py: 0.75, position: 'relative', zIndex: 2 }}>
        {sorted.map((pd, rank) => (
          <Grow key={pd.playerId} in timeout={360} style={{ transitionDelay: `${rank * 70}ms` }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <RankBadge rank={rank} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <PlayerScoreRow
                  playerName={pd.playerName}
                  playerColor={playerColorFor(pd.playerId)}
                  prediction={pd.prediction}
                  actual={pd.actual}
                  roundScore={pd.roundScore}
                  totalScore={pd.totalScore}
                  phase={ScorePhase.SCORED}
                  animateScore
                  animationDelay={rank * 70 + 120}
                />
              </Box>
            </Stack>
          </Grow>
        ))}
      </Stack>
      <Button
        variant="contained"
        color="primary"
        onClick={onNextRound}
        sx={{ position: 'relative', zIndex: 2, fontWeight: 700, py: 1, borderRadius: 2.5 }}
      >
        <FlagIcon sx={{ mr: 1 }} />
        {isLastRound ? 'Ver resultados finales' : 'Siguiente ronda'}
      </Button>
    </Stack>
  )
}

const CONFETTI_COLORS = [c.goldPrimary, c.cardRed, c.successGreen, '#1565C0', '#6A1B9A', c.cardWhite]

function PochaConfetti() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
        '@keyframes confettiFall': {
          '0%': { transform: 'translate3d(0, -20px, 0) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translate3d(var(--drift), 420px, 0) rotate(var(--spin))', opacity: 0 }
        }
      }}
    >
      {Array.from({ length: 20 }, (_, i) => {
        const left = (i * 37 + 11) % 100
        const delay = (i % 7) * 0.06
        const duration = 1.1 + (i % 5) * 0.16
        const drift = (i % 2 === 0 ? 1 : -1) * (16 + (i % 4) * 14)
        const spin = 360 + ((i * 53) % 540)
        return (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: -16,
              left: `${left}%`,
              width: i % 3 === 0 ? 8 : 6,
              height: i % 3 === 0 ? 8 : 12,
              borderRadius: i % 3 === 0 ? '50%' : '1px',
              bgcolor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              '--drift': `${drift}px`,
              '--spin': `${spin}deg`,
              animation: `confettiFall ${duration}s ease-in ${delay}s both`
            }}
          />
        )
      })}
    </Box>
  )
}
