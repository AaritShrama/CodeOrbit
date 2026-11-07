/**
 * CODEORBIT — START-UP
 * Runs each start-up step on its own (one failing step cannot stop the rest),
 * owns the single data-changed listener, the keyboard shortcuts, the starfield
 * and offline support. Made by Let's Cook.
 */

import { navigation } from './navigation.js';
import {
  setupModalDismissHandlers,
  openCommandPalette,
  renderPaletteResults,
  toast
} from './components.js';
import { sounds } from './utils.js';
import { storage } from './storage.js';
import { initDashboard, renderDashboard } from './dashboard.js';
import { initSkills, renderSkills } from './skills.js';
import { initProgress, renderProgress } from './progress.js';
import { initProjects, renderProjects } from './projects.js';
import { initGoals, renderGoals } from './goals.js';
import { initAchievements, renderAchievements, evaluateAchievements } from './achievements.js';
import { initAnalytics, renderAnalytics } from './analytics.js';
import { initSettings, renderSettings } from './settings.js';
import { initRecap } from './recap.js';

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

/** Settings → Sounds. Read again after every change, so the switch works at once. */
function syncSoundSetting() {
  sounds.enabled = storage.getSettings().soundEnabled !== false;
}

function initApp() {
  console.log('CodeOrbit is starting');
  const failures = [];

  // 1. Background starfield (purely decorative)
  runStep('starfield', initStarfield, failures);

  // 2. Dialogs (Esc / click outside to close), keyboard shortcuts, sound setting
  runStep('dialogs', setupModalDismissHandlers, failures);
  runStep('shortcuts', setupGlobalShortcuts, failures);
  runStep('sound setting', syncSoundSetting, failures);

  // 3. Offline support + install as an app (sw.js). Optional: failure only means no offline use.
  runStep('offline support', registerServiceWorker, failures);

  // 4. Register pages with the router (cannot fail, but keep the pattern uniform)
  runStep(
    'pages',
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
  runStep('badges page', initAchievements, failures);
  runStep('progress page', initAnalytics, failures);
  runStep('settings page', initSettings, failures);
  runStep('week in review', initRecap, failures);

  // 6. Unlock badges already earned (e.g. data saved by an older version) before the first render
  runStep('badge check', evaluateAchievements, failures);

  // 7. Router: renders the visible page (the ONLY startup render)
  runStep('navigation', () => navigation.init(), failures);

  // 8. The one data-change listener: every save in storage.js ends up here
  window.addEventListener('codeorbit:data-changed', e => {
    syncSoundSetting();
    // If this unlocks badges it saves, which dispatches data-changed again;
    // that nested round re-renders everything below, so stop here to avoid a double render.
    // Replacing the whole data set (sample data, restore, delete all) unlocks quietly.
    const silent = Boolean(e && e.detail && e.detail.reason === 'replace');
    if (evaluateAchievements({ silent })) return;

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
    // Ctrl+K, Cmd+K or "/" opens search
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

  // Typing in search
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
   STARFIELD (decorative; still when reduced motion is on)
   ========================================================================== */
function initStarfield() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

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

/* ==========================================================================
   OFFLINE SUPPORT (see sw.js and docs/DECISIONS.md D-024)
   ========================================================================== */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  // Service workers only run on https (GitHub Pages) or on this computer while developing.
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (location.protocol !== 'https:' && !local) return;
  navigator.serviceWorker.register('./sw.js').catch(err => {
    console.warn('CodeOrbit: offline support is not available.', err);
  });
}
