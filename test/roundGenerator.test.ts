import { describe, expect, it } from 'vitest'
import { generateRounds } from '../src/domain/roundGenerator'
import { BAJADA, RONDA_ARRIBA, SUBIDA } from '../src/domain/gamePhase'

describe('RoundGenerator', () => {
  it('genera subida de 1 a N', () => {
    expect(generateRounds(4, [SUBIDA])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('genera bajada de N-1 a 1', () => {
    expect(generateRounds(4, [BAJADA])).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
  })

  it('genera ronda arriba N veces por jugador', () => {
    expect(generateRounds(4, [RONDA_ARRIBA])).toEqual([10, 10, 10, 10])
  })

  it('con subida presente, ronda arriba son numPlayers-1 rondas', () => {
    expect(generateRounds(4, [SUBIDA, RONDA_ARRIBA, BAJADA])).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      10, 10, 10,
      9, 8, 7, 6, 5, 4, 3, 2, 1
    ])
  })

  it('solo una ronda arriba cuando hay un solo jugador extra', () => {
    expect(generateRounds(2, [SUBIDA, RONDA_ARRIBA])).toEqual([
      ...Array.from({ length: 20 }, (_, i) => i + 1),
      20
    ])
  })
})
