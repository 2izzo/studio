/**
 * Entry module for pack-index HTML pages.
 *
 * Each pack-index HTML references this file via:
 *   <script type="module" src="/src/pack-index-entry.ts"></script>
 *
 * And marks its storage key on the body:
 *   <body data-storage-key="rizzo-studio-<slug>">
 */

import { initPackIndex } from '@shared/pack-index';

const storageKey = document.body.dataset['storageKey'];
if (storageKey) {
  initPackIndex({ storageKey });
} else {
  // Soft-fail so the static content still renders even if the data attr
  // is missing. Log so it's visible in devtools.
  // eslint-disable-next-line no-console
  console.warn('pack-index-entry: <body data-storage-key="..."> not set');
}
