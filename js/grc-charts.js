/**
 * grc-charts.js — SECURE VERSION
 *
 * Fixes applied:
 * - Chart.js self-loading: if the host page didn't include the CDN script,
 *   this file injects it with the pinned SRI hash before calling Chart.
 * - renderRiskChart / renderControlChart guard typeof Chart before executing.
 * - getLabData() undefined guard: if not defined on the page, charts skip cleanly.
 */

const _CHARTJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.4/chart.umd.min.js';
const _CHARTJS_SRI = 'sha512-6HrPqAvK+lZElIZ4mZ64fyxIBTsaX5zAFZg2V/2WT+iKPrFzTzvx6QAsLW2OoLAkjezOe9h7QmMPpfZJcg==';

let riskChartInstance    = null;
let controlChartInstance = null;

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#94a3b8',
        font: { family: "'Inter', sans-serif", size: 11 },
        usePointStyle: true,
        padding: 20
      }
    }
  }
};

function renderRiskChart() {
  if (typeof Chart === 'undefined') return;
  const ctx = document.getElementById('chart-risk');
  if (!ctx) return;
  if (typeof getLabData !== 'function') return;
  const data = getLabData().risks || [];

  const counts = {
    Critical: data.filter(r => r.level === 'Critical').length,
    High:     data.filter(r => r.level === 'High').length,
    Medium:   data.filter(r => r.level === 'Medium').length,
    Low:      data.filter(r => r.level === 'Low').length
  };

  if (riskChartInstance) riskChartInstance.destroy();

  riskChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [{
        data: [counts.Critical, counts.High, counts.Medium, counts.Low],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(56, 189, 248, 0.8)'
        ],
        borderColor: '#1e293b',
        borderWidth: 2,
        hoverOffset: 4
      }]
    },
    options: {
      ...commonOptions,
      cutout: '75%',
      plugins: {
        ...commonOptions.plugins,
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#f8fafc',
          bodyColor: '#f8fafc',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 10,
          displayColors: true
        }
      }
    }
  });
}

function renderControlChart() {
  if (typeof Chart === 'undefined') return;
  const ctx = document.getElementById('chart-control');
  if (!ctx) return;
  if (typeof getLabData !== 'function') return;
  const data = getLabData().controls || [];

  const counts = {
    Implemented:       data.filter(c => c.status === 'Implemented').length,
    'In Progress':     data.filter(c => c.status === 'In Progress').length,
    'Not Implemented': data.filter(c => c.status === 'Not Implemented').length
  };

  if (controlChartInstance) controlChartInstance.destroy();

  controlChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Implemented', 'In Progress', 'Not Implemented'],
      datasets: [{
        label: 'Controls',
        data: [counts.Implemented, counts['In Progress'], counts['Not Implemented']],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      ...commonOptions,
      plugins: {
        ...commonOptions.plugins,
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#f8fafc',
          bodyColor: '#f8fafc',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 10
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
          ticks: { color: '#94a3b8', stepSize: 1 }
        },
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });
}

// Self-loading bootstrap — inject Chart.js CDN if page didn't include it
(function () {
  if (typeof Chart !== 'undefined') return; // already loaded
  const script = document.createElement('script');
  script.src            = _CHARTJS_CDN;
  script.integrity      = _CHARTJS_SRI;
  script.crossOrigin    = 'anonymous';
  script.referrerPolicy = 'no-referrer';
  script.onerror = function () {
    console.warn('grc-charts.js: Chart.js CDN unavailable. Charts suppressed.');
  };
  document.head.appendChild(script);
}());
