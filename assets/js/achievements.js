/**
 * CODEORBIT — ACHIEVEMENTS ENGINE MODULE
 * Real-time condition evaluation, unlocking, celebration chimes, and badge rendering.
 */

import { storage } from './storage.js';
import { escapeHTML, formatDate, calculateStreak } from './utils.js';
import { toast } from './components.js';

export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_skill',
    title: 'First Orbit',
    description: 'Add your first skill to the developer universe.',
    icon: '🪐',
    category: 'Skills',
    check: (data) => (data.skills || []).length >= 1,
    progress: (data) => ({ current: Math.min(1, (data.skills || []).length), target: 1 })
  },
  {
    id: 'first_mission',
    title: 'Ignition Sequence',
    description: 'Create your first Space Mission project.',
    icon: '🚀',
    category: 'Missions',
    check: (data) => (data.projects || []).length >= 1,
    progress: (data) => ({ current: Math.min(1, (data.projects || []).length), target: 1 })
  },
  {
    id: 'learning_explorer',
    title: 'Learning Explorer',
    description: 'Complete 5 learning sessions in your Mission Log.',
    icon: '🧭',
    category: 'Progress',
    check: (data) => (data.activities || []).length >= 5,
    progress: (data) => ({ current: Math.min(5, (data.activities || []).length), target: 5 })
  },
  {
    id: 'orbit_streak',
    title: 'Orbit Streak',
    description: 'Maintain a 3-day consecutive learning streak.',
    icon: '🔥',
    category: 'Habits',
    check: (data) => calculateStreak(data.activities).longestStreak >= 3,
    progress: (data) => ({ current: Math.min(3, calculateStreak(data.activities).longestStreak), target: 3 })
  },
  {
    id: 'deep_space_voyager',
    title: 'Deep Space Voyager',
    description: 'Maintain a 7-day unbroken learning streak.',
    icon: '🌌',
    category: 'Habits',
    check: (data) => calculateStreak(data.activities).longestStreak >= 7,
    progress: (data) => ({ current: Math.min(7, calculateStreak(data.activities).longestStreak), target: 7 })
  },
  {
    id: 'skill_master',
    title: 'Skill Master',
    description: 'Bring a skill to 100% completion in your universe.',
    icon: '⭐',
    category: 'Skills',
    check: (data) => (data.skills || []).some(s => s.progress >= 100 || s.status === 'Completed'),
    progress: (data) => {
      const completed = (data.skills || []).filter(s => s.progress >= 100 || s.status === 'Completed').length;
      return { current: Math.min(1, completed), target: 1 };
    }
  },
  {
    id: 'goal_crusher',
    title: 'Goal Crusher',
    description: 'Complete 5 learning milestones.',
    icon: '🏆',
    category: 'Milestones',
    check: (data) => (data.goals || []).filter(g => g.status === 'Completed').length >= 5,
    progress: (data) => {
      const completed = (data.goals || []).filter(g => g.status === 'Completed').length;
      return { current: Math.min(5, completed), target: 5 };
    }
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Log 100 total hours of deep developer learning.',
    icon: '⏱',
    category: 'Progress',
    check: (data) => {
      const totalMinutes = (data.activities || []).reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
      return totalMinutes >= 6000; // 100 hours
    },
    progress: (data) => {
      const totalHours = Math.round(((data.activities || []).reduce((sum, a) => sum + (Number(a.duration) || 0), 0) / 60) * 10) / 10;
      return { current: Math.min(100, totalHours), target: 100, unit: 'h' };
    }
  },
  {
    id: 'fleet_commander',
    title: 'Fleet Commander',
    description: 'Complete 3 Space Mission developer projects.',
    icon: '🛰',
    category: 'Missions',
    check: (data) => (data.projects || []).filter(p => p.status === 'Completed').length >= 3,
    progress: (data) => {
      const comp = (data.projects || []).filter(p => p.status === 'Completed').length;
      return { current: Math.min(3, comp), target: 3 };
    }
  },
  {
    id: 'constellation_creator',
    title: 'Constellation Creator',
    description: 'Have at least 6 active or completed skills orbiting simultaneously.',
    icon: '✨',
    category: 'Skills',
    check: (data) => (data.skills || []).length >= 6,
    progress: (data) => ({ current: Math.min(6, (data.skills || []).length), target: 6 })
  }
];

let activeCategory = 'All';

export function initAchievements() {
  evaluateAchievements();
  renderAchievements();

  // Category filter pills
  document.querySelectorAll('#achievement-category-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#achievement-category-pills .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category') || 'All';
      renderAchievements();
    });
  });

  window.addEventListener('codeorbit:data-changed', () => {
    evaluateAchievements();
    renderAchievements();
  });
}

let isEvaluating = false;

/**
 * Checks all conditions and unlocks newly satisfied achievements.
 */
export function evaluateAchievements() {
  if (isEvaluating) return;
  isEvaluating = true;
  try {
    const data = storage.getUniverse();
    const unlocked = data.achievements || [];

    ACHIEVEMENT_DEFINITIONS.forEach(def => {
      const isAlreadyUnlocked = unlocked.some(a => a.id === def.id);
      if (!isAlreadyUnlocked && def.check(data)) {
        const newlyUnlocked = storage.unlockAchievement(def.id);
        if (newlyUnlocked) {
          toast.achievement('Achievement Unlocked!', `${def.icon} ${def.title}: ${def.description}`);
        }
      }
    });
  } catch (err) {
    console.error('Achievement evaluation error:', err);
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

  const filteredList = activeCategory === 'All'
    ? ACHIEVEMENT_DEFINITIONS
    : ACHIEVEMENT_DEFINITIONS.filter(def => def.category === activeCategory);

  if (filteredList.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🏆</div>
        <h4 class="empty-state-title">No Badges in Category</h4>
        <p class="empty-state-desc">Select another category or view all badges.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredList.map(def => {
    const unlockedRecord = unlockedList.find(a => a.id === def.id);
    const isUnlocked = Boolean(unlockedRecord);
    const prog = def.progress(data);
    const progPct = Math.min(100, Math.round((prog.current / prog.target) * 100));

    return `
      <div class="card ${isUnlocked ? 'card-glow-orange' : ''} achievement-card" style="display: flex; flex-direction: column; justify-content: space-between; border-color: ${isUnlocked ? 'rgba(249, 115, 22, 0.5)' : 'var(--glass-border)'}; background: ${isUnlocked ? 'linear-gradient(135deg, rgba(25, 36, 61, 0.9) 0%, rgba(42, 26, 61, 0.6) 100%)' : 'var(--glass-surface)'}; box-shadow: ${isUnlocked ? '0 4px 20px rgba(0,0,0,0.4), 0 0 16px rgba(249, 115, 22, 0.2)' : '0 4px 16px rgba(0,0,0,0.3)'};">
        <div>
          <!-- Header -->
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;">
            <div style="width: 46px; height: 46px; border-radius: var(--radius-sm); background: ${isUnlocked ? 'var(--orange-subtle)' : 'var(--bg-input)'}; border: 1px solid ${isUnlocked ? 'rgba(249, 115, 22, 0.45)' : 'var(--border)'}; display: flex; align-items: center; justify-content: center; font-size: 1.45rem; box-shadow: ${isUnlocked ? '0 0 16px var(--orange-glow)' : 'none'};">
              ${def.icon}
            </div>

            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
              <span class="badge ${isUnlocked ? 'badge-orange' : 'badge-muted'}" style="font-size: 0.625rem;">
                ${isUnlocked ? '⭐ Unlocked' : '🔒 In Progress'}
              </span>
              <span style="font-size: 0.625rem; font-family: var(--font-mono); color: var(--text-muted);">${escapeHTML(def.category)}</span>
            </div>
          </div>

          <h3 style="font-size: 1.05rem; font-weight: 700; color: ${isUnlocked ? '#FDBA74' : '#FFFFFF'}; margin-bottom: 4px; letter-spacing: -0.01em;">
            ${escapeHTML(def.title)}
          </h3>

          <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.45; margin-bottom: 14px; min-height: 34px;">
            ${escapeHTML(def.description)}
          </p>
        </div>

        <div>
          <!-- Progress or Unlock Date -->
          ${isUnlocked ? `
            <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 10px; font-size: 0.6875rem; color: var(--cyan-accent); font-family: var(--font-mono); display: flex; align-items: center; justify-content: space-between;">
              <span>Unlocked</span>
              <span>${formatDate(unlockedRecord.unlockedAt)}</span>
            </div>
          ` : `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; color: var(--text-muted); margin-bottom: 6px;">
                <span>Requirement</span>
                <span style="font-family: var(--font-mono); color: var(--text-secondary);">${prog.current} / ${prog.target}${prog.unit || ''}</span>
              </div>
              <div class="progress-bar-container" style="height: 5px;">
                <div class="progress-bar-fill fill-primary" style="width: ${progPct}%;"></div>
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  }).join('');
}
