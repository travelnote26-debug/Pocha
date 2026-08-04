import { describe, expect, it } from 'vitest'
import { calculateScore, getMaxTricksPerPlayer } from '../src/domain/scoreCalculator'

describe('ScoreCalculator', () => {
  describe('calculateScore', () => {
    it('da 10 + 5*bazas cuando se acierta la predicción', () => {
      expect(calculateScore(3, 3, 5)).toBe(25)
      expect(calculateScore(0, 0, 5)).toBe(10)
    })

    it('penaliza 5 por baza de diferencia cuando se falla', () => {
      expect(calculateScore(2, 4, 5)).toBe(-10)
      expect(calculateScore(4, 2, 5)).toBe(-10)
    })

    it('duplica solo si se hacen todas las bazas, con x2 y más de 1 carta', () => {
      expect(calculateScore(4, 4, 4, true)).toBe(60)
      expect(calculateScore(4, 4, 4, false)).toBe(30)
      expect(calculateScore(1, 1, 1, true)).toBe(15)
      expect(calculateScore(2, 4, 4, true)).toBe(-10)
    })
  })

  describe('getMaxTricksPerPlayer', () => {
    it('divide 40 cartas entre jugadores', () => {
      expect(getMaxTricksPerPlayer(4)).toBe(10)
      expect(getMaxTricksPerPlayer(5)).toBe(8)
    })
  })
})
