// Chart.js Manager for Dashboard Metrics

let statusChartInstance = null;
let categoryChartInstance = null;
let deptChartInstance = null;
let neighborhoodChartInstance = null;

function renderDashboardCharts(chartsData) {
  if (!chartsData) return;

  // 1. Status Distribution Doughnut Chart
  const statusCtx = document.getElementById('chart-status')?.getContext('2d');
  if (statusCtx && chartsData.status_distribution) {
    if (statusChartInstance) statusChartInstance.destroy();

    const labels = chartsData.status_distribution.map(item => item.status);
    const data = chartsData.status_distribution.map(item => item.count);

    statusChartInstance = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#64748b']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // 2. Category Distribution Bar Chart
  const catCtx = document.getElementById('chart-categories')?.getContext('2d');
  if (catCtx && chartsData.category_distribution) {
    if (categoryChartInstance) categoryChartInstance.destroy();

    const labels = chartsData.category_distribution.map(item => item.name);
    const data = chartsData.category_distribution.map(item => item.count);

    categoryChartInstance = new Chart(catCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Talep Sayısı',
          data: data,
          backgroundColor: '#0284c7',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  // 3. Department Distribution Pie Chart
  const deptCtx = document.getElementById('chart-departments')?.getContext('2d');
  if (deptCtx && chartsData.department_distribution) {
    if (deptChartInstance) deptChartInstance.destroy();

    const labels = chartsData.department_distribution.map(item => item.name);
    const data = chartsData.department_distribution.map(item => item.count);

    deptChartInstance = new Chart(deptCtx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#1e3a8a', '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // 4. Neighborhood Density Horizontal Bar Chart
  const nCtx = document.getElementById('chart-neighborhoods')?.getContext('2d');
  if (nCtx && chartsData.neighborhood_density) {
    if (neighborhoodChartInstance) neighborhoodChartInstance.destroy();

    const labels = chartsData.neighborhood_density.map(item => item.name);
    const data = chartsData.neighborhood_density.map(item => item.count);

    neighborhoodChartInstance = new Chart(nCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Şikâyet Yoğunluğu',
          data: data,
          backgroundColor: '#f59e0b',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }
}
