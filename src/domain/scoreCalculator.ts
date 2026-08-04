const TOTAL_CARDS = 40
const CORRECT_PREDICTION_BASE = 10
const CORRECT_PREDICTION_PER_TRICK = 5
const WRONG_PREDICTION_PENALTY_PER_TRICK = 5

export function calculateScore(
  predicted: number,
  actual: number,
  numCards: number,
  pochaX2 = false
): number {
  const baseScore =
    predicted === actual
      ? CORRECT_PREDICTION_BASE + CORRECT_PREDICTION_PER_TRICK * actual
      : -WRONG_PREDICTION_PENALTY_PER_TRICK * Math.abs(predicted - actual)

  const isAllTricks = predicted === actual && predicted === numCards

  if (pochaX2 && numCards > 1 && isAllTricks) return baseScore * 2
  return baseScore
}

export function getMaxTricksPerPlayer(numPlayers: number): number {
  return Math.floor(TOTAL_CARDS / numPlayers)
}
