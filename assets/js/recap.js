/**
 * CODEORBIT — "YOUR WEEK IN REVIEW"
 * A short look back at the Monday–Sunday week that just ended, plus a place to
 * set next week's goal. Offered on Home on Sundays and Mondays (until opened),
 * and always reachable from the Progress page. Numbers come from
 * utils.weeklyRecap(), which has its own tests.
 */

import { storage } from './storage.js';
import { weeklyRecap, formatDuration, skillLabel, DEFAULT_WEEKLY_HOURS } from './utils.js';
import { openModal, closeModal, toast } from './components.js';

export function initRecap() {
  document.getElementById('open-recap-btn')?.addEventListener('click', () => openRecap());
  document.getElementById('recap-goal-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const hours = parseFloat(document.getElementById('recap-goal').value);
    if (!(hours >= 1 && hours <= 80)) {
      toast.error('Check the goal', 'Please enter between 1 and 80 hours.');
      return;
    }
    storage.saveSettings({ weeklyTargetHours: hours });
    closeModal('recap-modal');
    toast.success('Goal saved', `Your goal for next week is ${hours} hours.`);
  });
}

/** Whether Home should offer the recap today: Sunday or Monday, not seen yet, and there is something to show. */
export function shouldOfferRecap(data, now = new Date()) {
  const day = now.getDay();
  if (day !== 0 && day !== 1) return false;
  const r = weeklyRecap(data.activities || [], now);
  if (r.minutes + r.prevMinutes === 0) return false;
  return (data.settings || {}).recapSeenFor !== r.end;
}

export function openRecap() {
  const data = storage.getUniverse();
  const settings = data.settings || {};
  const r = weeklyRecap(data.activities || []);
  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  set('recap-range', rangeLabel(r.start, r.end));
  set('recap-hours', String(Math.round((r.minutes / 60) * 10) / 10));
  set('recap-compare', compareLine(r.minutes, r.prevMinutes));
  set('recap-days', `${r.activeDays} of 7`);
  set(
    'recap-best',
    r.bestDay ? `${weekday(r.bestDay.date)}, ${formatDuration(r.bestDay.minutes)}` : '—'
  );
  set(
    'recap-skill',
    r.topSkill ? `${skillLabel(r.topSkill.name)}, ${formatDuration(r.topSkill.minutes)}` : '—'
  );
  set('recap-sessions', String(r.sessions));
  const goal = document.getElementById('recap-goal');
  if (goal) goal.value = String(Number(settings.weeklyTargetHours) || DEFAULT_WEEKLY_HOURS);

  openModal('recap-modal');
  // Seen: stop offering it on Home for this week.
  if (settings.recapSeenFor !== r.end) storage.saveSettings({ recapSeenFor: r.end });
}

function compareLine(minutes, prev) {
  if (minutes === 0 && prev === 0)
    return 'No study time in the last two weeks. This week is a fresh start.';
  if (prev === 0) return 'More than the week before, which had no study time. Good start.';
  const diff = minutes - prev;
  if (diff === 0) return 'The same as the week before.';
  return diff > 0
    ? `${formatDuration(diff)} more than the week before.`
    : `${formatDuration(-diff)} less than the week before. Next week is a fresh start.`;
}

function weekday(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long' });
}

function rangeLabel(start, end) {
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  const sameMonth = a.getMonth() === b.getMonth();
  const left = a.toLocaleDateString(
    'en-GB',
    sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'long' }
  );
  const right = b.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  return `${left} – ${right}`;
}
