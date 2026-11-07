/**
 * CODEORBIT — MILESTONES (GOAL MANAGEMENT) MODULE
 * Learning horizons, priority flags, deadline countdowns, and completion metrics.
 */

import { storage } from './storage.js';
import { escapeHTML, formatDate, formatRelativeTime, getTodayISO } from './utils.js';
import { openModal, closeModal, toast, showConfirmDialog } from './components.js';

let searchQuery = '';
let activeStatus = 'All';
let activePriority = 'All';

export function initGoals() {
  setupGoalEventListeners();
  // No render here: navigation.init() renders whichever page is visible, and
  // navigateTo() renders each page when the user opens it.
}

function setupGoalEventListeners() {
  // Search
  const searchInput = document.getElementById('goal-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderGoals();
    });
  }

  // Status Filter Pills
  document.querySelectorAll('#goal-status-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('#goal-status-pills .pill-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatus = btn.getAttribute('data-status') || 'All';
      renderGoals();
    });
  });

  // Priority Filter
  const priorityFilter = document.getElementById('goal-priority-filter');
  if (priorityFilter) {
    priorityFilter.addEventListener('change', e => {
      activePriority = e.target.value;
      renderGoals();
    });
  }

  // Create Goal Button
  const createBtn = document.getElementById('create-goal-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => openGoalModal());
  }

  // Form Submission
  const goalForm = document.getElementById('goal-modal-form');
  if (goalForm) {
    goalForm.addEventListener('submit', handleGoalFormSubmit);
  }

  // Progress slider
  const progSlider = document.getElementById('goal-form-progress');
  const progBadge = document.getElementById('goal-form-progress-badge');
  if (progSlider && progBadge) {
    progSlider.addEventListener('input', e => {
      progBadge.textContent = `${e.target.value}%`;
    });
  }
}

export function renderGoals() {
  const container = document.getElementById('goals-card-grid');
  if (!container) return;

  const data = storage.getUniverse();
  const goals = data.goals || [];
  const today = getTodayISO();

  // Metrics
  const total = goals.length;
  const completed = goals.filter(g => g.status === 'Completed').length;
  const active = goals.filter(g => g.status === 'Active').length;
  const overdue = goals.filter(
    g => g.status === 'Active' && g.deadline && g.deadline < today
  ).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setEl('goal-stat-rate', `${completionRate}%`);
  setEl('goal-stat-completed', completed);
  setEl('goal-stat-active', active);
  setEl('goal-stat-overdue', overdue);

  // Filters
  let filtered = [...goals];

  if (searchQuery) {
    filtered = filtered.filter(
      g =>
        (g.title || '').toLowerCase().includes(searchQuery) ||
        (g.description && g.description.toLowerCase().includes(searchQuery)) ||
        (g.category && g.category.toLowerCase().includes(searchQuery))
    );
  }

  if (activeStatus !== 'All') {
    if (activeStatus === 'Overdue') {
      filtered = filtered.filter(g => g.status === 'Active' && g.deadline && g.deadline < today);
    } else {
      filtered = filtered.filter(g => g.status === activeStatus);
    }
  }

  if (activePriority !== 'All') {
    filtered = filtered.filter(g => g.priority === activePriority);
  }

  // Sort: Overdue first, then high priority, then deadline
  filtered.sort((a, b) => {
    const aOverdue = a.status === 'Active' && a.deadline && a.deadline < today;
    const bOverdue = b.status === 'Active' && b.deadline && b.deadline < today;
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31');
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h4 class="empty-state-title">No goals here yet</h4>
        <p class="empty-state-desc">
          ${
            searchQuery || activeStatus !== 'All' || activePriority !== 'All'
              ? 'Nothing matches your search or filters. Try clearing them.'
              : 'Add something you want to reach, like finishing a course, and give it a due date.'
          }
        </p>
        <button class="btn btn-primary" id="empty-create-goal-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add a goal
        </button>
      </div>
    `;
    const emptyBtn = document.getElementById('empty-create-goal-btn');
    if (emptyBtn) emptyBtn.addEventListener('click', () => openGoalModal());
    return;
  }

  container.innerHTML = filtered
    .map(g => {
      const isCompleted = g.status === 'Completed';
      const isOverdue = !isCompleted && g.deadline && g.deadline < today;
      const ringCircum = 2 * Math.PI * 20; // 125.66 for r=20
      const ringOffset = ringCircum - (Math.min(100, Number(g.progress) || 0) / 100) * ringCircum;

      let deadlineDisplay = 'No due date';
      if (g.deadline) {
        const daysLeft = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        const text =
          daysLeft < 0
            ? `${-daysLeft} days late`
            : daysLeft === 0
              ? 'Due today'
              : `${daysLeft} days left`;
        deadlineDisplay = isCompleted
          ? `Finished &bull; was due ${formatDate(g.deadline)}`
          : `${text} &bull; ${formatDate(g.deadline)}`;
      }

      return `
      <div class="card card-glow-orange goal-item-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <!-- Header Row -->
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="badge ${getPriorityBadge(g.priority)}">
                ${escapeHTML(g.priority)} priority
              </span>
              <span class="badge badge-muted">
                ${escapeHTML(g.category)}
              </span>
            </div>

            <div style="display: flex; gap: 4px;">
              <button class="btn btn-ghost btn-sm btn-icon-only edit-goal-btn" data-id="${g.id}" aria-label="Edit ${escapeHTML(g.title)}" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
              </button>
              <button class="btn btn-ghost btn-sm btn-icon-only delete-goal-btn" data-id="${g.id}" aria-label="Delete ${escapeHTML(g.title)}" title="Delete" style="color: var(--danger);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>

          <!-- Goal Info with Circular Progress Ring -->
          <div style="display: flex; gap: 14px; align-items: flex-start; margin-bottom: 12px;">
            <div class="goal-ring-wrap" title="${g.progress}% done">
              <svg class="goal-ring-svg" viewBox="0 0 50 50">
                <circle class="goal-ring-bg" cx="25" cy="25" r="20"></circle>
                <circle class="goal-ring-fill ${isCompleted ? 'fill-done' : ''}" cx="25" cy="25" r="20"
                  stroke-dasharray="125.66" stroke-dashoffset="${ringOffset}"></circle>
              </svg>
              <span class="goal-ring-text">${g.progress}%</span>
            </div>

            <div style="flex: 1;">
              <h3 style="font-size: var(--text-xl); font-weight: 700; color: var(--text-primary); margin-bottom: 4px; letter-spacing: -0.01em;">
                ${escapeHTML(g.title)}
              </h3>
              <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.45; min-height: 32px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">
                ${escapeHTML(g.description || 'No notes.')}
              </p>
            </div>
          </div>
        </div>

        <div>
          <!-- Progress Bar Meter -->
          <div class="progress-bar-container" style="height: 6px; margin-bottom: 12px;">
            <div class="progress-bar-fill ${isCompleted ? 'fill-success' : 'fill-orange'}" style="width: ${g.progress}%;"></div>
          </div>

          <!-- Bottom Footer & Quick Complete -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-light); padding-top: 10px; font-size: var(--text-xs); flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 0.6875rem; color: ${isOverdue ? 'var(--danger)' : 'var(--text-muted)'}; font-weight: ${isOverdue ? '700' : '500'}; font-family: var(--font-mono);">
                ${deadlineDisplay}
              </span>
              <span style="font-size: 0.625rem; color: var(--text-muted);">${formatRelativeTime(g.deadline)}</span>
            </div>

            <button class="btn btn-sm btn-outline toggle-complete-goal-btn" data-id="${g.id}">
              ${isCompleted ? 'Not done yet' : 'Mark as done'}
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join('');

  // Wire event handlers
  container.querySelectorAll('.toggle-complete-goal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      toggleGoalComplete(id);
    });
  });

  container.querySelectorAll('.edit-goal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openGoalModal(id);
    });
  });

  container.querySelectorAll('.delete-goal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      showConfirmDialog({
        title: 'Delete this goal?',
        message: 'This goal will be deleted. This cannot be undone.',
        confirmText: 'Delete',
        onConfirm: () => {
          storage.deleteGoal(id);
          toast.info('Deleted', 'The goal was removed.');
        }
      });
    });
  });
}

function getPriorityBadge(priority) {
  switch (priority) {
    case 'Critical':
      return 'badge-danger';
    case 'High':
      return 'badge-orange';
    case 'Medium':
      return 'badge-warning';
    default:
      return 'badge-muted';
  }
}

function toggleGoalComplete(goalId) {
  const goal = (storage.getGoals() || []).find(g => g.id === goalId);
  if (!goal) return;

  if (goal.status === 'Completed') {
    goal.status = 'Active';
    goal.progress = 50;
    toast.info('Back in progress', `${goal.title}`);
  } else {
    goal.status = 'Completed';
    goal.progress = 100;
    toast.success('Goal reached', `Well done on finishing "${goal.title}".`);
  }

  storage.saveGoal(goal);
}

export function openGoalModal(goalId = null) {
  const form = document.getElementById('goal-modal-form');
  if (!form) return;

  form.reset();
  const titleEl = document.getElementById('goal-modal-title');
  const progBadge = document.getElementById('goal-form-progress-badge');

  if (goalId) {
    const goal = (storage.getGoals() || []).find(g => g.id === goalId);
    if (!goal) return;

    if (titleEl) titleEl.textContent = 'Edit goal';
    document.getElementById('goal-form-id').value = goal.id;
    document.getElementById('goal-form-title').value = goal.title || '';
    document.getElementById('goal-form-category').value = goal.category || 'Programming';
    document.getElementById('goal-form-priority').value = goal.priority || 'Medium';
    document.getElementById('goal-form-status').value = goal.status || 'Active';
    document.getElementById('goal-form-deadline').value = goal.deadline || '';
    document.getElementById('goal-form-progress').value = goal.progress || 0;
    document.getElementById('goal-form-description').value = goal.description || '';
    if (progBadge) progBadge.textContent = `${goal.progress || 0}%`;
  } else {
    if (titleEl) titleEl.textContent = 'Add a goal';
    document.getElementById('goal-form-id').value = '';
    document.getElementById('goal-form-progress').value = 0;
    if (progBadge) progBadge.textContent = '0%';
  }

  openModal('goal-modal');
}

function handleGoalFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('goal-form-id').value;
  const title = document.getElementById('goal-form-title').value.trim();
  const category = document.getElementById('goal-form-category').value;
  const priority = document.getElementById('goal-form-priority').value;
  const status = document.getElementById('goal-form-status').value;
  const deadline = document.getElementById('goal-form-deadline').value;
  const progress = parseInt(document.getElementById('goal-form-progress').value, 10) || 0;
  const description = document.getElementById('goal-form-description').value.trim();

  if (!title) {
    toast.error('Missing information', 'Please write your goal.');
    return;
  }

  const finalStatus = progress === 100 ? 'Completed' : status;
  const finalProgress = finalStatus === 'Completed' && progress < 100 ? 100 : progress;

  const goalData = {
    title,
    category,
    priority,
    status: finalStatus,
    deadline,
    progress: finalProgress,
    description
  };
  if (id) goalData.id = id;

  storage.saveGoal(goalData);
  closeModal('goal-modal');
  toast.success(id ? 'Saved' : 'Goal added', `${title}`);
}
