/**
 * CODEORBIT — NAVIGATION MODULE
 * Hash routing between pages, the active top-bar link, and the page title.
 */

// Route names (the part after #) are kept as they were so old links and saved
// bookmarks still work; only the words people see changed (D-020).
const ROUTE_CONFIG = {
  dashboard: { title: 'Home', subtitle: '' },
  skills: {
    title: 'Your skills',
    subtitle:
      'Everything you are learning, in one place. Use +10% and −10% to update how far along you are.'
  },
  progress: {
    title: 'Study sessions',
    subtitle: 'Every bit of study time you have added, newest first.'
  },
  projects: {
    title: 'Projects',
    subtitle: 'Things you are building, and how far along each one is.'
  },
  goals: {
    title: 'Goals',
    subtitle: 'What you want to reach, and by when.'
  },
  achievements: {
    title: 'Badges',
    subtitle: 'You earn a badge when you reach a milestone.'
  },
  analytics: {
    title: 'Progress',
    subtitle: 'How your studying is going over time.'
  },
  settings: {
    title: 'Settings',
    subtitle: 'Your profile, your goals, and your saved data.'
  }
};

/**
 * True only for the app's own pages. A plain `ROUTE_CONFIG[name]` check is not
 * enough: every object also has inherited keys like `constructor`, `toString`
 * and `__proto__`, so `#constructor` used to pass and show a blank app.
 */
export function isRoute(name) {
  return typeof name === 'string' && Object.hasOwn(ROUTE_CONFIG, name);
}

class NavigationManager {
  constructor() {
    this.currentRoute = 'dashboard';
    this.viewCallbacks = new Map();
  }

  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleHashChange());

    // Top bar links
    document.querySelectorAll('.nav-link[data-route]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        this.navigateTo(link.getAttribute('data-route'));
      });
    });

    // Initial load
    this.handleHashChange();
  }

  registerView(route, callback) {
    this.viewCallbacks.set(route, callback);
  }

  /**
   * Re-renders the page currently on screen. A render error is logged and
   * contained so it cannot break navigation or the data-change loop.
   */
  renderCurrentView() {
    const route = this.currentRoute;
    const cb = this.viewCallbacks.get(route);
    if (typeof cb !== 'function') return;
    try {
      cb();
    } catch (err) {
      // Constant format string: never put a value from the URL in console's first argument.
      console.error('Error rendering view [%s]:', route, err);
    }
  }

  handleHashChange() {
    let hash = window.location.hash.replace('#', '').trim();
    if (!isRoute(hash)) {
      hash = 'dashboard';
    }
    this.navigateTo(hash, false);
  }

  navigateTo(route, updateHash = true) {
    if (!isRoute(route)) route = 'dashboard';
    this.currentRoute = route;

    if (updateHash && window.location.hash !== `#${route}`) {
      window.location.hash = `#${route}`;
      return; // Will trigger handleHashChange
    }

    // Switch view sections
    document.querySelectorAll('.view-page').forEach(page => {
      page.classList.remove('active');
    });

    const targetPage = document.getElementById(`view-${route}`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    // Highlight the current page in the top bar. Badges and Settings have no
    // top-bar link, so Badges lights up "Progress" (it is opened from there).
    const navRoute = route === 'achievements' ? 'analytics' : route;
    document.querySelectorAll('.nav-link[data-route]').forEach(link => {
      const isCurrent = link.getAttribute('data-route') === navRoute;
      link.classList.toggle('active', isCurrent);
      if (isCurrent) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    // Page title (Home has its own big greeting instead)
    const config = ROUTE_CONFIG[route];
    const headerEl = document.getElementById('page-header');
    const titleEl = document.getElementById('page-title-text');
    const subtitleEl = document.getElementById('page-subtitle-text');
    if (headerEl) headerEl.hidden = route === 'dashboard';
    if (titleEl) titleEl.textContent = config.title;
    if (subtitleEl) subtitleEl.textContent = config.subtitle;
    document.title = route === 'dashboard' ? 'CodeOrbit' : `${config.title} · CodeOrbit`;

    // Trigger page-specific refresh callback
    this.renderCurrentView();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh Lucide Icons if available
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }
}

export const navigation = new NavigationManager();
