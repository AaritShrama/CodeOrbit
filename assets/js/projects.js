/**
 * CODEORBIT — SPACE MISSIONS (PROJECT MANAGEMENT) MODULE
 * Developer project tracker, multi-tech tag management, and progress horizons.
 */

import { storage } from './storage.js';
import { escapeHTML, formatDate } from './utils.js';
import { openModal, closeModal, toast, showConfirmDialog } from './components.js';

let searchQuery = '';
let activeStatus = 'All';
let activeSort = 'progress-desc';
let modalTechTags = [];

export function initProjects() {
  setupProjectEventListeners();
  // No render here: navigation.init() renders whichever page is visible, and
  // navigateTo() renders each page when the user opens it.
}

function setupProjectEventListeners() {
  // Search
  const searchInput = document.getElementById('project-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderProjects();
    });
  }

  // Status Filter Pills
  document.querySelectorAll('#project-status-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('#project-status-pills .pill-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatus = btn.getAttribute('data-status') || 'All';
      renderProjects();
    });
  });

  // Sort
  const sortSelect = document.getElementById('project-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      activeSort = e.target.value;
      renderProjects();
    });
  }

  // Create Project Button
  const createBtn = document.getElementById('create-project-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => openProjectModal());
  }

  // Form Submission
  const projectForm = document.getElementById('project-modal-form');
  if (projectForm) {
    projectForm.addEventListener('submit', handleProjectFormSubmit);
  }

  // Progress slider in modal updates badge
  const progSlider = document.getElementById('project-form-progress');
  const progBadge = document.getElementById('project-form-progress-badge');
  if (progSlider && progBadge) {
    progSlider.addEventListener('input', e => {
      progBadge.textContent = `${e.target.value}%`;
    });
  }

  // Tag Input field in modal
  const tagInputField = document.getElementById('project-tag-input');
  if (tagInputField) {
    tagInputField.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = tagInputField.value.trim().replace(/^,+|,+$/g, '');
        if (val && !modalTechTags.includes(val)) {
          modalTechTags.push(val);
          renderModalTags();
        }
        tagInputField.value = '';
      }
    });
  }
}

export function renderProjects() {
  const container = document.getElementById('projects-card-grid');
  if (!container) return;

  let projects = storage.getProjects();

  // Summary counts
  const total = projects.length;
  const inProgress = projects.filter(p => p.status === 'In Progress').length;
  const planning = projects.filter(p => p.status === 'Planning').length;
  const completed = projects.filter(p => p.status === 'Completed').length;

  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setEl('proj-stat-total', total);
  setEl('proj-stat-inprogress', inProgress);
  setEl('proj-stat-planning', planning);
  setEl('proj-stat-completed', completed);

  // Filters
  if (searchQuery) {
    projects = projects.filter(
      p =>
        (p.name || '').toLowerCase().includes(searchQuery) ||
        (p.description && p.description.toLowerCase().includes(searchQuery)) ||
        (p.technologies && p.technologies.some(t => (t || '').toLowerCase().includes(searchQuery)))
    );
  }

  if (activeStatus !== 'All') {
    projects = projects.filter(p => p.status === activeStatus);
  }

  // Sorting
  projects.sort((a, b) => {
    if (activeSort === 'name-asc') return a.name.localeCompare(b.name);
    if (activeSort === 'progress-desc') return (b.progress || 0) - (a.progress || 0);
    if (activeSort === 'progress-asc') return (a.progress || 0) - (b.progress || 0);
    if (activeSort === 'date-desc') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return 0;
  });

  if (projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h4 class="empty-state-title">No projects here yet</h4>
        <p class="empty-state-desc">
          ${
            searchQuery || activeStatus !== 'All'
              ? 'Nothing matches your search or filters. Try clearing them.'
              : 'Add something you are building, like a website or an app, and track how far along it is.'
          }
        </p>
        <button class="btn btn-primary" id="empty-create-project-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add a project
        </button>
      </div>
    `;
    const emptyBtn = document.getElementById('empty-create-project-btn');
    if (emptyBtn) emptyBtn.addEventListener('click', () => openProjectModal());
    return;
  }

  container.innerHTML = projects
    .map(p => {
      const isCompleted = p.status === 'Completed';

      let targetDateDisplay = 'No finish date';
      if (p.targetDate) {
        const daysLeft = Math.ceil((new Date(p.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        const countdown =
          daysLeft < 0
            ? `${-daysLeft} days late`
            : daysLeft === 0
              ? 'due today'
              : `${daysLeft} days left`;
        targetDateDisplay = `Finish by ${formatDate(p.targetDate)} (${countdown})`;
      }

      return `
      <div class="card card-glow-cyan project-item-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <!-- Top Row -->
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px;">
            <span class="badge ${getStatusBadge(p.status)}">
              ${escapeHTML(projectStatusLabel(p.status))}
            </span>
            <div style="display: flex; gap: 4px;">
              <button class="btn btn-ghost btn-sm btn-icon-only edit-project-btn" data-id="${p.id}" aria-label="Edit ${escapeHTML(p.name)}" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
              </button>
              <button class="btn btn-ghost btn-sm btn-icon-only delete-project-btn" data-id="${p.id}" aria-label="Delete ${escapeHTML(p.name)}" title="Delete" style="color: var(--danger);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>

          <h3 style="font-size: var(--text-xl); font-weight: 700; color: var(--text-primary); margin-bottom: 6px; letter-spacing: -0.01em;">
            ${escapeHTML(p.name)}
          </h3>

          <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.45; margin-bottom: 14px; min-height: 36px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${escapeHTML(p.description || 'No description yet.')}
          </p>

          <!-- Tech Stack -->
          <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 16px;">
            ${(p.technologies || []).map(t => `<span class="badge badge-muted" style="font-size: 0.625rem; font-family: var(--font-mono);">${escapeHTML(t)}</span>`).join('')}
          </div>
        </div>

        <div>
          <!-- Progress -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.6875rem; margin-bottom: 6px;">
            <span class="label-mono">How far along</span>
            <span style="font-weight: 800; font-size: var(--text-lg); color: var(--text-primary); font-variant-numeric: tabular-nums;">${p.progress}%</span>
          </div>

          <div class="progress-bar-container" style="height: 7px; margin-bottom: 14px;">
            <div class="progress-bar-fill ${isCompleted ? 'fill-success' : 'fill-primary'}" style="width: ${p.progress}%;"></div>
          </div>

          <!-- Bottom Links and Dates -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-light); padding-top: 10px; font-size: var(--text-xs); flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; gap: 10px;">
              ${
                p.githubUrl
                  ? `
                <a href="${escapeHTML(p.githubUrl)}" target="_blank" rel="noopener noreferrer" style="color: var(--text-secondary); display: inline-flex; align-items: center; gap: 4px; font-weight: 600;" title="Code on GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                  <span style="font-size: 0.6875rem;">Code</span>
                </a>
              `
                  : ''
              }
              ${
                p.liveDemoUrl
                  ? `
                <a href="${escapeHTML(p.liveDemoUrl)}" target="_blank" rel="noopener noreferrer" style="color: var(--cyan-accent); display: inline-flex; align-items: center; gap: 4px; font-weight: 600;" title="Live site">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  <span style="font-size: 0.6875rem;">Live site</span>
                </a>
              `
                  : ''
              }
            </div>

            <span style="font-size: 0.6875rem; color: var(--text-muted); font-family: var(--font-mono);">
              ${targetDateDisplay}
            </span>
          </div>
        </div>
      </div>
    `;
    })
    .join('');

  // Wire buttons
  container.querySelectorAll('.edit-project-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openProjectModal(id);
    });
  });

  container.querySelectorAll('.delete-project-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const p = storage.getProjectById(id);
      showConfirmDialog({
        title: 'Delete this project?',
        message: `"${p ? p.name : 'This project'}" will be deleted. Your study sessions stay. This cannot be undone.`,
        confirmText: 'Delete',
        onConfirm: () => {
          storage.deleteProject(id);
          toast.info('Deleted', 'The project was removed.');
        }
      });
    });
  });
}

function getStatusBadge(status) {
  switch (status) {
    case 'Completed':
      return 'badge-primary';
    case 'In Progress':
      return 'badge-cyan';
    case 'Planning':
      return 'badge-secondary';
    case 'On Hold':
      return 'badge-warning';
    default:
      return 'badge-muted';
  }
}

function renderModalTags() {
  const container = document.getElementById('project-modal-tags-list');
  if (!container) return;

  container.innerHTML = modalTechTags
    .map(
      tag => `
    <span class="tag-badge">
      ${escapeHTML(tag)}
      <span class="tag-remove-btn" data-tag="${escapeHTML(tag)}">&times;</span>
    </span>
  `
    )
    .join('');

  container.querySelectorAll('.tag-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-tag');
      modalTechTags = modalTechTags.filter(t => t !== tag);
      renderModalTags();
    });
  });
}

export function openProjectModal(projectId = null) {
  const form = document.getElementById('project-modal-form');
  if (!form) return;

  form.reset();
  modalTechTags = [];
  const titleEl = document.getElementById('project-modal-title');
  const progBadge = document.getElementById('project-form-progress-badge');

  if (projectId) {
    const p = storage.getProjectById(projectId);
    if (!p) return;

    if (titleEl) titleEl.textContent = 'Edit project';
    document.getElementById('project-form-id').value = p.id;
    document.getElementById('project-form-name').value = p.name || '';
    document.getElementById('project-form-status').value = p.status || 'Planning';
    document.getElementById('project-form-progress').value = p.progress || 0;
    document.getElementById('project-form-github').value = p.githubUrl || '';
    document.getElementById('project-form-demo').value = p.liveDemoUrl || '';
    document.getElementById('project-form-start-date').value = p.startDate || '';
    document.getElementById('project-form-target-date').value = p.targetDate || '';
    document.getElementById('project-form-description').value = p.description || '';
    modalTechTags = [...(p.technologies || [])];
    if (progBadge) progBadge.textContent = `${p.progress || 0}%`;
  } else {
    if (titleEl) titleEl.textContent = 'Add a project';
    document.getElementById('project-form-id').value = '';
    document.getElementById('project-form-progress').value = 10;
    if (progBadge) progBadge.textContent = '10%';
    modalTechTags = ['TypeScript', 'Node.js'];
  }

  renderModalTags();
  openModal('project-modal');
}

function handleProjectFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('project-form-id').value;
  const name = document.getElementById('project-form-name').value.trim();
  const status = document.getElementById('project-form-status').value;
  const progress = parseInt(document.getElementById('project-form-progress').value, 10) || 0;
  const githubUrl = document.getElementById('project-form-github').value.trim();
  const liveDemoUrl = document.getElementById('project-form-demo').value.trim();
  const startDate = document.getElementById('project-form-start-date').value;
  const targetDate = document.getElementById('project-form-target-date').value;
  const description = document.getElementById('project-form-description').value.trim();

  if (!name) {
    toast.error('Missing information', 'Please give your project a name.');
    return;
  }

  // Basic URL format validation if provided
  if (githubUrl && !githubUrl.startsWith('http')) {
    toast.error('Check the link', 'The GitHub link must start with http:// or https://');
    return;
  }
  if (liveDemoUrl && !liveDemoUrl.startsWith('http')) {
    toast.error('Check the link', 'The live site link must start with http:// or https://');
    return;
  }

  const finalStatus = progress === 100 ? 'Completed' : status;
  const finalProgress = finalStatus === 'Completed' && progress < 100 ? 100 : progress;

  const projectData = {
    name,
    status: finalStatus,
    progress: finalProgress,
    technologies: [...modalTechTags],
    githubUrl,
    liveDemoUrl,
    startDate,
    targetDate,
    description
  };
  if (id) projectData.id = id;

  storage.saveProject(projectData);
  closeModal('project-modal');
  toast.success(id ? 'Saved' : 'Project added', `${name}`);
}

/** Words people see for each stored project status (stored values stay the same). */
function projectStatusLabel(status) {
  if (status === 'Completed') return 'Finished';
  if (status === 'On Hold') return 'Paused';
  if (status === 'In Progress') return 'In progress';
  return status || 'Planning';
}
