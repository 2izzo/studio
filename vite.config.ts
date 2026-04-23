import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * MPA entries — every HTML file in the site.
 *
 * Phase 1 only *processes* these through Vite; it does NOT rewrite any
 * existing lesson markup. Only the top-level index.html imports a .ts
 * module. Existing lessons keep their inline scripts and CDN Tone.js
 * exactly as they are today.
 */
const entries = {
  main: resolve(__dirname, 'index.html'),

  // chord-progressions/ has no pack-index page today — it predates the
  // module-index pattern. The landing points directly at lesson 1 for this
  // pack. Phase 2 todo: mint chord-progressions/index.html to match the
  // other packs (and also fix the broken prereq link in modes/index.html).
  'chord-progressions-01': resolve(__dirname, 'chord-progressions/01-lofi-lab.html'),
  'chord-progressions-02': resolve(__dirname, 'chord-progressions/02-swapper.html'),
  'chord-progressions-03': resolve(__dirname, 'chord-progressions/03-transformation.html'),
  'chord-progressions-04': resolve(__dirname, 'chord-progressions/04-quiz.html'),

  'modes':                 resolve(__dirname, 'modes/index.html'),
  'modes-01':              resolve(__dirname, 'modes/01-seven-rooms.html'),
  'modes-02':              resolve(__dirname, 'modes/02-parent-scale.html'),
  'modes-03':              resolve(__dirname, 'modes/03-interchange.html'),
  'modes-04':              resolve(__dirname, 'modes/04-quiz.html'),

  'rhythm-and-pocket':     resolve(__dirname, 'rhythm-and-pocket/index.html'),
  'rhythm-and-pocket-01':  resolve(__dirname, 'rhythm-and-pocket/01-feel-families.html'),
  'rhythm-and-pocket-02':  resolve(__dirname, 'rhythm-and-pocket/02-the-pocket.html'),
  'rhythm-and-pocket-03':  resolve(__dirname, 'rhythm-and-pocket/03-ghosts.html'),
  'rhythm-and-pocket-04':  resolve(__dirname, 'rhythm-and-pocket/04-quiz.html'),

  'melody-and-motifs':     resolve(__dirname, 'melody-and-motifs/index.html'),
  'melody-and-motifs-01':  resolve(__dirname, 'melody-and-motifs/01-motif-lab.html'),
  'melody-and-motifs-02':  resolve(__dirname, 'melody-and-motifs/02-call-response.html'),
  'melody-and-motifs-03':  resolve(__dirname, 'melody-and-motifs/03-melody-over-chords.html'),
  'melody-and-motifs-04':  resolve(__dirname, 'melody-and-motifs/04-quiz.html'),

  'voice-leading':         resolve(__dirname, 'voice-leading/index.html'),
  'voice-leading-01':      resolve(__dirname, 'voice-leading/01-common-tones.html'),
  'voice-leading-02':      resolve(__dirname, 'voice-leading/02-smallest-move.html'),
  'voice-leading-03':      resolve(__dirname, 'voice-leading/03-circle-walk.html'),
  'voice-leading-04':      resolve(__dirname, 'voice-leading/04-quiz.html'),
};

export default defineConfig({
  // GitHub Pages serves project sites at <user>.github.io/<repo>/.
  // If a custom domain is configured later, change this to '/'.
  base: '/studio/',

  resolve: {
    alias: { '@shared': resolve(__dirname, 'src/shared') },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    minify: 'esbuild',
    rollupOptions: { input: entries },
  },
});
