/**
 * CODEORBIT — SHARED HELPERS
 * Escaping, dates (always LOCAL calendar days), the words people see for stored
 * values, the progress score, and the badge sound. Pure functions, unit-tested
 * in tests/utils.test.js.
 */

/** Goals used when settings have none (a new user starts with these too). */
export const DEFAULT_DAILY_HOURS = 2;
export const DEFAULT_WEEKLY_HOURS = 10;

/** Stored skill name for study time not tied to one of your skills. */
export const GENERAL_SKILL = 'General Exploration';

/**
 * Escapes unsafe characters from strings to prevent XSS.
 * @param {string} str - Raw input string
 * @returns {string} Sanitized HTML-safe string
 */
export function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * A link that is safe to put in href: only http:// and https:// pass.
 * escapeHTML() alone is not enough for links: "javascript:..." contains nothing
 * to escape but runs code when clicked (e.g. from a shared backup file).
 * @param {string} url
 * @returns {string} the trimmed url, or '' when it is not http(s)
 */
export function safeUrl(url) {
  if (typeof url !== 'string') return '';
  const u = url.trim();
  return /^https?:\/\/[^\s]+$/i.test(u) ? u : '';
}

/* --------------------------------------------------------------------------
   Words people see for stored values. Saved data keeps the original values
   (old backups must keep working); only the label changes. See D-022.
   -------------------------------------------------------------------------- */

/** Skill status: 'Not Started' | 'Learning' | 'Practicing' | 'Completed' */
export function statusLabel(status) {
  if (status === 'Completed') return 'Finished';
  if (status === 'Practicing') return 'Practising';
  if (status === 'Not Started') return 'Not started';
  return status || 'Learning';
}

/** Project status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' */
export function projectStatusLabel(status) {
  if (status === 'Completed') return 'Finished';
  if (status === 'On Hold') return 'Paused';
  if (status === 'In Progress') return 'In progress';
  return status || 'Planning';
}

/** Study session type, e.g. 'Practice Problems' */
export function typeLabel(type) {
  if (type === 'Practice Problems') return 'Practice problems';
  if (type === 'Project Development') return 'Project work';
  return type || 'Other';
}

/** The skill a study session belongs to ('General Exploration' reads as 'General'). */
export function skillLabel(name) {
  if (!name || name === GENERAL_SKILL) return 'General';
  return name;
}

/**
 * Generates a unique identifier.
 * @param {string} prefix - Optional prefix (e.g., 'sk_', 'act_')
 * @returns {string} Unique string ID
 */
export function generateId(prefix = 'id_') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return prefix + crypto.randomUUID().slice(0, 8);
  }
  return prefix + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * Gets a local date in YYYY-MM-DD format offset by a number of days.
 * @param {number} offsetDays - Relative day offset (e.g. 0 for today, -1 for yesterday)
 * @returns {string} YYYY-MM-DD
 */
export function getRelativeISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toLocalISO(d);
}

/**
 * Formats a Date as YYYY-MM-DD in the user's LOCAL timezone.
 * Never use date.toISOString().slice(0, 10) for calendar days: that is UTC
 * and shifts the day for users east or west of Greenwich (e.g. India, UTC+5:30).
 * @param {Date} date
 * @returns {string} YYYY-MM-DD
 */
export function toLocalISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * The last N local calendar days, today first.
 * This is THE definition of "last 7 days" / "last 30 days" used across the app.
 * @param {number} n
 * @returns {string[]} e.g. ['2026-11-07', '2026-11-06', ...]
 */
export function getLastNDaysISO(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    days.push(getRelativeISO(-i));
  }
  return days;
}

/**
 * Whether an activity date (YYYY-MM-DD or full ISO string) falls within the
 * last N local calendar days, including today.
 * @param {string} dateStr
 * @param {number} n
 * @returns {boolean}
 */
export function isWithinLastNDays(dateStr, n) {
  if (!dateStr) return false;
  const day = dateStr.slice(0, 10);
  return day <= getTodayISO() && day >= getRelativeISO(-(n - 1));
}

/**
 * Gets the current date in YYYY-MM-DD format (local time).
 * @returns {string} ISO Date string
 */
export function getTodayISO() {
  return getRelativeISO(0);
}

/**
 * The weekday with the highest total focused minutes, e.g. 'Saturday'.
 * Plain YYYY-MM-DD dates are parsed as LOCAL midnight: `new Date('2026-11-07')`
 * alone is UTC midnight, which is still the previous day west of UTC and
 * shifts every weekday count by one (the same trap toLocalISO documents above).
 * @param {Array<{date?: string, duration?: number}>} activities
 * @returns {string} The peak weekday name, or 'Weekday' when no session has minutes.
 */
export function peakWeekday(activities = []) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun..Sat
  for (const a of activities) {
    if (!a || !a.date) continue;
    const d = new Date(a.date.slice(0, 10) + 'T00:00:00');
    if (Number.isNaN(d.getTime())) continue;
    dayCounts[d.getDay()] += Number(a.duration) || 0;
  }
  if (!dayCounts.some(mins => mins > 0)) return 'Weekday';
  return dayNames[dayCounts.indexOf(Math.max(...dayCounts))];
}

/**
 * Formats an ISO date string into a friendly localized format.
 * Example: '2026-11-07' -> 'Nov 7, 2026'
 * @param {string} dateStr - Date string
 * @param {boolean} includeWeekday - Include weekday name
 * @returns {string} Formatted date, 'N/A' when empty, or 'Invalid date' (never the raw input)
 */
export function formatDate(dateStr, includeWeekday = false) {
  if (!dateStr || typeof dateStr !== 'string') return 'N/A';
  try {
    const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
    // Never return the input itself: callers insert the result into innerHTML,
    // so an invalid "date" from an imported file must not reach the page as HTML.
    if (isNaN(d.getTime())) return 'Invalid date';

    const options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    if (includeWeekday) options.weekday = 'short';
    return d.toLocaleDateString('en-US', options);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Formats relative time (e.g. "Today", "Yesterday", "3 days ago")
 * @param {string} dateStr - ISO date string
 * @returns {string} Relative string
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const cleanDate = typeof dateStr === 'string' ? dateStr.slice(0, 10) : '';
  const today = getTodayISO();
  if (cleanDate === today) return 'Today';

  const d = new Date(cleanDate + 'T00:00:00');
  const now = new Date(today + 'T00:00:00');
  const diffDays = Math.round((now - d) / (1000 * 60 * 60 * 24));

  if (isNaN(diffDays)) return formatDate(dateStr);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  if (diffDays >= 7 && diffDays < 14) return '1 week ago';
  if (diffDays < 0) {
    const futureDays = Math.abs(diffDays);
    if (futureDays === 1) return 'Tomorrow';
    return `In ${futureDays} days`;
  }
  return formatDate(dateStr);
}

/**
 * Formats duration in minutes into a human-friendly string (e.g. "1h 45m" or "45m")
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export function formatDuration(minutes) {
  const m = Number(minutes) || 0;
  if (m < 60) return `${m}m`;
  const hrs = Math.floor(m / 60);
  const remainingMins = m % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
}

/**
 * The "days in a row" line on Home.
 * When yesterday counted but today has nothing yet, the run is at risk: say so,
 * because that is the moment a nudge can still save it.
 * @param {number} currentStreak - from calculateStreak()
 * @param {boolean} studiedToday
 * @returns {{ text: string, atRisk: boolean }}
 */
export function streakMessage(currentStreak, studiedToday) {
  const n = Number(currentStreak) || 0;
  if (n >= 1 && !studiedToday) {
    return {
      text:
        n === 1
          ? 'Study today to make it 2 days in a row.'
          : `Study today to keep your ${n} days in a row going.`,
      atRisk: true
    };
  }
  if (n >= 2) return { text: `You studied ${n} days in a row.`, atRisk: false };
  if (n === 1) return { text: 'Study again tomorrow to make it 2 days in a row.', atRisk: false };
  return { text: 'Add study time today to start counting days in a row.', atRisk: false };
}

/**
 * Whether Home should remind the user to download a backup.
 * Data lives only in this browser, so clearing it or switching devices loses
 * everything. Remind when there is real data worth losing (3+ sessions, not the
 * sample data) and no backup in the last 30 days, unless snoozed.
 * @param {{ lastBackupAt?: string, backupSnoozeUntil?: string, sampleData?: boolean }} settings
 * @param {number} sessionCount
 * @param {Date} [now]
 * @returns {null | { daysSince: number | null }} null = no reminder; daysSince null = never backed up
 */
export function backupReminder(settings = {}, sessionCount = 0, now = new Date()) {
  if (settings.sampleData || sessionCount < 3) return null;
  const snooze = Date.parse(settings.backupSnoozeUntil || '');
  if (!Number.isNaN(snooze) && snooze > now.getTime()) return null;
  const last = Date.parse(settings.lastBackupAt || '');
  if (Number.isNaN(last)) return { daysSince: null };
  const daysSince = Math.floor((now.getTime() - last) / 86400000);
  return daysSince >= 30 ? { daysSince } : null;
}

/**
 * Numbers for "Your week in review": the Monday–Sunday week that ended on the
 * most recent Sunday (today, if today is Sunday), compared with the week before.
 * All dates are LOCAL calendar days (see toLocalISO).
 * @param {Array<{date?: string, duration?: number, skill?: string}>} activities
 * @param {Date} [now]
 * @returns {{ start: string, end: string, minutes: number, prevMinutes: number,
 *   sessions: number, activeDays: number,
 *   bestDay: null | { date: string, minutes: number },
 *   topSkill: null | { name: string, minutes: number } }}
 */
export function weeklyRecap(activities = [], now = new Date()) {
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const sinceSunday = day.getDay(); // 0 = Sunday
  const end = new Date(day);
  end.setDate(day.getDate() - sinceSunday);
  const dayISO = offset => {
    const d = new Date(end);
    d.setDate(end.getDate() + offset);
    return toLocalISO(d);
  };
  const week = Array.from({ length: 7 }, (_, i) => dayISO(i - 6)); // Mon..Sun
  const prevStart = dayISO(-13);
  const prevEnd = dayISO(-7);

  const byDay = Object.fromEntries(week.map(d => [d, 0]));
  const bySkill = new Map();
  let minutes = 0;
  let prevMinutes = 0;
  let sessions = 0;

  for (const a of activities) {
    const d = a && typeof a.date === 'string' ? a.date.slice(0, 10) : '';
    const mins = Number(a && a.duration) || 0;
    if (Object.hasOwn(byDay, d)) {
      byDay[d] += mins;
      minutes += mins;
      sessions += 1;
      const name = (a.skill || 'Other').toString();
      bySkill.set(name, (bySkill.get(name) || 0) + mins);
    } else if (d >= prevStart && d <= prevEnd) {
      prevMinutes += mins;
    }
  }

  let bestDay = null;
  for (const d of week) {
    if (byDay[d] > 0 && (!bestDay || byDay[d] > bestDay.minutes)) {
      bestDay = { date: d, minutes: byDay[d] };
    }
  }
  let topSkill = null;
  for (const [name, mins] of bySkill) {
    if (!topSkill || mins > topSkill.minutes) topSkill = { name, minutes: mins };
  }

  return {
    start: week[0],
    end: week[6],
    minutes,
    prevMinutes,
    sessions,
    activeDays: week.filter(d => byDay[d] > 0).length,
    bestDay,
    topSkill
  };
}

/**
 * Days in a row: the current run of days with study time, and the longest ever.
 * The current run still counts when today has nothing yet but yesterday does.
 * @param {Array} activities - List of activity records with .date field
 * @returns {{ currentStreak: number, longestStreak: number }}
 */
export function calculateStreak(activities = []) {
  if (!activities || activities.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Extract unique sorted dates (descending)
  const uniqueDates = Array.from(new Set(activities.map(a => a.date && a.date.slice(0, 10))))
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a));

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = getTodayISO();
  const yesterday = getRelativeISO(-1);

  // Check if active today or yesterday
  const hasToday = uniqueDates.includes(today);
  const hasYesterday = uniqueDates.includes(yesterday);

  let currentStreak = 0;
  if (hasToday || hasYesterday) {
    const checkDate = new Date();
    if (!hasToday) checkDate.setDate(checkDate.getDate() - 1);

    while (true) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate all-time longest streak
  const chronologicalDates = [...uniqueDates].sort((a, b) => new Date(a) - new Date(b));
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dStr of chronologicalDates) {
    const curDate = new Date(dStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((curDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevDate = curDate;
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  return {
    currentStreak: Math.max(currentStreak, 0),
    longestStreak: Math.max(longestStreak, currentStreak)
  };
}

/**
 * The progress score, 0 to 100, shown on the Progress page. Four parts
 * (the names people see are in brackets; the breakdown keys stay the same):
 * - consistency (Studying often): days with study time in the last 7, up to 30
 * - learningHours (Weekly goal): hours in the last 7 days vs the weekly goal, up to 30
 * - projects (Projects): average % of your projects, up to 20
 * - skills (Skills): average % of your skills, up to 20
 *
 * @param {Object} data - { activities, skills, projects, settings }
 * @returns {{ score: number, level: string, breakdown: Object }}
 */
export function calculateProgressScore({
  activities = [],
  skills = [],
  projects = [],
  settings = {}
}) {
  const weeklyTargetHours = Math.max(1, Number(settings.weeklyTargetHours) || DEFAULT_WEEKLY_HOURS);

  // 1. Studying often: how many of the last 7 days had study time? (max 30)
  const last7Days = getLastNDaysISO(7);
  const activeDaysLast7 = last7Days.filter(day =>
    activities.some(a => a.date && a.date.slice(0, 10) === day)
  ).length;
  const consistencyScore = Math.round((activeDaysLast7 / 7) * 30);

  // 2. Weekly goal: hours in the last 7 days vs the goal (max 30)
  const weeklyMinutes = activities
    .filter(a => isWithinLastNDays(a.date, 7))
    .reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const weeklyHours = weeklyMinutes / 60;
  const hoursScore = Math.min(30, Math.round((weeklyHours / weeklyTargetHours) * 30));

  // Projects and skills give a neutral 10/20 when the user has none, so people who
  // don't track projects aren't punished. That baseline is only earned once the user
  // has added at least one study session: with nothing saved the score is 0, not 20. (D-015)
  const neutralBaseline = activities.length > 0 ? 10 : 0;

  // 3. Projects (max 20)
  let projectScore;
  if (projects.length > 0) {
    const avgProjectProg =
      projects.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / projects.length;
    projectScore = Math.round((avgProjectProg / 100) * 20);
  } else {
    projectScore = neutralBaseline;
  }

  // 4. Skills (max 20)
  let skillScore;
  if (skills.length > 0) {
    const avgSkillProg =
      skills.reduce((sum, s) => sum + (Number(s.progress) || 0), 0) / skills.length;
    skillScore = Math.round((avgSkillProg / 100) * 20);
  } else {
    skillScore = neutralBaseline;
  }

  const totalScore = Math.min(
    100,
    Math.max(0, consistencyScore + hoursScore + projectScore + skillScore)
  );

  let level = 'Just beginning';
  if (totalScore >= 85) level = 'Excellent';
  else if (totalScore >= 70) level = 'Very good';
  else if (totalScore >= 50) level = 'Good';
  else if (totalScore >= 30) level = 'Getting started';

  return {
    score: totalScore,
    level,
    breakdown: {
      consistency: { points: consistencyScore, max: 30, activeDays: activeDaysLast7 },
      learningHours: {
        points: hoursScore,
        max: 30,
        currentHours: Math.round(weeklyHours * 10) / 10,
        targetHours: weeklyTargetHours
      },
      projects: { points: projectScore, max: 20, count: projects.length },
      skills: { points: skillScore, max: 20, count: skills.length }
    }
  };
}

/**
 * The one sound CodeOrbit makes: a short chime when you earn a badge.
 * Made with the Web Audio API (no sound files). Off when Settings → Sounds is
 * off: app.js copies settings.soundEnabled into `enabled` at startup and after
 * every change.
 */
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (
      !this.ctx &&
      typeof window !== 'undefined' &&
      (window.AudioContext || window.webkitAudioContext)
    ) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playTone(freq, type, duration, delay = 0) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      }, delay * 1000);
    } catch {
      // Audio not supported or blocked by browser policy
    }
  }

  // Badge earned
  achievement() {
    this.playTone(440, 'triangle', 0.2, 0); // A4
    this.playTone(554.37, 'triangle', 0.2, 0.1); // C#5
    this.playTone(659.25, 'triangle', 0.2, 0.2); // E5
    this.playTone(880, 'sine', 0.5, 0.3); // A5
  }
}

export const sounds = new SoundEffects();
