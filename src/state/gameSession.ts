import { create } from 'zustand'
import type { Game, Player, Round } from '../domain/models'
import { getPlayerIdList } from '../domain/models'
import { parsePhases } from '../domain/gamePhase'
import { generateRounds } from '../domain/roundGenerator'
import { calculateScore } from '../domain/scoreCalculator'
import { clearRoundDraft, loadRoundDraft, saveRoundDraft } from '../data/roundDraft'
import { useDataStore } from './dataStore'

export enum RoundPhase {
  SHOWING_ROUND_INFO = 'SHOWING_ROUND_INFO',
  COLLECTING_PREDICTIONS = 'COLLECTING_PREDICTIONS',
  PREDICTIONS_CONFIRMED = 'PREDICTIONS_CONFIRMED',
  COLLECTING_ACTUALS = 'COLLECTING_ACTUALS',
  ROUND_SCORED = 'ROUND_SCORED'
}

export interface PlayerRoundData {
  playerId: number
  playerName: string
  prediction: number | null
  actual: number | null
  roundScore: number
  totalScore: number
}

export interface GameSessionState {
  game: Game | null
  players: Player[]
  rounds: number[]
  currentRoundIndex: number
  currentRoundId: number | null
  phase: RoundPhase
  playerData: PlayerRoundData[]
  totalScores: Record<number, number>
  isFinished: boolean
  isLoading: boolean
  dealerName: string
  isEditingRound: boolean

  loadGame: (gameId: number) => void
  startPredictions: () => void
  updatePrediction: (playerIndex: number, value: number) => void
  confirmPredictions: () => void
  continueToActuals: () => void
  updateActual: (playerIndex: number, value: number) => void
  confirmActuals: () => void
  nextRound: () => void
  finishGame: (gameId: number) => void
  createRoundIfNeeded: () => void
  editLastRound: () => void
  backToPreviousStep: () => boolean
}

function dealerNameFor(players: Player[], roundIndex: number): string {
  return players[roundIndex % players.length]?.name ?? ''
}

function saveCurrentDraft(state: GameSessionState, phase: RoundPhase = state.phase): void {
  if (!state.game || state.currentRoundId === null) return
  if (
    phase !== RoundPhase.COLLECTING_PREDICTIONS &&
    phase !== RoundPhase.PREDICTIONS_CONFIRMED &&
    phase !== RoundPhase.COLLECTING_ACTUALS
  ) {
    return
  }

  const predictions: Record<number, number | null> = {}
  const actuals: Record<number, number | null> = {}
  for (const pd of state.playerData) {
    predictions[pd.playerId] = pd.prediction
    actuals[pd.playerId] = pd.actual
  }

  saveRoundDraft(state.game.id, {
    roundId: state.currentRoundId,
    roundIndex: state.currentRoundIndex,
    phase,
    predictions,
    actuals
  })
}

export const useGameSession = create<GameSessionState>((set, get) => ({
  game: null,
  players: [],
  rounds: [],
  currentRoundIndex: 0,
  currentRoundId: null,
  phase: RoundPhase.SHOWING_ROUND_INFO,
  playerData: [],
  totalScores: {},
  isFinished: false,
  isLoading: true,
  dealerName: '',
  isEditingRound: false,

  loadGame: (gameId) => {
    const data = useDataStore.getState()
    const game = data.getGame(gameId)
    if (!game) return

    const players = data.getPlayersByIds(getPlayerIdList(game))
    const rounds = generateRounds(game.numPlayers, parsePhases(game.phases))
    const savedRounds = data.getRoundsByGameIdOnce(gameId)
    const scoreMap: Record<number, number> = {}
    for (const t of data.getTotalScoresByGameId(gameId)) scoreMap[t.playerId] = t.totalScore

    let currentRoundIndex = 0
    let currentRoundId: number | null = null

    if (savedRounds.length > 0) {
      const lastRound = savedRounds[savedRounds.length - 1]
      const lastRoundScored = data.getScoresByRoundIdOnce(lastRound.id).length > 0
      if (lastRoundScored) {
        currentRoundIndex = savedRounds.length
      } else {
        currentRoundIndex = savedRounds.length - 1
        currentRoundId = lastRound.id
      }
    }

    const isComplete = game.isFinished || currentRoundIndex >= rounds.length
    if (isComplete && !game.isFinished) {
      useDataStore.getState().finishGame(game.id)
    }

    const draft = !isComplete && currentRoundId !== null ? loadRoundDraft(gameId) : null
    const activeDraft =
      draft && draft.roundId === currentRoundId && draft.roundIndex === currentRoundIndex
        ? draft
        : null
    if (draft && !activeDraft) clearRoundDraft(gameId)
    const restoredPhase = activeDraft
      ? (activeDraft.phase as RoundPhase)
      : RoundPhase.SHOWING_ROUND_INFO

    set({
      game,
      players,
      rounds,
      currentRoundIndex,
      currentRoundId,
      phase: restoredPhase,
      playerData: players.map((p) => ({
        playerId: p.id,
        playerName: p.name,
        prediction: activeDraft?.predictions[p.id] ?? null,
        actual: activeDraft?.actuals[p.id] ?? null,
        roundScore: 0,
        totalScore: scoreMap[p.id] ?? 0
      })),
      totalScores: scoreMap,
      isFinished: isComplete,
      isLoading: false,
      dealerName: dealerNameFor(players, currentRoundIndex),
      isEditingRound: false
    })

    if (!isComplete && currentRoundId === null) {
      get().createRoundIfNeeded()
    }
  },

  createRoundIfNeeded: () => {
    const s = get()
    const game = s.game
    if (!game) return

    if (s.currentRoundIndex >= s.rounds.length) {
      useDataStore.getState().finishGame(game.id)
      set({ isFinished: true })
    } else {
      const roundId = useDataStore
        .getState()
        .createRound(game.id, s.currentRoundIndex + 1, s.rounds[s.currentRoundIndex])
      set({ currentRoundId: roundId })
    }
  },

  startPredictions: () => {
    set({ phase: RoundPhase.COLLECTING_PREDICTIONS })
    saveCurrentDraft(get())
  },

  updatePrediction: (playerIndex, value) => {
    const playerData = [...get().playerData]
    playerData[playerIndex] = { ...playerData[playerIndex], prediction: value }
    set({ playerData })
    saveCurrentDraft(get())
  },

  confirmPredictions: () => {
    const s = get()
    const numCards = s.rounds[s.currentRoundIndex]
    const predictions = s.playerData.map((pd) => pd.prediction)
    if (predictions.some((p) => p === null)) return
    const totalPredicted = s.playerData.reduce((sum, pd) => sum + (pd.prediction ?? 0), 0)
    if (totalPredicted === numCards) return
    set({ phase: RoundPhase.PREDICTIONS_CONFIRMED })
    saveCurrentDraft(get())
  },

  continueToActuals: () => {
    set({ phase: RoundPhase.COLLECTING_ACTUALS })
    saveCurrentDraft(get())
  },

  updateActual: (playerIndex, value) => {
    const playerData = [...get().playerData]
    playerData[playerIndex] = { ...playerData[playerIndex], actual: value }
    set({ playerData })
    saveCurrentDraft(get())
  },

  confirmActuals: () => {
    const s = get()
    const numCards = s.rounds[s.currentRoundIndex]
    const pochaX2 = s.game?.pochaX2 === true
    const roundId = s.currentRoundId
    if (roundId === null) return

    if (s.playerData.some((pd) => pd.actual === null)) return
    const totalActual = s.playerData.reduce((sum, pd) => sum + (pd.actual ?? 0), 0)
    if (totalActual !== numCards) return

    const data = useDataStore.getState()
    const newTotalScores: Record<number, number> = { ...s.totalScores }
    const scoreRows: { playerId: number; predictedTricks: number; actualTricks: number; roundScore: number }[] = []
    const updatedPlayerData = s.playerData.map((pd) => {
      const pred = pd.prediction ?? 0
      const actual = pd.actual ?? 0
      const roundScore = calculateScore(pred, actual, numCards, pochaX2)
      const newTotal = (newTotalScores[pd.playerId] ?? 0) + roundScore
      newTotalScores[pd.playerId] = newTotal
      scoreRows.push({ playerId: pd.playerId, predictedTricks: pred, actualTricks: actual, roundScore })
      return { ...pd, roundScore, totalScore: newTotal }
    })
    data.saveScores(roundId, scoreRows)
    if (s.game) clearRoundDraft(s.game.id)

    set({
      phase: RoundPhase.ROUND_SCORED,
      playerData: updatedPlayerData,
      totalScores: newTotalScores,
      isEditingRound: false
    })
  },

  nextRound: () => {
    const s = get()
    const nextIndex = s.currentRoundIndex + 1
    if (s.game) clearRoundDraft(s.game.id)

    if (nextIndex >= s.rounds.length) {
      const game = s.game
      if (game) useDataStore.getState().finishGame(game.id)
      set({ isFinished: true, currentRoundIndex: nextIndex, isEditingRound: false })
      return
    }

    set({
      currentRoundIndex: nextIndex,
      phase: RoundPhase.SHOWING_ROUND_INFO,
      currentRoundId: null,
      playerData: s.playerData.map((pd) => ({
        ...pd,
        prediction: null,
        actual: null,
        roundScore: 0
      })),
      dealerName: dealerNameFor(s.players, nextIndex),
      isEditingRound: false
    })

    get().createRoundIfNeeded()
  },

  editLastRound: () => {
    const s = get()
    const game = s.game
    if (!game) return

    const data = useDataStore.getState()
    const savedRounds = data.getRoundsByGameIdOnce(game.id)
    let targetIndex = -1
    let targetRound: Round | null = null

    for (let i = savedRounds.length - 1; i >= 0; i--) {
      const round = savedRounds[i]
      if (data.getScoresByRoundIdOnce(round.id).length > 0) {
        targetIndex = i
        targetRound = round
        break
      }
    }
    if (!targetRound) return

    for (let i = savedRounds.length - 1; i > targetIndex; i--) {
      const round = savedRounds[i]
      if (data.getScoresByRoundIdOnce(round.id).length === 0) {
        data.deleteRound(round.id)
      }
    }

    const targetScores = data.getScoresByRoundIdOnce(targetRound.id)
    const scoreByPlayer = new Map(targetScores.map((score) => [score.playerId, score]))
    const totalScores: Record<number, number> = {}
    for (const total of data.getTotalScoresByGameId(game.id)) {
      totalScores[total.playerId] = total.totalScore
    }
    for (const score of targetScores) {
      totalScores[score.playerId] = (totalScores[score.playerId] ?? 0) - score.roundScore
    }

    const players =
      s.players.length > 0 ? s.players : data.getPlayersByIds(getPlayerIdList(game))
    const playerData = players.map((player) => {
      const score = scoreByPlayer.get(player.id)
      return {
        playerId: player.id,
        playerName: player.name,
        prediction: score?.predictedTricks ?? null,
        actual: score?.actualTricks ?? null,
        roundScore: 0,
        totalScore: totalScores[player.id] ?? 0
      }
    })

    clearRoundDraft(game.id)
    set({
      players,
      currentRoundIndex: targetIndex,
      currentRoundId: targetRound.id,
      phase: RoundPhase.COLLECTING_PREDICTIONS,
      playerData,
      totalScores,
      isFinished: false,
      isEditingRound: true,
      dealerName: dealerNameFor(players, targetIndex)
    })
    saveCurrentDraft(get())
  },

  backToPreviousStep: () => {
    const s = get()

    switch (s.phase) {
      case RoundPhase.PREDICTIONS_CONFIRMED:
        set({ phase: RoundPhase.COLLECTING_PREDICTIONS })
        saveCurrentDraft(get())
        return true
      case RoundPhase.COLLECTING_ACTUALS:
        set({ phase: RoundPhase.PREDICTIONS_CONFIRMED })
        saveCurrentDraft(get())
        return true
      case RoundPhase.COLLECTING_PREDICTIONS:
        if (s.isEditingRound) return false
        if (s.game) clearRoundDraft(s.game.id)
        set({ phase: RoundPhase.SHOWING_ROUND_INFO })
        return true
      case RoundPhase.ROUND_SCORED:
        get().editLastRound()
        if (!get().isEditingRound) return false
        set({ phase: RoundPhase.COLLECTING_ACTUALS })
        saveCurrentDraft(get())
        return true
      default:
        return false
    }
  },

  finishGame: (gameId) => {
    useDataStore.getState().finishGame(gameId)
    set({ isFinished: true })
  }
}))
