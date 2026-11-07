/**
 * Unit tests for assets/js/utils.js: escaping and safe links, the words shown for stored
 * values, dates, the peak weekday, days in a row, the progress score, backup reminder, recap.
 * Run with `npm test` (every timezone) or `npm run test:quick` (yours only).
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeHTML,
  formatDate,
  formatRelativeTime,
  toLocalISO,
  getTodayISO,
  getRelativeISO,
  getLastNDaysISO,
  isWithinLastNDays,
  peakWeekday,
  calculateStreak,
  calculateProgressScore,
  streakMessage,
  backupReminder,
  weeklyRecap,
  safeUrl,
  statusLabel,
  projectStatusLabel,
  typeLabel,
  skillLabel,
  GENERAL_SKILL
} from '../assets/js/utils.js';
import { freezeTime, TZ } from './helpers/clock.js';

/** Build activities from local YYYY-MM-DD strings. */
const sessions = (...dates) => dates.map((date, i) => ({ id: `a${i}`, date, duration: 60 }));

/** Local noon on a given local date (safe from DST edges). */
const localNoon = (y, m, d) => new Date(y, m - 1, d, 12, 0, 0);

describe('escapeHTML', () => {
  test('escapes every character that can break out of HTML', () => {
    assert.equal(
      escapeHTML(`<img src=x onerror="alert('x')">&`),
      '&lt;img src=x onerror=&quot;alert(&#039;x&#039;)&quot;&gt;&amp;'
    );
  });

  test('returns an empty string for anything that is not a string', () => {
    for (const value of [null, undefined, 42, {}, []]) assert.equal(escapeHTML(value), '');
  });
});

// Security regression: formatDate used to return an invalid input unchanged, and
// its result is inserted into innerHTML. A malicious imported "date" ran as code.
// Security: escapeHTML does not make a link safe; "javascript:" has nothing to escape.
describe('safeUrl', () => {
  test('keeps http and https links', () => {
    assert.equal(safeUrl('https://github.com/me/app'), 'https://github.com/me/app');
    assert.equal(safeUrl('  http://example.com  '), 'http://example.com');
  });

  test('drops anything that is not a web link', () => {
    for (const bad of [
      'javascript:alert(1)',
      'JavaScript:alert(1)',
      ' javascript:alert(1)',
      'data:text/html,<b>x</b>',
      'httpx://example.com',
      'https://',
      'example.com',
      '',
      null,
      42
    ]) {
      assert.equal(safeUrl(bad), '', String(bad));
    }
  });
});

// D-022: stored values never change; these are the words people see.
describe('labels for stored values', () => {
  test('skill status', () => {
    assert.deepEqual(
      ['Not Started', 'Learning', 'Practicing', 'Completed', undefined].map(statusLabel),
      ['Not started', 'Learning', 'Practising', 'Finished', 'Learning']
    );
  });

  test('project status', () => {
    assert.deepEqual(
      ['Planning', 'In Progress', 'On Hold', 'Completed', undefined].map(projectStatusLabel),
      ['Planning', 'In progress', 'Paused', 'Finished', 'Planning']
    );
  });

  test('study session type', () => {
    assert.deepEqual(
      ['Practice Problems', 'Project Development', 'Coding', undefined].map(typeLabel),
      ['Practice problems', 'Project work', 'Coding', 'Other']
    );
  });

  test('a session not tied to one of your skills reads as "General"', () => {
    assert.equal(skillLabel(GENERAL_SKILL), 'General');
    assert.equal(skillLabel(''), 'General');
    assert.equal(skillLabel('Python'), 'Python');
  });
});

describe('formatDate / formatRelativeTime never echo invalid input', () => {
  const evil = '<img src=x onerror=alert(1)>';
  test('invalid dates become a fixed label, never the input', () => {
    assert.equal(formatDate(evil), 'Invalid date');
    assert.equal(formatRelativeTime(evil), 'Invalid date');
    assert.equal(formatDate('not a date'), 'Invalid date');
  });
  test('empty or non-string input is N/A', () => {
    for (const v of ['', null, undefined, 42, {}]) assert.equal(formatDate(v), 'N/A');
  });
  test('valid dates still format normally', () => {
    assert.equal(formatDate('2026-11-07'), 'Nov 7, 2026');
  });
});

describe('local calendar dates', () => {
  test('toLocalISO formats the LOCAL date, not the UTC date', () => {
    assert.equal(toLocalISO(new Date(2026, 0, 5, 0, 30)), '2026-01-05');
    assert.equal(toLocalISO(new Date(2026, 11, 31, 23, 59)), '2026-12-31');
  });

  // Regression for the bug fixed in D-007: at 02:00 in India it was still
  // "yesterday" in UTC, so the app showed the wrong day.
  test('"today" at 02:00 IST is the date where the user is', t => {
    freezeTime(t, '2026-11-07T02:00:00+05:30'); // = 2026-11-06 20:30 UTC
    const expected = {
      'Asia/Kolkata': '2026-11-07',
      UTC: '2026-11-06',
      'America/Los_Angeles': '2026-11-06',
      'Pacific/Kiritimati': '2026-11-07'
    }[TZ];
    if (expected) assert.equal(getTodayISO(), expected);
    assert.equal(getTodayISO(), toLocalISO(new Date()));
  });

  test('getRelativeISO crosses month and leap-day boundaries', t => {
    freezeTime(t, localNoon(2028, 3, 1));
    assert.equal(getRelativeISO(0), '2028-03-01');
    assert.equal(getRelativeISO(-1), '2028-02-29');
    assert.equal(getRelativeISO(1), '2028-03-02');
  });

  test('getLastNDaysISO returns N distinct consecutive days, today first', t => {
    freezeTime(t, localNoon(2026, 3, 2));
    assert.deepEqual(getLastNDaysISO(4), ['2026-03-02', '2026-03-01', '2026-02-28', '2026-02-27']);
  });

  test('getLastNDaysISO has no gaps or duplicates across a DST change', t => {
    // US clocks go back on 2026-11-01; must still be 7 different days.
    freezeTime(t, localNoon(2026, 11, 3));
    const days = getLastNDaysISO(7);
    assert.deepEqual(days, [
      '2026-11-03',
      '2026-11-02',
      '2026-11-01',
      '2026-10-31',
      '2026-10-30',
      '2026-10-29',
      '2026-10-28'
    ]);
  });

  test('isWithinLastNDays: today and 6 days ago are in, 7 days ago and future are out', t => {
    freezeTime(t, localNoon(2026, 11, 7));
    assert.equal(isWithinLastNDays('2026-11-07', 7), true);
    assert.equal(isWithinLastNDays('2026-11-01', 7), true);
    assert.equal(isWithinLastNDays('2026-10-31', 7), false);
    assert.equal(isWithinLastNDays('2026-11-08', 7), false);
  });

  test('isWithinLastNDays accepts full timestamps and rejects empty values', t => {
    freezeTime(t, localNoon(2026, 11, 7));
    assert.equal(isWithinLastNDays('2026-11-05T23:59:00.000Z', 7), true);
    assert.equal(isWithinLastNDays('', 7), false);
    assert.equal(isWithinLastNDays(undefined, 7), false);
  });
});

describe('peakWeekday', () => {
  test('a session on a known Saturday counts as Saturday in every timezone', () => {
    // 2026-11-07 is a Saturday on the calendar. Parsing the plain date as UTC
    // midnight makes it "Friday" for anyone west of UTC, which is exactly what
    // the America/Los_Angeles run of scripts/test.mjs catches.
    assert.equal(peakWeekday(sessions('2026-11-07')), 'Saturday');
  });

  test('the weekday with the most focused minutes wins', () => {
    const acts = [
      { id: 'sat', date: '2026-11-07', duration: 120 }, // Saturday
      { id: 'mon1', date: '2026-11-09', duration: 60 }, // Monday
      { id: 'mon2', date: '2026-11-16', duration: 90 } // Monday
    ];
    assert.equal(peakWeekday(acts), 'Monday');
  });

  test('no sessions means no peak, without crashing', () => {
    assert.equal(peakWeekday([]), 'Weekday');
  });

  test('entries without dates are ignored', () => {
    const acts = [{ id: 'x' }, { id: 'sat', date: '2026-11-07', duration: 30 }];
    assert.equal(peakWeekday(acts), 'Saturday');
  });
});

describe('calculateStreak', () => {
  test('no sessions means no streak', () => {
    assert.deepEqual(calculateStreak([]), { currentStreak: 0, longestStreak: 0 });
    assert.deepEqual(calculateStreak(), { currentStreak: 0, longestStreak: 0 });
  });

  test('counts consecutive days ending today', t => {
    freezeTime(t, localNoon(2026, 11, 7));
    const s = calculateStreak(sessions('2026-11-07', '2026-11-06', '2026-11-05'));
    assert.equal(s.currentStreak, 3);
    assert.equal(s.longestStreak, 3);
  });

  test('a streak ending yesterday is still alive today (user has not studied yet)', t => {
    freezeTime(t, localNoon(2026, 11, 7));
    assert.equal(calculateStreak(sessions('2026-11-06', '2026-11-05')).currentStreak, 2);
  });

  test('missing yesterday breaks the current streak but not the longest', t => {
    freezeTime(t, localNoon(2026, 11, 7));
    const s = calculateStreak(sessions('2026-11-05', '2026-11-04', '2026-11-03'));
    assert.equal(s.currentStreak, 0);
    assert.equal(s.longestStreak, 3);
  });

  test('several sessions on one day count as one day', t => {
    freezeTime(t, localNoon(2026, 11, 7));
    const s = calculateStreak(sessions('2026-11-07', '2026-11-07', '2026-11-06'));
    assert.equal(s.currentStreak, 2);
  });

  test('longest streak continues across month and year boundaries', t => {
    freezeTime(t, localNoon(2027, 6, 1));
    assert.equal(
      calculateStreak(sessions('2026-01-30', '2026-01-31', '2026-02-01', '2026-02-02'))
        .longestStreak,
      4
    );
    assert.equal(
      calculateStreak(sessions('2026-12-30', '2026-12-31', '2027-01-01')).longestStreak,
      3
    );
  });

  test('current streak survives the US daylight-saving change', t => {
    freezeTime(t, localNoon(2026, 11, 2));
    const s = calculateStreak(sessions('2026-10-31', '2026-11-01', '2026-11-02'));
    assert.equal(s.currentStreak, 3);
  });

  test('sessions without a date are ignored', t => {
    freezeTime(t, localNoon(2026, 11, 7));
    const s = calculateStreak([{ id: 'x' }, ...sessions('2026-11-07')]);
    assert.equal(s.currentStreak, 1);
  });
});

describe('calculateProgressScore', () => {
  // Regression for D-015: a brand-new user used to get 20/100 for doing nothing.
  test('an empty universe scores 0', () => {
    const r = calculateProgressScore({});
    assert.equal(r.score, 0);
    assert.equal(r.breakdown.projects.points, 0);
    assert.equal(r.breakdown.skills.points, 0);
    assert.equal(r.level, 'Just beginning');
  });

  test('skills and projects with no sessions still score only what they earn', () => {
    const r = calculateProgressScore({
      skills: [{ progress: 50 }],
      projects: [{ progress: 50 }]
    });
    assert.equal(r.score, 20); // 10 (skills 50%) + 10 (projects 50%)
  });

  test('one session today with nothing else: consistency + hours + neutral baselines', t => {
    freezeTime(t, localNoon(2026, 11, 7));
    const r = calculateProgressScore({
      activities: sessions('2026-11-07'), // 60 minutes
      settings: { weeklyTargetHours: 10 }
    });
    assert.equal(r.breakdown.consistency.points, 4); // 1/7 days of 30
    assert.equal(r.breakdown.learningHours.points, 3); // 1h of 10h target, of 30
    assert.equal(r.breakdown.projects.points, 10); // neutral: user is active, tracks no projects
    assert.equal(r.breakdown.skills.points, 10);
    assert.equal(r.score, 27);
  });

  test('a perfect week scores 100 and never more', t => {
    freezeTime(t, localNoon(2026, 11, 7));
    const week = getLastNDaysISO(7).map((date, i) => ({ id: `w${i}`, date, duration: 600 }));
    const r = calculateProgressScore({
      activities: week,
      skills: [{ progress: 100 }],
      projects: [{ progress: 100 }],
      settings: { weeklyTargetHours: 5 }
    });
    assert.equal(r.score, 100);
    assert.equal(r.level, 'Excellent');
  });

  test('a weekly target of 0 or garbage does not produce NaN', t => {
    freezeTime(t, localNoon(2026, 11, 7));
    for (const weeklyTargetHours of [0, -3, 'abc', null]) {
      const r = calculateProgressScore({
        activities: sessions('2026-11-07'),
        settings: { weeklyTargetHours }
      });
      assert.ok(Number.isInteger(r.score), `score for target ${weeklyTargetHours}`);
      assert.ok(r.score >= 0 && r.score <= 100);
    }
  });

  test('sessions older than 7 days do not count toward this week', t => {
    freezeTime(t, localNoon(2026, 11, 7));
    const r = calculateProgressScore({ activities: sessions('2026-10-31') });
    assert.equal(r.breakdown.consistency.activeDays, 0);
    assert.equal(r.breakdown.learningHours.currentHours, 0);
  });
});

describe('streakMessage', () => {
  test('nudges when the run is alive but today is still empty', () => {
    assert.deepEqual(streakMessage(5, false), {
      text: 'Study today to keep your 5 days in a row going.',
      atRisk: true
    });
    assert.equal(streakMessage(1, false).atRisk, true);
  });

  test('celebrates once today is done', () => {
    assert.deepEqual(streakMessage(5, true), {
      text: 'You studied 5 days in a row.',
      atRisk: false
    });
    assert.equal(streakMessage(1, true).atRisk, false);
  });

  test('no run yet: an invitation, not a warning', () => {
    assert.equal(streakMessage(0, false).atRisk, false);
    assert.equal(streakMessage(0, true).atRisk, false);
  });
});

describe('backupReminder', () => {
  const now = new Date('2026-11-07T12:00:00Z');
  const daysAgo = n => new Date(now.getTime() - n * 86400000).toISOString();

  test('reminds when there is real data and never a backup', () => {
    assert.deepEqual(backupReminder({}, 3, now), { daysSince: null });
  });

  test('stays quiet for little data or sample data', () => {
    assert.equal(backupReminder({}, 2, now), null);
    assert.equal(backupReminder({ sampleData: true }, 50, now), null);
  });

  test('stays quiet for 30 days after a backup, then reminds', () => {
    assert.equal(backupReminder({ lastBackupAt: daysAgo(29) }, 10, now), null);
    assert.deepEqual(backupReminder({ lastBackupAt: daysAgo(31) }, 10, now), { daysSince: 31 });
  });

  test('"Not now" snoozes until the snooze date', () => {
    const tomorrow = new Date(now.getTime() + 86400000).toISOString();
    assert.equal(backupReminder({ backupSnoozeUntil: tomorrow }, 10, now), null);
    assert.deepEqual(backupReminder({ backupSnoozeUntil: daysAgo(1) }, 10, now), {
      daysSince: null
    });
  });
});

describe('weeklyRecap', () => {
  // Local dates. 2026-11-08 is a Sunday.
  const acts = [
    { date: '2026-11-02', duration: 30, skill: 'Go' }, // Mon
    { date: '2026-11-04', duration: 90, skill: 'SQL' }, // Wed (best day)
    { date: '2026-11-04', duration: 20, skill: 'Go' },
    { date: '2026-11-08', duration: 60, skill: 'Go' }, // Sun
    { date: '2026-10-30', duration: 45, skill: 'Go' }, // week before
    { date: '2026-11-09', duration: 999, skill: 'Go' } // next week: ignored
  ];

  test('on Sunday it covers Monday to today', t => {
    freezeTime(t, new Date(2026, 10, 8, 20));
    const r = weeklyRecap(acts);
    assert.equal(r.start, '2026-11-02');
    assert.equal(r.end, '2026-11-08');
    assert.equal(r.minutes, 200);
    assert.equal(r.prevMinutes, 45);
    assert.equal(r.sessions, 4);
    assert.equal(r.activeDays, 3);
    assert.deepEqual(r.bestDay, { date: '2026-11-04', minutes: 110 });
    assert.deepEqual(r.topSkill, { name: 'Go', minutes: 110 });
  });

  test('on Monday it still shows the week that just ended', t => {
    freezeTime(t, new Date(2026, 10, 9, 8));
    const r = weeklyRecap(acts);
    assert.equal(r.end, '2026-11-08');
    assert.equal(r.minutes, 200);
  });

  test('an empty week has no best day or top skill', t => {
    freezeTime(t, new Date(2026, 10, 8, 12));
    const r = weeklyRecap([]);
    assert.equal(r.minutes, 0);
    assert.equal(r.bestDay, null);
    assert.equal(r.topSkill, null);
  });
});
