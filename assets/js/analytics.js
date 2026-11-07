/**
 * CODEORBIT — PROGRESS PAGE MODULE (route: #analytics)
 * Progress score (moved here from Home), badges count, totals, charts and
 * a few plain-language observations about your study habits.
 */

import { storage } from './storage.js';
import {
  calculateStreak,
  calculateProgressScore,
  escapeHTML,
  isWithinLastNDays,
  peakWeekday,
  skillLabel
} from './utils.js';
import { chartManager } from './charts.js';
import { openModal } from './components.js';
import { ACHIEVEMENT_DEFINITIONS } from './achievements.js';

export function initAnalytics() {
  document.getElementById('score-breakdown-btn')?.addEventListener('click', () => {
    openModal('score-breakdown-modal');
  });
}

export function renderAnalytics() {
  const data = storage.getUniverse();
  const skills = data.skills || [];
  const activities = data.activities || [];
  const projects = data.projects || [];
  const goals = data.goals || [];

  // 1. Calculations
  const totalMinutes = activities.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const weekMins = activities
    .filter(a => isWithinLastNDays(a.date, 7))
    .reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const weeklyHours = Math.round((weekMins / 60) * 10) / 10;

  const skillCompleted = skills.filter(s => s.status === 'Completed' || s.progress >= 100).length;
  const skillCompletionRate =
    skills.length > 0 ? Math.round((skillCompleted / skills.length) * 100) : 0;

  const streak = calculateStreak(activities);

  // Numbers at the top
  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setEl('analytics-total-hours', `${totalHours}h`);
  setEl('analytics-weekly-hours', `${weeklyHours}h`);
  setEl('analytics-skill-rate', `${skillCompletionRate}%`);
  setEl('analytics-streak', `${streak.currentStreak}`);

  // Progress score + its explanation dialog
  const prod = calculateProgressScore({
    activities,
    skills,
    projects,
    settings: data.settings || {}
  });
  setEl('score-number-display', `${prod.score}`);
  setEl('score-level-badge', prod.level);
  populateScoreModal(prod, setEl);

  // Badges (count only badges that exist: a backup could list unknown ids)
  const earned = ACHIEVEMENT_DEFINITIONS.filter(def =>
    (data.achievements || []).some(a => a.id === def.id)
  ).length;
  setEl('progress-badges-count', `${earned} of ${ACHIEVEMENT_DEFINITIONS.length} earned`);

  // 2. Render Charts
  chartManager.renderWeeklyChart('analytics-weekly-chart', activities);
  chartManager.renderMonthlyTrendChart('analytics-monthly-trend-chart', activities);
  chartManager.renderSkillCategoryChart('analytics-skills-cat-chart', skills);
  chartManager.renderProjectStatusChart('analytics-project-status-chart', projects);
  chartManager.renderActivityTypeChart('analytics-activity-type-chart', activities);

  // 3. "What we noticed"
  generateHabitInsights(activities, skills, goals);
}

function generateHabitInsights(activities, skills, goals) {
  const container = document.getElementById('analytics-insights-container');
  if (!container) return;

  if (activities.length === 0) {
    container.innerHTML = `
      <div style="color: var(--text-muted); font-size: var(--text-sm); text-align: center; padding: 20px;">
        Add a few study sessions and we will point out patterns here.
      </div>
    `;
    return;
  }

  // Most studied skill
  const skillMins = {};
  activities.forEach(a => {
    skillMins[a.skill] = (skillMins[a.skill] || 0) + (Number(a.duration) || 0);
  });
  let topSkill = '';
  let maxMins = 0;
  for (const [s, m] of Object.entries(skillMins)) {
    if (m > maxMins) {
      maxMins = m;
      topSkill = s;
    }
  }

  // Day of the week with the most study time
  const peakDay = peakWeekday(activities);

  // Goals not finished yet
  const pendingGoals = goals.filter(g => g.status === 'Active').length;

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
      <div class="card card-elevated" style="padding: 16px;">
        <div class="label-mono" style="margin-bottom: 6px;">Most studied skill</div>
        <div style="font-size: var(--text-lg); font-weight: 700;">${escapeHTML(skillLabel(topSkill))}</div>
        <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px;">${Math.round((maxMins / 60) * 10) / 10} hours in total.</div>
      </div>

      <div class="card card-elevated" style="padding: 16px;">
        <div class="label-mono" style="margin-bottom: 6px;">Your best day</div>
        <div style="font-size: var(--text-lg); font-weight: 700;">${escapeHTML(peakDay)}</div>
        <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px;">You study the most on this day of the week.</div>
      </div>

      <div class="card card-elevated" style="padding: 16px;">
        <div class="label-mono" style="margin-bottom: 6px;">Goals in progress</div>
        <div style="font-size: var(--text-lg); font-weight: 700;">${pendingGoals}</div>
        <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px;">See which ones are due soon on the Goals page.</div>
      </div>
    </div>
  `;
}

/** Fills in the "How your progress score works" dialog. */
function populateScoreModal(prod, setEl) {
  const b = prod.breakdown;
  setEl(
    'breakdown-consistency-val',
    `${b.consistency.points} / ${b.consistency.max} (${b.consistency.activeDays} of 7 days)`
  );
  setEl(
    'breakdown-hours-val',
    `${b.learningHours.points} / ${b.learningHours.max} (${b.learningHours.currentHours} of ${b.learningHours.targetHours} hours)`
  );
  setEl(
    'breakdown-projects-val',
    `${b.projects.points} / ${b.projects.max} (${b.projects.count} projects)`
  );
  setEl('breakdown-skills-val', `${b.skills.points} / ${b.skills.max} (${b.skills.count} skills)`);
  setEl('breakdown-total-val', `${prod.score} / 100 · ${prod.level}`);
}
