/**
 * CODEORBIT — MISSION LOGS (LEARNING PROGRESS) MODULE
 * Time tracking, daily target progress ring, session timeline, and activity CRUD.
 */

import { activityIcon } from './icons.js';
import { storage } from './storage.js';
import {
  escapeHTML,
  formatDate,
  formatDuration,
  formatRelativeTime,
  getTodayISO,
  getRelativeISO,
  isWithinLastNDays
} from './utils.js';
import { openModal, closeModal, toast, showConfirmDialog } from './components.js';

let searchQuery = '';
let activeType = 'All';
let activeSkill = 'All';
let activeSort = 'date-desc';

export function initProgress() {
  setupProgressEventListeners();
  // No render here: navigation.init() renders whichever page is visible, and
  // navigateTo() renders each page when the user opens it.
}

function setupProgressEventListeners() {
  // Search
  const searchInput = document.getElementById('log-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderProgress();
    });
  }

  // Activity Type Filter
  const typeFilter = document.getElementById('log-type-filter');
  if (typeFilter) {
    typeFilter.addEventListener('change', e => {
      activeType = e.target.value;
      renderProgress();
    });
  }

  // Skill Filter
  const skillFilter = document.getElementById('log-skill-filter');
  if (skillFilter) {
    skillFilter.addEventListener('change', e => {
      activeSkill = e.target.value;
      renderProgress();
    });
  }

  // Sort Filter
  const sortSelect = document.getElementById('log-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      activeSort = e.target.value;
      renderProgress();
    });
  }

  // Add Log Button
  const addBtn = document.getElementById('launch-session-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openActivityModal());
  }

  // Activity Form Submission
  const logForm = document.getElementById('activity-modal-form');
  if (logForm) {
    logForm.addEventListener('submit', handleActivityFormSubmit);
  }
}

export function renderProgress() {
  const container = document.getElementById('mission-logs-timeline');
  if (!container) return;

  const data = storage.getUniverse();
  const activities = data.activities || [];
  const skills = data.skills || [];
  const settings = data.settings || {};

  // Populate skill filter dropdown
  populateSkillFilterOptions(skills);

  // 1. Calculate Progress Metrics
  const totalMinutes = activities.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const totalSessions = activities.length;
  const avgSessionMins = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

  // Last 7 days & Last 30 days
  const weekMins = activities
    .filter(a => isWithinLastNDays(a.date, 7))
    .reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const monthMins = activities
    .filter(a => isWithinLastNDays(a.date, 30))
    .reduce((sum, a) => sum + (Number(a.duration) || 0), 0);

  // Set Metric Elements
  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setEl('metric-total-hours', `${totalHours}h`);
  setEl('metric-weekly-hours', `${Math.round((weekMins / 60) * 10) / 10}h`);
  setEl('metric-monthly-hours', `${Math.round((monthMins / 60) * 10) / 10}h`);
  setEl('metric-avg-session', `${avgSessionMins}m`);
  setEl('metric-total-sessions', totalSessions);

  // 2. Daily Goal Circular Progress
  const today = getTodayISO();
  const todayMins = activities
    .filter(a => a.date && a.date.slice(0, 10) === today)
    .reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const todayHours = Math.round((todayMins / 60) * 10) / 10;
  const dailyTargetHours = Math.max(0.5, Number(settings.dailyTargetHours) || 2);
  const dailyPct = Math.min(100, Math.round((todayHours / dailyTargetHours) * 100));

  setEl('daily-target-display', `${todayHours} / ${dailyTargetHours}h`);
  setEl('daily-target-pct', `${dailyPct}%`);

  const dailyRing = document.getElementById('daily-target-ring');
  if (dailyRing) {
    const circum = 2 * Math.PI * 40; // r=40 -> 251.32
    const offset = circum - (dailyPct / 100) * circum;
    dailyRing.style.strokeDasharray = `${circum}`;
    dailyRing.style.strokeDashoffset = `${offset}`;
  }

  // 3. Filter & Sort Activities List
  let filtered = [...activities];

  if (searchQuery) {
    filtered = filtered.filter(
      a =>
        (a.title || '').toLowerCase().includes(searchQuery) ||
        (a.skill || '').toLowerCase().includes(searchQuery) ||
        (a.notes && a.notes.toLowerCase().includes(searchQuery))
    );
  }

  if (activeType !== 'All') {
    filtered = filtered.filter(a => a.type === activeType);
  }

  if (activeSkill !== 'All') {
    filtered = filtered.filter(a => a.skill === activeSkill);
  }

  filtered.sort((a, b) => {
    if (activeSort === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (activeSort === 'duration-desc')
      return (Number(b.duration) || 0) - (Number(a.duration) || 0);
    if (activeSort === 'duration-asc') return (Number(a.duration) || 0) - (Number(b.duration) || 0);
    return new Date(b.date) - new Date(a.date); // default date-desc
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h4 class="empty-state-title">No study time added yet</h4>
        <p class="empty-state-desc">
          ${
            searchQuery || activeType !== 'All' || activeSkill !== 'All'
              ? 'Nothing matches your search or filters. Try clearing them.'
              : 'Each time you study, add it here: what you did and for how long.'
          }
        </p>
        <button class="btn btn-primary" id="empty-launch-btn">
          Add study time
        </button>
      </div>
    `;
    const btn = document.getElementById('empty-launch-btn');
    if (btn) btn.addEventListener('click', () => openActivityModal());
    return;
  }

  // Render Timeline with Date Grouping
  const groups = {};
  filtered.forEach(act => {
    const dStr = act.date ? act.date.slice(0, 10) : 'Unknown';
    if (!groups[dStr]) groups[dStr] = [];
    groups[dStr].push(act);
  });

  const dateKeys = Object.keys(groups);
  const todayStr = getTodayISO();
  const yesterdayStr = getRelativeISO(-1);

  const getDateGroupLabel = dStr => {
    if (dStr === todayStr) return 'Today';
    if (dStr === yesterdayStr) return 'Yesterday';
    return formatDate(dStr, false);
  };

  container.innerHTML = dateKeys
    .map(dStr => {
      const groupItems = groups[dStr];
      const groupMins = groupItems.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
      const label = getDateGroupLabel(dStr);

      return `
      <div class="timeline-date-group">
        <div class="timeline-date-header">
          <span class="timeline-date-badge">${escapeHTML(label)}</span>
          <span class="timeline-date-summary">${groupItems.length} session${groupItems.length === 1 ? '' : 's'} &bull; ${formatDuration(groupMins)}</span>
        </div>
        <div class="timeline-stream">
          ${groupItems
            .map(
              act => `
            <div class="activity-timeline-item card card-elevated" style="display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;">
              <div style="display: flex; gap: 14px; flex: 1;">
                <div class="log-type-icon" style="width: 40px; height: 40px; flex-shrink: 0;">
                  ${activityIcon(act.type)}
                </div>
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;">
                    <h4 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0;">
                      ${escapeHTML(act.title)}
                    </h4>
                    <span class="badge badge-cyan">${escapeHTML(act.skill)}</span>
                    <span class="badge badge-muted">${escapeHTML(typeLabel(act.type))}</span>
                  </div>

                  ${
                    act.notes
                      ? `
                    <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.45; margin-bottom: 6px;">
                      ${escapeHTML(act.notes)}
                    </p>
                  `
                      : ''
                  }

                  <div style="font-size: 0.6875rem; color: var(--text-muted); display: flex; align-items: center; gap: 10px; font-family: var(--font-mono);">
                    <span>${formatDate(act.date, true)} (${formatRelativeTime(act.date)})</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0;">
                <span style="font-weight: 800; font-size: var(--text-xl); letter-spacing: -0.02em; font-variant-numeric: tabular-nums;">
                  ${formatDuration(act.duration)}
                </span>
                <div style="display: flex; gap: 4px;">
                  <button class="btn btn-ghost btn-sm btn-icon-only edit-log-btn" data-id="${act.id}" aria-label="Edit this study session" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                  </button>
                  <button class="btn btn-ghost btn-sm btn-icon-only delete-log-btn" data-id="${act.id}" aria-label="Delete this study session" title="Delete" style="color: var(--danger);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
    })
    .join('');

  // Wire actions
  container.querySelectorAll('.edit-log-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openActivityModal(id);
    });
  });

  container.querySelectorAll('.delete-log-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      showConfirmDialog({
        title: 'Delete this study session?',
        message:
          'Its time will be taken off your totals and your days in a row. This cannot be undone.',
        confirmText: 'Delete',
        onConfirm: () => {
          storage.deleteActivity(id);
          toast.info('Deleted', 'The study session was removed.');
        }
      });
    });
  });
}

function populateSkillFilterOptions(skills) {
  const filter = document.getElementById('log-skill-filter');
  if (!filter) return;

  const currentVal = filter.value;
  const skillNames = Array.from(new Set(skills.map(s => s.name)));

  filter.innerHTML =
    `<option value="All">All skills</option>` +
    skillNames
      .map(
        name =>
          `<option value="${escapeHTML(name)}" ${currentVal === name ? 'selected' : ''}>${escapeHTML(name)}</option>`
      )
      .join('');
}

export function openActivityModal(activityId = null) {
  const form = document.getElementById('activity-modal-form');
  if (!form) return;

  form.reset();
  const skills = storage.getSkills();

  // Populate skill select dropdown
  const skillSelect = document.getElementById('activity-form-skill');
  if (skillSelect) {
    skillSelect.innerHTML =
      skills.length > 0
        ? skills
            .map(s => `<option value="${escapeHTML(s.name)}">${escapeHTML(s.name)}</option>`)
            .join('') + `<option value="General Exploration">General Exploration</option>`
        : `<option value="General Exploration">General Exploration</option>`;
  }

  const titleEl = document.getElementById('activity-modal-title');
  const dateInput = document.getElementById('activity-form-date');

  if (activityId) {
    const act = (storage.getActivities() || []).find(a => a.id === activityId);
    if (!act) return;

    if (titleEl) titleEl.textContent = 'Edit study time';
    document.getElementById('activity-form-id').value = act.id;
    document.getElementById('activity-form-title').value = act.title || '';
    if (skillSelect) skillSelect.value = act.skill || '';
    document.getElementById('activity-form-duration').value = act.duration || 60;
    document.getElementById('activity-form-type').value = act.type || 'Coding';
    if (dateInput) dateInput.value = act.date ? act.date.slice(0, 10) : getTodayISO();
    document.getElementById('activity-form-notes').value = act.notes || '';
  } else {
    if (titleEl) titleEl.textContent = 'Add study time';
    document.getElementById('activity-form-id').value = '';
    if (dateInput) dateInput.value = getTodayISO();
    document.getElementById('activity-form-duration').value = 45;
  }

  openModal('activity-modal');
}

function handleActivityFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('activity-form-id').value;
  const title = document.getElementById('activity-form-title').value.trim();
  const skill = document.getElementById('activity-form-skill').value;
  const duration = parseInt(document.getElementById('activity-form-duration').value, 10);
  const type = document.getElementById('activity-form-type').value;
  const date = document.getElementById('activity-form-date').value;
  const notes = document.getElementById('activity-form-notes').value.trim();

  if (!title) {
    toast.error('Missing information', 'Please say what you studied.');
    return;
  }
  if (!duration || duration <= 0) {
    toast.error('Check the time', 'Please enter how many minutes you studied.');
    return;
  }

  const actData = {
    title,
    skill,
    duration,
    type,
    date: date || getTodayISO(),
    notes
  };
  if (id) actData.id = id;

  storage.saveActivity(actData);
  closeModal('activity-modal');
  toast.success(id ? 'Saved' : 'Study time added', `${formatDuration(duration)} on ${skill}.`);
}

/** Words people see for each stored session type (stored values stay the same). */
function typeLabel(type) {
  if (type === 'Practice Problems') return 'Practice problems';
  if (type === 'Project Development') return 'Project work';
  return type || 'Other';
}
