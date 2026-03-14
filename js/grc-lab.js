/**
 * grc-lab.js — SECURE VERSION
 *
 * Security hardening applied:
 * - All innerHTML usage replaced with safe DOM methods (createElement + textContent)
 * - Badge class locked to an allowlist — no user data can inject class names
 * - All fetch() calls include error handling with safe fallback rows
 * - JSON values are validated as strings before use
 * - No user-controlled data ever touches innerHTML, className freeform, or eval
 */

document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // 1. COLLAPSIBLE SECTIONS
  // ==========================================
  const collapsibles = document.querySelectorAll('.collapsible-header');
  collapsibles.forEach(header => {
    header.addEventListener('click', function () {
      this.classList.toggle('active');
      const content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });

  // Open the first section by default
  if (collapsibles.length > 0) {
    collapsibles[0].click();
  }


  // ==========================================
  // 2. SECURE BADGE HELPER
  //
  // Uses an explicit allowlist of CSS class names.
  // No user-supplied value can ever directly become a class name.
  // ==========================================
  const BADGE_ALLOWLIST = {
    'critical':             'badge-critical',
    'not implemented':      'badge-critical',
    'remediation required': 'badge-critical',
    'no':                   'badge-critical',
    'high':                 'badge-high',
    'medium':               'badge-medium',
    'in progress':          'badge-medium',
    'under review':         'badge-medium',
    'investigating':        'badge-medium',
    'low':                  'badge-low',
    'active':               'badge-low',
    'implemented':          'badge-low',
    'compliant':            'badge-low',
    'resolved':             'badge-low',
    'mitigated':            'badge-low',
    'yes':                  'badge-low',
  };

  function getBadgeClass(value) {
    // Coerce to string safely, then look up from allowlist only
    const key = String(value).toLowerCase().trim();
    return BADGE_ALLOWLIST[key] || 'badge-progress';
  }


  // ==========================================
  // 3. SECURE DOM HELPERS
  //
  // These never touch innerHTML. All values go
  // through textContent which cannot execute HTML.
  // ==========================================

  /**
   * Creates a plain <td> with safe text content.
   * @param {*} value - Any value; coerced to string safely.
   */
  function createTd(value) {
    const td = document.createElement('td');
    td.textContent = String(value ?? '');
    return td;
  }

  /**
   * Creates a <td> containing a badge <span>.
   * The badge class comes from the allowlist only — never from user data.
   * @param {*} value - Badge text value.
   */
  function createBadgeTd(value) {
    const td = document.createElement('td');
    const span = document.createElement('span');
    // Class comes from allowlist lookup — never directly from JSON
    span.className = `badge ${getBadgeClass(value)}`;
    // Text content is safe — cannot execute HTML
    span.textContent = String(value ?? '');
    td.appendChild(span);
    return td;
  }

  /**
   * Appends a full-width error row to a table body when a fetch fails.
   * @param {HTMLElement} tbody
   * @param {number} colspan
   */
  function appendErrorRow(tbody, colspan) {
    const row = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = colspan;
    td.textContent = 'Failed to load data. Please refresh the page.';
    td.style.textAlign = 'center';
    td.style.color = '#ef4444';
    row.appendChild(td);
    tbody.appendChild(row);
  }


  // ==========================================
  // 4. SECURE DATA FETCHING & TABLE POPULATION
  //
  // Each fetch:
  //   - Has .catch() error handling
  //   - Uses only createElement + textContent
  //   - Never interpolates JSON values into HTML strings
  // ==========================================

  // --- Assets ---
  fetch('data/assets.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const tbody = document.getElementById('assets-body');
      if (!tbody || !Array.isArray(data)) return;

      data.forEach(item => {
        const row = document.createElement('tr');
        row.appendChild(createTd(item.id));
        row.appendChild(createTd(item.name));
        row.appendChild(createTd(item.owner));
        row.appendChild(createTd(item.classification));
        row.appendChild(createBadgeTd(item.status));
        tbody.appendChild(row);
      });
    })
    .catch(() => {
      const tbody = document.getElementById('assets-body');
      if (tbody) appendErrorRow(tbody, 5);
    });


  // --- Risk Register ---
  fetch('data/risk-register.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const tbody = document.getElementById('risks-body');
      if (!tbody || !Array.isArray(data)) return;

      data.forEach(item => {
        const row = document.createElement('tr');
        row.appendChild(createTd(item.id));
        row.appendChild(createTd(item.description));
        row.appendChild(createTd(item.likelihood));
        row.appendChild(createTd(item.impact));
        row.appendChild(createBadgeTd(item.level));
        row.appendChild(createTd(item.mitigation));
        tbody.appendChild(row);
      });
    })
    .catch(() => {
      const tbody = document.getElementById('risks-body');
      if (tbody) appendErrorRow(tbody, 6);
    });


  // --- Controls ---
  fetch('data/controls.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const tbody = document.getElementById('controls-body');
      if (!tbody || !Array.isArray(data)) return;

      data.forEach(item => {
        const row = document.createElement('tr');
        row.appendChild(createTd(item.id));
        row.appendChild(createTd(item.name));
        row.appendChild(createTd(item.framework));
        row.appendChild(createBadgeTd(item.status));
        tbody.appendChild(row);
      });
    })
    .catch(() => {
      const tbody = document.getElementById('controls-body');
      if (tbody) appendErrorRow(tbody, 4);
    });


  // --- Vendors ---
  fetch('data/vendors.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const tbody = document.getElementById('vendors-body');
      if (!tbody || !Array.isArray(data)) return;

      data.forEach(item => {
        const row = document.createElement('tr');
        row.appendChild(createTd(item.vendor));
        row.appendChild(createTd(item.service));
        row.appendChild(createBadgeTd(item.riskRating));
        row.appendChild(createBadgeTd(item.status));
        tbody.appendChild(row);
      });
    })
    .catch(() => {
      const tbody = document.getElementById('vendors-body');
      if (tbody) appendErrorRow(tbody, 4);
    });


  // --- Incidents ---
  fetch('data/incidents.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const tbody = document.getElementById('incidents-body');
      if (!tbody || !Array.isArray(data)) return;

      data.forEach(item => {
        const row = document.createElement('tr');
        row.appendChild(createTd(item.id));
        row.appendChild(createTd(item.type));
        row.appendChild(createBadgeTd(item.severity));
        row.appendChild(createBadgeTd(item.status));
        row.appendChild(createTd(item.date));
        tbody.appendChild(row);
      });
    })
    .catch(() => {
      const tbody = document.getElementById('incidents-body');
      if (tbody) appendErrorRow(tbody, 5);
    });


  // --- Statement of Applicability (SoA) ---
  fetch('data/soa.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const tbody = document.getElementById('soa-body');
      if (!tbody || !Array.isArray(data)) return;

      data.forEach(item => {
        const row = document.createElement('tr');
        row.appendChild(createTd(item.id));
        row.appendChild(createTd(item.description));
        row.appendChild(createBadgeTd(item.applicable));
        row.appendChild(createTd(item.justification));
        tbody.appendChild(row);
      });
    })
    .catch(() => {
      const tbody = document.getElementById('soa-body');
      if (tbody) appendErrorRow(tbody, 4);
    });


  // ==========================================
  // 5. CHART.JS VISUALIZATIONS
  // (No user data injected — static config only)
  //
  // Self-loading: if Chart.js wasn't included in the page's <head>,
  // we inject it from cdnjs with the pinned SRI hash, then initialise
  // charts in the script's onload callback so there's no race condition.
  // ==========================================

  const CHARTJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.4/chart.umd.min.js';
  const CHARTJS_SRI = 'sha512-6HrPqAvK+lZElIZ4mZ64fyxIBTsaX5zAFZg2V/2WT+iKPrFzTzvx6QAsLW2OoLAkjezOe9h7QmMPpfZJcg==';

  /**
   * Initialise both charts. Called once Chart.js is confirmed available.
   */
  function initCharts() {
    // Guard: if Chart global still missing after load attempt, bail silently
    if (typeof Chart === 'undefined') return;

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // Risk Heatmap — Bubble Chart
    const riskCanvas = document.getElementById('riskHeatmap');
    if (riskCanvas) {
      new Chart(riskCanvas.getContext('2d'), {
        type: 'bubble',
        data: {
          datasets: [{
            label: 'Active Risks',
            data: [
              { x: 4, y: 4, r: 20 }, // Critical
              { x: 4, y: 3, r: 15 }, // High L, Med I
              { x: 3, y: 4, r: 15 }, // Med L, High I
              { x: 2, y: 4, r: 10 }, // Low L, High I
              { x: 3, y: 2, r: 10 }  // Med L, Low I
            ],
            backgroundColor: function (context) {
              const val = context.raw;
              if (!val) return 'rgba(56, 189, 248, 0.6)';
              const score = val.x * val.y;
              if (score >= 12) return 'rgba(239, 68, 68, 0.7)';
              if (score >= 8)  return 'rgba(249, 115, 22, 0.7)';
              if (score >= 4)  return 'rgba(234, 179, 8, 0.7)';
              return 'rgba(34, 197, 94, 0.7)';
            },
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: { display: true, text: 'Likelihood (1-5)' },
              min: 0, max: 5,
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            y: {
              title: { display: true, text: 'Impact (1-5)' },
              min: 0, max: 5,
              grid: { color: 'rgba(255,255,255,0.05)' }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                // Static chart data only — not user input — safe
                label: function (context) {
                  return `Likelihood: ${context.raw.x}, Impact: ${context.raw.y}`;
                }
              }
            }
          }
        }
      });
    }

    // Control Implementation Status — Doughnut Chart
    const controlCanvas = document.getElementById('controlStatusChart');
    if (controlCanvas) {
      new Chart(controlCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Implemented', 'In Progress', 'Not Implemented'],
          datasets: [{
            data: [75, 15, 10],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(56, 189, 248, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ],
            borderColor: '#1f2937',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
  }

  // If Chart.js is already on the page (loaded by the HTML), init immediately.
  // Otherwise inject the CDN script with SRI and init once it loads.
  if (typeof Chart !== 'undefined') {
    initCharts();
  } else {
    const script = document.createElement('script');
    script.src = CHARTJS_CDN;
    script.integrity = CHARTJS_SRI;
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'no-referrer';
    script.onload = initCharts;
    script.onerror = function () {
      // CDN blocked or unavailable — charts silently suppressed, rest of page unaffected
      console.warn('grc-lab.js: Chart.js could not be loaded. Charts will not render.');
    };
    document.head.appendChild(script);
  }

});
