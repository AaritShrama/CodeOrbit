/**
 * CODEORBIT — NAVIGATION MODULE
 * Multi-view routing, active state indicators, mobile drawer management, and title synchronization.
 */

import { storage } from './storage.js';

const ROUTE_CONFIG = {
  dashboard: {
    title: 'Command Center',
    subtitle: 'System Overview & Orbital Telemetry',
    icon: 'layout-dashboard'
  },
  skills: {
    title: 'Skill Universe',
    subtitle: 'Planetary Competency & Proficiency Engine',
    icon: 'orbit'
  },
  progress: {
    title: 'Mission Logs',
    subtitle: 'Developer Sprints, Time Tracking & Learning Habit',
    icon: 'book-open'
  },
  projects: {
    title: 'Space Missions',
    subtitle: 'Developer Project Tracker & Architecture Builds',
    icon: 'rocket'
  },
  goals: {
    title: 'Milestones',
    subtitle: 'Technical Objectives & Target Horizons',
    icon: 'target'
  },
  achievements: {
    title: 'Universe Achievements',
    subtitle: 'Unlocked Milestones & Explorer Badges',
    icon: 'trophy'
  },
  analytics: {
    title: 'Universe Analytics',
    subtitle: 'Deep Velocity Trends & Habit Distributions',
    icon: 'bar-chart-3'
  },
  settings: {
    title: 'System Settings',
    subtitle: 'Developer Profile, Appearance & Local Storage Backup',
    icon: 'settings'
  }
};

class NavigationManager {
  constructor() {
    this.currentRoute = 'dashboard';
    this.viewCallbacks = new Map();
  }

  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleHashChange());

    // Setup sidebar navigation links
    document.querySelectorAll('.nav-link[data-route]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        this.navigateTo(route);
        this.closeMobileSidebar();
      });
    });

    // Mobile sidebar hamburger button
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => this.toggleMobileSidebar());
    }
    if (sidebarBackdrop) {
      sidebarBackdrop.addEventListener('click', () => this.closeMobileSidebar());
    }

    // Initial load
    this.handleHashChange();
    this.updateBadges();

    // Re-update badges on data changes
    window.addEventListener('codeorbit:data-changed', () => this.updateBadges());
  }

  registerView(route, callback) {
    this.viewCallbacks.set(route, callback);
  }

  handleHashChange() {
    let hash = window.location.hash.replace('#', '').trim();
    if (!hash || !ROUTE_CONFIG[hash]) {
      hash = 'dashboard';
    }
    this.navigateTo(hash, false);
  }

  navigateTo(route, updateHash = true) {
    if (!ROUTE_CONFIG[route]) route = 'dashboard';
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

    // Update active nav-link
    document.querySelectorAll('.nav-link[data-route]').forEach(link => {
      if (link.getAttribute('data-route') === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update topbar header
    const config = ROUTE_CONFIG[route];
    const titleEl = document.getElementById('page-title-text');
    const subtitleEl = document.getElementById('page-subtitle-text');
    if (titleEl) titleEl.textContent = config.title;
    if (subtitleEl) subtitleEl.textContent = config.subtitle;

    // Trigger page-specific refresh callback
    const cb = this.viewCallbacks.get(route);
    if (typeof cb === 'function') {
      try {
        cb();
      } catch (err) {
        console.error(`Error rendering view [${route}]:`, err);
      }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh Lucide Icons if available
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }

  updateBadges() {
    const data = storage.getUniverse();
    const skillsCount = (data.skills || []).length;
    const activeProjectsCount = (data.projects || []).filter(p => p.status === 'In Progress').length;
    const pendingGoalsCount = (data.goals || []).filter(g => g.status === 'Active').length;
    const unlockedAchievements = (data.achievements || []).length;

    const elSkills = document.getElementById('nav-badge-skills');
    const elProjects = document.getElementById('nav-badge-projects');
    const elGoals = document.getElementById('nav-badge-goals');
    const elAchievements = document.getElementById('nav-badge-achievements');

    if (elSkills) elSkills.textContent = skillsCount;
    if (elProjects) elProjects.textContent = activeProjectsCount;
    if (elGoals) elGoals.textContent = pendingGoalsCount;
    if (elAchievements) elAchievements.textContent = `${unlockedAchievements}/10`;
  }

  toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.toggle('open');
    if (backdrop) backdrop.classList.toggle('active');
  }

  closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  }
}

export const navigation = new NavigationManager();
