/**
 * Unit tests for route validation in assets/js/navigation.js.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isRoute } from '../assets/js/navigation.js';

const PAGES = [
  'dashboard',
  'skills',
  'progress',
  'projects',
  'goals',
  'achievements',
  'analytics',
  'settings'
];

test('all 8 real pages are valid routes', () => {
  for (const page of PAGES) assert.equal(isRoute(page), true, page);
});

// Regression: `#constructor` passed a plain ROUTE_CONFIG[name] check and showed a blank app.
test('inherited object keys are not routes', () => {
  for (const name of ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'valueOf']) {
    assert.equal(isRoute(name), false, name);
  }
});

test('unknown, empty and non-string values are not routes', () => {
  for (const name of ['nonsense', '', ' skills', 'Skills', '%c%s', null, undefined, 42, {}]) {
    assert.equal(isRoute(name), false, String(name));
  }
});
