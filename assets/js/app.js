/**
 * CODEORBIT — MAIN APPLICATION BOOTSTRAP MODULE
 * Wires state listeners, cosmic canvas starfield, global keyboard shortcuts, and view orchestration.
 * Organization: LET'S COOK — THE FOUNDRY
 */

import { storage } from './storage.js';
import { navigation } from './navigation.js';
import {
  setupModalDismissHandlers,
  openCommandPalette,
  renderPaletteResults,
  toast
} from './components.js';
import { initDashboard, renderDashboard } from './dashboard.js';
import { initSkills, renderSkills } from './skills.js';
import { initProgress, renderProgress } from './progress.js';
import { initProjects, renderProjects } from './projects.js';
import { initGoals, renderGoals } from './goals.js';
import { initAchievements, renderAchievements, evaluateAchievements } from './achievements.js';
import { initAnalytics, renderAnalytics } from './analytics.js';
import { initSettings, renderSettings, applyTheme } from './settings.js';

/**
 * Runs one startup step in isolation. A failing step is logged and recorded,
 * and startup continues with the next step instead of stopping the whole app.
 */
function runStep(name, fn, failures) {
  try {
    fn();
  } catch (err) {
    failures.push(name);
    console.error(`CodeOrbit startup step failed: ${name}`, err);
  }
}

function refreshIcons() {
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
}

function initApp() {
  console.log('CodeOrbit is starting');
  const failures = [];

  // 1. Theme
  runStep('theme', () => applyTheme(storage.getSettings().theme || 'dark', false), failures);

  // 2. Background starfield (purely decorative)
  runStep('starfield', initCosmicStarfield, failures);

  // 3. Modal dismiss handlers + keyboard shortcuts
  runStep('modals', setupModalDismissHandlers, failures);
  runStep('shortcuts', setupGlobalShortcuts, failures);

  // 4. Register views with the router (cannot fail, but keep the pattern uniform)
  runStep(
    'routes',
    () => {
      navigation.registerView('dashboard', renderDashboard);
      navigation.registerView('skills', renderSkills);
      navigation.registerView('progress', renderProgress);
      navigation.registerView('projects', renderProjects);
      navigation.registerView('goals', renderGoals);
      navigation.registerView('achievements', renderAchievements);
      navigation.registerView('analytics', renderAnalytics);
      navigation.registerView('settings', renderSettings);
    },
    failures
  );

  // 5. Page controllers: each one only wires its own listeners, so one broken
  //    page must not stop the others.
  runStep('home page', initDashboard, failures);
  runStep('skills page', initSkills, failures);
  runStep('study sessions page', initProgress, failures);
  runStep('projects page', initProjects, failures);
  runStep('goals page', initGoals, failures);
  runStep('achievements page', initAchievements, failures);
  runStep('analytics page', initAnalytics, failures);
  runStep('settings page', initSettings, failures);

  // 6. Unlock anything already earned (e.g. after an import) before the first render
  runStep('achievement check', evaluateAchievements, failures);

  // 7. Router: renders the visible page (the ONLY startup render)
  runStep('navigation', () => navigation.init(), failures);

  // 8. Global data-change listener (event bus)
  window.addEventListener('codeorbit:data-changed', () => {
    // If this unlocks achievements it saves, which dispatches data-changed again;
    // that nested round re-renders everything below, so stop here to avoid a double render.
    if (evaluateAchievements()) return;

    navigation.renderCurrentView();
    refreshIcons();
  });

  // 9. Icons
  runStep('icons', refreshIcons, failures);

  if (failures.length > 0) {
    toast.error(
      'Some parts failed to load',
      `${failures.join(', ')}. The rest of CodeOrbit still works. See the browser console for details.`
    );
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
  window.addEventListener('keydown', e => {
    // Ctrl+K or Cmd+K or "/" to open Command Palette
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
    } else if (
      e.key === '/' &&
      document.activeElement.tagName !== 'INPUT' &&
      document.activeElement.tagName !== 'TEXTAREA'
    ) {
      e.preventDefault();
      openCommandPalette();
    }
  });

  // Search input typing in Command Palette
  const paletteInput = document.getElementById('palette-search-input');
  if (paletteInput) {
    paletteInput.addEventListener('input', e => {
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

  const numStars = Math.min(80, Math.floor((width * height) / 16000));
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
