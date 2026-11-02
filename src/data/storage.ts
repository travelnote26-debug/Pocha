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

export function loadDatabase(): Database {
  return {
    players: read<Player[]>(KEYS.players, []),
    games: read<Game[]>(KEYS.games, []),
    rounds: read<Round[]>(KEYS.rounds, []),
    scores: read<RoundPlayerScore[]>(KEYS.scores, [])
  }
}

export function saveDatabase(db: Database): void {
  const entries: [string, unknown][] = [
    [KEYS.players, db.players],
    [KEYS.games, db.games],
    [KEYS.rounds, db.rounds],
    [KEYS.scores, db.scores]
  ]
  for (const [key, value] of entries) {
    try {
      const serialized = JSON.stringify(value)
      if (localStorage.getItem(key) !== serialized) localStorage.setItem(key, serialized)
    } catch {
      // almacenamiento no disponible: ignorar
    }
  }
}

export function nextId(items: { id: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}
