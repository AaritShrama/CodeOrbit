/**
 * Keeps sw.js in step with the app: every file the app loads must be in the
 * offline list, and every listed file must exist (a missing one would make the
 * service worker fail to install, and offline support would silently stop).
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const listed = [
  ...sw
    .slice(sw.indexOf('const APP_FILES'), sw.indexOf('];', sw.indexOf('const APP_FILES')))
    .matchAll(/'([^']+)'/g)
].map(m => m[1]);
const root = new URL('../', import.meta.url);

describe('offline file list (sw.js)', () => {
  test('lists every stylesheet, script and font', () => {
    for (const dir of ['assets/css', 'assets/js', 'assets/fonts']) {
      for (const f of readdirSync(new URL(dir, root))) {
        if (/\.(css|js|woff2)$/.test(f)) assert.ok(listed.includes(`${dir}/${f}`), `${dir}/${f}`);
      }
    }
  });

  test('lists the page, manifest and the app icons', () => {
    for (const f of ['./', 'index.html', 'manifest.webmanifest', 'assets/images/icon-192.png']) {
      assert.ok(listed.includes(f), f);
    }
  });

  test('every listed file exists', () => {
    for (const f of listed.filter(f => f !== './')) {
      assert.ok(existsSync(new URL(f, root)), `${f} is listed but missing`);
    }
  });
});
