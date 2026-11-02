function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern)
    }
  } catch {
    // vibración no disponible: ignorar
  }
}

export function hapticTick(): void {
  vibrate(10)
}

export function hapticSuccess(): void {
  vibrate([30, 40, 60])
}
