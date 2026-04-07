/**
 * Scoring utility for Mini Game Quiz
 *
 * Ranking priority:
 * 1. Correct answers (more = better)
 * 2. Prediction deviation (lower = better)
 * 3. Time spent (faster = better)
 */

export function calculateDailyScore(
  correctAnswers: number,
  totalDeviation: number,
  totalTimeMs: number,
): number {
  const correctScore = correctAnswers * 1000;
  const deviationPenalty = totalDeviation * 10;
  const timePenalty = Math.floor(totalTimeMs / 100);

  return correctScore - deviationPenalty - timePenalty;
}

/**
 * Compare two daily results for ranking.
 * Returns negative if a should rank higher (better).
 */
export function compareDailyResults(
  a: { correctAnswers: number; totalDeviation: number; totalTimeMs: number },
  b: { correctAnswers: number; totalDeviation: number; totalTimeMs: number },
): number {
  // More correct = better (descending)
  if (a.correctAnswers !== b.correctAnswers) {
    return b.correctAnswers - a.correctAnswers;
  }
  // Less deviation = better (ascending)
  if (a.totalDeviation !== b.totalDeviation) {
    return a.totalDeviation - b.totalDeviation;
  }
  // Less time = better (ascending)
  return a.totalTimeMs - b.totalTimeMs;
}

/**
 * Compare two overall results for final ranking.
 */
export function compareOverallResults(
  a: { totalCorrectAnswers: number; totalScore: number },
  b: { totalCorrectAnswers: number; totalScore: number },
): number {
  if (a.totalCorrectAnswers !== b.totalCorrectAnswers) {
    return b.totalCorrectAnswers - a.totalCorrectAnswers;
  }
  return b.totalScore - a.totalScore;
}
