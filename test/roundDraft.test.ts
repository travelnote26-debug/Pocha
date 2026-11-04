import { beforeEach, describe, expect, it } from 'vitest'
import { clearRoundDraft, loadRoundDraft, saveRoundDraft } from '../src/data/roundDraft'

const values = new Map<string, string>()

const storage: Storage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => {
    values.set(key, value)
  },
  removeItem: (key) => {
    values.delete(key)
  },
  clear: () => values.clear(),
  key: (index) => Array.from(values.keys())[index] ?? null,
  get length() {
    return values.size
  }
}

beforeEach(() => {
  values.clear()
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true
  })
})

describe('RoundDraft', () => {
  it('guarda y recupera el borrador de la ronda', () => {
    saveRoundDraft(7, {
      roundId: 12,
      roundIndex: 2,
      phase: 'COLLECTING_ACTUALS',
      predictions: { 1: 2, 2: 0 },
      actuals: { 1: 1, 2: 1 }
    })

    expect(loadRoundDraft(7)).toEqual({
      roundId: 12,
      roundIndex: 2,
      phase: 'COLLECTING_ACTUALS',
      predictions: { 1: 2, 2: 0 },
      actuals: { 1: 1, 2: 1 }
    })
  })

  it('devuelve null si no hay borrador o es inválido', () => {
    expect(loadRoundDraft(7)).toBeNull()
    values.set('apuntator:roundDraft:7', '{"roundId":"12"}')
    expect(loadRoundDraft(7)).toBeNull()
  })

  it('elimina el borrador', () => {
    saveRoundDraft(7, {
      roundId: 12,
      roundIndex: 2,
      phase: 'COLLECTING_PREDICTIONS',
      predictions: { 1: null },
      actuals: { 1: null }
    })
    clearRoundDraft(7)
    expect(loadRoundDraft(7)).toBeNull()
  })
})
