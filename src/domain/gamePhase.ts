export type GamePhaseName = 'SUBIDA' | 'RONDA_ARRIBA' | 'BAJADA'

export interface GamePhase {
  name: GamePhaseName
  displayName: string
}

export const SUBIDA: GamePhase = { name: 'SUBIDA', displayName: 'Subida' }
export const RONDA_ARRIBA: GamePhase = { name: 'RONDA_ARRIBA', displayName: 'Ronda arriba' }
export const BAJADA: GamePhase = { name: 'BAJADA', displayName: 'Bajada' }

export const GAME_PHASES: GamePhase[] = [SUBIDA, RONDA_ARRIBA, BAJADA]

export function parsePhases(phases: string): GamePhase[] {
  if (!phases || phases.trim() === '') return []
  return phases
    .split(',')
    .map((p) => p.trim())
    .map((p) => GAME_PHASES.find((ph) => ph.name === p))
    .filter((p): p is GamePhase => p !== undefined)
}

export function phasesDisplay(phases: GamePhase[]): string {
  return phases.map((p) => p.displayName).join(' + ')
}

export function displayPhasesString(phases: string): string {
  return phasesDisplay(parsePhases(phases))
}
