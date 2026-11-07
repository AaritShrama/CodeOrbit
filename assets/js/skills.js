/**
 * CODEORBIT — SKILL UNIVERSE MODULE
 * Planetary competency tracker, search, filters, sorting, and full CRUD operations.
 */

import { storage } from './storage.js';
import { escapeHTML, formatDate } from './utils.js';
import { openModal, closeModal, toast, showConfirmDialog } from './components.js';

let searchQuery = '';
let activeCategory = 'All';
let activeStatus = 'All';
let activeSort = 'progress-desc';

export function initSkills() {
  setupSkillEventListeners();
  // No render here: navigation.init() renders whichever page is visible, and
  // navigateTo() renders each page when the user opens it.
}

function setupSkillEventListeners() {
  // Search input
  const searchInput = document.getElementById('skill-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderSkills();
    });
  }

  // Category filter
  const categoryFilter = document.getElementById('skill-category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', e => {
      activeCategory = e.target.value;
      renderSkills();
    });
  }

  // Status pills
  document.querySelectorAll('#skill-status-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('#skill-status-pills .pill-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatus = btn.getAttribute('data-status') || 'All';
      renderSkills();
    });
  });

  // Sort selector
  const sortSelect = document.getElementById('skill-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      activeSort = e.target.value;
      renderSkills();
    });
  }

  // Add Skill button
  const addBtn = document.getElementById('add-skill-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openSkillModal());
  }

  // Skill Form submission
  const skillForm = document.getElementById('skill-modal-form');
  if (skillForm) {
    skillForm.addEventListener('submit', handleSkillFormSubmit);
  }

  // Progress slider in modal updates label
  const progSlider = document.getElementById('skill-form-progress');
  const progBadge = document.getElementById('skill-form-progress-badge');
  if (progSlider && progBadge) {
    progSlider.addEventListener('input', e => {
      progBadge.textContent = `${e.target.value}%`;
    });
  }
}

export function renderSkills() {
  const container = document.getElementById('skills-card-grid');
  if (!container) return;

  let skills = storage.getSkills();

  // 1. Search Filter
  if (searchQuery) {
    skills = skills.filter(
      s =>
        (s.name || '').toLowerCase().includes(searchQuery) ||
        (s.category || '').toLowerCase().includes(searchQuery) ||
        (s.description || '').toLowerCase().includes(searchQuery)
    );
  }

  // 2. Category Filter
  if (activeCategory !== 'All') {
    skills = skills.filter(s => s.category === activeCategory);
  }

  // 3. Status Filter
  if (activeStatus !== 'All') {
    skills = skills.filter(s => s.status === activeStatus);
  }

  // 4. Sorting
  skills.sort((a, b) => {
    if (activeSort === 'name-asc') return a.name.localeCompare(b.name);
    if (activeSort === 'name-desc') return b.name.localeCompare(a.name);
    if (activeSort === 'progress-desc') return (b.progress || 0) - (a.progress || 0);
    if (activeSort === 'progress-asc') return (a.progress || 0) - (b.progress || 0);
    if (activeSort === 'date-desc') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return 0;
  });

  // Empty state check
  if (skills.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h4 class="empty-state-title">No skills here yet</h4>
        <p class="empty-state-desc">
          ${
            searchQuery || activeCategory !== 'All' || activeStatus !== 'All'
              ? 'Nothing matches your search or filters. Try clearing them.'
              : 'Add something you are learning, like Python or React, to get started.'
          }
        </p>
        <button class="btn btn-primary" id="empty-add-skill-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add a skill
        </button>
      </div>
    `;
    const emptyBtn = document.getElementById('empty-add-skill-btn');
    if (emptyBtn) emptyBtn.addEventListener('click', () => openSkillModal());
    return;
  }

  // Render cards: big number, planet that grows with progress, 10-step bar
  container.innerHTML = skills
    .map(s => {
      const id = escapeHTML(s.id);
      const name = escapeHTML(s.name);
      const progress = Math.max(0, Math.min(100, Number(s.progress) || 0));
      const done = s.status === 'Completed' || progress >= 100;
      const planet = Math.round(20 + progress * 0.36);
      const filled = Math.round(progress / 10);
      const ticks = Array.from(
        { length: 10 },
        (_, k) => `<span class="skill-tick${k < filled ? ' is-on' : ''}"></span>`
      ).join('');
      return `
      <article class="card skill-item-card${done ? ' is-done' : ''}" data-skill-id="${id}">
        <div class="skill-card-top">
          <span class="label-mono">${escapeHTML(s.category)}</span>
          <div class="skill-card-top-right">
            <span class="badge ${getStatusBadgeClass(s.status)}">${escapeHTML(statusLabel(s.status))}</span>
            <button class="btn btn-ghost btn-sm btn-icon-only skill-action-btn" data-id="${id}" aria-label="More actions for ${name}" title="Edit or delete">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </button>
          </div>
        </div>

        <div class="skill-card-id">
          <span class="skill-planet" aria-hidden="true" style="width: ${planet}px; height: ${planet}px;"></span>
          <div class="skill-card-name">
            <h3>${name}</h3>
            <span>Level: ${escapeHTML(s.proficiency || 'Beginner')}${s.targetDate ? ` · Finish by ${formatDate(s.targetDate)}` : ''}</span>
          </div>
        </div>

        <div class="skill-card-figure">
          <span class="skill-pct">${progress}<small>%</small></span>
          <div class="skill-steps">
            <button class="btn btn-outline btn-sm quick-step-btn" data-id="${id}" data-delta="-10" aria-label="Decrease ${name} by 10%" ${progress <= 0 ? 'disabled' : ''}>−10%</button>
            <button class="btn btn-outline btn-sm quick-step-btn" data-id="${id}" data-delta="10" aria-label="Increase ${name} by 10%" ${progress >= 100 ? 'disabled' : ''}>+10%</button>
          </div>
        </div>

        <div class="skill-ticks" role="progressbar" aria-label="${name} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">${ticks}</div>
      </article>
    `;
    })
    .join('');

  // Wire action buttons
  container.querySelectorAll('.quick-step-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const delta = parseInt(btn.getAttribute('data-delta'), 10);
      stepSkillProgress(id, delta);
    });
  });

  container.querySelectorAll('.skill-action-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      showSkillContextMenu(id, btn);
    });
  });
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Completed':
      return 'badge-primary';
    case 'Practicing':
      return 'badge-orange';
    case 'Learning':
      return 'badge-cyan';
    default:
      return 'badge-muted';
  }
}

let activeMenuDismissListener = null;

function stepSkillProgress(skillId, delta) {
  const skill = storage.getSkillById(skillId);
  if (!skill) return;

  const newProgress = Math.min(100, Math.max(0, (Number(skill.progress) || 0) + delta));
  skill.progress = newProgress;
  if (newProgress === 100) {
    skill.status = 'Completed';
  } else if (skill.status === 'Completed' && newProgress < 100) {
    skill.status = 'Practicing';
  } else if (newProgress > 0 && skill.status === 'Not Started') {
    skill.status = 'Learning';
  }

  storage.saveSkill(skill);
  toast.success('Updated', `${skill.name} is now at ${newProgress}%.`);
}

function showSkillContextMenu(skillId, anchorEl) {
  if (activeMenuDismissListener) {
    document.removeEventListener('click', activeMenuDismissListener);
    activeMenuDismissListener = null;
  }

  const existingMenu = document.querySelector('.skill-pop-menu');
  if (existingMenu) existingMenu.remove();

  const menu = document.createElement('div');
  menu.className = 'dropdown-menu skill-pop-menu active';
  menu.style.position = 'absolute';
  menu.style.top = '100%';
  menu.style.right = '0';
  menu.style.zIndex = '120';

  menu.innerHTML = `
    <button class="dropdown-item" id="menu-edit-skill">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
      Edit Skill
    </button>
    <div class="dropdown-divider"></div>
    <button class="dropdown-item danger" id="menu-delete-skill">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
      Delete Skill
    </button>
  `;

  anchorEl.parentElement.appendChild(menu);

  menu.querySelector('#menu-edit-skill').addEventListener('click', () => {
    menu.remove();
    if (activeMenuDismissListener) {
      document.removeEventListener('click', activeMenuDismissListener);
      activeMenuDismissListener = null;
    }
    openSkillModal(skillId);
  });

  menu.querySelector('#menu-delete-skill').addEventListener('click', () => {
    menu.remove();
    if (activeMenuDismissListener) {
      document.removeEventListener('click', activeMenuDismissListener);
      activeMenuDismissListener = null;
    }
    const s = storage.getSkillById(skillId);
    showConfirmDialog({
      title: 'Delete this skill?',
      message: `"${s.name}" will be deleted. This cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: () => {
        storage.deleteSkill(skillId);
        toast.info('Deleted', `${s.name} was removed.`);
      }
    });
  });

  activeMenuDismissListener = e => {
    if (!menu.contains(e.target) && e.target !== anchorEl) {
      menu.remove();
      document.removeEventListener('click', activeMenuDismissListener);
      activeMenuDismissListener = null;
    }
  };
  setTimeout(() => document.addEventListener('click', activeMenuDismissListener), 10);
}

export function openSkillModal(skillId = null) {
  const form = document.getElementById('skill-modal-form');
  if (!form) return;

  form.reset();
  const titleEl = document.getElementById('skill-modal-title');
  const progBadge = document.getElementById('skill-form-progress-badge');

  if (skillId) {
    const skill = storage.getSkillById(skillId);
    if (!skill) return;

    if (titleEl) titleEl.textContent = 'Edit skill';
    document.getElementById('skill-form-id').value = skill.id;
    document.getElementById('skill-form-name').value = skill.name || '';
    document.getElementById('skill-form-category').value = skill.category || 'Programming';
    document.getElementById('skill-form-proficiency').value = skill.proficiency || 'Beginner';
    document.getElementById('skill-form-status').value = skill.status || 'Not Started';
    document.getElementById('skill-form-progress').value = skill.progress || 0;
    document.getElementById('skill-form-target-date').value = skill.targetDate || '';
    document.getElementById('skill-form-description').value = skill.description || '';
    if (progBadge) progBadge.textContent = `${skill.progress || 0}%`;
  } else {
    if (titleEl) titleEl.textContent = 'Add a skill';
    document.getElementById('skill-form-id').value = '';
    document.getElementById('skill-form-progress').value = 10;
    if (progBadge) progBadge.textContent = '10%';
  }

  openModal('skill-modal');
}

function handleSkillFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('skill-form-id').value;
  const name = document.getElementById('skill-form-name').value.trim();
  const category = document.getElementById('skill-form-category').value;
  const proficiency = document.getElementById('skill-form-proficiency').value;
  const status = document.getElementById('skill-form-status').value;
  const progress = parseInt(document.getElementById('skill-form-progress').value, 10) || 0;
  const targetDate = document.getElementById('skill-form-target-date').value;
  const description = document.getElementById('skill-form-description').value.trim();

  if (!name) {
    toast.error('Missing information', 'Please give your skill a name.');
    return;
  }

  const finalStatus = progress === 100 ? 'Completed' : status;
  const finalProgress = finalStatus === 'Completed' && progress < 100 ? 100 : progress;

  const skillData = {
    name,
    category,
    proficiency,
    status: finalStatus,
    progress: finalProgress,
    targetDate,
    description
  };
  if (id) skillData.id = id;

  storage.saveSkill(skillData);
  closeModal('skill-modal');
  toast.success(id ? 'Saved' : 'Skill added', `${name}`);
}

/** Words people see for each stored status (stored values stay the same). */
function statusLabel(status) {
  switch (status) {
    case 'Completed':
      return 'Finished';
    case 'Practicing':
      return 'Practising';
    case 'Not Started':
      return 'Not started';
    default:
      return status || 'Learning';
  }
}
