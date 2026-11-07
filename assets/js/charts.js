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
      textColor: isDark ? '#8F8F95' : '#63636A',
      gridColor: isDark ? 'rgba(44, 44, 49, 0.7)' : 'rgba(226, 226, 224, 0.9)',
      tooltipBg: isDark ? '#121214' : '#FFFFFF',
      tooltipText: isDark ? '#F5F5F4' : '#0A0A0B',
      tooltipBorder: isDark ? '#3A3A40' : '#C4C4C0',
      // Black, white and greys with one crimson (Let's Cook); see D-020
      bar: isDark ? '#B9B9BE' : '#45454B',
      accent: '#B8002F',
      palette: isDark
        ? ['#B8002F', '#F5F5F4', '#8F8F95', '#FF4D6A', '#4A4A52', '#B9B9BE', '#2C2C31', '#6B6B72']
        : ['#B8002F', '#0A0A0B', '#8F8F95', '#FF4D6A', '#C4C4C0', '#45454B', '#E2E2E0', '#6B6B72']
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

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dayLabels,
        datasets: [
          {
            label: 'Hours',
            data: dayHours,
            backgroundColor: theme.bar,
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.55
          }
        ]
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
              label: item => `${item.raw} hours`
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
              callback: v => `${v}h`
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
    fillGrad.addColorStop(0, 'rgba(184, 0, 47, 0.22)');
    fillGrad.addColorStop(1, 'rgba(184, 0, 47, 0)');

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Hours',
            data: hours,
            borderColor: theme.accent,
            borderWidth: 2.5,
            pointBackgroundColor: theme.accent,
            pointBorderColor: theme.tooltipBg,
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: fillGrad,
            tension: 0.35
          }
        ]
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
              label: item => `${item.raw} hours`
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
              callback: v => `${v}h`
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

    const palette = theme.palette;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['No skills yet'],
        datasets: [
          {
            data: counts.length ? counts : [1],
            backgroundColor: counts.length
              ? labels.map((_, i) => palette[i % palette.length])
              : [theme.gridColor],
            borderWidth: 2,
            borderColor: theme.tooltipBg
          }
        ]
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
      Planning: 0,
      'In Progress': 0,
      'On Hold': 0,
      Completed: 0
    };

    projects.forEach(p => {
      if (statusCounts[p.status] !== undefined) {
        statusCounts[p.status]++;
      }
    });

    const shownAs = { 'In Progress': 'In progress', 'On Hold': 'Paused', Completed: 'Finished' };
    const labels = Object.keys(statusCounts).map(k => shownAs[k] || k);
    const counts = Object.values(statusCounts);

    const colors = [theme.palette[2], theme.palette[1], theme.palette[4], theme.accent];

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: theme.tooltipBg
          }
        ]
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
        labels: labels.length
          ? labels.map(
              l =>
                ({
                  'Practice Problems': 'Practice problems',
                  'Project Development': 'Project work'
                })[l] || l
            )
          : ['No study time yet'],
        datasets: [
          {
            label: 'Hours',
            data: dataVals.length ? dataVals : [0],
            backgroundColor: theme.bar,
            borderRadius: 4,
            barPercentage: 0.6
          }
        ]
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
              label: item => `${item.raw} hrs`
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
