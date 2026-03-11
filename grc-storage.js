/**
 * grc-storage.js
 * Manages localStorage for the GRC Platform.
 * Provides: initStorage(), getLabData(), saveLabData(), resetLabData()
 *
 * Auto-seeds on first load so the dashboard is never empty.
 */

const GRC_STORAGE_KEY = 'grc_lab_data_v1';

// ─────────────────────────────────────────────
// SEED DATA  — realistic demo content
// ─────────────────────────────────────────────
const SEED_DATA = {
  assets: [
    { id: 'A-001', name: 'Customer Database',        owner: 'IT Team',      classification: 'Confidential', status: 'Active' },
    { id: 'A-002', name: 'Cloud Infrastructure (AWS)', owner: 'DevOps',     classification: 'Critical',     status: 'Active' },
    { id: 'A-003', name: 'HR Records System',        owner: 'HR Department', classification: 'Restricted',  status: 'Active' },
    { id: 'A-004', name: 'Public Website',            owner: 'Marketing',    classification: 'Public',       status: 'Active' },
    { id: 'A-005', name: 'Legacy Financial App',      owner: 'Finance',      classification: 'Confidential', status: 'Decommissioning' },
    { id: 'A-006', name: 'VPN Gateway',               owner: 'IT Security',  classification: 'Restricted',   status: 'Active' },
    { id: 'A-007', name: 'Email Platform (M365)',     owner: 'IT Team',      classification: 'Internal',     status: 'Active' },
    { id: 'A-008', name: 'Source Code Repository',   owner: 'Engineering',  classification: 'Restricted',   status: 'Active' },
    { id: 'A-009', name: 'Payment Processing',        owner: 'Finance',      classification: 'Confidential', status: 'Active' },
    { id: 'A-010', name: 'Active Directory',          owner: 'IT Security',  classification: 'Restricted',   status: 'Active' },
  ],

  risks: [
    { id: 'R-001', description: 'Unpatched Web Servers',              assetId: 'A-002', likelihood: 5, impact: 5, level: 'Critical', mitigation: 'Automated patch management via AWS Systems Manager.' },
    { id: 'R-002', description: 'Phishing attacks targeting employees', assetId: 'A-007', likelihood: 5, impact: 4, level: 'Critical', mitigation: 'Monthly phishing simulations; deploy Proofpoint email gateway.' },
    { id: 'R-003', description: 'Third-party vendor data breach',      assetId: 'A-001', likelihood: 3, impact: 5, level: 'High',     mitigation: 'Enforce vendor risk assessments and contractual security obligations.' },
    { id: 'R-004', description: 'Misconfigured Cloud Storage',         assetId: 'A-002', likelihood: 3, impact: 4, level: 'High',     mitigation: 'Deploy CSPM and enforce bucket policies.' },
    { id: 'R-005', description: 'Loss of physical devices',            assetId: 'A-003', likelihood: 3, impact: 2, level: 'Medium',   mitigation: 'Enforce Full Disk Encryption (FDE) and MDM.' },
    { id: 'R-006', description: 'SQL Injection in legacy application', assetId: 'A-005', likelihood: 4, impact: 5, level: 'Critical', mitigation: 'Parameterise all queries; accelerate decommission plan.' },
    { id: 'R-007', description: 'Privileged access abuse',             assetId: 'A-010', likelihood: 2, impact: 5, level: 'High',     mitigation: 'Implement PAM solution and MFA for all admin accounts.' },
    { id: 'R-008', description: 'Ransomware targeting backups',        assetId: 'A-001', likelihood: 3, impact: 5, level: 'High',     mitigation: 'Immutable backup storage; quarterly restoration tests.' },
    { id: 'R-009', description: 'Insider threat — data exfiltration',  assetId: 'A-008', likelihood: 2, impact: 4, level: 'Medium',   mitigation: 'DLP solution; least-privilege access; egress monitoring.' },
    { id: 'R-010', description: 'DDoS on public website',              assetId: 'A-004', likelihood: 4, impact: 2, level: 'Medium',   mitigation: 'CloudFlare WAF and DDoS protection enabled.' },
    { id: 'R-011', description: 'Expired TLS certificates',            assetId: 'A-004', likelihood: 2, impact: 2, level: 'Low',      mitigation: "Automated cert rotation via Let's Encrypt / AWS ACM." },
    { id: 'R-012', description: 'Insufficient logging and monitoring', assetId: 'A-002', likelihood: 3, impact: 3, level: 'Medium',   mitigation: 'Deploy centralised SIEM; define alert thresholds and escalation paths.' },
  ],

  controls: [
    { id: 'CTL-001', name: 'Patch Management Policy',       riskId: 'R-001', framework: 'ISO 27001', status: 'Implemented' },
    { id: 'CTL-002', name: 'Security Awareness Training',   riskId: 'R-002', framework: 'NIST CSF',  status: 'Implemented' },
    { id: 'CTL-003', name: 'Vendor Risk Assessment',        riskId: 'R-003', framework: 'ISO 27001', status: 'In Progress' },
    { id: 'CTL-004', name: 'CSPM Tool Deployment',          riskId: 'R-004', framework: 'NIST CSF',  status: 'In Progress' },
    { id: 'CTL-005', name: 'Full Disk Encryption',          riskId: 'R-005', framework: 'CIS',       status: 'Implemented' },
    { id: 'CTL-006', name: 'Privileged Access Management',  riskId: 'R-007', framework: 'SOC 2',     status: 'Not Implemented' },
    { id: 'CTL-007', name: 'Immutable Backup Config',       riskId: 'R-008', framework: 'NIST CSF',  status: 'Implemented' },
    { id: 'CTL-008', name: 'DLP Solution',                  riskId: 'R-009', framework: 'ISO 27001', status: 'Not Implemented' },
    { id: 'CTL-009', name: 'SIEM and Alerting',             riskId: 'R-012', framework: 'SOC 2',     status: 'In Progress' },
    { id: 'CTL-010', name: 'GDPR Encryption Controls',      riskId: 'R-003', framework: 'GDPR',      status: 'Implemented' },
  ],

  vendors: [
    { id: 'V-001', name: 'Amazon Web Services (AWS)', service: 'Cloud Hosting',              riskRating: 'Medium', status: 'Compliant' },
    { id: 'V-002', name: 'Microsoft',                 service: 'Identity & Email (M365)',     riskRating: 'Low',    status: 'Compliant' },
    { id: 'V-003', name: 'TechServe MSP',             service: 'Managed IT Support',          riskRating: 'High',   status: 'Under Review' },
    { id: 'V-004', name: 'DataAnalytics Inc.',        service: 'Marketing Analytics',         riskRating: 'Medium', status: 'Remediation Required' },
    { id: 'V-005', name: 'Stripe',                    service: 'Payment Processing',          riskRating: 'Low',    status: 'Compliant' },
    { id: 'V-006', name: 'CloudFlare',                service: 'CDN & DDoS Protection',       riskRating: 'Low',    status: 'Compliant' },
  ],

  incidents: [
    { id: 'INC-001', type: 'Phishing Attempt',      assetId: 'A-007', severity: 'Medium',   status: 'Resolved',      date: '2026-03-01' },
    { id: 'INC-002', type: 'Unauthorized Access',   assetId: 'A-001', severity: 'High',     status: 'Investigating', date: '2026-03-08' },
    { id: 'INC-003', type: 'Malware Detection',     assetId: 'A-005', severity: 'Low',      status: 'Resolved',      date: '2026-03-09' },
    { id: 'INC-004', type: 'DDoS Attack',           assetId: 'A-004', severity: 'Critical', status: 'Mitigated',     date: '2026-03-10' },
  ],

  policies: [
    { id: 'POL-001', name: 'Information Security Policy',  version: '2.1', date: '2026-01-15' },
    { id: 'POL-002', name: 'Acceptable Use Policy',        version: '1.4', date: '2025-11-20' },
    { id: 'POL-003', name: 'Incident Response Plan',       version: '3.0', date: '2026-02-01' },
    { id: 'POL-004', name: 'Business Continuity Plan',     version: '1.2', date: '2026-01-30' },
  ]
};

// ─────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────

/**
 * Called once on DOMContentLoaded.
 * Seeds localStorage if empty so the app is never blank on first visit.
 */
function initStorage() {
  if (!localStorage.getItem(GRC_STORAGE_KEY)) {
    localStorage.setItem(GRC_STORAGE_KEY, JSON.stringify(SEED_DATA));
  }
}

/** Returns the current data object from localStorage. */
function getLabData() {
  try {
    const raw = localStorage.getItem(GRC_STORAGE_KEY);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SEED_DATA));
  } catch (e) {
    console.error('[GRC Storage] Failed to parse stored data:', e);
    return JSON.parse(JSON.stringify(SEED_DATA));
  }
}

/** Persists an updated data object back to localStorage. */
function saveLabData(data) {
  try {
    localStorage.setItem(GRC_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[GRC Storage] Failed to save data:', e);
  }
}

/**
 * Resets localStorage to the seed data.
 * Called by the "Load Demo Data" button.
 */
function resetLabData() {
  localStorage.setItem(GRC_STORAGE_KEY, JSON.stringify(JSON.parse(JSON.stringify(SEED_DATA))));
  // Refresh all rendered data
  if (typeof updateDashboardMetrics === 'function') updateDashboardMetrics();
  if (typeof renderAllTables       === 'function') renderAllTables();
  if (typeof renderRiskChart       === 'function') renderRiskChart();
  if (typeof renderControlChart    === 'function') renderControlChart();
  if (typeof populateDropdowns     === 'function') populateDropdowns();
}
