/**
 * CODEORBIT — ACHIEVEMENTS ENGINE MODULE
 * Badge rules, unlocking, and the Badges page.
 * Ids and categories are stored in saved data, so they never change; only the words people see do.
 */

import { storage } from './storage.js';
import { escapeHTML, formatDate, calculateStreak } from './utils.js';
import { toast } from './components.js';
import { icon } from './icons.js';

export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_skill',
    title: 'First skill',
    description: 'Add your first skill.',
    icon: 'planet',
    category: 'Skills',
    check: data => (data.skills || []).length >= 1,
    progress: data => ({ current: Math.min(1, (data.skills || []).length), target: 1 })
  },
  {
    id: 'first_mission',
    title: 'First project',
    description: 'Add your first project.',
    icon: 'folder',
    category: 'Missions',
    check: data => (data.projects || []).length >= 1,
    progress: data => ({ current: Math.min(1, (data.projects || []).length), target: 1 })
  },
  {
    id: 'learning_explorer',
    title: 'Getting going',
    description: 'Add 5 study sessions.',
    icon: 'compass',
    category: 'Progress',
    check: data => (data.activities || []).length >= 5,
    progress: data => ({ current: Math.min(5, (data.activities || []).length), target: 5 })
  },
  {
    id: 'orbit_streak',
    title: '3 days in a row',
    description: 'Study 3 days in a row.',
    icon: 'flame',
    category: 'Habits',
    check: data => calculateStreak(data.activities).longestStreak >= 3,
    progress: data => ({
      current: Math.min(3, calculateStreak(data.activities).longestStreak),
      target: 3
    })
  },
  {
    id: 'deep_space_voyager',
    title: '7 days in a row',
    description: 'Study 7 days in a row.',
    icon: 'calendar',
    category: 'Habits',
    check: data => calculateStreak(data.activities).longestStreak >= 7,
    progress: data => ({
      current: Math.min(7, calculateStreak(data.activities).longestStreak),
      target: 7
    })
  },
  {
    id: 'skill_master',
    title: 'First skill finished',
    description: 'Take one skill all the way to 100%.',
    icon: 'star',
    category: 'Skills',
    check: data => (data.skills || []).some(s => s.progress >= 100 || s.status === 'Completed'),
    progress: data => {
      const completed = (data.skills || []).filter(
        s => s.progress >= 100 || s.status === 'Completed'
      ).length;
      return { current: Math.min(1, completed), target: 1 };
    }
  },
  {
    id: 'goal_crusher',
    title: '5 goals reached',
    description: 'Finish 5 goals.',
    icon: 'trophy',
    category: 'Milestones',
    check: data => (data.goals || []).filter(g => g.status === 'Completed').length >= 5,
    progress: data => {
      const completed = (data.goals || []).filter(g => g.status === 'Completed').length;
      return { current: Math.min(5, completed), target: 5 };
    }
  },
  {
    id: 'century_club',
    title: '100 hours',
    description: 'Study for 100 hours in total.',
    icon: 'clock',
    category: 'Progress',
    check: data => {
      const totalMinutes = (data.activities || []).reduce(
        (sum, a) => sum + (Number(a.duration) || 0),
        0
      );
      return totalMinutes >= 6000; // 100 hours
    },
    progress: data => {
      const totalHours =
        Math.round(
          ((data.activities || []).reduce((sum, a) => sum + (Number(a.duration) || 0), 0) / 60) * 10
        ) / 10;
      return { current: Math.min(100, totalHours), target: 100, unit: 'h' };
    }
  },
  {
    id: 'fleet_commander',
    title: '3 projects finished',
    description: 'Finish 3 projects.',
    icon: 'check',
    category: 'Missions',
    check: data => (data.projects || []).filter(p => p.status === 'Completed').length >= 3,
    progress: data => {
      const comp = (data.projects || []).filter(p => p.status === 'Completed').length;
      return { current: Math.min(3, comp), target: 3 };
    }
  },
  {
    id: 'constellation_creator',
    title: '6 skills',
    description: 'Have 6 skills in CodeOrbit at the same time.',
    icon: 'layers',
    category: 'Skills',
    check: data => (data.skills || []).length >= 6,
    progress: data => ({ current: Math.min(6, (data.skills || []).length), target: 6 })
  }
];

let activeCategory = 'All';

export function initAchievements() {
  // No evaluate/render here: initApp() evaluates once at startup and the router
  // renders this page when it is visible.

  // Category filter pills
  document.querySelectorAll('#achievement-category-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('#achievement-category-pills .pill-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category') || 'All';
      renderAchievements();
    });
  });

  // No data-changed listener here: app.js owns the single listener that
  // evaluates achievements and re-renders the visible page (incl. this one).
}

let isEvaluating = false;

/**
 * Checks all conditions and unlocks every newly satisfied achievement in ONE save.
 *
 * Called from app.js's single 'codeorbit:data-changed' listener and once at startup.
 * The save dispatches 'codeorbit:data-changed' again (synchronously); that nested
 * round re-renders the page, and isEvaluating stops it from evaluating again.
 *
 * @returns {boolean} true if anything was unlocked (i.e. data was saved and the
 *   nested data-changed round has already re-rendered the UI).
 */
export function evaluateAchievements() {
  if (isEvaluating) return false;
  isEvaluating = true;
  try {
    const data = storage.getUniverse();
    const unlocked = data.achievements || [];

    const newlySatisfied = ACHIEVEMENT_DEFINITIONS.filter(
      def => !unlocked.some(a => a.id === def.id) && def.check(data)
    );
    if (newlySatisfied.length === 0) return false;

    const saved = storage.unlockAchievements(newlySatisfied.map(def => def.id));
    if (saved) {
      newlySatisfied.forEach(def => {
        toast.achievement('You earned a badge', `${def.title}: ${def.description}`);
      });
    }
    return saved;
  } catch (err) {
    console.error('Achievement evaluation error:', err);
    return false;
  } finally {
    isEvaluating = false;
  }
}

export function renderAchievements() {
  const container = document.getElementById('achievements-grid');
  if (!container) return;

  const data = storage.getUniverse();
  const unlockedList = data.achievements || [];

  const total = ACHIEVEMENT_DEFINITIONS.length;
  const unlockedCount = unlockedList.length;
  const unlockPct = Math.round((unlockedCount / total) * 100);

  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setEl('achieve-stat-unlocked', `${unlockedCount} / ${total}`);
  setEl('achieve-stat-pct', `${unlockPct}%`);

  const filteredList =
    activeCategory === 'All'
      ? ACHIEVEMENT_DEFINITIONS
      : ACHIEVEMENT_DEFINITIONS.filter(def => def.category === activeCategory);

  if (filteredList.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h4 class="empty-state-title">No badges in this group</h4>
        <p class="empty-state-desc">Pick another group, or choose All.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredList
    .map(def => {
      const unlockedRecord = unlockedList.find(a => a.id === def.id);
      const isUnlocked = Boolean(unlockedRecord);
      const prog = def.progress(data);
      const progPct = Math.min(100, Math.round((prog.current / prog.target) * 100));

      return `
      <article class="card achievement-card${isUnlocked ? ' is-earned' : ''}">
        <div class="achievement-top">
          <span class="achievement-icon">${icon(isUnlocked ? def.icon : 'lock', 20)}</span>
          <span class="badge ${isUnlocked ? 'badge-primary' : 'badge-muted'}">${isUnlocked ? 'Earned' : 'Not yet'}</span>
        </div>
        <h3 class="achievement-title">${escapeHTML(def.title)}</h3>
        <p class="achievement-desc">${escapeHTML(def.description)}</p>
        ${
          isUnlocked
            ? `<div class="achievement-foot"><span class="label-mono">Earned on</span><span>${formatDate(unlockedRecord.unlockedAt)}</span></div>`
            : `<div class="achievement-foot"><span class="label-mono">${escapeHTML(categoryLabel(def.category))}</span><span>${prog.current} / ${prog.target}${prog.unit || ''}</span></div>
               <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${progPct}%;"></div></div>`
        }
      </article>
    `;
    })
    .join('');
}

/** Words people see for each badge group (the stored group names stay the same). */
function categoryLabel(category) {
  if (category === 'Missions') return 'Projects';
  if (category === 'Milestones') return 'Goals';
  return category;
}
