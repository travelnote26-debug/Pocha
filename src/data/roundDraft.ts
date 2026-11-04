export type RoundDraftPhase =
  | 'COLLECTING_PREDICTIONS'
  | 'PREDICTIONS_CONFIRMED'
  | 'COLLECTING_ACTUALS'

export interface RoundDraft {
  roundId: number
  roundIndex: number
  phase: RoundDraftPhase
  predictions: Record<number, number | null>
  actuals: Record<number, number | null>
}

const PREFIX = 'apuntator:roundDraft:'

function storageKey(gameId: number): string {
  return `${PREFIX}${gameId}`
}

function isDraftPhase(value: unknown): value is RoundDraftPhase {
  return (
    value === 'COLLECTING_PREDICTIONS' ||
    value === 'PREDICTIONS_CONFIRMED' ||
    value === 'COLLECTING_ACTUALS'
  )
}

function isNumberRecord(value: unknown): value is Record<number, number | null> {
  if (typeof value !== 'object' || value === null) return false
  return Object.values(value).every((entry) => entry === null || typeof entry === 'number')
}

export function loadRoundDraft(gameId: number): RoundDraft | null {
  try {
    const raw = localStorage.getItem(storageKey(gameId))
    if (raw === null) return null
    const parsed = JSON.parse(raw) as Partial<RoundDraft>
    if (
      typeof parsed.roundId !== 'number' ||
      typeof parsed.roundIndex !== 'number' ||
      !isDraftPhase(parsed.phase) ||
      !isNumberRecord(parsed.predictions) ||
      !isNumberRecord(parsed.actuals)
    ) {
      return null
    }
    return parsed as RoundDraft
  } catch {
    return null
  }
}

export function saveRoundDraft(gameId: number, draft: RoundDraft): void {
  try {
    localStorage.setItem(storageKey(gameId), JSON.stringify(draft))
  } catch {
    // almacenamiento no disponible: ignorar
  }
}

export function clearRoundDraft(gameId: number): void {
  try {
    localStorage.removeItem(storageKey(gameId))
  } catch {
    // almacenamiento no disponible: ignorar
  }
}
