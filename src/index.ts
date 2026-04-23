import {
  readPackProgress,
  countComplete,
  firstIncompleteLesson,
  type PackProgress,
} from '@shared/progress';

/**
 * The five packs, in the order they appear on the landing.
 *
 * `storageKey` is the key each pack's existing lesson HTML already writes to
 * localStorage — these pre-date the TS migration and changing them would
 * wipe every learner's progress, so they're preserved exactly. Note the
 * drift: directory name ≠ storage key for two packs.
 *
 *   directory                  storage key
 *   chord-progressions   →  rizzo-studio-chord-progressions
 *   modes                →  rizzo-studio-modes
 *   rhythm-and-pocket    →  rizzo-studio-rhythm
 *   melody-and-motifs    →  rizzo-studio-melody
 *   voice-leading        →  rizzo-studio-voice-leading
 *
 * Edit this array to reorder, rename, or add packs. It's the single source
 * of truth for the landing.
 */
interface Pack {
  readonly slug: string;
  readonly storageKey: string;
  readonly packNumber: number;
  readonly title: string;
  readonly blurb: string;
  readonly lessonCount: number;
  readonly packIndexHref: string;
  readonly lessonHrefs: readonly string[]; // length === lessonCount
}

const PACKS: readonly Pack[] = [
  {
    slug: 'chord-progressions',
    storageKey: 'rizzo-studio-chord-progressions',
    packNumber: 1,
    title: 'Chord Progressions',
    blurb:
      'Learn to hear how chords pull on each other. Build a diatonic ear with labs, swaps, and transformations.',
    lessonCount: 4,
    packIndexHref: 'chord-progressions/index.html',
    lessonHrefs: [
      'chord-progressions/01-lofi-lab.html',
      'chord-progressions/02-swapper.html',
      'chord-progressions/03-transformation.html',
      'chord-progressions/04-quiz.html',
    ],
  },
  {
    slug: 'modes',
    storageKey: 'rizzo-studio-modes',
    packNumber: 2,
    title: 'Modes',
    blurb:
      'Same seven notes, seven worlds. Hear modes as feelings, not formulas — from bright Lydian to dark Phrygian.',
    lessonCount: 4,
    packIndexHref: 'modes/index.html',
    lessonHrefs: [
      'modes/01-seven-rooms.html',
      'modes/02-parent-scale.html',
      'modes/03-interchange.html',
      'modes/04-quiz.html',
    ],
  },
  {
    slug: 'rhythm-and-pocket',
    storageKey: 'rizzo-studio-rhythm',
    packNumber: 3,
    title: 'Rhythm & Pocket',
    blurb:
      'Straight, swing, and shuffle feel. ±15ms microtiming. Ghost notes. The groove side of the brain.',
    lessonCount: 4,
    packIndexHref: 'rhythm-and-pocket/index.html',
    lessonHrefs: [
      'rhythm-and-pocket/01-feel-families.html',
      'rhythm-and-pocket/02-the-pocket.html',
      'rhythm-and-pocket/03-ghosts.html',
      'rhythm-and-pocket/04-quiz.html',
    ],
  },
  {
    slug: 'melody-and-motifs',
    storageKey: 'rizzo-studio-melody',
    packNumber: 4,
    title: 'Melody & Motifs',
    blurb:
      'Turn short ideas into whole lines. Motif labs, call-and-response, and melody over changes.',
    lessonCount: 4,
    packIndexHref: 'melody-and-motifs/index.html',
    lessonHrefs: [
      'melody-and-motifs/01-motif-lab.html',
      'melody-and-motifs/02-call-response.html',
      'melody-and-motifs/03-melody-over-chords.html',
      'melody-and-motifs/04-quiz.html',
    ],
  },
  {
    slug: 'voice-leading',
    storageKey: 'rizzo-studio-voice-leading',
    packNumber: 5,
    title: 'Voice Leading',
    blurb:
      'Smooth the motion between chords. Common tones, smallest moves, circle walks, and the voicing quiz.',
    lessonCount: 4,
    packIndexHref: 'voice-leading/index.html',
    lessonHrefs: [
      'voice-leading/01-common-tones.html',
      'voice-leading/02-smallest-move.html',
      'voice-leading/03-circle-walk.html',
      'voice-leading/04-quiz.html',
    ],
  },
];

interface CardState {
  readonly pack: Pack;
  readonly progress: PackProgress;
  readonly done: number;
  readonly isComplete: boolean;
  readonly nextLesson: number | null;
  readonly href: string;
  readonly cta: string;
}

function computeState(pack: Pack): CardState {
  const progress = readPackProgress(pack.storageKey);
  const done = countComplete(progress, pack.lessonCount);
  const isComplete = done === pack.lessonCount;
  const nextLesson = firstIncompleteLesson(progress, pack.lessonCount);

  let href: string;
  if (nextLesson === null) {
    href = pack.packIndexHref;
  } else {
    // noUncheckedIndexedAccess: lessonHrefs[i] is string | undefined.
    href = pack.lessonHrefs[nextLesson - 1] ?? pack.packIndexHref;
  }

  let cta: string;
  if (isComplete) cta = 'Review pack →';
  else if (done === 0) cta = 'Start pack →';
  else cta = `Resume lesson ${nextLesson} →`;

  return { pack, progress, done, isComplete, nextLesson, href, cta };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderCard(state: CardState): string {
  const { pack, done, isComplete, cta, href } = state;
  const classes = `pack-card${isComplete ? ' complete' : ''}`;
  return `
    <a class="${classes}" href="${escapeHtml(href)}">
      <div class="kicker">Pack ${pack.packNumber}</div>
      <h2>${escapeHtml(pack.title)}</h2>
      <p class="blurb">${escapeHtml(pack.blurb)}</p>
      <div class="progress-row">
        <span class="progress-count"><strong>${done}</strong> / ${pack.lessonCount} complete</span>
        <span class="cta">${escapeHtml(cta)}</span>
      </div>
    </a>
  `;
}

function renderPacks(): void {
  const grid = document.getElementById('packGrid');
  if (!grid) return;
  const cards = PACKS.map((pack) => renderCard(computeState(pack)));

  // Also roll up total progress across all packs for the hero subline.
  const totalDone = PACKS.reduce(
    (acc, pack) => acc + countComplete(readPackProgress(pack.storageKey), pack.lessonCount),
    0,
  );
  const totalLessons = PACKS.reduce((acc, pack) => acc + pack.lessonCount, 0);

  grid.innerHTML = cards.join('');
  const tally = document.getElementById('tally');
  if (tally) {
    tally.textContent =
      totalDone === 0
        ? `${totalLessons} lessons across ${PACKS.length} packs.`
        : `${totalDone} / ${totalLessons} lessons complete across ${PACKS.length} packs.`;
  }
}

renderPacks();
// Re-render when the tab regains focus — lets completions in other tabs
// show up on the landing without a manual refresh.
window.addEventListener('focus', renderPacks);
