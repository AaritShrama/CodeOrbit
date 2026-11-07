/**
 * Freezes "now" for one test, so date logic is tested at an exact moment.
 * Pass an absolute instant (with a UTC offset) to test "the same moment seen
 * from different timezones", or a local Date to test "local noon on day X".
 */
export function freezeTime(t, instant) {
  const ms = instant instanceof Date ? instant.getTime() : new Date(instant).getTime();
  t.mock.timers.enable({ apis: ['Date'], now: ms });
}

/** The timezone this test process runs in (set by scripts/test.mjs). */
export const TZ = process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone;
