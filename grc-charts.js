let riskChartInstance = null;
let controlChartInstance = null;

// Common chart options for dark theme
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#94a3b8',
                font: {
                    family: "'Inter', sans-serif",
                    size: 11
                },
                usePointStyle: true,
                padding: 20
            }
        }
    }
};

function renderRiskChart() {
    const canvas = document.getElementById('chart-risk');
    if (!canvas) return;

    // Safely destroy any existing chart on this canvas
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    const data = getLabData().risks;
    const counts = {
        'Critical': data.filter(r => r.level === 'Critical').length,
        'High':     data.filter(r => r.level === 'High').length,
        'Medium':   data.filter(r => r.level === 'Medium').length,
        'Low':      data.filter(r => r.level === 'Low').length
    };

    riskChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Critical', 'High', 'Medium', 'Low'],
            datasets: [{
                data: [counts['Critical'], counts['High'], counts['Medium'], counts['Low']],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.85)',
                    'rgba(249, 115, 22, 0.85)',
                    'rgba(234, 179, 8, 0.85)',
                    'rgba(56, 189, 248, 0.85)'
                ],
                borderColor: '#1e293b',
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { family: "'Inter', sans-serif", size: 11 },
                        usePointStyle: true,
                        padding: 16
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#f8fafc',
                    bodyColor: '#f8fafc',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 10
                }
            },
            cutout: '72%'
        }
    });
}

function renderControlChart() {
    const canvas = document.getElementById('chart-control');
    if (!canvas) return;

    // Safely destroy any existing chart on this canvas
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    const data = getLabData().controls;
    const counts = {
        'Implemented':     data.filter(c => c.status === 'Implemented').length,
        'In Progress':     data.filter(c => c.status === 'In Progress').length,
        'Not Implemented': data.filter(c => c.status === 'Not Implemented').length
    };

    controlChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Implemented', 'In Progress', 'Not Implemented'],
            datasets: [{
                label: 'Controls',
                data: [counts['Implemented'], counts['In Progress'], counts['Not Implemented']],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.85)',
                    'rgba(234, 179, 8, 0.85)',
                    'rgba(239, 68, 68, 0.85)'
                ],
                borderRadius: 5,
                borderSkipped: false,
                maxBarThickness: 48
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
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
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', stepSize: 1, precision: 0 }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}