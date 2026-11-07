/**
 * CODEORBIT — HOME PAGE MODULE
 * Home answers one question: "how is my week going, and what is next?"
 *   - greeting + hours studied in the last 7 days against the weekly goal
 *   - the orbit: one planet per skill (bigger = more progress, crimson = finished)
 *   - hours studied on each of the last 7 days
 *   - "Coming up": the nearest goal, the last study session, and on Sundays and
 *     Mondays "Your week in review" (recap.js)
 *   - one-tap "+30 min" on the skill you studied last, with Undo
 *   - a backup reminder when there is real data and no recent backup (utils.backupReminder)
 * With nothing saved at all, a short getting-started screen shows instead.
 * The progress score that used to live here is on the Progress page (analytics.js).
 */

import { storage } from './storage.js';
import {
  escapeHTML,
  formatDuration,
  formatRelativeTime,
  calculateStreak,
  streakMessage,
  backupReminder,
  getLastNDaysISO,
  getTodayISO,
  isWithinLastNDays,
  DEFAULT_WEEKLY_HOURS
} from './utils.js';
import { toast } from './components.js';
import { openSkillModal } from './skills.js';
import { openActivityModal } from './progress.js';
import { downloadBackup } from './settings.js';
import { openRecap, shouldOfferRecap } from './recap.js';

const MAX_PLANETS = 12;
const QUICK_MINUTES = 30;
let lastQuickAddId = null;
let quickDoneTimer = null;

export function initDashboard() {
  // No render here: navigation.init() renders whichever page is visible.
  document.getElementById('home-add-time')?.addEventListener('click', () => openActivityModal());
  document
    .getElementById('home-add-first-skill')
    ?.addEventListener('click', () => openSkillModal());
  document.getElementById('home-quick-add')?.addEventListener('click', quickAdd);
  document.getElementById('home-quick-undo')?.addEventListener('click', undoQuickAdd);
  document.getElementById('home-backup-download')?.addEventListener('click', () => {
    downloadBackup();
  });
  document.getElementById('home-backup-snooze')?.addEventListener('click', () => {
    // Ask again in a week
    storage.saveSettings({
      backupSnoozeUntil: new Date(Date.now() + 7 * 86400000).toISOString()
    });
  });
  document.getElementById('home-load-sample')?.addEventListener('click', () => {
    // Only shown when nothing is saved yet (see isFirstVisit), so nothing is overwritten.
    storage.loadSampleData();
    toast.success(
      'Sample data loaded',
      'Have a look around. You can delete it any time in Settings.'
    );
  });
}

export function renderDashboard() {
  const data = storage.getUniverse();
  const skills = data.skills || [];
  const activities = data.activities || [];
  const goals = data.goals || [];
  const settings = data.settings || {};

  // First visit = nothing saved at all. Projects and goals count too: the
  // sample-data button replaces everything, so it must never be offered when
  // there is anything to lose (issue #13).
  const isFirstVisit =
    skills.length === 0 &&
    activities.length === 0 &&
    goals.length === 0 &&
    (data.projects || []).length === 0;
  setHidden('home-empty', !isFirstVisit);
  setHidden('home-main', isFirstVisit);
  if (isFirstVisit) return;

  renderGreeting(data.profile || {});
  renderWeek(activities, settings);
  renderQuickAdd(skills, activities);
  renderOrbit(skills);
  renderDays(activities);
  renderComingUp(goals, activities, shouldOfferRecap(data));
  renderBackupReminder(settings, activities.length);
}

function setHidden(id, hidden) {
  const el = document.getElementById(id);
  if (el) el.hidden = hidden;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/** "Good evening, Alex." and today's date. */
function renderGreeting(profile) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  setText('home-greeting-text', greeting);
  setText('hero-user-name', (profile.name || 'there').split(' ')[0]);
  setText(
    'home-date',
    new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' })
  );
}

/** Hours in the last 7 days against the weekly goal, plus the days-in-a-row line. */
function renderWeek(activities, settings) {
  const minutes = activities
    .filter(a => isWithinLastNDays(a.date, 7))
    .reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const hours = Math.round((minutes / 60) * 10) / 10;
  const target = Math.max(1, Number(settings.weeklyTargetHours) || DEFAULT_WEEKLY_HOURS);
  const pct = Math.min(100, Math.round((hours / target) * 100));

  setText('home-week-hours', String(hours));
  setText('home-week-target', `of ${target} hours`);

  const fill = document.getElementById('home-week-bar-fill');
  if (fill) fill.style.width = `${pct}%`;
  const bar = document.getElementById('home-week-bar');
  if (bar) {
    bar.setAttribute('aria-valuenow', String(pct));
    bar.setAttribute('aria-valuetext', `${hours} of ${target} hours, ${pct}%`);
  }

  const left = Math.round((target - hours) * 10) / 10;
  const goalLine =
    left > 0
      ? `${left} hours left to reach your goal.`
      : 'You reached your weekly goal. Nice work.';

  const { currentStreak } = calculateStreak(activities);
  const today = getTodayISO();
  const studiedToday = activities.some(a => a && a.date && a.date.slice(0, 10) === today);
  const streak = streakMessage(currentStreak, studiedToday);

  setText('home-week-goal', goalLine);
  setText('home-week-streak', streak.text);
  document.getElementById('home-week-streak')?.classList.toggle('is-at-risk', streak.atRisk);
}

/**
 * One planet per skill, spread over three rings. Size grows with progress;
 * finished skills are crimson. Built with DOM APIs (no innerHTML), so skill
 * names from an imported file can never become markup.
 */
function renderOrbit(skills) {
  const orbit = document.getElementById('home-orbit');
  const rings = [1, 2, 3].map(n => document.getElementById(`orbit-spin-${n}`));
  if (!orbit || rings.some(r => !r)) return;

  rings.forEach(r => r.replaceChildren());
  const shown = skills.slice(0, MAX_PLANETS);

  shown.forEach((skill, i) => {
    const ring = rings[i % 3];
    const onRing = shown.filter((_, j) => j % 3 === i % 3);
    const slot = onRing.indexOf(skill);
    const angle = (360 / onRing.length) * slot + (i % 3) * 40;
    const rad = (angle * Math.PI) / 180;

    const progress = Math.max(0, Math.min(100, Number(skill.progress) || 0));
    const done = progress >= 100 || skill.status === 'Completed';
    const size = Math.round(10 + progress * 0.2); // 10px .. 30px

    // A real button: tap on a phone, click, or Tab + Enter all show the skill.
    const planet = document.createElement('button');
    planet.type = 'button';
    planet.className = done ? 'orbit-planet is-done' : 'orbit-planet';
    planet.style.width = `${size}px`;
    planet.style.height = `${size}px`;
    // Position on the ring's edge: the ring box is a circle, 50% = its radius.
    planet.style.left = `${50 + 50 * Math.sin(rad)}%`;
    planet.style.top = `${50 - 50 * Math.cos(rad)}%`;
    planet.title = `${skill.name}: ${progress}%`;
    planet.setAttribute('aria-label', `${skill.name}, ${progress}%`);
    const show = () => showPlanet(planet, skill, progress, done);
    planet.addEventListener('click', show);
    planet.addEventListener('mouseenter', show);
    planet.addEventListener('focus', show);
    ring.appendChild(planet);
  });

  // A re-render drops the old planets, so drop the old selection too.
  setHidden('home-orbit-detail', true);
  setHidden('home-orbit-caption', false);
  setText(
    'home-orbit-caption',
    shown.length
      ? 'Each planet is one of your skills. The bigger it is, the further along you are. Red means finished.'
      : 'Add a skill and it will appear here as a planet.'
  );
}

/**
 * The skill for one-tap logging: the one you studied most recently, if it still
 * exists; otherwise your first skill. Returns null when there are no skills.
 */
function quickSkill(skills, activities) {
  const names = new Set(skills.map(s => s.name));
  const last = [...activities]
    .filter(a => a && a.date && names.has(a.skill))
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (last) return { name: last.skill, type: last.type || 'Other' };
  return skills.length ? { name: skills[0].name, type: 'Other' } : null;
}

function renderQuickAdd(skills, activities) {
  const btn = document.getElementById('home-quick-add');
  if (!btn) return;
  const pick = quickSkill(skills, activities);
  btn.hidden = !pick;
  if (!pick) return;
  // Label in a span so a long skill name is cut with "…" instead of widening the button.
  const label = document.createElement('span');
  label.className = 'btn-label';
  label.textContent = `+${QUICK_MINUTES} min on ${pick.name}`;
  btn.replaceChildren(label);
  btn.title = `Add ${QUICK_MINUTES} minutes on ${pick.name}, today`;
}

/** Adds 30 minutes, today, on the quick skill. Undo stays available for 10 seconds. */
function quickAdd() {
  const data = storage.getUniverse();
  const pick = quickSkill(data.skills || [], data.activities || []);
  if (!pick) return;

  storage.saveActivity({
    title: `Studied ${pick.name}`,
    skill: pick.name,
    duration: QUICK_MINUTES,
    type: pick.type,
    date: getTodayISO(),
    notes: ''
  });
  // saveActivity puts new sessions first
  lastQuickAddId = (storage.getUniverse().activities || [])[0]?.id || null;

  setText('home-quick-done-text', `Added ${QUICK_MINUTES} min on ${pick.name}.`);
  setHidden('home-quick-done', false);
  clearTimeout(quickDoneTimer);
  quickDoneTimer = setTimeout(() => {
    setHidden('home-quick-done', true);
    lastQuickAddId = null;
  }, 10000);
}

function undoQuickAdd() {
  if (lastQuickAddId) storage.deleteActivity(lastQuickAddId);
  lastQuickAddId = null;
  clearTimeout(quickDoneTimer);
  setHidden('home-quick-done', true);
  toast.info('Undone', `The ${QUICK_MINUTES} minutes were removed.`);
}

function renderBackupReminder(settings, sessionCount) {
  const reminder = backupReminder(settings, sessionCount);
  setHidden('home-backup', !reminder);
  if (!reminder) return;
  setText(
    'home-backup-text',
    reminder.daysSince === null
      ? 'You have never downloaded a backup.'
      : `Your last backup was ${reminder.daysSince} days ago.`
  );
}

/** Shows the chosen planet's skill under the orbit, in place of the caption. */
function showPlanet(planet, skill, progress, done) {
  document
    .querySelectorAll('.orbit-planet.is-selected')
    .forEach(p => p.classList.remove('is-selected'));
  planet.classList.add('is-selected');
  setText('orbit-detail-cat', skill.category || 'Skill');
  setText('orbit-detail-name', skill.name || 'Skill');
  setText('orbit-detail-meta', done ? 'Finished · 100%' : `${progress}% of the way there`);
  setHidden('home-orbit-caption', true);
  setHidden('home-orbit-detail', false);
}

/** Hours studied on each of the last 7 days, oldest on the left, today on the right. */
function renderDays(activities) {
  const container = document.getElementById('home-days-grid');
  if (!container) return;

  const days = getLastNDaysISO(7).reverse();
  const today = getTodayISO();
  const minutesByDay = Object.fromEntries(days.map(d => [d, 0]));
  for (const a of activities) {
    const d = a && a.date ? a.date.slice(0, 10) : '';
    if (Object.hasOwn(minutesByDay, d)) minutesByDay[d] += Number(a.duration) || 0;
  }
  const max = Math.max(60, ...Object.values(minutesByDay));

  container.innerHTML = days
    .map(d => {
      const mins = minutesByDay[d];
      const isToday = d === today;
      const name = isToday
        ? 'Today'
        : new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short' });
      const height = mins === 0 ? 0 : Math.max(6, Math.round((mins / max) * 100));
      const label = mins === 0 ? '0' : formatDuration(mins);
      return `
        <div class="day-col${isToday ? ' is-today' : ''}" role="img" aria-label="${escapeHTML(name)}: ${escapeHTML(label)}">
          <span class="day-val" aria-hidden="true">${escapeHTML(label)}</span>
          <div class="day-bar${mins === 0 ? ' is-empty' : ''}" style="height: ${height}%;" aria-hidden="true"></div>
          <span class="day-name" aria-hidden="true">${escapeHTML(name)}</span>
        </div>`;
    })
    .join('');
}

/** The nearest unfinished goal and the most recent study session. */
function renderComingUp(goals, activities, offerRecap = false) {
  const container = document.getElementById('home-next-list');
  if (!container) return;

  const rows = [];
  const today = getTodayISO();

  const nextGoal = goals
    .filter(g => g.status === 'Active')
    .sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'))[0];

  if (nextGoal) {
    rows.push({
      href: '#goals',
      kind: goalDueText(nextGoal.deadline, today),
      title: nextGoal.title,
      meta: `${Number(nextGoal.progress) || 0}% done`
    });
  } else {
    rows.push({ href: '#goals', kind: 'Goal', title: 'Set your next goal', meta: '' });
  }

  const last = [...activities]
    .filter(a => a && a.date)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (last) {
    rows.push({
      href: '#progress',
      kind: `Last studied · ${formatRelativeTime(last.date)}`,
      title: last.title || last.skill || 'Study session',
      meta: formatDuration(last.duration)
    });
  }

  // Sundays and Mondays: the week that just ended, until it has been opened once
  const recapRow = offerRecap
    ? `
      <button type="button" class="next-row" id="home-open-recap">
        <span class="next-body">
          <span class="next-kind">Your week in review</span>
          <span class="next-title">See how your week went</span>
        </span>
        <span class="next-arrow" aria-hidden="true">→</span>
      </button>`
    : '';

  container.innerHTML =
    recapRow +
    rows
      .map(
        r => `
      <a class="next-row" href="${r.href}">
        <span class="next-body">
          <span class="next-kind">${escapeHTML(r.kind)}</span>
          <span class="next-title">${escapeHTML(r.title)}</span>
        </span>
        ${r.meta ? `<span class="next-meta">${escapeHTML(r.meta)}</span>` : ''}
        <span class="next-arrow" aria-hidden="true">→</span>
      </a>`
      )
      .join('');
  document.getElementById('home-open-recap')?.addEventListener('click', () => openRecap());
}

function goalDueText(deadline, today) {
  if (!deadline) return 'Goal · no due date';
  const days = Math.round(
    (new Date(`${deadline.slice(0, 10)}T00:00:00`) - new Date(`${today}T00:00:00`)) / 86400000
  );
  if (Number.isNaN(days)) return 'Goal';
  if (days < 0) return `Goal · ${-days} day${days === -1 ? '' : 's'} late`;
  if (days === 0) return 'Goal · due today';
  return `Goal · due in ${days} day${days === 1 ? '' : 's'}`;
}
