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
    const ctx = document.getElementById('chart-risk');
    if (!ctx) return;

    const data = getLabData().risks;
    
    const counts = {
        'Critical': data.filter(r => r.level === 'Critical').length,
        'High': data.filter(r => r.level === 'High').length,
        'Medium': data.filter(r => r.level === 'Medium').length,
        'Low': data.filter(r => r.level === 'Low').length
    };

    if (riskChartInstance) {
        riskChartInstance.destroy();
    }

    riskChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Critical', 'High', 'Medium', 'Low'],
            datasets: [{
                data: [counts['Critical'], counts['High'], counts['Medium'], counts['Low']],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',   // Red
                    'rgba(249, 115, 22, 0.8)',  // Orange
                    'rgba(234, 179, 8, 0.8)',   // Yellow
                    'rgba(56, 189, 248, 0.8)'   // Blue
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
    const ctx = document.getElementById('chart-control');
    if (!ctx) return;

    const data = getLabData().controls;
    
    const counts = {
        'Implemented': data.filter(c => c.status === 'Implemented').length,
        'In Progress': data.filter(c => c.status === 'In Progress').length,
        'Not Implemented': data.filter(c => c.status === 'Not Implemented').length
    };

    if (controlChartInstance) {
        controlChartInstance.destroy();
    }

    controlChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Implemented', 'In Progress', 'Not Implemented'],
            datasets: [{
                label: 'Controls',
                data: [counts['Implemented'], counts['In Progress'], counts['Not Implemented']],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',   // Green
                    'rgba(234, 179, 8, 0.8)',   // Yellow
                    'rgba(239, 68, 68, 0.8)'    // Red
                ],
                borderRadius: 4,
                borderSkipped: false
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                legend: {
                    display: false // Hide legend for single dataset bar chart
                },
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
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}