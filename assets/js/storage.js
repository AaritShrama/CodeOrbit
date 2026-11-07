/**
 * CODEORBIT — LOCALSTORAGE ARCHITECTURE MODULE
 * Centralized, safe, validated client-side persistence engine.
 */

import { generateId, getTodayISO, getRelativeISO } from './utils.js';

const STORAGE_KEY = 'codeorbit_universe_v1';
const DATA_VERSION = 1;

/**
 * Default realistic developer universe data for immediate out-of-the-box immersion.
 */
function getDefaultUniverse() {
  const today = getTodayISO();
  const d1 = getRelativeISO(-1);
  const d2 = getRelativeISO(-2);
  const d3 = getRelativeISO(-3);
  const d4 = getRelativeISO(-4);

  return {
    version: DATA_VERSION,
    profile: {
      name: 'Alex Rivera',
      title: 'Full-Stack Explorer & AI Builder',
      bio: 'Charting a course across modern web frameworks, distributed architectures, and intelligent systems.',
      avatar: 'astronaut', // astronaut, robot, cyberpunk, nebula, satellite, core
      github: 'alexrivera-orbit',
      joinedDate: '2026-01-15'
    },
    settings: {
      theme: 'dark', // 'dark' | 'light'
      dailyTargetHours: 2,
      weeklyTargetHours: 12,
      soundEnabled: true,
      reducedMotion: false
    },
    skills: [
      {
        id: generateId('sk_'),
        name: 'TypeScript',
        category: 'Programming',
        proficiency: 'Advanced',
        status: 'Learning',
        progress: 85,
        targetDate: '2026-12-15',
        description: 'Advanced generics, utility types, and compiler configuration.',
        createdAt: '2026-09-01T10:00:00.000Z',
        updatedAt: '2026-11-05T14:30:00.000Z'
      },
      {
        id: generateId('sk_'),
        name: 'Python & PyTorch',
        category: 'Artificial Intelligence',
        proficiency: 'Intermediate',
        status: 'Learning',
        progress: 68,
        targetDate: '2026-12-30',
        description: 'Deep neural networks, attention mechanisms, and custom autograd models.',
        createdAt: '2026-09-10T11:00:00.000Z',
        updatedAt: '2026-11-06T16:00:00.000Z'
      },
      {
        id: generateId('sk_'),
        name: 'React & Next.js Ecosystem',
        category: 'Web Development',
        proficiency: 'Expert',
        status: 'Completed',
        progress: 100,
        targetDate: '2026-10-01',
        description: 'Server Components, concurrent rendering, and streaming UI architectures.',
        createdAt: '2026-08-01T08:00:00.000Z',
        updatedAt: '2026-10-01T12:00:00.000Z'
      },
      {
        id: generateId('sk_'),
        name: 'PostgreSQL & Vector DBs',
        category: 'Database',
        proficiency: 'Intermediate',
        status: 'Practicing',
        progress: 55,
        targetDate: '2027-01-20',
        description: 'Query planning, indexing strategies, pgvector, and cosine similarity search.',
        createdAt: '2026-10-05T09:00:00.000Z',
        updatedAt: '2026-11-04T18:00:00.000Z'
      },
      {
        id: generateId('sk_'),
        name: 'Docker & Kubernetes',
        category: 'DevOps',
        proficiency: 'Intermediate',
        status: 'Learning',
        progress: 45,
        targetDate: '2027-02-15',
        description: 'Multi-stage container builds, Helm charts, and cluster networking.',
        createdAt: '2026-10-15T14:00:00.000Z',
        updatedAt: '2026-11-02T19:00:00.000Z'
      },
      {
        id: generateId('sk_'),
        name: 'Distributed Systems & CS',
        category: 'Computer Science',
        proficiency: 'Beginner',
        status: 'Learning',
        progress: 30,
        targetDate: '2027-03-01',
        description: 'Raft consensus, CAP theorem, gossip protocols, and event streaming.',
        createdAt: '2026-10-20T16:00:00.000Z',
        updatedAt: '2026-11-01T11:00:00.000Z'
      }
    ],
    activities: [
      {
        id: generateId('act_'),
        title: 'Built Custom Embedding Pipeline in PyTorch',
        skill: 'Python & PyTorch',
        duration: 90, // minutes
        date: today,
        type: 'Coding',
        notes: 'Implemented cosine similarity search matrix for semantic vector retrieval.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateId('act_'),
        title: 'Mastered Advanced Conditional Types in TypeScript',
        skill: 'TypeScript',
        duration: 75,
        date: d1,
        type: 'Practice Problems',
        notes: 'Solved 6 Type-Challenges on type gymnastics and template literals.',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: generateId('act_'),
        title: 'Vector Search Benchmark with pgvector',
        skill: 'PostgreSQL & Vector DBs',
        duration: 120,
        date: d2,
        type: 'Project Development',
        notes: 'Benchmarked HNSW vs IVFFLAT indexing on 100k embedding vectors.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: generateId('act_'),
        title: 'Read Designing Data-Intensive Applications (Ch. 5 & 6)',
        skill: 'Distributed Systems & CS',
        duration: 60,
        date: d3,
        type: 'Reading',
        notes: 'Replication lag, leaderless replication, and conflict resolution.',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: generateId('act_'),
        title: 'Multi-stage Dockerfile Optimization for Go Microservices',
        skill: 'Docker & Kubernetes',
        duration: 45,
        date: d4,
        type: 'Tutorial',
        notes: 'Reduced production image footprint from 850MB to 18MB using alpine scratch.',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
      }
    ],
    projects: [
      {
        id: generateId('proj_'),
        name: 'OrbitFlow CLI',
        description: 'Lightweight autonomous terminal utility for tracking developer focus sprints and orbital habits.',
        technologies: ['TypeScript', 'Node.js', 'Chalk', 'Commander'],
        status: 'In Progress',
        progress: 75,
        githubUrl: 'https://github.com/alexrivera-orbit/orbitflow-cli',
        liveDemoUrl: 'https://orbitflow.dev',
        startDate: '2026-10-01',
        targetDate: '2026-11-20',
        createdAt: '2026-10-01T12:00:00.000Z',
        updatedAt: '2026-11-05T15:00:00.000Z'
      },
      {
        id: generateId('proj_'),
        name: 'Neural Canvas Vector Search',
        description: 'Interactive visual playground for high-dimensional latent space exploration and clustering.',
        technologies: ['Python', 'FastAPI', 'PyTorch', 'Tailwind', 'Canvas API'],
        status: 'In Progress',
        progress: 50,
        githubUrl: 'https://github.com/alexrivera-orbit/neural-canvas',
        liveDemoUrl: '',
        startDate: '2026-10-15',
        targetDate: '2026-12-10',
        createdAt: '2026-10-15T14:00:00.000Z',
        updatedAt: '2026-11-04T18:00:00.000Z'
      },
      {
        id: generateId('proj_'),
        name: 'Cosmic UI Component Library',
        description: 'Accessible, dark-first UI kit for futuristic web dashboards with glassmorphism and smooth micro-interactions.',
        technologies: ['CSS3', 'Vanilla JS', 'Web Components', 'Storybook'],
        status: 'Completed',
        progress: 100,
        githubUrl: 'https://github.com/alexrivera-orbit/cosmic-ui',
        liveDemoUrl: 'https://cosmic-ui.universe.dev',
        startDate: '2026-08-15',
        targetDate: '2026-09-30',
        createdAt: '2026-08-15T09:00:00.000Z',
        updatedAt: '2026-09-30T17:00:00.000Z'
      }
    ],
    goals: [
      {
        id: generateId('goal_'),
        title: 'Master PyTorch Custom Dataset Loaders & DataLoader Optimization',
        description: 'Write zero-copy DataLoader pipelines for multimodal datasets.',
        category: 'Artificial Intelligence',
        deadline: '2026-11-18',
        priority: 'High',
        progress: 60,
        status: 'Active',
        createdAt: '2026-10-25T10:00:00.000Z',
        updatedAt: '2026-11-06T12:00:00.000Z'
      },
      {
        id: generateId('goal_'),
        title: 'Ship v1.0 of OrbitFlow CLI to npm',
        description: 'Publish documentation, add automated test suite, and release v1.0.',
        category: 'Web Development',
        deadline: '2026-11-20',
        priority: 'Critical',
        progress: 80,
        status: 'Active',
        createdAt: '2026-10-28T14:00:00.000Z',
        updatedAt: '2026-11-05T18:00:00.000Z'
      },
      {
        id: generateId('goal_'),
        title: 'Deploy Kubernetes Mini-Cluster on Raspberry Pi',
        description: 'Set up k3s cluster with Traefik ingress and Prometheus monitoring.',
        category: 'DevOps',
        deadline: '2026-12-05',
        priority: 'Medium',
        progress: 25,
        status: 'Active',
        createdAt: '2026-11-01T09:00:00.000Z',
        updatedAt: '2026-11-03T16:00:00.000Z'
      },
      {
        id: generateId('goal_'),
        title: 'Complete 30 Consecutive Days of Code Commits',
        description: 'Maintain an unbroken daily learning or contribution habit.',
        category: 'Programming',
        deadline: '2026-10-31',
        priority: 'High',
        progress: 100,
        status: 'Completed',
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-31T23:59:00.000Z'
      }
    ],
    achievements: [
      { id: 'first_skill', unlockedAt: '2026-09-01T10:00:00.000Z' },
      { id: 'first_mission', unlockedAt: '2026-08-15T09:00:00.000Z' },
      { id: 'learning_explorer', unlockedAt: '2026-11-07T06:00:00.000Z' },
      { id: 'orbit_streak', unlockedAt: '2026-11-06T12:00:00.000Z' },
      { id: 'skill_master', unlockedAt: '2026-10-01T12:00:00.000Z' }
    ]
  };
}

class StorageManager {
  constructor() {
    this.cache = null;
    this.init();
  }

  /**
   * Initializes local storage and migrates or sets default state.
   */
  init() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const defaultData = getDefaultUniverse();
        this.saveUniverse(defaultData);
        this.cache = defaultData;
      } else {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.skills)) {
          // Corrupted or invalid structure, reset to defaults
          const defaultData = getDefaultUniverse();
          this.saveUniverse(defaultData);
          this.cache = defaultData;
        } else {
          this.cache = parsed;
        }
      }
    } catch (e) {
      console.warn('CodeOrbit Storage Init Error:', e);
      this.cache = getDefaultUniverse();
    }
  }

  /**
   * Safe read of entire universe state.
   */
  getUniverse() {
    if (!this.cache) this.init();
    return JSON.parse(JSON.stringify(this.cache));
  }

  /**
   * Safe atomic write to localStorage with event emission.
   */
  saveUniverse(data) {
    try {
      this.cache = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('codeorbit:data-changed', { detail: { timestamp: Date.now() } }));
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  }

  /* ========================================================================
     PROFILE & SETTINGS
     ======================================================================== */
  getProfile() {
    return this.getUniverse().profile || {};
  }

  saveProfile(profileData) {
    const data = this.getUniverse();
    data.profile = {
      ...data.profile,
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    return this.saveUniverse(data);
  }

  getSettings() {
    return this.getUniverse().settings || {};
  }

  saveSettings(settingsData) {
    const data = this.getUniverse();
    data.settings = {
      ...data.settings,
      ...settingsData
    };
    return this.saveUniverse(data);
  }

  /* ========================================================================
     SKILLS (CRUD)
     ======================================================================== */
  getSkills() {
    return this.getUniverse().skills || [];
  }

  getSkillById(id) {
    return this.getSkills().find(s => s.id === id) || null;
  }

  saveSkill(skill) {
    const data = this.getUniverse();
    const skills = data.skills || [];
    const now = new Date().toISOString();

    if (skill.id) {
      // Update
      const index = skills.findIndex(s => s.id === skill.id);
      if (index !== -1) {
        skills[index] = { ...skills[index], ...skill, updatedAt: now };
      } else {
        skills.push({ ...skill, createdAt: now, updatedAt: now });
      }
    } else {
      // Create
      const newSkill = {
        ...skill,
        id: generateId('sk_'),
        createdAt: now,
        updatedAt: now
      };
      skills.push(newSkill);
    }

    data.skills = skills;
    return this.saveUniverse(data);
  }

  deleteSkill(id) {
    const data = this.getUniverse();
    data.skills = (data.skills || []).filter(s => s.id !== id);
    return this.saveUniverse(data);
  }

  /* ========================================================================
     MISSION LOGS / ACTIVITIES (CRUD)
     ======================================================================== */
  getActivities() {
    return this.getUniverse().activities || [];
  }

  saveActivity(activity) {
    const data = this.getUniverse();
    const activities = data.activities || [];
    const now = new Date().toISOString();

    if (activity.id) {
      const idx = activities.findIndex(a => a.id === activity.id);
      if (idx !== -1) {
        activities[idx] = { ...activities[idx], ...activity, updatedAt: now };
      } else {
        activities.push({ ...activity, createdAt: now, updatedAt: now });
      }
    } else {
      const newActivity = {
        ...activity,
        id: generateId('act_'),
        createdAt: now,
        updatedAt: now
      };
      activities.unshift(newActivity); // Newest first
    }

    data.activities = activities;
    return this.saveUniverse(data);
  }

  deleteActivity(id) {
    const data = this.getUniverse();
    data.activities = (data.activities || []).filter(a => a.id !== id);
    return this.saveUniverse(data);
  }

  /* ========================================================================
     SPACE MISSIONS / PROJECTS (CRUD)
     ======================================================================== */
  getProjects() {
    return this.getUniverse().projects || [];
  }

  getProjectById(id) {
    return this.getProjects().find(p => p.id === id) || null;
  }

  saveProject(project) {
    const data = this.getUniverse();
    const projects = data.projects || [];
    const now = new Date().toISOString();

    if (project.id) {
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        projects[idx] = { ...projects[idx], ...project, updatedAt: now };
      } else {
        projects.push({ ...project, createdAt: now, updatedAt: now });
      }
    } else {
      const newProj = {
        ...project,
        id: generateId('proj_'),
        createdAt: now,
        updatedAt: now
      };
      projects.push(newProj);
    }

    data.projects = projects;
    return this.saveUniverse(data);
  }

  deleteProject(id) {
    const data = this.getUniverse();
    data.projects = (data.projects || []).filter(p => p.id !== id);
    return this.saveUniverse(data);
  }

  /* ========================================================================
     MILESTONES / GOALS (CRUD)
     ======================================================================== */
  getGoals() {
    return this.getUniverse().goals || [];
  }

  saveGoal(goal) {
    const data = this.getUniverse();
    const goals = data.goals || [];
    const now = new Date().toISOString();

    if (goal.id) {
      const idx = goals.findIndex(g => g.id === goal.id);
      if (idx !== -1) {
        goals[idx] = { ...goals[idx], ...goal, updatedAt: now };
      } else {
        goals.push({ ...goal, createdAt: now, updatedAt: now });
      }
    } else {
      const newGoal = {
        ...goal,
        id: generateId('goal_'),
        createdAt: now,
        updatedAt: now
      };
      goals.push(newGoal);
    }

    data.goals = goals;
    return this.saveUniverse(data);
  }

  deleteGoal(id) {
    const data = this.getUniverse();
    data.goals = (data.goals || []).filter(g => g.id !== id);
    return this.saveUniverse(data);
  }

  /* ========================================================================
     ACHIEVEMENTS
     ======================================================================== */
  getAchievements() {
    return this.getUniverse().achievements || [];
  }

  unlockAchievement(achievementId) {
    const data = this.getUniverse();
    const achievements = data.achievements || [];

    if (!achievements.some(a => a.id === achievementId)) {
      achievements.push({
        id: achievementId,
        unlockedAt: new Date().toISOString()
      });
      data.achievements = achievements;
      this.saveUniverse(data);
      return true; // Newly unlocked
    }
    return false;
  }

  /* ========================================================================
     BACKUP, IMPORT & RESET
     ======================================================================== */
  exportJSON() {
    const data = this.getUniverse();
    return JSON.stringify(data, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      // Validate schema
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON root format: must be an object.');
      }
      if (!Array.isArray(parsed.skills) || !Array.isArray(parsed.activities) || !Array.isArray(parsed.projects)) {
        throw new Error('Missing essential CodeOrbit collections (skills, activities, projects).');
      }

      const defaults = getDefaultUniverse();
      parsed.version = DATA_VERSION;
      parsed.profile = (typeof parsed.profile === 'object' && parsed.profile) ? { ...defaults.profile, ...parsed.profile } : defaults.profile;
      parsed.settings = (typeof parsed.settings === 'object' && parsed.settings) ? { ...defaults.settings, ...parsed.settings } : defaults.settings;
      parsed.skills = Array.isArray(parsed.skills) ? parsed.skills : [];
      parsed.activities = Array.isArray(parsed.activities) ? parsed.activities : [];
      parsed.projects = Array.isArray(parsed.projects) ? parsed.projects : [];
      parsed.goals = Array.isArray(parsed.goals) ? parsed.goals : [];
      parsed.achievements = Array.isArray(parsed.achievements) ? parsed.achievements : [];

      // Normalize numbers
      parsed.skills.forEach(s => {
        s.progress = Math.min(100, Math.max(0, parseInt(s.progress, 10) || 0));
      });
      parsed.projects.forEach(p => {
        p.progress = Math.min(100, Math.max(0, parseInt(p.progress, 10) || 0));
        p.technologies = Array.isArray(p.technologies) ? p.technologies : [];
      });
      parsed.goals.forEach(g => {
        g.progress = Math.min(100, Math.max(0, parseInt(g.progress, 10) || 0));
      });
      parsed.activities.forEach(a => {
        a.duration = Math.max(1, parseInt(a.duration, 10) || 30);
      });

      this.saveUniverse(parsed);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  resetAllData() {
    const cleanUniverse = {
      version: DATA_VERSION,
      profile: {
        name: 'Developer',
        title: 'Explorer',
        bio: 'Welcome to my CodeOrbit developer universe.',
        avatar: 'astronaut',
        github: '',
        joinedDate: getTodayISO()
      },
      settings: {
        theme: 'dark',
        dailyTargetHours: 2,
        weeklyTargetHours: 10,
        soundEnabled: true,
        reducedMotion: false
      },
      skills: [],
      activities: [],
      projects: [],
      goals: [],
      achievements: []
    };
    return this.saveUniverse(cleanUniverse);
  }

  loadDemoUniverse() {
    const demo = getDefaultUniverse();
    return this.saveUniverse(demo);
  }
}

export const storage = new StorageManager();
