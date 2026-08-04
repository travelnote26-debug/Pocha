export interface Player {
  id: number
  name: string
}

export interface Game {
  id: number
  phases: string
  pochaX2: boolean
  numPlayers: number
  playerIds: string
  startTime: number
  isFinished: boolean
}

export interface Round {
  id: number
  gameId: number
  roundNumber: number
  numCards: number
}

export interface RoundPlayerScore {
  id: number
  roundId: number
  playerId: number
  predictedTricks: number
  actualTricks: number
  roundScore: number
}

export function getPlayerIdList(game: Game): number[] {
  if (!game.playerIds || game.playerIds.trim() === '') return []
  return game.playerIds
    .split(',')
    .map((p) => p.trim())
    .map((p) => Number(p))
    .filter((n) => !Number.isNaN(n))
}
