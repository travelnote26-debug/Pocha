import type { Game, Player, Round, RoundPlayerScore } from '../domain/models'

const PREFIX = 'apuntator:'

const KEYS = {
  players: `${PREFIX}players`,
  games: `${PREFIX}games`,
  rounds: `${PREFIX}rounds`,
  scores: `${PREFIX}scores`
} as const

export interface Database {
  players: Player[]
  games: Game[]
  rounds: Round[]
  scores: RoundPlayerScore[]
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // almacenamiento no disponible: ignorar
  }
}

export function loadDatabase(): Database {
  return {
    players: read<Player[]>(KEYS.players, []),
    games: read<Game[]>(KEYS.games, []),
    rounds: read<Round[]>(KEYS.rounds, []),
    scores: read<RoundPlayerScore[]>(KEYS.scores, [])
  }
}

export function saveDatabase(db: Database): void {
  write(KEYS.players, db.players)
  write(KEYS.games, db.games)
  write(KEYS.rounds, db.rounds)
  write(KEYS.scores, db.scores)
}

export function nextId(items: { id: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

export function clearDatabase(): void {
  localStorage.removeItem(KEYS.players)
  localStorage.removeItem(KEYS.games)
  localStorage.removeItem(KEYS.rounds)
  localStorage.removeItem(KEYS.scores)
}
