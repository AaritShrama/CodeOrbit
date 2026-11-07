/**
 * CODEORBIT — UNIVERSE ANALYTICS MODULE
 * Deep metrics, Chart.js integrations, and automated developer habit insights.
 */

import { storage } from './storage.js';
import { calculateStreak, isWithinLastNDays } from './utils.js';
import { chartManager } from './charts.js';

export function initAnalytics() {
  // Nothing to wire up yet. The router calls renderAnalytics() when the page is shown.
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

  const monthMins = activities
    .filter(a => isWithinLastNDays(a.date, 30))
    .reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const monthlyHours = Math.round((monthMins / 60) * 10) / 10;

  const skillCompleted = skills.filter(s => s.status === 'Completed' || s.progress >= 100).length;
  const skillCompletionRate = skills.length > 0 ? Math.round((skillCompleted / skills.length) * 100) : 0;

  const projectCompleted = projects.filter(p => p.status === 'Completed').length;
  const projectCompletionRate = projects.length > 0 ? Math.round((projectCompleted / projects.length) * 100) : 0;

  const goalCompleted = goals.filter(g => g.status === 'Completed').length;
  const goalCompletionRate = goals.length > 0 ? Math.round((goalCompleted / goals.length) * 100) : 0;

  const streak = calculateStreak(activities);

  // Set KPIs
  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setEl('analytics-total-hours', `${totalHours}h`);
  setEl('analytics-weekly-hours', `${weeklyHours}h`);
  setEl('analytics-monthly-hours', `${monthlyHours}h`);
  setEl('analytics-skill-rate', `${skillCompletionRate}%`);
  setEl('analytics-project-rate', `${projectCompletionRate}%`);
  setEl('analytics-goal-rate', `${goalCompletionRate}%`);
  setEl('analytics-streak', `${streak.currentStreak} Days`);

  // 2. Render Charts
  chartManager.renderWeeklyChart('analytics-weekly-chart', activities);
  chartManager.renderMonthlyTrendChart('analytics-monthly-trend-chart', activities);
  chartManager.renderSkillCategoryChart('analytics-skills-cat-chart', skills);
  chartManager.renderProjectStatusChart('analytics-project-status-chart', projects);
  chartManager.renderActivityTypeChart('analytics-activity-type-chart', activities);

  // 3. Automated Developer Habit Insights
  generateHabitInsights(activities, skills, goals);
}

function generateHabitInsights(activities, skills, goals) {
  const container = document.getElementById('analytics-insights-container');
  if (!container) return;

  if (activities.length === 0) {
    container.innerHTML = `
      <div style="color: var(--text-muted); font-size: var(--text-sm); text-align: center; padding: 20px;">
        Log a few learning sessions to generate intelligent velocity insights!
      </div>
    `;
    return;
  }

  // Find top focused skill
  const skillMins = {};
  activities.forEach(a => {
    skillMins[a.skill] = (skillMins[a.skill] || 0) + (Number(a.duration) || 0);
  });
  let topSkill = 'General';
  let maxMins = 0;
  for (const [s, m] of Object.entries(skillMins)) {
    if (m > maxMins) {
      maxMins = m;
      topSkill = s;
    }
  }

  // Find most active day of week
  const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun..Sat
  activities.forEach(a => {
    if (a.date) {
      const d = new Date(a.date);
      dayCounts[d.getDay()] += (Number(a.duration) || 0);
    }
  });
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const maxDayIdx = dayCounts.indexOf(Math.max(...dayCounts));
  const peakDay = dayNames[maxDayIdx] || 'Weekday';

  // Pending goals count
  const pendingGoals = goals.filter(g => g.status === 'Active').length;

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
      <div class="card card-elevated" style="padding: 16px;">
        <div style="font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Top Focus Skill</div>
        <div style="font-size: var(--text-base); font-weight: 700; color: var(--cyan-accent);">${topSkill}</div>
        <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">${Math.round((maxMins / 60) * 10) / 10} hours logged across sessions.</div>
      </div>

      <div class="card card-elevated" style="padding: 16px;">
        <div style="font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Peak Velocity Day</div>
        <div style="font-size: var(--text-base); font-weight: 700; color: #C4B5FD;">${peakDay}s</div>
        <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">You achieve your highest focus volume on this day.</div>
      </div>

      <div class="card card-elevated" style="padding: 16px;">
        <div style="font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Milestone Trajectory</div>
        <div style="font-size: var(--text-base); font-weight: 700; color: var(--orbital-orange);">${pendingGoals} Active Goals</div>
        <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">Prioritize upcoming deadlines in your Command Center.</div>
      </div>
    </div>
  `;
}
