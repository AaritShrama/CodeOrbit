/**
 * CODEORBIT — SETTINGS & DATA MANAGEMENT MODULE
 * Profile editing, avatar presets, theme toggles, JSON backup/restore, and data reset.
 */

import { storage } from './storage.js';
import { getTodayISO } from './utils.js';
import { toast, showConfirmDialog } from './components.js';

export function initSettings() {
  setupSettingsEventListeners();
  // The sidebar profile card is visible on every page, so fill it now.
  // The settings form itself is filled by renderSettings() when the page is opened.
  updateSidebarProfile(storage.getProfile());
}

function setupSettingsEventListeners() {
  // Section Navigation Bar
  document.querySelectorAll('#settings-nav-bar .settings-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('#settings-nav-bar .settings-nav-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        targetEl.style.borderColor = 'var(--cyan-accent)';
        targetEl.style.boxShadow = '0 0 25px var(--cyan-glow)';
        setTimeout(() => {
          targetEl.style.borderColor = '';
          targetEl.style.boxShadow = '';
        }, 1400);
      }
    });
  });

  // Profile Form
  const profileForm = document.getElementById('settings-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileSubmit);
  }

  // Preferences Form
  const prefForm = document.getElementById('settings-preferences-form');
  if (prefForm) {
    prefForm.addEventListener('submit', handlePreferencesSubmit);
  }

  // Theme selector in settings
  const themeSelect = document.getElementById('settings-theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', e => {
      applyTheme(e.target.value);
    });
  }

  // Topbar theme toggle button
  const topbarThemeBtn = document.getElementById('topbar-theme-toggle');
  if (topbarThemeBtn) {
    topbarThemeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      if (themeSelect) themeSelect.value = next;
    });
  }

  // Avatar preset options
  document.querySelectorAll('.avatar-option-btn').forEach(btn => {
    btn.innerHTML = getAvatarSvg(btn.getAttribute('data-avatar'));
    btn.setAttribute('aria-label', btn.getAttribute('title') || 'Profile picture');
  });
  document.querySelectorAll('.avatar-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.avatar-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const avatarVal = btn.getAttribute('data-avatar');
      const hiddenInput = document.getElementById('settings-avatar-input');
      if (hiddenInput) hiddenInput.value = avatarVal;
      updateSidebarAvatar(avatarVal);
    });
  });

  // Export JSON
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExportJSON);
  }

  // Import JSON File input
  const importFileInput = document.getElementById('import-file-input');
  const importTriggerBtn = document.getElementById('import-data-btn');
  if (importTriggerBtn && importFileInput) {
    importTriggerBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', handleImportFile);
  }

  // Load Demo Data
  const loadDemoBtn = document.getElementById('load-demo-data-btn');
  if (loadDemoBtn) {
    loadDemoBtn.addEventListener('click', () => {
      showConfirmDialog({
        title: 'Load sample data?',
        message:
          'This replaces everything you have saved with sample data, so you can try CodeOrbit out. Download a backup first if you want to keep your own data.',
        confirmText: 'Load sample data',
        confirmClass: 'btn-primary',
        onConfirm: () => {
          storage.loadDemoUniverse();
          renderSettings();
          toast.success('Sample data loaded', 'You can delete it any time from this page.');
        }
      });
    });
  }

  // Reset Application Data
  const resetBtn = document.getElementById('reset-data-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      showConfirmDialog({
        title: 'Delete all your data?',
        message:
          'This deletes all your skills, study sessions, projects and goals from this device. It cannot be undone. Download a backup first if you might want them back.',
        confirmText: 'Delete everything',
        confirmClass: 'btn-danger',
        onConfirm: () => {
          storage.resetAllData();
          renderSettings();
          toast.warning('All data deleted', 'CodeOrbit is empty again.');
        }
      });
    });
  }
}

export function renderSettings() {
  const profile = storage.getProfile();
  const settings = storage.getSettings();

  // Populate Profile Inputs
  const nameInput = document.getElementById('settings-name-input');
  const titleInput = document.getElementById('settings-title-input');
  const bioInput = document.getElementById('settings-bio-input');
  const githubInput = document.getElementById('settings-github-input');
  const avatarInput = document.getElementById('settings-avatar-input');

  if (nameInput) nameInput.value = profile.name || '';
  if (titleInput) titleInput.value = profile.title || '';
  if (bioInput) bioInput.value = profile.bio || '';
  if (githubInput) githubInput.value = profile.github || '';
  if (avatarInput) avatarInput.value = profile.avatar || 'astronaut';

  // Highlight selected avatar preset
  document.querySelectorAll('.avatar-option-btn').forEach(btn => {
    if (btn.getAttribute('data-avatar') === (profile.avatar || 'astronaut')) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });

  // Populate Preferences Inputs
  const themeSelect = document.getElementById('settings-theme-select');
  const dailyTargetInput = document.getElementById('settings-daily-target');
  const weeklyTargetInput = document.getElementById('settings-weekly-target');
  const soundCheckbox = document.getElementById('settings-sound-enabled');

  if (themeSelect) themeSelect.value = settings.theme || 'dark';
  if (dailyTargetInput) dailyTargetInput.value = settings.dailyTargetHours || 2;
  if (weeklyTargetInput) weeklyTargetInput.value = settings.weeklyTargetHours || 12;
  if (soundCheckbox) soundCheckbox.checked = settings.soundEnabled !== false;

  // Apply initial theme
  applyTheme(settings.theme || 'dark', false);

  // Update sidebar profile card
  updateSidebarProfile(profile);
}

function handleProfileSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('settings-name-input').value.trim();
  const title = document.getElementById('settings-title-input').value.trim();
  const bio = document.getElementById('settings-bio-input').value.trim();
  const github = document.getElementById('settings-github-input').value.trim();
  const avatar = document.getElementById('settings-avatar-input').value || 'astronaut';

  if (!name) {
    toast.error('Missing information', 'Please enter your name.');
    return;
  }

  const updatedProfile = { name, title, bio, github, avatar };
  storage.saveProfile(updatedProfile);
  updateSidebarProfile(updatedProfile);
  toast.success('Saved', 'Your profile was updated.');
}

function handlePreferencesSubmit(e) {
  e.preventDefault();

  const theme = document.getElementById('settings-theme-select').value;
  const dailyTargetHours = parseFloat(document.getElementById('settings-daily-target').value) || 2;
  const weeklyTargetHours =
    parseFloat(document.getElementById('settings-weekly-target').value) || 10;
  const soundEnabled = document.getElementById('settings-sound-enabled').checked;

  const newSettings = {
    theme,
    dailyTargetHours,
    weeklyTargetHours,
    soundEnabled
  };

  storage.saveSettings(newSettings);
  applyTheme(theme, false); // theme is already in newSettings; saving again would run the data-change loop twice
  toast.success('Saved', 'Your preferences were updated.');
}

export function applyTheme(themeName, save = true) {
  if (themeName === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  // Update topbar theme button icon
  const topbarThemeBtn = document.getElementById('topbar-theme-toggle');
  if (topbarThemeBtn) {
    topbarThemeBtn.innerHTML =
      themeName === 'light'
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`;
  }

  if (save) {
    storage.saveSettings({ theme: themeName });
  }
}

function updateSidebarProfile(profile) {
  const nameEl = document.getElementById('sidebar-user-name');
  const levelEl = document.getElementById('sidebar-user-level');
  if (nameEl) nameEl.textContent = profile.name || 'Developer';
  if (levelEl) levelEl.textContent = profile.title || '';

  updateSidebarAvatar(profile.avatar || 'astronaut');
}

function updateSidebarAvatar(avatarKey) {
  const avatarImg = document.getElementById('sidebar-avatar-img');
  if (avatarImg) {
    avatarImg.innerHTML = getAvatarSvg(avatarKey);
  }
}

export function getAvatarSvg(avatarKey) {
  switch (avatarKey) {
    case 'robot':
      return `<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none"><rect width="40" height="40" rx="20" fill="#121214"/><rect x="11" y="13" width="18" height="15" rx="3" fill="#B9B9BE"/><circle cx="16" cy="20" r="2.5" fill="#FF4D6A"/><circle cx="24" cy="20" r="2.5" fill="#FF4D6A"/><path d="M16 24h8" stroke="#FFFFFF" stroke-width="1.5"/><line x1="20" y1="13" x2="20" y2="8" stroke="#FF4D6A" stroke-width="2"/><circle cx="20" cy="7" r="2" fill="#B8002F"/></svg>`;
    case 'cyberpunk':
      return `<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none"><rect width="40" height="40" rx="20" fill="#121214"/><circle cx="20" cy="20" r="14" fill="#4A4A52"/><path d="M10 20h20" stroke="#FF4D6A" stroke-width="3"/><rect x="13" y="17" width="14" height="6" rx="2" fill="#B8002F"/><circle cx="17" cy="20" r="1.5" fill="#FFFFFF"/><circle cx="23" cy="20" r="1.5" fill="#FFFFFF"/></svg>`;
    case 'nebula':
      return `<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none"><rect width="40" height="40" rx="20" fill="#121214"/><circle cx="20" cy="20" r="13" fill="url(#nebulaG)"/><defs><radialGradient id="nebulaG"><stop offset="0%" stop-color="#FF4D6A"/><stop offset="60%" stop-color="#8F8F95"/><stop offset="100%" stop-color="#2C2C31"/></radialGradient></defs><circle cx="23" cy="17" r="2" fill="#FFFFFF"/><circle cx="16" cy="23" r="1.5" fill="#FFFFFF"/></svg>`;
    case 'satellite':
      return `<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none"><rect width="40" height="40" rx="20" fill="#121214"/><rect x="16" y="16" width="8" height="8" rx="1" fill="#FF4D6A"/><rect x="8" y="17" width="6" height="6" fill="#B8002F"/><rect x="26" y="17" width="6" height="6" fill="#B8002F"/><line x1="14" y1="20" x2="16" y2="20" stroke="#FFFFFF"/><line x1="24" y1="20" x2="26" y2="20" stroke="#FFFFFF"/></svg>`;
    case 'core':
      return `<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none"><rect width="40" height="40" rx="20" fill="#121214"/><circle cx="20" cy="20" r="12" fill="#B8002F"/><circle cx="20" cy="20" r="7" fill="#F5F5F4"/><circle cx="20" cy="20" r="3" fill="#FFFFFF"/></svg>`;
    default: // 'astronaut'
      return `<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none"><rect width="40" height="40" rx="20" fill="#121214"/><circle cx="20" cy="20" r="13" fill="#F5F5F4"/><rect x="13" y="15" width="14" height="9" rx="4" fill="#0A0A0B"/><path d="M15 17c1-1.5 4-2 7 0" stroke="#FF4D6A" stroke-width="1.5"/><circle cx="20" cy="31" r="2" fill="#FF4D6A"/></svg>`;
  }
}

function handleExportJSON() {
  const jsonStr = storage.exportJSON();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `codeorbit-universe-${getTodayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success(
    'Backup downloaded',
    'Keep the file somewhere safe. You can restore it from this page.'
  );
}

function handleImportFile(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = event => {
    const content = event.target.result;
    showConfirmDialog({
      title: 'Restore from this backup?',
      message: `Everything you have saved now will be replaced with what is in "${file.name}".`,
      confirmText: 'Restore',
      confirmClass: 'btn-primary',
      onConfirm: () => {
        const result = storage.importJSON(content);
        if (result.success) {
          renderSettings();
          toast.success('Backup restored', 'Your data is back.');
        } else {
          toast.error('Could not restore', result.error || 'That file is not a CodeOrbit backup.');
        }
      }
    });
  };
  reader.onerror = () => {
    toast.error('Could not open the file', 'Please try again, or pick a different file.');
  };
  reader.readAsText(file);
  // Reset input so same file can be selected again
  e.target.value = '';
}
