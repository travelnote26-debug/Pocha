import CheckIcon from '@mui/icons-material/Check'
import FlagIcon from '@mui/icons-material/Flag'
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { displayPhasesString } from '../domain/gamePhase'
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
    if (state.isFinished && state.game) {
      navigate(`/game-over/${state.game.id}`, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isFinished, state.game])

  useEffect(() => {
    if (state.phase === RoundPhase.ROUND_SCORED) hapticSuccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <AppTopBar
        title="Partida"
        onBack={() => setShowFinishDialog(true)}
        actions={state.game ? <RoundHistoryAction game={state.game} /> : undefined}
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
        <DialogActions>
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
          <Button
            onClick={() => {
              setShowFinishDialog(false)
              navigate(-1)
            }}
          >
            Guardar y salir
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
  const turnOrder = rememberTurnOrder(state)
  const assigned = state.playerData.reduce((sum, pd) => sum + (pd.actual ?? 0), 0)
  const allSet = state.playerData.every((pd) => pd.actual !== null)
  const isValid = allSet && assigned === currentCards
  const remaining = currentCards - assigned
  const excess = assigned - currentCards

  return (
    <BazasSelection
      headerPrefix="Bazas de"
      confirmText="Confirmar bazas"
      turnOrder={turnOrder}
      playerName={(i) => state.playerData[i]?.playerName ?? ''}
      getValue={(i) => state.playerData[i]?.actual ?? null}
      onValueChange={state.updateActual}
      isChipEnabled={() => true}
      maxChips={currentCards}
      summaryText={
        assigned > currentCards
          ? `Bazas asignadas: ${assigned} / ${currentCards} · Se exceden ${excess}`
          : `Bazas asignadas: ${assigned} / ${currentCards} · Quedan ${remaining}`
      }
      isSummaryValid={assigned <= currentCards}
      confirmEnabled={allSet && isValid}
      onConfirm={state.confirmActuals}
    />
  )
}

function ScoredContent({
  state,
  isLastRound,
  onNextRound
}: {
  state: GameSessionState
  isLastRound: boolean
  onNextRound: () => void
}) {
  const sorted = [...state.playerData].sort((a, b) => b.totalScore - a.totalScore)

  return (
    <Stack sx={{ flexGrow: 1, minHeight: 0 }}>
      <Typography variant="body2" fontWeight="bold" color="text.secondary">
        Resultado de la ronda
      </Typography>
      <Stack spacing={0.75} sx={{ flexGrow: 1, overflowY: 'auto', py: 0.75 }}>
        {sorted.map((pd, rank) => (
          <Stack key={pd.playerId} direction="row" alignItems="center" spacing={1}>
            <RankBadge rank={rank} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <PlayerScoreRow
                playerName={pd.playerName}
                prediction={pd.prediction}
                actual={pd.actual}
                roundScore={pd.roundScore}
                totalScore={pd.totalScore}
                phase={ScorePhase.SCORED}
              />
            </Box>
          </Stack>
        ))}
      </Stack>
      <Button variant="contained" color="primary" onClick={onNextRound} sx={{ fontWeight: 700, py: 1, borderRadius: 2.5 }}>
        <FlagIcon sx={{ mr: 1 }} />
        {isLastRound ? 'Ver resultados finales' : 'Siguiente ronda'}
      </Button>
    </Stack>
  )
}
