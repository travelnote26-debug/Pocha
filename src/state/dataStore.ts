import { create } from 'zustand'
import type { Game, Player, Round, RoundPlayerScore } from '../domain/models'
import { loadDatabase, nextId, saveDatabase, type Database } from '../data/storage'

export interface PlayerTotalScore {
  playerId: number
  totalScore: number
}

interface DataState {
  db: Database
  loaded: boolean
  load: () => void
  createPlayer: (name: string) => number
  getPlayersByIds: (ids: number[]) => Player[]
  createGame: (phases: string, pochaX2: boolean, numPlayers: number, playerIds: string) => number
  getGame: (id: number) => Game | undefined
  finishGame: (id: number) => void
  createRound: (gameId: number, roundNumber: number, numCards: number) => number
  saveScores: (roundId: number, rows: PlayerRoundScoreInput[]) => number
  getRoundsByGameIdOnce: (gameId: number) => Round[]
  getScoresByRoundIdOnce: (roundId: number) => RoundPlayerScore[]
  getTotalScoresByGameId: (gameId: number) => PlayerTotalScore[]
  deletePlayer: (playerId: number) => void
  deleteGame: (gameId: number) => void
}

function commit(set: (fn: (state: DataState) => Partial<DataState>) => void, db: Database) {
  saveDatabase(db)
  set(() => ({ db }))
}

export interface PlayerRoundScoreInput {
  playerId: number
  predictedTricks: number
  actualTricks: number
  roundScore: number
}

export const useDataStore = create<DataState>((set, get) => ({
  db: { players: [], games: [], rounds: [], scores: [] },
  loaded: false,

  load: () => {
    if (get().loaded) return
    const db = loadDatabase()
    set({ db, loaded: true })
  },

  createPlayer: (name) => {
    const db = { ...get().db }
    const id = nextId(db.players)
    db.players = [...db.players, { id, name }]
    commit(set, db)
    return id
  },

  getPlayersByIds: (ids) => {
    const players = get().db.players
    const byId = new Map(players.map((p) => [p.id, p]))
    return ids.map((id) => byId.get(id)).filter((p): p is Player => p !== undefined)
  },

  createGame: (phases, pochaX2, numPlayers, playerIds) => {
    const db = { ...get().db }
    const id = nextId(db.games)
    const game: Game = {
      id,
      phases,
      pochaX2,
      numPlayers,
      playerIds,
      startTime: Date.now(),
      isFinished: false
    }
    db.games = [game, ...db.games]
    commit(set, db)
    return id
  },

  getGame: (id) => get().db.games.find((g) => g.id === id),

  finishGame: (id) => {
    const db = { ...get().db }
    db.games = db.games.map((g) => (g.id === id ? { ...g, isFinished: true } : g))
    commit(set, db)
  },

  createRound: (gameId, roundNumber, numCards) => {
    const db = { ...get().db }
    const id = nextId(db.rounds)
    db.rounds = [...db.rounds, { id, gameId, roundNumber, numCards }]
    commit(set, db)
    return id
  },

  saveScores: (roundId, rows) => {
    const db = { ...get().db }
    let id = nextId(db.scores)
    const saved = rows.map((row) => ({ id: id++, roundId, ...row }))
    db.scores = [...db.scores, ...saved]
    commit(set, db)
    return saved[0]?.id ?? id
  },

  getRoundsByGameIdOnce: (gameId) =>
    get()
      .db.rounds.filter((r) => r.gameId === gameId)
      .sort((a, b) => a.roundNumber - b.roundNumber),

  getScoresByRoundIdOnce: (roundId) =>
    get().db.scores.filter((s) => s.roundId === roundId),

  getTotalScoresByGameId: (gameId) => {
    const roundIds = new Set(
      get()
        .db.rounds.filter((r) => r.gameId === gameId)
        .map((r) => r.id)
    )
    const totals = new Map<number, number>()
    for (const score of get().db.scores) {
      if (!roundIds.has(score.roundId)) continue
      totals.set(score.playerId, (totals.get(score.playerId) ?? 0) + score.roundScore)
    }
    return Array.from(totals.entries()).map(([playerId, totalScore]) => ({
      playerId,
      totalScore
    }))
  },

  deletePlayer: (playerId) => {
    const db = { ...get().db }
    db.players = db.players.filter((p) => p.id !== playerId)
    commit(set, db)
  },

  deleteGame: (gameId) => {
    const db = { ...get().db }
    const roundIds = new Set(db.rounds.filter((r) => r.gameId === gameId).map((r) => r.id))
    db.scores = db.scores.filter((s) => !roundIds.has(s.roundId))
    db.rounds = db.rounds.filter((r) => r.gameId !== gameId)
    db.games = db.games.filter((g) => g.id !== gameId)
    commit(set, db)
  }
}))
