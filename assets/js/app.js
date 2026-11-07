/**
 * CODEORBIT — MAIN APPLICATION BOOTSTRAP MODULE
 * Wires state listeners, cosmic canvas starfield, global keyboard shortcuts, and view orchestration.
 * Organization: LET'S COOK — THE FOUNDRY
 */

import { storage } from './storage.js';
import { navigation } from './navigation.js';
import { setupModalDismissHandlers, openCommandPalette, closeCommandPalette, renderPaletteResults, openModal, closeModal } from './components.js';
import { initDashboard, renderDashboard } from './dashboard.js';
import { initSkills, renderSkills, openSkillModal } from './skills.js';
import { initProgress, renderProgress, openActivityModal } from './progress.js';
import { initProjects, renderProjects, openProjectModal } from './projects.js';
import { initGoals, renderGoals, openGoalModal } from './goals.js';
import { initAchievements, renderAchievements, evaluateAchievements } from './achievements.js';
import { initAnalytics, renderAnalytics } from './analytics.js';
import { initSettings, renderSettings, applyTheme } from './settings.js';
import { escapeHTML, formatDate, formatRelativeTime, getTodayISO } from './utils.js';

function initApp() {
  try {
    console.log('🚀 Initializing CodeOrbit — Your Universe of Developer Growth');

    // 1. Initialize Settings & Theme
    const settings = storage.getSettings();
    applyTheme(settings.theme || 'dark', false);

    // 2. Initialize Cosmic Starfield Canvas
    initCosmicStarfield();

    // 3. Setup Generic Modal Listeners & Shortcuts
    setupModalDismissHandlers();
    setupGlobalShortcuts();

    // 4. Initialize Topbar Menus (Search, Notifications, Quick Actions)
    setupTopbarInteractions();

    // 5. Register Views with Navigation Router
    navigation.registerView('dashboard', () => renderDashboard());
    navigation.registerView('skills', () => renderSkills());
    navigation.registerView('progress', () => renderProgress());
    navigation.registerView('projects', () => renderProjects());
    navigation.registerView('goals', () => renderGoals());
    navigation.registerView('achievements', () => renderAchievements());
    navigation.registerView('analytics', () => renderAnalytics());
    navigation.registerView('settings', () => renderSettings());

    // 6. Initialize Page Controllers
    initDashboard();
    initSkills();
    initProgress();
    initProjects();
    initGoals();
    initAchievements();
    initAnalytics();
    initSettings();

    // 7. Initialize Navigation Router
    navigation.init();

    // 8. Global State Change Listener (Event Bus)
    window.addEventListener('codeorbit:data-changed', () => {
      // If this unlocks achievements it saves, which dispatches data-changed again;
      // that nested round re-renders everything below, so stop here to avoid a double render.
      if (evaluateAchievements()) return;

      // Re-render currently active view
      const current = navigation.currentRoute;
      if (current === 'dashboard') renderDashboard();
      else if (current === 'skills') renderSkills();
      else if (current === 'progress') renderProgress();
      else if (current === 'projects') renderProjects();
      else if (current === 'goals') renderGoals();
      else if (current === 'achievements') renderAchievements();
      else if (current === 'analytics') renderAnalytics();
      else if (current === 'settings') renderSettings();

      // Refresh notifications count
      updateNotificationsPanel();

      // Re-create icons if Lucide is available
      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
      }
    });

    // Initial Lucide Icons Render
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  } catch (err) {
    console.error('Fatal initialization error in CodeOrbit:', err?.message || err, err?.stack);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/* ==========================================================================
   GLOBAL KEYBOARD SHORTCUTS
   ========================================================================== */
function setupGlobalShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Ctrl+K or Cmd+K or "/" to open Command Palette
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
    } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      openCommandPalette();
    }
  });

  // Search input typing in Command Palette
  const paletteInput = document.getElementById('palette-search-input');
  if (paletteInput) {
    paletteInput.addEventListener('input', (e) => {
      renderPaletteResults(e.target.value);
    });
  }

  // Search button in topbar
  const searchBtn = document.getElementById('topbar-search-trigger');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => openCommandPalette());
  }
}

/* ==========================================================================
   TOPBAR INTERACTIONS (QUICK ACTION & NOTIFICATIONS)
   ========================================================================== */
function setupTopbarInteractions() {
  // Quick Action Dropdown
  const quickBtn = document.getElementById('topbar-launch-btn');
  const quickMenu = document.getElementById('quick-action-menu');

  if (quickBtn && quickMenu) {
    quickBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      quickMenu.classList.toggle('active');
    });

    document.getElementById('action-log-session')?.addEventListener('click', () => {
      quickMenu.classList.remove('active');
      openActivityModal();
    });

    document.getElementById('action-add-skill')?.addEventListener('click', () => {
      quickMenu.classList.remove('active');
      openSkillModal();
    });

    document.getElementById('action-create-project')?.addEventListener('click', () => {
      quickMenu.classList.remove('active');
      openProjectModal();
    });

    document.getElementById('action-set-goal')?.addEventListener('click', () => {
      quickMenu.classList.remove('active');
      openGoalModal();
    });
  }

  // Notifications Dropdown
  const notifBtn = document.getElementById('topbar-notif-btn');
  const notifMenu = document.getElementById('notifications-dropdown-menu');

  if (notifBtn && notifMenu) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifMenu.classList.toggle('active');
      updateNotificationsPanel();
    });
  }

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (quickMenu && !quickMenu.contains(e.target) && e.target !== quickBtn) {
      quickMenu.classList.remove('active');
    }
    if (notifMenu && !notifMenu.contains(e.target) && e.target !== notifBtn) {
      notifMenu.classList.remove('active');
    }
  });

  updateNotificationsPanel();
}

/**
 * Dynamically computes notifications from real universe data
 */
function updateNotificationsPanel() {
  const container = document.getElementById('notifications-list');
  const badge = document.getElementById('topbar-notif-badge');
  if (!container) return;

  const data = storage.getUniverse();
  const today = getTodayISO();
  const notifs = [];

  // 1. Check upcoming goals due within 5 days
  (data.goals || []).forEach(g => {
    if (g.status === 'Active' && g.deadline) {
      const diffDays = Math.round((new Date(g.deadline) - new Date(today)) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 4) {
        notifs.push({
          icon: '🎯',
          iconBg: 'var(--orange-subtle)',
          title: `Milestone Due Soon: ${g.title}`,
          time: diffDays === 0 ? 'Due Today' : `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`
        });
      } else if (diffDays < 0) {
        notifs.push({
          icon: '⚠️',
          iconBg: 'rgba(239, 68, 68, 0.2)',
          title: `Overdue Milestone: ${g.title}`,
          time: `Was due ${formatRelativeTime(g.deadline)}`
        });
      }
    }
  });

  // 2. Check recent achievements
  (data.achievements || []).slice(-2).reverse().forEach(a => {
    notifs.push({
      icon: '⭐',
      iconBg: 'var(--orange-subtle)',
      title: `Unlocked Achievement!`,
      time: formatDate(a.unlockedAt)
    });
  });

  // 3. Welcome / Streak info
  notifs.push({
    icon: '🪐',
    iconBg: 'var(--cyan-subtle)',
    title: 'CodeOrbit Core Online',
    time: 'Ready for deep space developer progress.'
  });

  if (badge) {
    badge.style.display = notifs.length > 0 ? 'block' : 'none';
  }

  container.innerHTML = notifs.map(n => `
    <div class="notif-item">
      <div class="notif-icon" style="background: ${n.iconBg};">
        ${n.icon}
      </div>
      <div class="notif-content">
        <div class="notif-title">${escapeHTML(n.title)}</div>
        <div class="notif-time">${escapeHTML(n.time)}</div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   PERFORMANT COSMIC STARFIELD CANVAS
   ========================================================================== */
function initCosmicStarfield() {
  const canvas = document.getElementById('cosmic-stars-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Check reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const numStars = Math.min(120, Math.floor((width * height) / 10000));
  const stars = [];

  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      flickerSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1)
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      if (!prefersReduced) {
        s.alpha += s.flickerSpeed;
        if (s.alpha > 0.95 || s.alpha < 0.15) {
          s.flickerSpeed = -s.flickerSpeed;
        }
      }

      ctx.fillStyle = `rgba(248, 250, 252, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!prefersReduced) {
      requestAnimationFrame(draw);
    }
  }

  draw();
}
