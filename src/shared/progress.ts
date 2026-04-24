/**
 * Per-pack progress reader.
 *
 * Existing lesson pages already write keys of the form `rizzo-studio-<slug>`
 * where <slug> is NOT always the directory name (e.g. `rhythm-and-pocket/`
 * uses key `rizzo-studio-rhythm`). This module reads those keys READ-ONLY
 * for the top-level landing rollup. It does NOT modify existing data.
 *
 * The shape below matches what every pack's index.html writes today:
 *   { lesson1: 'complete', lesson2: 'complete', quizBest: 7, ... }
 */

export interface PackProgress {
  lesson1?: 'complete';
  lesson2?: 'complete';
  lesson3?: 'complete';
  lesson4?: 'complete';
  quizBest?: number;
  [extra: string]: unknown;
}

/**
 * Pull a pack's progress blob from localStorage.
 * Swallows JSON parse errors and returns {} — malformed state should not
 * crash the landing.
 */
export function readPackProgress(storageKey: string): PackProgress {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as PackProgress;
    }
    return {};
  } catch {
    return {};
  }
}

/** Count lessons marked 'complete' in the blob (1..total). */
export function countComplete(progress: PackProgress, total = 4): number {
  let done = 0;
  for (let i = 1; i <= total; i++) {
    if (progress[`lesson${i}`] === 'complete') done++;
  }
  return done;
}

/** Lowest lesson number that's not yet complete, or null if all done. */
export function firstIncompleteLesson(
  progress: PackProgress,
  total = 4,
): number | null {
  for (let i = 1; i <= total; i++) {
    if (progress[`lesson${i}`] !== 'complete') return i;
  }
  return null;
}
