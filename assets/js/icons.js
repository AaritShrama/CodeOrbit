/**
 * CODEORBIT — SMALL INLINE ICON SET
 * Line icons drawn as inline SVG strings, so they show up immediately after any
 * re-render (Lucide only swaps <i data-lucide> tags when createIcons() runs).
 * They replace the emoji the old design used: emoji look different on every
 * device and clash with the black/white/crimson look.
 */

const PATHS = {
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  book: '<path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>',
  target:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  play: '<polygon points="7 4 20 12 7 20 7 4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  planet:
    '<circle cx="12" cy="12" r="5"/><ellipse cx="12" cy="12" rx="10.5" ry="3.5" transform="rotate(-20 12 12)"/>',
  flame:
    '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 3-5 5-5 8a7 7 0 0 0 7 7z"/>',
  star: '<polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/>',
  trophy:
    '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  flag: '<path d="M4 22V4"/><path d="M4 4h13l-2 4 2 4H4"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  compass:
    '<circle cx="12" cy="12" r="9"/><polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>'
};

/**
 * @param {string} name - a key of PATHS (unknown names fall back to "clock")
 * @param {number} [size=18]
 * @returns {string} an <svg> string, hidden from screen readers (the text next to it carries the meaning)
 */
export function icon(name, size = 18) {
  const body = Object.hasOwn(PATHS, name) ? PATHS[name] : PATHS.clock;
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

/** Icon for each type of study session. */
export function activityIcon(type) {
  switch (type) {
    case 'Coding':
      return icon('code');
    case 'Reading':
      return icon('book');
    case 'Practice Problems':
      return icon('target');
    case 'Project Development':
      return icon('folder');
    case 'Research':
      return icon('search');
    case 'Tutorial':
      return icon('play');
    default:
      return icon('clock');
  }
}
