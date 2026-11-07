/**
 * CODEORBIT — CHART.JS INTEGRATION MODULE
 * Cosmic-themed Chart.js configurations, gradients, and lifecycle management.
 */

import { toLocalISO } from './utils.js';

class ChartManager {
  constructor() {
    this.instances = new Map();
  }

  getThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return {
      textColor: isDark ? '#94A3B8' : '#475569',
      gridColor: isDark ? 'rgba(37, 49, 74, 0.4)' : 'rgba(203, 213, 225, 0.6)',
      tooltipBg: isDark ? '#19243D' : '#FFFFFF',
      tooltipText: isDark ? '#F8FAFC' : '#0F172A',
      tooltipBorder: isDark ? '#25314A' : '#CBD5E1'
    };
  }

  destroyChart(id) {
    if (this.instances.has(id)) {
      try {
        this.instances.get(id).destroy();
      } catch (e) {
        console.warn('Chart destroy error:', e);
      }
      this.instances.delete(id);
    }
  }

  /**
   * Weekly Learning Hours Chart (Dashboard & Analytics)
   */
  renderWeeklyChart(canvasId, activities = []) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;

    this.destroyChart(canvasId);
    const ctx = canvas.getContext('2d');
    const theme = this.getThemeColors();

    // Calculate hours for each day of the current week (Mon - Sun)
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sun, 1 is Mon...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayHours = [0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = toLocalISO(d);

      const dayMins = activities
        .filter(a => a.date && a.date.slice(0, 10) === dStr)
        .reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
      dayHours[i] = Math.round((dayMins / 60) * 10) / 10;
    }

    // Bar Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, '#38BDF8');
    gradient.addColorStop(0.5, '#6366F1');
    gradient.addColorStop(1, '#7C3AED');

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dayLabels,
        datasets: [{
          label: 'Learning Hours',
          data: dayHours,
          backgroundColor: gradient,
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.55
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            titleColor: theme.tooltipText,
            bodyColor: theme.tooltipText,
            borderColor: theme.tooltipBorder,
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (item) => `${item.raw} hrs logged`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: theme.textColor, font: { family: 'Inter', size: 12 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: theme.gridColor },
            ticks: {
              color: theme.textColor,
              font: { family: 'Inter', size: 12 },
              callback: (v) => `${v}h`
            }
          }
        }
      }
    });

    this.instances.set(canvasId, chart);
  }

  /**
   * 30-Day Monthly Trend Chart (Analytics)
   */
  renderMonthlyTrendChart(canvasId, activities = []) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;

    this.destroyChart(canvasId);
    const ctx = canvas.getContext('2d');
    const theme = this.getThemeColors();

    const labels = [];
    const hours = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = toLocalISO(d);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      const dayMins = activities
        .filter(a => a.date && a.date.slice(0, 10) === dStr)
        .reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
      hours.push(Math.round((dayMins / 60) * 10) / 10);
    }

    const fillGrad = ctx.createLinearGradient(0, 0, 0, 280);
    fillGrad.addColorStop(0, 'rgba(124, 58, 237, 0.45)');
    fillGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.08)');
    fillGrad.addColorStop(1, 'rgba(8, 13, 27, 0)');

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Daily Hours',
          data: hours,
          borderColor: '#38BDF8',
          borderWidth: 2.5,
          pointBackgroundColor: '#7C3AED',
          pointBorderColor: '#FFFFFF',
          pointHoverRadius: 6,
          fill: true,
          backgroundColor: fillGrad,
          tension: 0.35
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            titleColor: theme.tooltipText,
            bodyColor: theme.tooltipText,
            borderColor: theme.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: (item) => `${item.raw} hours`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: theme.textColor,
              font: { family: 'Inter', size: 11 },
              maxTicksLimit: 10
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: theme.gridColor },
            ticks: {
              color: theme.textColor,
              font: { family: 'Inter', size: 11 },
              callback: (v) => `${v}h`
            }
          }
        }
      }
    });

    this.instances.set(canvasId, chart);
  }

  /**
   * Skill Category Distribution Chart (Doughnut)
   */
  renderSkillCategoryChart(canvasId, skills = []) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;

    this.destroyChart(canvasId);
    const ctx = canvas.getContext('2d');
    const theme = this.getThemeColors();

    const categoryMap = {};
    skills.forEach(s => {
      const cat = s.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const labels = Object.keys(categoryMap);
    const counts = Object.values(categoryMap);

    const palette = [
      '#7C3AED', // Violet
      '#38BDF8', // Cyan
      '#F97316', // Orange
      '#22C55E', // Green
      '#6366F1', // Indigo
      '#F59E0B', // Amber
      '#EC4899', // Pink
      '#64748B'  // Slate
    ];

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['No Skills Yet'],
        datasets: [{
          data: counts.length ? counts : [1],
          backgroundColor: counts.length ? labels.map((_, i) => palette[i % palette.length]) : ['#25314A'],
          borderWidth: 2,
          borderColor: theme.tooltipBg
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: theme.textColor,
              font: { family: 'Inter', size: 12 },
              padding: 14
            }
          },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            titleColor: theme.tooltipText,
            bodyColor: theme.tooltipText,
            borderColor: theme.tooltipBorder,
            borderWidth: 1
          }
        },
        cutout: '68%'
      }
    });

    this.instances.set(canvasId, chart);
  }

  /**
   * Project Status Distribution Chart (Doughnut / Pie)
   */
  renderProjectStatusChart(canvasId, projects = []) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;

    this.destroyChart(canvasId);
    const ctx = canvas.getContext('2d');
    const theme = this.getThemeColors();

    const statusCounts = {
      'Planning': 0,
      'In Progress': 0,
      'On Hold': 0,
      'Completed': 0
    };

    projects.forEach(p => {
      if (statusCounts[p.status] !== undefined) {
        statusCounts[p.status]++;
      }
    });

    const labels = Object.keys(statusCounts);
    const counts = Object.values(statusCounts);

    const colors = ['#6366F1', '#38BDF8', '#F59E0B', '#22C55E'];

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: counts,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: theme.tooltipBg
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: theme.textColor,
              font: { family: 'Inter', size: 12 },
              padding: 12
            }
          },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            titleColor: theme.tooltipText,
            bodyColor: theme.tooltipText,
            borderColor: theme.tooltipBorder,
            borderWidth: 1
          }
        },
        cutout: '65%'
      }
    });

    this.instances.set(canvasId, chart);
  }

  /**
   * Activity Type Breakdown Chart (Horizontal Bar)
   */
  renderActivityTypeChart(canvasId, activities = []) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;

    this.destroyChart(canvasId);
    const ctx = canvas.getContext('2d');
    const theme = this.getThemeColors();

    const typeHoursMap = {};
    activities.forEach(a => {
      const type = a.type || 'Other';
      const hrs = (Number(a.duration) || 0) / 60;
      typeHoursMap[type] = (typeHoursMap[type] || 0) + hrs;
    });

    const labels = Object.keys(typeHoursMap);
    const dataVals = labels.map(l => Math.round(typeHoursMap[l] * 10) / 10);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['No Activities'],
        datasets: [{
          label: 'Total Hours',
          data: dataVals.length ? dataVals : [0],
          backgroundColor: '#6366F1',
          borderRadius: 4,
          barPercentage: 0.6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            titleColor: theme.tooltipText,
            bodyColor: theme.tooltipText,
            borderColor: theme.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: (item) => `${item.raw} hrs`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: theme.gridColor },
            ticks: { color: theme.textColor, font: { family: 'Inter', size: 11 } }
          },
          y: {
            grid: { display: false },
            ticks: { color: theme.textColor, font: { family: 'Inter', size: 11 } }
          }
        }
      }
    });

    this.instances.set(canvasId, chart);
  }
}

export const chartManager = new ChartManager();
