import { getMaxTricksPerPlayer } from './scoreCalculator'
import { BAJADA, RONDA_ARRIBA, SUBIDA, type GamePhase } from './gamePhase'

export function generateRounds(numPlayers: number, phases: GamePhase[]): number[] {
  const maxCards = getMaxTricksPerPlayer(numPlayers)
  const hasSubida = phases.some((p) => p.name === SUBIDA.name)
  const rounds: number[] = []

  for (const phase of phases) {
    if (phase.name === SUBIDA.name) {
      for (let i = 1; i <= maxCards; i++) rounds.push(i)
    } else if (phase.name === BAJADA.name) {
      for (let i = maxCards - 1; i >= 1; i--) rounds.push(i)
    } else if (phase.name === RONDA_ARRIBA.name) {
      const count = hasSubida ? numPlayers - 1 : numPlayers
      for (let i = 0; i < count; i++) rounds.push(maxCards)
    }
  }

  return rounds
}
