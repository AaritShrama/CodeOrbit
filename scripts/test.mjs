/**
 * Runs the unit tests once per timezone, because date bugs only show up away
 * from UTC (see docs/DECISIONS.md D-007 and D-015).
 *
 *   npm test            all timezones below
 *   npm run test:quick  your computer's timezone only
 *
 * Works the same on Windows, macOS and Linux (no shell-specific TZ=... syntax).
 */
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const TIMEZONES = [
  'Asia/Kolkata', // UTC+5:30: where most contributors are; caught the original bug
  'UTC',
  'America/Los_Angeles', // UTC-8/-7: behind UTC, with a DST change on 1 Nov 2026
  'Pacific/Kiritimati' // UTC+14: the most extreme offset
];

const quick = process.argv.includes('--quick');
const zones = quick ? [null] : TIMEZONES;

const files = readdirSync('tests')
  .filter(f => f.endsWith('.test.js'))
  .sort()
  .map(f => join('tests', f));

let failed = false;
for (const tz of zones) {
  const env = { ...process.env };
  if (tz) env.TZ = tz;
  console.log(`\n=== Unit tests — timezone: ${tz || 'local'} ===`);
  const result = spawnSync(
    process.execPath,
    ['--import', './tests/helpers/browser-globals.js', '--test', ...files],
    { stdio: 'inherit', env }
  );
  if (result.status !== 0) failed = true;
}

if (failed) {
  console.error('\nSome tests failed. See the output above.');
  process.exit(1);
}
console.log(`\nAll tests passed in ${zones.length} timezone(s).`);
