document.addEventListener('DOMContentLoaded', () => {
    // Initialize storage and load data
    initStorage();
    
    // Setup Navigation
    setupNavigation();
    
    // Render initial data
    updateDashboardMetrics();
    renderAllTables();
    
    // Render Charts
    renderRiskChart();
    renderControlChart();
    
    // Setup Modals
    setupModals();
    
    // Setup Filters
    setupFilters();
});

// --- NAVIGATION ---
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-target]');
    const views = document.querySelectorAll('.view-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and views
            navLinks.forEach(l => l.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            
            // Add active class to clicked link and corresponding view
            link.classList.add('active');
            const targetId = link.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// --- DASHBOARD METRICS ---
function updateDashboardMetrics() {
    const data = getLabData();
    
    const assetCount = data.assets.length;
    const riskCount = data.risks.length;
    const controlCount = data.controls.length;
    const vendorCount = data.vendors.length;
    const incidentCount = data.incidents.length;

    // Update Metric Cards
    document.getElementById('count-assets').textContent = assetCount;
    document.getElementById('count-risks').textContent = riskCount;
    document.getElementById('count-controls').textContent = controlCount;
    document.getElementById('count-vendors').textContent = vendorCount;
    document.getElementById('count-incidents').textContent = incidentCount;

    // Update Hero Stats
    document.getElementById('hero-controls').textContent = controlCount;
    document.getElementById('hero-risks').textContent = data.risks.filter(r => r.level === 'High' || r.level === 'Critical').length;
    document.getElementById('hero-incidents').textContent = data.incidents.filter(i => i.status !== 'Resolved').length;

    // Calculate Health Score
    calculateHealthScore(data);
    
    // Update Advisor
    updateHealthAdvisor(data);
}

function calculateHealthScore(data) {
    if (data.controls.length === 0 && data.risks.length === 0) {
        document.getElementById('overall-health-score').textContent = '0';
        document.getElementById('health-risk-score').textContent = '0';
        document.getElementById('health-control-score').textContent = '0%';
        return;
    }

    // Simple mock calculation
    const effectiveControls = data.controls.filter(c => c.status === 'Implemented').length;
    const controlEffectiveness = data.controls.length > 0 ? Math.round((effectiveControls / data.controls.length) * 100) : 0;
    
    const criticalRisks = data.risks.filter(r => r.level === 'Critical').length;
    const highRisks = data.risks.filter(r => r.level === 'High').length;
    const riskScore = Math.max(0, 100 - (criticalRisks * 20) - (highRisks * 10));

    const overallScore = Math.round((controlEffectiveness + riskScore) / 2);

    document.getElementById('overall-health-score').textContent = overallScore;
    document.getElementById('health-risk-score').textContent = riskScore;
    document.getElementById('health-control-score').textContent = controlEffectiveness + '%';

    const statusBadge = document.getElementById('health-status');
    if (overallScore >= 80) {
        statusBadge.textContent = 'Healthy';
        statusBadge.className = 'badge badge-success';
    } else if (overallScore >= 50) {
        statusBadge.textContent = 'Fair';
        statusBadge.className = 'badge badge-warning';
    } else {
        statusBadge.textContent = 'Needs Attention';
        statusBadge.className = 'badge badge-critical';
    }
}

// --- PROGRAM HEALTH ADVISOR ---
function updateHealthAdvisor(data) {
    const advisorList = document.getElementById('advisor-list');
    const advisorCount = document.getElementById('advisor-count');
    advisorList.innerHTML = '';
    let gaps = 0;

    // Check 1: No Assets
    if (data.assets.length === 0) {
        gaps++;
        advisorList.innerHTML += `
            <div class="advisor-item critical">
                <i class="fas fa-server advisor-icon"></i>
                <div class="advisor-content">
                    <h4>No assets inventoried</h4>
                    <p>Start by documenting what you are protecting to provide context for risks.</p>
                    <a class="advisor-action" onclick="openModal('modal-asset')">Add Assets &rarr;</a>
                </div>
            </div>`;
    }

    // Check 2: No Risks
    if (data.risks.length === 0) {
        gaps++;
        advisorList.innerHTML += `
            <div class="advisor-item critical">
                <i class="fas fa-triangle-exclamation advisor-icon"></i>
                <div class="advisor-content">
                    <h4>No risks defined</h4>
                    <p>The foundation of GRC is missing. Define your risk appetite and register risks.</p>
                    <a class="advisor-action" onclick="openModal('modal-risk')">Add Risks &rarr;</a>
                </div>
            </div>`;
    }

    // Check 3: Unmitigated Critical Risks
    const unmitigatedCritical = data.risks.filter(r => r.level === 'Critical' && !data.controls.some(c => c.riskId === r.id && c.status === 'Implemented'));
    if (unmitigatedCritical.length > 0) {
        gaps++;
        advisorList.innerHTML += `
            <div class="advisor-item warning">
                <i class="fas fa-shield-virus advisor-icon"></i>
                <div class="advisor-content">
                    <h4>Unmitigated Critical Risks</h4>
                    <p>You have ${unmitigatedCritical.length} critical risk(s) without implemented controls.</p>
                    <a class="advisor-action" onclick="openModal('modal-control')">Add Controls &rarr;</a>
                </div>
            </div>`;
    }

    // Check 4: Open Incidents
    const openIncidents = data.incidents.filter(i => i.status !== 'Resolved');
    if (openIncidents.length > 0) {
        gaps++;
        advisorList.innerHTML += `
            <div class="advisor-item warning">
                <i class="fas fa-fire advisor-icon"></i>
                <div class="advisor-content">
                    <h4>Active Incidents</h4>
                    <p>There are ${openIncidents.length} unresolved security incidents requiring attention.</p>
                    <a class="advisor-action" onclick="document.querySelector('[data-target=view-incidents]').click()">View Incidents &rarr;</a>
                </div>
            </div>`;
    }

    if (gaps === 0) {
        advisorList.innerHTML = `
            <div class="advisor-item success">
                <i class="fas fa-check-circle advisor-icon"></i>
                <div class="advisor-content">
                    <h4>Program is Healthy</h4>
                    <p>No immediate gaps identified in your core GRC data.</p>
                </div>
            </div>`;
        advisorCount.textContent = 'All Clear';
        advisorCount.className = 'badge badge-success';
    } else {
        advisorCount.textContent = `${gaps} gap${gaps > 1 ? 's' : ''} found`;
        advisorCount.className = 'badge badge-critical';
    }
}

// --- FILTERS ---
function setupFilters() {
    const pills = document.querySelectorAll('#filter-frameworks .pill');
    const searchInput = document.getElementById('search-controls');

    pills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            pills.forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            renderTableControls();
        });
    });

    if(searchInput) {
        searchInput.addEventListener('input', () => {
            renderTableControls();
        });
    }
}

// --- TABLES ---
function renderAllTables() {
    renderTableAssets();
    renderTableRisks();
    renderTableControls();
    renderTableVendors();
    renderTableIncidents();
    renderTablePolicies();
    populateDropdowns();
}

function getBadgeClass(statusOrLevel) {
    const map = {
        'Active': 'badge-success',
        'Implemented': 'badge-success',
        'Approved': 'badge-success',
        'Resolved': 'badge-success',
        
        'In Progress': 'badge-warning',
        'Under Review': 'badge-warning',
        'Investigating': 'badge-warning',
        'Medium': 'badge-warning',
        
        'Not Implemented': 'badge-critical',
        'Rejected': 'badge-critical',
        'Open': 'badge-critical',
        'High': 'badge-critical',
        'Critical': 'badge-critical',
        
        'Low': 'badge-info',
        'Public': 'badge-info',
        
        'Inactive': 'badge-neutral',
        'Internal': 'badge-neutral',
        'Confidential': 'badge-warning',
        'Restricted': 'badge-critical'
    };
    return map[statusOrLevel] || 'badge-neutral';
}

function renderTableAssets() {
    const tbody = document.querySelector('#table-assets tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const data = getLabData().assets;
    
    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td><span style="font-family: monospace; color: var(--text-muted)">${item.id}</span></td>
                <td style="font-weight: 500">${item.name}</td>
                <td>${item.owner}</td>
                <td><span class="badge ${getBadgeClass(item.classification)}">${item.classification}</span></td>
                <td><span class="badge ${getBadgeClass(item.status)}">${item.status}</span></td>
            </tr>
        `;
    });
}

function renderTableRisks() {
    const tbody = document.querySelector('#table-risks tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const data = getLabData().risks;
    
    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td><span style="font-family: monospace; color: var(--text-muted)">${item.id}</span></td>
                <td style="font-weight: 500">${item.description}</td>
                <td>${item.assetId}</td>
                <td>${item.likelihood}</td>
                <td>${item.impact}</td>
                <td><span class="badge ${getBadgeClass(item.level)}">${item.level}</span></td>
            </tr>
        `;
    });
}

function renderTableControls() {
    const tbody = document.querySelector('#table-controls tbody');
    if(!tbody) return;
    
    const data = getLabData().controls;
    
    // Get active filter
    const activePill = document.querySelector('#filter-frameworks .pill.active');
    const frameworkFilter = activePill ? activePill.getAttribute('data-filter') : 'all';
    
    // Get search query
    const searchInput = document.getElementById('search-controls');
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';

    // Filter data
    const filteredData = data.filter(item => {
        const matchFramework = frameworkFilter === 'all' || item.framework === frameworkFilter;
        const matchSearch = item.name.toLowerCase().includes(searchQuery) || 
                            item.id.toLowerCase().includes(searchQuery) ||
                            item.framework.toLowerCase().includes(searchQuery);
        return matchFramework && matchSearch;
    });

    // Update count badge
    const countBadge = document.getElementById('controls-table-count');
    if(countBadge) countBadge.textContent = `${filteredData.length} controls`;

    tbody.innerHTML = '';
    
    if(filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">No controls found matching your criteria.</td></tr>`;
        return;
    }

    filteredData.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td><span style="font-family: monospace; color: var(--text-muted)">${item.id}</span></td>
                <td style="font-weight: 500">${item.name}</td>
                <td>${item.riskId}</td>
                <td><span class="badge badge-neutral">${item.framework}</span></td>
                <td><span class="badge ${getBadgeClass(item.status)}">${item.status}</span></td>
                <td><button class="btn btn-outline btn-sm"><i class="fas fa-plus"></i> Add</button></td>
            </tr>
        `;
    });
}

function renderTableVendors() {
    const tbody = document.querySelector('#table-vendors tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const data = getLabData().vendors;
    
    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td><span style="font-family: monospace; color: var(--text-muted)">${item.id}</span></td>
                <td style="font-weight: 500">${item.name}</td>
                <td>${item.service}</td>
                <td><span class="badge ${getBadgeClass(item.riskRating)}">${item.riskRating}</span></td>
                <td><span class="badge ${getBadgeClass(item.status)}">${item.status}</span></td>
            </tr>
        `;
    });
}

function renderTableIncidents() {
    const tbody = document.querySelector('#table-incidents tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const data = getLabData().incidents;
    
    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td><span style="font-family: monospace; color: var(--text-muted)">${item.id}</span></td>
                <td style="font-weight: 500">${item.type}</td>
                <td>${item.assetId}</td>
                <td><span class="badge ${getBadgeClass(item.severity)}">${item.severity}</span></td>
                <td><span class="badge ${getBadgeClass(item.status)}">${item.status}</span></td>
                <td>${item.date}</td>
            </tr>
        `;
    });
}

function renderTablePolicies() {
    const tbody = document.querySelector('#table-policies tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const data = getLabData().policies || [];
    
    if(data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No policies uploaded yet.</td></tr>`;
        return;
    }

    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td><span style="font-family: monospace; color: var(--text-muted)">${item.id}</span></td>
                <td style="font-weight: 500">${item.name}</td>
                <td>v${item.version}</td>
                <td>${item.date}</td>
                <td><span class="badge badge-success">Active</span></td>
            </tr>
        `;
    });
}

// --- DROPDOWNS ---
function populateDropdowns() {
    const data = getLabData();
    
    const assetSelects = document.querySelectorAll('select[name="assetId"]');
    assetSelects.forEach(select => {
        select.innerHTML = '<option value="">Select an Asset...</option>';
        data.assets.forEach(a => {
            select.innerHTML += `<option value="${a.id}">${a.name} (${a.id})</option>`;
        });
    });

    const riskSelects = document.querySelectorAll('select[name="riskId"]');
    riskSelects.forEach(select => {
        select.innerHTML = '<option value="">Select a Risk...</option>';
        data.risks.forEach(r => {
            select.innerHTML += `<option value="${r.id}">${r.description.substring(0,30)}... (${r.id})</option>`;
        });
    });
}

// --- MODALS & FORMS ---
function openModal(modalId) {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById(modalId).classList.add('active');
}

function closeModals() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

function setupModals() {
    // Close on overlay click
    document.getElementById('modal-overlay').addEventListener('click', closeModals);

    // Form Submissions
    setupForm('form-asset', 'assets', (formData) => ({
        id: 'AST-' + Math.floor(Math.random() * 10000),
        name: formData.get('name'),
        owner: formData.get('owner'),
        classification: formData.get('classification'),
        status: formData.get('status')
    }));

    setupForm('form-risk', 'risks', (formData) => {
        const l = parseInt(formData.get('likelihood'));
        const i = parseInt(formData.get('impact'));
        const score = l * i;
        let level = 'Low';
        if(score >= 15) level = 'Critical';
        else if(score >= 10) level = 'High';
        else if(score >= 5) level = 'Medium';

        return {
            id: 'RSK-' + Math.floor(Math.random() * 10000),
            description: formData.get('description'),
            assetId: formData.get('assetId'),
            likelihood: l,
            impact: i,
            level: level
        };
    });

    setupForm('form-control', 'controls', (formData) => ({
        id: 'CTL-' + Math.floor(Math.random() * 10000),
        name: formData.get('name'),
        riskId: formData.get('riskId'),
        framework: formData.get('framework'),
        status: formData.get('status')
    }));

    setupForm('form-vendor', 'vendors', (formData) => ({
        id: 'VND-' + Math.floor(Math.random() * 10000),
        name: formData.get('name'),
        service: formData.get('service'),
        riskRating: formData.get('riskRating'),
        status: formData.get('status')
    }));

    setupForm('form-incident', 'incidents', (formData) => ({
        id: 'INC-' + Math.floor(Math.random() * 10000),
        type: formData.get('type'),
        assetId: formData.get('assetId'),
        severity: formData.get('severity'),
        status: formData.get('status'),
        date: new Date().toISOString().split('T')[0]
    }));

    setupForm('form-policy', 'policies', (formData) => ({
        id: 'POL-' + Math.floor(Math.random() * 10000),
        name: formData.get('name'),
        version: formData.get('version'),
        date: new Date().toISOString().split('T')[0]
    }));
}

function setupForm(formId, dataType, dataMapper) {
    const form = document.getElementById(formId);
    if(!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const newItem = dataMapper(formData);
        
        const data = getLabData();
        if(!data[dataType]) data[dataType] = [];
        data[dataType].push(newItem);
        saveLabData(data);
        
        closeModals();
        form.reset();
        
        // Refresh UI
        updateDashboardMetrics();
        renderAllTables();
        renderRiskChart();
        renderControlChart();
    });
}
