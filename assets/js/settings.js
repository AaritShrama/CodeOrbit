/**
 * CODEORBIT — SETTINGS PAGE
 * Profile and profile picture, study goals and sounds, and "Your data":
 * download / restore a backup, load sample data, delete everything, install.
 */

import { storage } from './storage.js';
import { getTodayISO, DEFAULT_DAILY_HOURS, DEFAULT_WEEKLY_HOURS } from './utils.js';
import { toast, showConfirmDialog } from './components.js';

export function initSettings() {
  setupSettingsEventListeners();
  // The profile picture in the top bar is on every page, so fill it now.
  // The settings form itself is filled by renderSettings() when the page is opened.
  updateTopbarProfile(storage.getProfile());
}

function setupSettingsEventListeners() {
  // Section buttons at the top: scroll to the section and outline it briefly
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
        targetEl.style.borderColor = 'var(--text-primary)';
        setTimeout(() => {
          targetEl.style.borderColor = '';
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

  // Profile picture choices
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
      updateTopbarAvatar(avatarVal);
    });
  });

  // Download backup
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', downloadBackup);
  }

  // Restore from backup (hidden file input)
  const importFileInput = document.getElementById('import-file-input');
  const importTriggerBtn = document.getElementById('import-data-btn');
  if (importTriggerBtn && importFileInput) {
    importTriggerBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', handleImportFile);
  }

  // "Install CodeOrbit on this device": only browsers that support it fire this event.
  let installPrompt = null;
  const installBtn = document.getElementById('install-app-btn');
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); // show our own button instead of the browser's mini bar
    installPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    if (installBtn) installBtn.hidden = true;
    toast.success('Installed', 'CodeOrbit is now on this device, and it works offline.');
  });
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!installPrompt) return;
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      installBtn.hidden = true;
    });
  }

  // Load sample data
  const loadSampleBtn = document.getElementById('load-sample-data-btn');
  if (loadSampleBtn) {
    loadSampleBtn.addEventListener('click', () => {
      showConfirmDialog({
        title: 'Load sample data?',
        message:
          'This replaces everything you have saved with sample data, so you can try CodeOrbit out. Download a backup first if you want to keep your own data.',
        confirmText: 'Load sample data',
        confirmClass: 'btn-primary',
        onConfirm: () => {
          storage.loadSampleData();
          renderSettings();
          toast.success('Sample data loaded', 'You can delete it any time from this page.');
        }
      });
    });
  }

  // Delete all my data
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

  // Profile
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

  // Show which profile picture is chosen
  document.querySelectorAll('.avatar-option-btn').forEach(btn => {
    if (btn.getAttribute('data-avatar') === (profile.avatar || 'astronaut')) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });

  // Preferences
  const dailyTargetInput = document.getElementById('settings-daily-target');
  const weeklyTargetInput = document.getElementById('settings-weekly-target');
  const soundCheckbox = document.getElementById('settings-sound-enabled');

  if (dailyTargetInput) dailyTargetInput.value = settings.dailyTargetHours || DEFAULT_DAILY_HOURS;
  if (weeklyTargetInput)
    weeklyTargetInput.value = settings.weeklyTargetHours || DEFAULT_WEEKLY_HOURS;
  if (soundCheckbox) soundCheckbox.checked = settings.soundEnabled !== false;

  updateTopbarProfile(profile);
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
  updateTopbarProfile(updatedProfile);
  toast.success('Saved', 'Your profile was updated.');
}

function handlePreferencesSubmit(e) {
  e.preventDefault();

  const dailyTargetHours =
    parseFloat(document.getElementById('settings-daily-target').value) || DEFAULT_DAILY_HOURS;
  const weeklyTargetHours =
    parseFloat(document.getElementById('settings-weekly-target').value) || DEFAULT_WEEKLY_HOURS;
  const soundEnabled = document.getElementById('settings-sound-enabled').checked;

  const newSettings = {
    dailyTargetHours,
    weeklyTargetHours,
    soundEnabled
  };

  storage.saveSettings(newSettings);
  toast.success('Saved', 'Your preferences were updated.');
}

/** The profile picture in the top bar (and the name screen readers hear on it). */
function updateTopbarProfile(profile) {
  const nameEl = document.getElementById('topbar-user-name');
  if (nameEl) nameEl.textContent = profile.name || 'Developer';

  updateTopbarAvatar(profile.avatar || 'astronaut');
}

function updateTopbarAvatar(avatarKey) {
  const avatarImg = document.getElementById('topbar-avatar');
  if (avatarImg) {
    avatarImg.innerHTML = getAvatarSvg(avatarKey);
  }
}

/** Profile pictures. The keys are stored in saved data; the names people see are in index.html. */
function getAvatarSvg(avatarKey) {
  switch (avatarKey) {
    case 'robot':
      return `<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none"><rect width="40" height="40" rx="20" style="fill: var(--avatar-bg)"/><rect x="11" y="13" width="18" height="15" rx="3" fill="#B9B9BE"/><circle cx="16" cy="20" r="2.5" fill="#FF4D6A"/><circle cx="24" cy="20" r="2.5" fill="#FF4D6A"/><path d="M16 24h8" stroke="#FFFFFF" stroke-width="1.5"/><line x1="20" y1="13" x2="20" y2="8" stroke="#FF4D6A" stroke-width="2"/><circle cx="20" cy="7" r="2" fill="#B8002F"/></svg>`;
    case 'cyberpunk':
      return `<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none"><rect width="40" height="40" rx="20" style="fill: var(--avatar-bg)"/><circle cx="20" cy="20" r="14" fill="#4A4A52"/><path d="M10 20h20" stroke="#FF4D6A" stroke-width="3"/><rect x="13" y="17" width="14" height="6" rx="2" fill="#B8002F"/><circle cx="17" cy="20" r="1.5" fill="#FFFFFF"/><circle cx="23" cy="20" r="1.5" fill="#FFFFFF"/></svg>`;
    case 'nebula':
      return `<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none"><rect width="40" height="40" rx="20" style="fill: var(--avatar-bg)"/><circle cx="20" cy="20" r="13" fill="url(#nebulaG)"/><defs><radialGradient id="nebulaG"><stop offset="0%" stop-color="#FF4D6A"/><stop offset="60%" stop-color="#8F8F95"/><stop offset="100%" stop-color="#2C2C31"/></radialGradient></defs><circle cx="23" cy="17" r="2" fill="#FFFFFF"/><circle cx="16" cy="23" r="1.5" fill="#FFFFFF"/></svg>`;
    case 'satellite':
      return `<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none"><rect width="40" height="40" rx="20" style="fill: var(--avatar-bg)"/><rect x="16" y="16" width="8" height="8" rx="1" fill="#FF4D6A"/><rect x="8" y="17" width="6" height="6" fill="#B8002F"/><rect x="26" y="17" width="6" height="6" fill="#B8002F"/><line x1="14" y1="20" x2="16" y2="20" stroke="#FFFFFF"/><line x1="24" y1="20" x2="26" y2="20" stroke="#FFFFFF"/></svg>`;
    case 'core':
      return `<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none"><rect width="40" height="40" rx="20" style="fill: var(--avatar-bg)"/><circle cx="20" cy="20" r="12" fill="#B8002F"/><circle cx="20" cy="20" r="7" fill="#F5F5F4"/><circle cx="20" cy="20" r="3" fill="#FFFFFF"/></svg>`;
    default: // 'astronaut'
      return `<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none"><rect width="40" height="40" rx="20" style="fill: var(--avatar-bg)"/><circle cx="20" cy="20" r="13" fill="#F5F5F4"/><rect x="13" y="15" width="14" height="9" rx="4" fill="#0A0A0B"/><path d="M15 17c1-1.5 4-2 7 0" stroke="#FF4D6A" stroke-width="1.5"/><circle cx="20" cy="31" r="2" fill="#FF4D6A"/></svg>`;
  }
}

/** Downloads a backup file and remembers when, for the reminder on Home. */
export function downloadBackup() {
  handleExportJSON();
  storage.saveSettings({ lastBackupAt: new Date().toISOString(), backupSnoozeUntil: '' });
}

function handleExportJSON() {
  const jsonStr = storage.exportJSON();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `codeorbit-backup-${getTodayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success(
    'Backup downloaded',
    'Keep the file somewhere safe. To bring it back: Settings → Your data → Restore from backup.'
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
