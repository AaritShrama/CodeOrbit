/**
 * Unit tests for the achievement rules in assets/js/achievements.js.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ACHIEVEMENT_DEFINITIONS } from '../assets/js/achievements.js';
import { freezeTime } from './helpers/clock.js';

const byId = Object.fromEntries(ACHIEVEMENT_DEFINITIONS.map(d => [d.id, d]));
const empty = { skills: [], activities: [], projects: [], goals: [], achievements: [] };
const universe = extra => ({ ...empty, ...extra });
const days = (...dates) => dates.map((date, i) => ({ id: `a${i}`, date, duration: 30 }));

describe('achievement definitions', () => {
  test('there are 10, each with a unique id and the fields the UI needs', () => {
    assert.equal(ACHIEVEMENT_DEFINITIONS.length, 10);
    assert.equal(new Set(ACHIEVEMENT_DEFINITIONS.map(d => d.id)).size, 10);
    for (const d of ACHIEVEMENT_DEFINITIONS) {
      for (const field of ['id', 'title', 'description', 'icon', 'category']) {
        assert.ok(d[field], `${d.id}.${field}`);
      }
      assert.equal(typeof d.check, 'function');
      assert.equal(typeof d.progress, 'function');
    }
  });

  // Regression for D-009: new users must not get badges for nothing.
  test('an empty universe unlocks nothing', () => {
    for (const d of ACHIEVEMENT_DEFINITIONS) assert.equal(d.check(empty), false, d.id);
  });

  test('progress never exceeds the target, whatever the data', t => {
    freezeTime(t, new Date(2026, 10, 7, 12));
    // 300 sessions on 300 consecutive days ending today
    const consecutiveDays = Array.from({ length: 300 }, (_, i) => {
      const d = new Date(2026, 10, 7 - i, 12);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const lots = universe({
      skills: Array.from({ length: 20 }, (_, i) => ({ id: `s${i}`, progress: 100 })),
      activities: consecutiveDays.map((date, i) => ({ id: `a${i}`, date, duration: 600 })),
      projects: Array.from({ length: 10 }, (_, i) => ({ id: `p${i}`, status: 'Completed' })),
      goals: Array.from({ length: 10 }, (_, i) => ({ id: `g${i}`, status: 'Completed' }))
    });
    for (const d of ACHIEVEMENT_DEFINITIONS) {
      const p = d.progress(lots);
      assert.ok(p.current <= p.target, `${d.id}: ${p.current} > ${p.target}`);
      assert.ok(d.check(lots), `${d.id} should be unlocked`);
    }
  });
});

describe('individual rules unlock exactly at their threshold', () => {
  test('First Orbit: one skill', () => {
    assert.equal(byId.first_skill.check(universe({ skills: [{ id: 's' }] })), true);
  });

  test('Learning Explorer: 5 sessions, not 4', () => {
    const sessions = n => universe({ activities: days(...Array(n).fill('2026-11-01')) });
    assert.equal(byId.learning_explorer.check(sessions(4)), false);
    assert.equal(byId.learning_explorer.check(sessions(5)), true);
  });

  test('Orbit Streak: 3 consecutive days, not 3 scattered days', t => {
    freezeTime(t, new Date(2026, 10, 7, 12));
    assert.equal(
      byId.orbit_streak.check(
        universe({ activities: days('2026-11-01', '2026-11-02', '2026-11-03') })
      ),
      true
    );
    assert.equal(
      byId.orbit_streak.check(
        universe({ activities: days('2026-11-01', '2026-11-03', '2026-11-05') })
      ),
      false
    );
  });

  test('Century Club: 100 hours = 6000 minutes', () => {
    const minutes = m => universe({ activities: [{ id: 'a', date: '2026-11-01', duration: m }] });
    assert.equal(byId.century_club.check(minutes(5999)), false);
    assert.equal(byId.century_club.check(minutes(6000)), true);
  });

  test('Skill Master: a skill at 100% or marked Completed', () => {
    assert.equal(byId.skill_master.check(universe({ skills: [{ id: 's', progress: 99 }] })), false);
    assert.equal(byId.skill_master.check(universe({ skills: [{ id: 's', progress: 100 }] })), true);
    assert.equal(
      byId.skill_master.check(
        universe({ skills: [{ id: 's', progress: 10, status: 'Completed' }] })
      ),
      true
    );
  });

  test('Goal Crusher: 5 completed goals; active goals do not count', () => {
    const goals = (done, active) => [
      ...Array.from({ length: done }, (_, i) => ({ id: `d${i}`, status: 'Completed' })),
      ...Array.from({ length: active }, (_, i) => ({ id: `x${i}`, status: 'Active' }))
    ];
    assert.equal(byId.goal_crusher.check(universe({ goals: goals(4, 10) })), false);
    assert.equal(byId.goal_crusher.check(universe({ goals: goals(5, 0) })), true);
  });
});
