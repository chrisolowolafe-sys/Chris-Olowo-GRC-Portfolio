document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Initialize Collapsible Sections
  const collapsibles = document.querySelectorAll('.collapsible-header');
  collapsibles.forEach(header => {
      header.addEventListener('click', function() {
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
  if(collapsibles.length > 0) {
      collapsibles[0].click();
  }

  // 2. Helper function for badges
  function getBadgeClass(value) {
      const val = value.toLowerCase();
      if (['critical', 'not implemented', 'remediation required', 'no'].includes(val)) return 'badge-critical';
      if (['high'].includes(val)) return 'badge-high';
      if (['medium', 'in progress', 'under review', 'investigating'].includes(val)) return 'badge-medium';
      if (['low', 'active', 'implemented', 'compliant', 'resolved', 'mitigated', 'yes'].includes(val)) return 'badge-low';
      return 'badge-progress';
  }

  // 3. Fetch and Populate Data
  
  // Assets
  fetch('data/assets.json')
      .then(res => res.json())
      .then(data => {
          const tbody = document.getElementById('assets-body');
          data.forEach(item => {
              tbody.innerHTML += `
                  <tr>
                      <td>${item.id}</td>
                      <td>${item.name}</td>
                      <td>${item.owner}</td>
                      <td>${item.classification}</td>
                      <td><span class="badge ${getBadgeClass(item.status)}">${item.status}</span></td>
                  </tr>
              `;
          });
      });

  // Risk Register
  fetch('data/risk-register.json')
      .then(res => res.json())
      .then(data => {
          const tbody = document.getElementById('risks-body');
          data.forEach(item => {
              tbody.innerHTML += `
                  <tr>
                      <td>${item.id}</td>
                      <td>${item.description}</td>
                      <td>${item.likelihood}</td>
                      <td>${item.impact}</td>
                      <td><span class="badge ${getBadgeClass(item.level)}">${item.level}</span></td>
                      <td>${item.mitigation}</td>
                  </tr>
              `;
          });
      });

  // Controls
  fetch('data/controls.json')
      .then(res => res.json())
      .then(data => {
          const tbody = document.getElementById('controls-body');
          data.forEach(item => {
              tbody.innerHTML += `
                  <tr>
                      <td>${item.id}</td>
                      <td>${item.name}</td>
                      <td>${item.framework}</td>
                      <td><span class="badge ${getBadgeClass(item.status)}">${item.status}</span></td>
                  </tr>
              `;
          });
      });

  // Vendors
  fetch('data/vendors.json')
      .then(res => res.json())
      .then(data => {
          const tbody = document.getElementById('vendors-body');
          data.forEach(item => {
              tbody.innerHTML += `
                  <tr>
                      <td>${item.vendor}</td>
                      <td>${item.service}</td>
                      <td><span class="badge ${getBadgeClass(item.riskRating)}">${item.riskRating}</span></td>
                      <td><span class="badge ${getBadgeClass(item.status)}">${item.status}</span></td>
                  </tr>
              `;
          });
      });

  // Incidents
  fetch('data/incidents.json')
      .then(res => res.json())
      .then(data => {
          const tbody = document.getElementById('incidents-body');
          data.forEach(item => {
              tbody.innerHTML += `
                  <tr>
                      <td>${item.id}</td>
                      <td>${item.type}</td>
                      <td><span class="badge ${getBadgeClass(item.severity)}">${item.severity}</span></td>
                      <td><span class="badge ${getBadgeClass(item.status)}">${item.status}</span></td>
                      <td>${item.date}</td>
                  </tr>
              `;
          });
      });

  // SoA
  fetch('data/soa.json')
      .then(res => res.json())
      .then(data => {
          const tbody = document.getElementById('soa-body');
          data.forEach(item => {
              tbody.innerHTML += `
                  <tr>
                      <td>${item.id}</td>
                      <td>${item.description}</td>
                      <td><span class="badge ${getBadgeClass(item.applicable)}">${item.applicable}</span></td>
                      <td>${item.justification}</td>
                  </tr>
              `;
          });
      });

  // 4. Initialize Chart.js Visualizations
  
  // Common Chart Options
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Inter', sans-serif";

  // Risk Heatmap (Bubble Chart)
  const riskCtx = document.getElementById('riskHeatmap').getContext('2d');
  new Chart(riskCtx, {
      type: 'bubble',
      data: {
          datasets: [{
              label: 'Active Risks',
              data: [
                  { x: 4, y: 4, r: 20 }, // High Likelihood, High Impact (Critical)
                  { x: 4, y: 3, r: 15 }, // High L, Med I
                  { x: 3, y: 4, r: 15 }, // Med L, High I
                  { x: 2, y: 4, r: 10 }, // Low L, High I
                  { x: 3, y: 2, r: 10 }  // Med L, Low I
              ],
              backgroundColor: function(context) {
                  const val = context.raw;
                  if (!val) return 'rgba(56, 189, 248, 0.6)';
                  const score = val.x * val.y;
                  if (score >= 12) return 'rgba(239, 68, 68, 0.7)'; // Red
                  if (score >= 8) return 'rgba(249, 115, 22, 0.7)'; // Orange
                  if (score >= 4) return 'rgba(234, 179, 8, 0.7)';  // Yellow
                  return 'rgba(34, 197, 94, 0.7)'; // Green
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
                      label: function(context) {
                          return `Likelihood: ${context.raw.x}, Impact: ${context.raw.y}`;
                      }
                  }
              }
          }
      }
  });

  // Control Implementation Status (Doughnut Chart)
  const controlCtx = document.getElementById('controlStatusChart').getContext('2d');
  new Chart(controlCtx, {
      type: 'doughnut',
      data: {
          labels: ['Implemented', 'In Progress', 'Not Implemented'],
          datasets: [{
              data: [75, 15, 10],
              backgroundColor: [
                  'rgba(34, 197, 94, 0.8)', // Green
                  'rgba(56, 189, 248, 0.8)', // Blue
                  'rgba(239, 68, 68, 0.8)'   // Red
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

});
