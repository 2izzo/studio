/**
 * Shared renderer for the five pack-index pages
 * (chord-progressions, modes, rhythm-and-pocket, melody-and-motifs,
 * voice-leading).
 *
 * Every pack-index HTML file had the same ~70-line inline script with only
 * the storage key and a couple of phrasing nits differing. This module
 * replaces all five copies with a single typed renderer.
 *
 * Expected DOM contract (same as the existing pack-index HTML):
 *   <body data-storage-key="rizzo-studio-<slug>">
 *
 *   #lesson1 .. #lesson{totalLessons}     — each has a .lesson-action child
 *   #completedCount                       — text shows number complete
 *   #progressFill                         — width is set in %
 *   #quizStats                            — text shows capstone best
 *   #capstone                             — toggles .locked class
 *   #capstoneTitle, #capstoneText          — text changes with gate state
 *   #capstoneBtn                          — text changes when complete
 *   #skillList li[data-unlock="<n>"]      — toggles .unlocked class
 *   #resetLink                            — click handler clears progress
 */

import { readPackProgress, type PackProgress } from '@shared/progress';

export interface PackIndexConfig {
  readonly storageKey: string;
  /** Number of lessons in the pack. Defaults to 4. */
  readonly totalLessons?: number;
}

type Nullable<T> = T | null;

function $id(id: string): Nullable<HTMLElement> {
  return document.getElementById(id);
}

function lessonComplete(progress: PackProgress, n: number): boolean {
  return progress[`lesson${n}`] === 'complete';
}

function renderLessonPath(progress: PackProgress, total: number): number {
  let completed = 0;
  let assignedCurrent = false;

  for (let n = 1; n <= total; n++) {
    const el = $id(`lesson${n}`);
    if (!el) continue;

    el.classList.remove('locked', 'complete', 'current');

    const action = el.querySelector<HTMLElement>('.lesson-action');
    if (lessonComplete(progress, n)) {
      completed++;
      el.classList.add('complete');
      if (action) action.textContent = 'review';
    } else if (!assignedCurrent) {
      assignedCurrent = true;
      el.classList.add('current');
      if (action) action.textContent = '▶ open';
    } else {
      if (action) action.textContent = '▶ open';
    }
  }

  return completed;
}

function renderProgressBar(completed: number, total: number): void {
  const count = $id('completedCount');
  if (count) count.textContent = String(completed);

  const fill = $id('progressFill');
  if (fill) fill.style.width = `${(completed / total) * 100}%`;
}

function renderCapstone(progress: PackProgress, total: number): void {
  const capstone = $id('capstone');
  const capText = $id('capstoneText');
  const capTitle = $id('capstoneTitle');
  const capBtn = $id('capstoneBtn');
  if (!capstone || !capText || !capTitle) return;

  const finalLesson = total;
  const gateLessons: number[] = [];
  for (let n = 1; n < finalLesson; n++) gateLessons.push(n);

  const allGateLessonsDone = gateLessons.every((n) => lessonComplete(progress, n));
  const finalDone = lessonComplete(progress, finalLesson);

  if (finalDone) {
    capstone.classList.remove('locked');
    capTitle.textContent = '✓ Module Complete';
    const best = typeof progress.quizBest === 'number' ? progress.quizBest : '?';
    capText.innerHTML =
      `You passed the Snap Quiz — best: <strong style="color:var(--green)">${best}/10</strong>. Retake anytime.`;
    if (capBtn) capBtn.textContent = 'Retake Quiz';
  } else if (allGateLessonsDone) {
    capstone.classList.remove('locked');
    // All current packs have 4 lessons (3 gate + 1 capstone). If a pack
    // with a different shape lands later, generalize this copy.
    capText.textContent = 'All three lessons walked. The Snap Quiz is unlocked.';
  } else {
    capstone.classList.add('locked');
    const need = gateLessons.filter((n) => !lessonComplete(progress, n));
    capText.textContent =
      `Complete lesson${need.length > 1 ? 's' : ''} ${need.join(', ')} to unlock the Snap Quiz.`;
  }
}

function renderQuizStats(progress: PackProgress): void {
  const el = $id('quizStats');
  if (!el) return;
  if (typeof progress.quizBest === 'number') {
    el.textContent = `Capstone best: ${progress.quizBest}/10`;
  }
}

function renderSkillLadder(progress: PackProgress): void {
  const items = document.querySelectorAll<HTMLElement>('#skillList li');
  items.forEach((li) => {
    const raw = li.dataset['unlock'];
    if (raw === undefined) return;
    const requires = Number.parseInt(raw, 10);
    if (Number.isNaN(requires)) return;
    if (lessonComplete(progress, requires)) li.classList.add('unlocked');
    else li.classList.remove('unlocked');
  });
}

function render(cfg: PackIndexConfig): void {
  const total = cfg.totalLessons ?? 4;
  const progress = readPackProgress(cfg.storageKey);
  const completed = renderLessonPath(progress, total);
  renderProgressBar(completed, total);
  renderCapstone(progress, total);
  renderQuizStats(progress);
  renderSkillLadder(progress);
}

function wireResetLink(cfg: PackIndexConfig): void {
  const link = $id('resetLink');
  if (!link) return;
  link.addEventListener('click', () => {
    const ok = window.confirm(
      'Reset module progress? This clears completed lessons and quiz scores.',
    );
    if (!ok) return;
    localStorage.removeItem(cfg.storageKey);
    render(cfg);
  });
}

/**
 * Wire up a pack-index page. Call once on page load.
 */
export function initPackIndex(cfg: PackIndexConfig): void {
  render(cfg);
  wireResetLink(cfg);
  // Re-render when the user returns from a lesson and completes it — the
  // lesson writes localStorage, then coming back here triggers a refresh.
  window.addEventListener('focus', () => render(cfg));
}
