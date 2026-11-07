/**
 * CODEORBIT — COMMAND CENTER (DASHBOARD) MODULE
 * Hero updates, KPI calculations, Productivity Score gauge, Orbital Skill Visualizer,
 * multi-chart telemetry switcher, and preview feeds for logs, projects, and milestones.
 */

import { storage } from './storage.js';
import {
  escapeHTML,
  formatDate,
  formatDuration,
  formatRelativeTime,
  calculateStreak,
  calculateProductivityScore,
  isWithinLastNDays
} from './utils.js';
import { chartManager } from './charts.js';
import { openModal } from './components.js';

let isOrbitPaused = false;
let currentOrbitView = 'orbital'; // 'orbital' | 'constellation'
let currentTelemetryMode = 'weekly'; // 'weekly' | 'monthly'

export function initDashboard() {
  renderDashboard();

  // Orbital controls
  const pauseBtn = document.getElementById('orbital-pause-btn');
  const viewToggleBtn = document.getElementById('orbital-toggle-view-btn');

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      isOrbitPaused = !isOrbitPaused;
      const stage = document.getElementById('orbital-stage');
      if (stage) {
        stage.classList.toggle('paused', isOrbitPaused);
      }
      pauseBtn.innerHTML = isOrbitPaused
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Resume`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Pause`;
    });
  }

  if (viewToggleBtn) {
    viewToggleBtn.addEventListener('click', () => {
      currentOrbitView = currentOrbitView === 'orbital' ? 'constellation' : 'orbital';
      renderOrbitalVisualization();
    });
  }

  // Telemetry Chart Segmented Switcher (Weekly Velocity vs 30-Day Trend)
  const weeklyTab = document.getElementById('dashboard-tab-weekly');
  const monthlyTab = document.getElementById('dashboard-tab-monthly');

  if (weeklyTab) {
    weeklyTab.addEventListener('click', () => {
      currentTelemetryMode = 'weekly';
      weeklyTab.classList.add('active');
      if (monthlyTab) monthlyTab.classList.remove('active');
      const data = storage.getUniverse();
      chartManager.renderWeeklyChart('dashboard-weekly-chart', data.activities || []);
    });
  }

  if (monthlyTab) {
    monthlyTab.addEventListener('click', () => {
      currentTelemetryMode = 'monthly';
      monthlyTab.classList.add('active');
      if (weeklyTab) weeklyTab.classList.remove('active');
      const data = storage.getUniverse();
      chartManager.renderMonthlyTrendChart('dashboard-weekly-chart', data.activities || []);
    });
  }

  // Productivity score breakdown button
  const scoreInfoBtn = document.getElementById('score-breakdown-btn');
  if (scoreInfoBtn) {
    scoreInfoBtn.addEventListener('click', () => {
      openModal('score-breakdown-modal');
    });
  }
}

export function renderDashboard() {
  const data = storage.getUniverse();
  const profile = data.profile || {};
  const skills = data.skills || [];
  const activities = data.activities || [];
  const projects = data.projects || [];
  const goals = data.goals || [];
  const settings = data.settings || {};

  // 1. Hero Updates
  const heroNameEl = document.getElementById('hero-user-name');
  const heroDateEl = document.getElementById('hero-current-date');
  const heroStreakEl = document.getElementById('hero-streak-count');

  if (heroNameEl) heroNameEl.textContent = profile.name || 'Developer';
  if (heroDateEl) {
    const today = new Date();
    heroDateEl.textContent = today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  const streakData = calculateStreak(activities);
  if (heroStreakEl) {
    heroStreakEl.textContent = `${streakData.currentStreak}-Day Orbit Streak`;
  }

  // 2. Dynamic KPI Cards
  const activeSkillsCount = skills.filter(s => s.status !== 'Completed').length;
  const completedSkillsCount = skills.filter(s => s.status === 'Completed').length;

  const totalMinutes = activities.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Last 7 days minutes
  const weeklyMinutes = activities
    .filter(a => isWithinLastNDays(a.date, 7))
    .reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const weeklyHours = Math.round((weeklyMinutes / 60) * 10) / 10;

  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;

  // Render KPI values
  const kpi1Val = document.getElementById('kpi-skills-val');
  const kpi1Sub = document.getElementById('kpi-skills-sub');
  const kpi1Meter = document.getElementById('kpi-skills-meter');
  if (kpi1Val) kpi1Val.textContent = activeSkillsCount;
  if (kpi1Sub) kpi1Sub.textContent = `${completedSkillsCount} completed`;
  if (kpi1Meter) {
    const totalSkills = skills.length || 1;
    const pct = Math.min(100, Math.round((completedSkillsCount / totalSkills) * 100));
    kpi1Meter.style.width = `${pct}%`;
  }

  const kpi2Val = document.getElementById('kpi-hours-val');
  const kpi2Sub = document.getElementById('kpi-hours-sub');
  const kpi2Meter = document.getElementById('kpi-hours-meter');
  if (kpi2Val) kpi2Val.textContent = totalHours;
  if (kpi2Sub) kpi2Sub.textContent = `${weeklyHours}h this week`;
  if (kpi2Meter) {
    const targetHours = Math.max(1, Number(settings.weeklyTargetHours) || 12);
    const pct = Math.min(100, Math.round((weeklyHours / targetHours) * 100));
    kpi2Meter.style.width = `${pct}%`;
  }

  const kpi3Val = document.getElementById('kpi-missions-val');
  const kpi3Sub = document.getElementById('kpi-missions-sub');
  const kpi3Meter = document.getElementById('kpi-missions-meter');
  if (kpi3Val) kpi3Val.textContent = totalProjects;
  if (kpi3Sub) kpi3Sub.textContent = `${completedProjects} completed`;
  if (kpi3Meter) {
    const totalProj = projects.length || 1;
    const pct = Math.min(100, Math.round((completedProjects / totalProj) * 100));
    kpi3Meter.style.width = `${pct}%`;
  }

  const kpi4Val = document.getElementById('kpi-streak-val');
  const kpi4Sub = document.getElementById('kpi-streak-sub');
  const kpi4Meter = document.getElementById('kpi-streak-meter');
  if (kpi4Val) kpi4Val.textContent = streakData.currentStreak;
  if (kpi4Sub) kpi4Sub.textContent = `Longest: ${streakData.longestStreak} days`;
  if (kpi4Meter) {
    const pct = Math.min(100, Math.round((streakData.currentStreak / 30) * 100));
    kpi4Meter.style.width = `${pct}%`;
  }

  // 3. Productivity Score
  const prod = calculateProductivityScore({ activities, skills, projects, settings });
  const scoreNumEl = document.getElementById('score-number-display');
  const scoreLevelEl = document.getElementById('score-level-badge');
  const scoreRingEl = document.getElementById('score-gauge-ring');

  if (scoreNumEl) scoreNumEl.textContent = prod.score;
  if (scoreLevelEl) scoreLevelEl.textContent = prod.level;
  if (scoreRingEl) {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (prod.score / 100) * circumference;
    scoreRingEl.style.strokeDasharray = `${circumference}`;
    scoreRingEl.style.strokeDashoffset = `${offset}`;
  }

  // Populate score modal breakdown
  populateScoreModal(prod);

  // 4. Orbital Skill Visualization
  renderOrbitalVisualization();

  // 5. Flightpath Telemetry Charts (Weekly Velocity or 30-Day Trend + Skill Distribution)
  if (currentTelemetryMode === 'weekly') {
    chartManager.renderWeeklyChart('dashboard-weekly-chart', activities);
  } else {
    chartManager.renderMonthlyTrendChart('dashboard-weekly-chart', activities);
  }
  chartManager.renderSkillCategoryChart('dashboard-skills-distribution-chart', skills);

  // 6. Recent Mission Logs
  renderRecentLogs(activities);

  // 7. Active Space Missions Preview
  renderActiveProjects(projects);

  // 8. Upcoming Milestones Preview
  renderUpcomingGoals(goals);
}

/**
 * Renders the interactive Orbital Skill Visualization or Constellation Grid view.
 */
function renderOrbitalVisualization() {
  const stage = document.getElementById('orbital-stage');
  const gridView = document.getElementById('constellation-grid');
  const toggleBtn = document.getElementById('orbital-toggle-view-btn');
  if (!stage || !gridView) return;

  const data = storage.getUniverse();
  const skills = data.skills || [];

  if (currentOrbitView === 'constellation') {
    stage.style.display = 'none';
    gridView.style.display = 'grid';
    if (toggleBtn) {
      toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg> <span>Planetary Orbit</span>`;
    }
    renderConstellationGrid(skills, gridView);
    return;
  }

  // Planetary Orbit View
  stage.style.display = 'flex';
  gridView.style.display = 'none';
  if (toggleBtn) {
    toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> <span>Constellation Grid</span>`;
  }

  // Clear previous dynamic orbit tracks (preserve SVG paths and dev core)
  stage.querySelectorAll('.orbit-track').forEach(el => el.remove());

  const emptyState = document.getElementById('orbital-empty-state');
  if (skills.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';

  // Distribute skills across 3 orbital rings
  const ringConfigs = [
    { radius: 105, duration: 42, skills: [] },
    { radius: 165, duration: 65, skills: [] },
    { radius: 225, duration: 88, skills: [] }
  ];

  skills.forEach((skill, idx) => {
    const ringIdx = idx % 3;
    ringConfigs[ringIdx].skills.push(skill);
  });

  // Category to color class mapping
  const categoryClass = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('web')) return 'planet-web';
    if (c.includes('ai') || c.includes('intelligence') || c.includes('machine')) return 'planet-ai';
    if (c.includes('data') || c.includes('database')) return 'planet-data';
    if (c.includes('devops') || c.includes('cloud')) return 'planet-devops';
    if (c.includes('computer') || c.includes('cs') || c.includes('science')) return 'planet-cs';
    return 'planet-other';
  };

  ringConfigs.forEach((ring) => {
    if (ring.skills.length === 0) return;

    const track = document.createElement('div');
    track.className = 'orbit-track animating';
    track.style.width = `${ring.radius * 2}px`;
    track.style.height = `${ring.radius * 2}px`;
    track.style.setProperty('--orbit-duration', `${ring.duration}s`);

    const angleStep = 360 / ring.skills.length;

    ring.skills.forEach((skill, sIdx) => {
      const angle = sIdx * angleStep;
      // Calculate planet size based on progress (24px to 44px)
      const size = Math.round(24 + (Number(skill.progress) || 0) * 0.2);
      const isMastered = Number(skill.progress) >= 100 || skill.status === 'Completed';

      const nodeWrapper = document.createElement('div');
      nodeWrapper.className = 'planet-node-wrapper';
      nodeWrapper.style.transform = `rotate(${angle}deg) translate(0, -${ring.radius}px) rotate(-${angle}deg)`;

      nodeWrapper.innerHTML = `
        <div class="planet-sphere ${categoryClass(skill.category)}" style="width: ${size}px; height: ${size}px;">
          ${isMastered ? '<div class="planet-master-ring"></div>' : ''}
          <div class="planet-progress-ring"></div>
        </div>
        <div class="planet-label-pill">
          <span>${escapeHTML(skill.name)}</span>
          <span class="planet-pct-tag">${skill.progress}%</span>
        </div>
        <div class="planet-tooltip-card">
          <div class="tooltip-skill-name">${escapeHTML(skill.name)}</div>
          <div class="tooltip-meta-row">
            <span>${escapeHTML(skill.category)}</span>
            <span class="badge badge-cyan">${escapeHTML(skill.proficiency)}</span>
          </div>
          <div class="progress-bar-container" style="height: 5px; margin-bottom: 6px;">
            <div class="progress-bar-fill" style="width: ${skill.progress}%;"></div>
          </div>
          <div class="tooltip-actions">
            <button class="btn btn-sm btn-outline" style="font-size: 0.625rem; padding: 2px 8px;" onclick="window.location.hash='#skills'">
              View Skill &rarr;
            </button>
          </div>
        </div>
      `;

      track.appendChild(nodeWrapper);
    });

    stage.appendChild(track);
  });
}

/**
 * Renders the accessible grid alternative for the orbital view.
 */
function renderConstellationGrid(skills, container) {
  if (skills.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">
        No skills orbiting yet. Add your first skill to start!
      </div>
    `;
    return;
  }

  container.innerHTML = skills.map(s => `
    <div class="constellation-card">
      <div class="constellation-top">
        <span style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">${escapeHTML(s.name)}</span>
        <span class="badge badge-primary" style="font-size: 0.625rem;">${escapeHTML(s.proficiency)}</span>
      </div>
      <div style="font-size: 0.6875rem; color: var(--text-muted);">${escapeHTML(s.category)}</div>
      <div class="progress-bar-container" style="height: 6px;">
        <div class="progress-bar-fill" style="width: ${s.progress}%;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; color: var(--text-secondary);">
        <span>${escapeHTML(s.status)}</span>
        <span style="font-family: var(--font-mono); font-weight: 700; color: var(--cyan-accent);">${s.progress}%</span>
      </div>
    </div>
  `).join('');
}

/**
 * Populates recent mission activity logs preview.
 */
function renderRecentLogs(activities) {
  const container = document.getElementById('dashboard-recent-logs-list');
  if (!container) return;

  const recent = (activities || []).slice(0, 4);
  if (recent.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-size: var(--text-sm); padding: 20px;">
        No learning logs recorded yet. Launch a session to start tracking!
      </div>
    `;
    return;
  }

  container.innerHTML = recent.map(act => `
    <div class="recent-log-item">
      <div class="recent-log-left">
        <div class="log-type-icon">
          ${getLogIcon(act.type)}
        </div>
        <div class="log-title-block">
          <span class="log-item-title">${escapeHTML(act.title)}</span>
          <span class="log-item-meta">
            <span class="badge badge-muted" style="padding: 1px 6px;">${escapeHTML(act.skill)}</span>
            <span>&bull;</span>
            <span>${formatRelativeTime(act.date)}</span>
          </span>
        </div>
      </div>
      <div class="recent-log-right">
        <span class="log-duration-badge">${formatDuration(act.duration)}</span>
      </div>
    </div>
  `).join('');
}

function getLogIcon(type) {
  switch (type) {
    case 'Coding': return '&lt;/&gt;';
    case 'Reading': return '📖';
    case 'Practice Problems': return '🧩';
    case 'Project Development': return '🚀';
    case 'Research': return '🔍';
    case 'Tutorial': return '📺';
    default: return '⚡';
  }
}

/**
 * Populates active space missions preview.
 */
function renderActiveProjects(projects) {
  const container = document.getElementById('dashboard-active-missions-grid');
  if (!container) return;

  const active = (projects || []).filter(p => p.status === 'In Progress').slice(0, 2);
  if (active.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); font-size: var(--text-sm); padding: 20px;">
        No missions currently in progress. Create a new Space Mission!
      </div>
    `;
    return;
  }

  container.innerHTML = active.map(p => {
    let deadlineStr = '';
    const targetDateVal = p.targetDate || p.deadline;
    if (targetDateVal) {
      const daysLeft = Math.ceil((new Date(targetDateVal) - new Date()) / (1000 * 60 * 60 * 24));
      const countdown = daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`;
      deadlineStr = `<span style="font-size: 0.6875rem; color: var(--text-muted);">${formatDate(targetDateVal)} (${countdown})</span>`;
    }

    return `
      <div class="mission-preview-card">
        <div class="mission-header-row">
          <span class="mission-title">${escapeHTML(p.name)}</span>
          <span class="badge badge-cyan" style="font-size: 0.625rem;">${p.status}</span>
        </div>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHTML(p.description || '')}
        </p>
        <div class="progress-bar-container" style="height: 6px;">
          <div class="progress-bar-fill fill-primary" style="width: ${p.progress}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.6875rem;">
          <div class="mission-tech-stack">
            ${(p.technologies || []).slice(0, 2).map(t => `<span class="mission-tech-tag">${escapeHTML(t)}</span>`).join('')}
          </div>
          <span style="font-family: var(--font-mono); font-weight: 700; color: var(--cyan-accent);">${p.progress}%</span>
        </div>
        ${deadlineStr ? `<div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 4px; display: flex; justify-content: flex-end;">${deadlineStr}</div>` : ''}
      </div>
    `;
  }).join('');
}

/**
 * Populates upcoming milestone goals preview.
 */
function renderUpcomingGoals(goals) {
  const container = document.getElementById('dashboard-upcoming-goals-list');
  if (!container) return;

  const active = (goals || []).filter(g => g.status === 'Active').slice(0, 3);
  if (active.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-size: var(--text-sm); padding: 20px;">
        No active milestones right now. Set your next technical goal!
      </div>
    `;
    return;
  }

  container.innerHTML = active.map(g => {
    let deadlineBadge = '';
    if (g.deadline) {
      const daysLeft = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      const text = daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Today' : `${daysLeft}d left`;
      deadlineBadge = `<span style="font-size: 0.625rem; font-family: var(--font-mono); color: var(--text-muted); margin-left: 4px;">(${text})</span>`;
    }

    return `
      <div class="milestone-item">
        <div class="milestone-info">
          <div class="milestone-title-row">
            <span class="milestone-title">${escapeHTML(g.title)}</span>
            <span class="badge ${getPriorityBadgeClass(g.priority)}" style="font-size: 0.625rem;">${escapeHTML(g.priority)}</span>
          </div>
          <div class="milestone-deadline">Due: ${formatDate(g.deadline)}${deadlineBadge}</div>
          <div class="progress-bar-container" style="height: 4px; margin-top: 6px;">
            <div class="progress-bar-fill fill-orange" style="width: ${g.progress}%;"></div>
          </div>
        </div>
        <span style="font-family: var(--font-mono); font-weight: 700; font-size: var(--text-xs); color: var(--text-primary); margin-left: 8px;">
          ${g.progress}%
        </span>
      </div>
    `;
  }).join('');
}

function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'Critical': return 'badge-danger';
    case 'High': return 'badge-orange';
    case 'Medium': return 'badge-warning';
    default: return 'badge-muted';
  }
}

/**
 * Fills out the Productivity Score explanation modal breakdown.
 */
function populateScoreModal(prod) {
  const modal = document.getElementById('score-breakdown-modal');
  if (!modal) return;

  const b = prod.breakdown;
  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setEl('breakdown-consistency-val', `${b.consistency.points} / ${b.consistency.max} pts (${b.consistency.activeDays}/7 active days)`);
  setEl('breakdown-hours-val', `${b.learningHours.points} / ${b.learningHours.max} pts (${b.learningHours.currentHours}h / ${b.learningHours.targetHours}h goal)`);
  setEl('breakdown-projects-val', `${b.projects.points} / ${b.projects.max} pts (${b.projects.count} projects evaluated)`);
  setEl('breakdown-skills-val', `${b.skills.points} / ${b.skills.max} pts (${b.skills.count} skills progressing)`);
  setEl('breakdown-total-val', `${prod.score} / 100 — ${prod.level}`);
}
