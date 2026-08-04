import { create } from 'zustand'
import type { Game, Player } from '../domain/models'
import { getPlayerIdList } from '../domain/models'
import { parsePhases } from '../domain/gamePhase'
import { generateRounds } from '../domain/roundGenerator'
import { calculateScore } from '../domain/scoreCalculator'
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
}

function dealerNameFor(players: Player[], roundIndex: number): string {
  return players[roundIndex % players.length]?.name ?? ''
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

    set({
      game,
      players,
      rounds,
      currentRoundIndex,
      currentRoundId,
      phase: RoundPhase.SHOWING_ROUND_INFO,
      playerData: players.map((p) => ({
        playerId: p.id,
        playerName: p.name,
        prediction: null,
        actual: null,
        roundScore: 0,
        totalScore: scoreMap[p.id] ?? 0
      })),
      totalScores: scoreMap,
      isFinished: isComplete,
      isLoading: false,
      dealerName: dealerNameFor(players, currentRoundIndex)
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
    set({
      phase: RoundPhase.COLLECTING_PREDICTIONS,
      playerData: get().playerData.map((pd) => ({ ...pd, prediction: null }))
    })
  },

  updatePrediction: (playerIndex, value) => {
    const playerData = [...get().playerData]
    playerData[playerIndex] = { ...playerData[playerIndex], prediction: value }
    set({ playerData })
  },

  confirmPredictions: () => {
    const s = get()
    const numCards = s.rounds[s.currentRoundIndex]
    const predictions = s.playerData.map((pd) => pd.prediction)
    if (predictions.some((p) => p === null)) return
    const totalPredicted = s.playerData.reduce((sum, pd) => sum + (pd.prediction ?? 0), 0)
    if (totalPredicted === numCards) return
    set({ phase: RoundPhase.PREDICTIONS_CONFIRMED })
  },

  continueToActuals: () => {
    set({
      phase: RoundPhase.COLLECTING_ACTUALS,
      playerData: get().playerData.map((pd) => ({ ...pd, actual: null }))
    })
  },

  updateActual: (playerIndex, value) => {
    const playerData = [...get().playerData]
    playerData[playerIndex] = { ...playerData[playerIndex], actual: value }
    set({ playerData })
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
    const updatedPlayerData = s.playerData.map((pd) => {
      const pred = pd.prediction ?? 0
      const actual = pd.actual ?? 0
      const roundScore = calculateScore(pred, actual, numCards, pochaX2)
      const newTotal = (newTotalScores[pd.playerId] ?? 0) + roundScore
      newTotalScores[pd.playerId] = newTotal
      data.saveScore(roundId, pd.playerId, pred, actual, roundScore)
      return { ...pd, roundScore, totalScore: newTotal }
    })

    set({
      phase: RoundPhase.ROUND_SCORED,
      playerData: updatedPlayerData,
      totalScores: newTotalScores
    })
  },

  nextRound: () => {
    const s = get()
    const nextIndex = s.currentRoundIndex + 1

    if (nextIndex >= s.rounds.length) {
      const game = s.game
      if (game) useDataStore.getState().finishGame(game.id)
      set({ isFinished: true, currentRoundIndex: nextIndex })
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
      dealerName: dealerNameFor(s.players, nextIndex)
    })

    get().createRoundIfNeeded()
  },

  finishGame: (gameId) => {
    useDataStore.getState().finishGame(gameId)
    set({ isFinished: true })
  }
}))
