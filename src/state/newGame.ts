import { create } from 'zustand'
import { GAME_PHASES, type GamePhase } from '../domain/gamePhase'
import { useDataStore } from './dataStore'

export interface NewGameState {
  selectedPhases: GamePhase[]
  pochaX2: boolean
  selectedPlayerIds: number[]
  createdGameId: number | null
}

interface NewGameActions {
  togglePhase: (phase: GamePhase) => void
  togglePochaX2: () => void
  addPlayer: (name: string) => void
  togglePlayerSelection: (playerId: number) => void
  shufflePlayers: () => void
  movePlayer: (fromIndex: number, toIndex: number) => void
  removePlayer: (playerId: number) => void
  setDealer: (playerId: number) => void
  createGame: () => void
  reset: () => void
}

const initialState: NewGameState = {
  selectedPhases: [],
  pochaX2: false,
  selectedPlayerIds: [],
  createdGameId: null
}

function hasValidSelection(s: NewGameState): boolean {
  return s.selectedPhases.length > 0 && s.selectedPlayerIds.length >= 2
}

export const useNewGame = create<NewGameState & NewGameActions>((set, get) => ({
  ...initialState,

  togglePhase: (phase) => {
    const current = [...get().selectedPhases]
    const idx = current.findIndex((p) => p.name === phase.name)
    if (idx >= 0) current.splice(idx, 1)
    else current.push(phase)
    set({ selectedPhases: current })
  },

  togglePochaX2: () => set((s) => ({ pochaX2: !s.pochaX2 })),

  addPlayer: (name) => {
    if (name.trim() === '') return
    const id = useDataStore.getState().createPlayer(name.trim())
    set((s) => ({ selectedPlayerIds: [...s.selectedPlayerIds, id] }))
  },

  togglePlayerSelection: (playerId) => {
    set((s) => {
      const current = [...s.selectedPlayerIds]
      const idx = current.indexOf(playerId)
      if (idx >= 0) current.splice(idx, 1)
      else current.push(playerId)
      return { selectedPlayerIds: current }
    })
  },

  shufflePlayers: () => {
    set((s) => {
      const current = [...s.selectedPlayerIds]
      if (current.length < 2) return {}
      for (let i = current.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[current[i], current[j]] = [current[j], current[i]]
      }
      return { selectedPlayerIds: current }
    })
  },

  movePlayer: (fromIndex, toIndex) => {
    set((s) => {
      const current = [...s.selectedPlayerIds]
      if (fromIndex < 0 || fromIndex >= current.length) return {}
      if (toIndex < 0 || toIndex >= current.length) return {}
      const [item] = current.splice(fromIndex, 1)
      current.splice(toIndex, 0, item)
      return { selectedPlayerIds: current }
    })
  },

  removePlayer: (playerId) => {
    set((s) => ({ selectedPlayerIds: s.selectedPlayerIds.filter((id) => id !== playerId) }))
  },

  setDealer: (playerId) => {
    set((s) => {
      const current = [...s.selectedPlayerIds]
      const idx = current.indexOf(playerId)
      if (idx <= 0) return {}
      current.splice(idx, 1)
      current.unshift(playerId)
      return { selectedPlayerIds: current }
    })
  },

  createGame: () => {
    const s = get()
    if (!hasValidSelection(s)) return

    const orderedPhases = GAME_PHASES.filter((phase) =>
      s.selectedPhases.some((p) => p.name === phase.name)
    )
    const gameId = useDataStore.getState().createGame(
      orderedPhases.map((p) => p.name).join(','),
      s.pochaX2,
      s.selectedPlayerIds.length,
      s.selectedPlayerIds.join(',')
    )
    set({ createdGameId: gameId })
  },

  reset: () => set(initialState)
}))
