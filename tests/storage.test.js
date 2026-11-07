/**
 * Unit tests for assets/js/storage.js: first visit, corrupt data, saving, events,
 * achievements and import/export. Uses the in-memory localStorage from
 * tests/helpers/browser-globals.js.
 */
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { storage } from '../assets/js/storage.js';

const KEY = 'codeorbit_universe_v1';
const BACKUP_KEY = 'codeorbit_universe_v1_corrupt_backup';

/** Start every test from a brand-new visitor. */
function freshVisit() {
  localStorage.failGet = false;
  localStorage.clear();
  storage.cache = null;
  storage.init();
}

/** Count 'codeorbit:data-changed' events fired while running fn. */
function countChanges(fn) {
  let n = 0;
  const listener = () => n++;
  window.addEventListener('codeorbit:data-changed', listener);
  try {
    fn();
  } finally {
    window.removeEventListener('codeorbit:data-changed', listener);
  }
  return n;
}

const silenceWarnings = t => t.mock.method(console, 'warn', () => {});

beforeEach(freshVisit);

describe('first visit and stored data', () => {
  // Regression for D-009: first visits used to load the fake "Alex Rivera" data.
  test('a new visitor starts with an empty universe, saved to localStorage', () => {
    const u = storage.getUniverse();
    assert.equal(u.profile.name, 'Developer');
    for (const list of ['skills', 'activities', 'projects', 'goals', 'achievements']) {
      assert.deepEqual(u[list], [], list);
    }
    assert.ok(localStorage.getItem(KEY), 'saved on first visit');
  });

  test('existing valid data is kept as-is', () => {
    storage.saveSkill({ name: 'Rust', progress: 40 });
    storage.cache = null;
    storage.init();
    assert.equal(storage.getSkills()[0].name, 'Rust');
  });

  test('unreadable JSON is backed up, then the app starts fresh', t => {
    silenceWarnings(t);
    localStorage.setItem(KEY, '{not json');
    storage.init();
    assert.equal(localStorage.getItem(BACKUP_KEY), '{not json');
    assert.deepEqual(storage.getSkills(), []);
  });

  test('valid JSON with the wrong shape is also backed up', t => {
    silenceWarnings(t);
    localStorage.setItem(KEY, JSON.stringify({ skills: 'oops' }));
    storage.init();
    assert.equal(localStorage.getItem(BACKUP_KEY), JSON.stringify({ skills: 'oops' }));
    assert.equal(storage.getProfile().name, 'Developer');
  });

  test('blocked localStorage does not crash: the app runs in memory', t => {
    silenceWarnings(t);
    localStorage.failGet = true;
    storage.cache = null;
    assert.doesNotThrow(() => storage.init());
    assert.equal(storage.getProfile().name, 'Developer');
  });

  test('getUniverse returns a copy: changing it does not change stored data', () => {
    const u = storage.getUniverse();
    u.skills.push({ name: 'Injected' });
    u.profile.name = 'Changed';
    assert.equal(storage.getSkills().length, 0);
    assert.equal(storage.getProfile().name, 'Developer');
  });
});

describe('saving data', () => {
  test('each save fires exactly one data-changed event', () => {
    assert.equal(
      countChanges(() => storage.saveSkill({ name: 'Go' })),
      1
    );
  });

  test('a new skill gets an sk_ id and timestamps', () => {
    storage.saveSkill({ name: 'Python', progress: 60 });
    const [skill] = storage.getSkills();
    assert.match(skill.id, /^sk_/);
    assert.ok(skill.createdAt && skill.updatedAt);
  });

  test('saving with an existing id updates instead of duplicating', () => {
    storage.saveSkill({ name: 'Python', progress: 60 });
    const [skill] = storage.getSkills();
    storage.saveSkill({ id: skill.id, progress: 70 });
    const skills = storage.getSkills();
    assert.equal(skills.length, 1);
    assert.equal(skills[0].progress, 70);
    assert.equal(skills[0].name, 'Python', 'fields not sent are kept');
  });

  test('deleting removes only the matching item', () => {
    storage.saveSkill({ name: 'A' });
    storage.saveSkill({ name: 'B' });
    const [a] = storage.getSkills();
    storage.deleteSkill(a.id);
    assert.deepEqual(
      storage.getSkills().map(s => s.name),
      ['B']
    );
  });
});

describe('achievements', () => {
  // Regression for D-006: several unlocks must be ONE save, not one save each.
  test('unlocking several achievements saves once', () => {
    const changes = countChanges(() => {
      assert.equal(storage.unlockAchievements(['first_skill', 'first_mission']), true);
    });
    assert.equal(changes, 1);
    assert.deepEqual(
      storage.getAchievements().map(a => a.id),
      ['first_skill', 'first_mission']
    );
  });

  test('unlocking something already unlocked does nothing', () => {
    storage.unlockAchievements(['first_skill']);
    const changes = countChanges(() => {
      assert.equal(storage.unlockAchievements(['first_skill']), false);
    });
    assert.equal(changes, 0);
    assert.equal(storage.getAchievements().length, 1);
  });
});

describe('import and export', () => {
  const minimal = extra => JSON.stringify({ skills: [], activities: [], projects: [], ...extra });

  test('rejects text that is not JSON', () => {
    const r = storage.importJSON('definitely not json');
    assert.equal(r.success, false);
    assert.ok(r.error);
  });

  test('rejects JSON missing the core lists', () => {
    assert.equal(storage.importJSON(JSON.stringify({ skills: [] })).success, false);
    assert.equal(storage.importJSON('[]').success, false);
  });

  test('a failed import leaves existing data untouched', () => {
    storage.saveSkill({ name: 'Keep me' });
    storage.importJSON('{broken');
    assert.equal(storage.getSkills()[0].name, 'Keep me');
  });

  test('clamps progress to 0–100 and keeps durations positive', () => {
    storage.importJSON(
      minimal({
        skills: [
          { id: 's1', progress: 150 },
          { id: 's2', progress: -5 }
        ],
        projects: [{ id: 'p1', progress: '42' }],
        activities: [
          { id: 'a1', duration: -10 },
          { id: 'a2', duration: 'x' }
        ]
      })
    );
    const u = storage.getUniverse();
    assert.deepEqual(
      u.skills.map(s => s.progress),
      [100, 0]
    );
    assert.equal(u.projects[0].progress, 42);
    assert.deepEqual(u.projects[0].technologies, []);
    for (const a of u.activities) assert.ok(a.duration >= 1, `duration ${a.duration}`);
  });

  // Regression for D-009: a backup without a profile used to become "Alex Rivera".
  test('a backup without profile or settings gets blank defaults, not the demo user', () => {
    storage.importJSON(minimal());
    const u = storage.getUniverse();
    assert.equal(u.profile.name, 'Developer');
    assert.equal(u.settings.theme, 'dark');
    assert.deepEqual(u.goals, []);
    assert.deepEqual(u.achievements, []);
  });

  test('export then import gives back the same data', () => {
    storage.saveSkill({ name: 'TypeScript', progress: 30 });
    storage.saveActivity({ title: 'Study', duration: 45, date: '2026-11-07' });
    const before = storage.getUniverse();
    const exported = storage.exportJSON();
    storage.resetAllData();
    assert.equal(storage.importJSON(exported).success, true);
    assert.deepEqual(storage.getUniverse(), before);
  });
});

describe('reset and demo', () => {
  test('reset empties everything', () => {
    storage.saveSkill({ name: 'X' });
    storage.unlockAchievements(['first_skill']);
    storage.resetAllData();
    assert.deepEqual(storage.getSkills(), []);
    assert.deepEqual(storage.getAchievements(), []);
  });

  test('demo data is only loaded on request', () => {
    assert.notEqual(storage.getProfile().name, 'Alex Rivera');
    storage.loadDemoUniverse();
    assert.equal(storage.getProfile().name, 'Alex Rivera');
    assert.ok(storage.getSkills().length > 0);
  });
});
