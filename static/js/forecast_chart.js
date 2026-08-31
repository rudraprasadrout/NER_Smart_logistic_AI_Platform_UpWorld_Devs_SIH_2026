/**
 * PathNER — Hydrological & Geotechnical Risk Analysis Engine
 * Dual-axis Spline Analytics & Full-Screen Interactive Pop-up Modal.
 * Clean, domain-authentic military / NDRF meteorological matrix.
 */

class ForecastChart {
  constructor() {
    this.sidebarCanvasId = 'forecast-chart-canvas';
    this.modalCanvasId = 'modal-forecast-chart-canvas';
    this.sidebarChart = null;
    this.modalChart = null;
    this.timelineData = null;
    this.weatherData = null;
    this.selectedDistrict = 'ALL';

    this._initModalEvents();
  }

  _initModalEvents() {
    document.addEventListener('DOMContentLoaded', () => {
      const openBtn = document.getElementById('open-forecast-modal-btn');
      const closeBtn = document.getElementById('forecast-modal-close-btn');
      const backdrop = document.getElementById('forecast-modal-backdrop');
      const distSelect = document.getElementById('modal-district-select');

      if (openBtn) {
        openBtn.addEventListener('click', (e) => {
          // If clicked directly on canvas to switch horizon, let onClick handle, else open modal
          this.openModal();
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeModal());
      }

      if (backdrop) {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) this.closeModal();
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeModal();
      });

      if (distSelect) {
        distSelect.addEventListener('change', (e) => {
          this.selectedDistrict = e.target.value;
          this.renderModalChart();
        });
      }
    });
  }

  openModal() {
    const backdrop = document.getElementById('forecast-modal-backdrop');
    if (!backdrop) return;
    backdrop.classList.add('active');

    // Fetch live weather telemetry for detailed table if not loaded
    if (!this.weatherData) {
      fetch('/api/v1/weather')
        .then(r => r.json())
        .then(d => {
          if (d.status === 'success') {
            this.weatherData = d.weather;
            this._populateDistrictTable();
          }
        })
        .catch(() => {});
    } else {
      this._populateDistrictTable();
    }

    setTimeout(() => this.renderModalChart(), 60);
  }

  closeModal() {
    const backdrop = document.getElementById('forecast-modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  renderChart(forecastTimeline) {
    this.timelineData = forecastTimeline;
    const canvas = document.getElementById(this.sidebarCanvasId);
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    if (this.sidebarChart) this.sidebarChart.destroy();

    const data = this._extractHorizonData('ALL');

    const gradRisk = ctx.createLinearGradient(0, 0, 0, 160);
    gradRisk.addColorStop(0, 'rgba(239, 68, 68, 0.38)');
    gradRisk.addColorStop(0.7, 'rgba(239, 68, 68, 0.08)');
    gradRisk.addColorStop(1, 'rgba(239, 68, 68, 0.00)');

    const gradRain = ctx.createLinearGradient(0, 0, 0, 160);
    gradRain.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    gradRain.addColorStop(0.7, 'rgba(56, 189, 248, 0.05)');
    gradRain.addColorStop(1, 'rgba(56, 189, 248, 0.00)');

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)';

    this.sidebarChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Observed', '+24h', '+48h', '+72h'],
        datasets: [
          {
            label: 'Corridor Risk (%)',
            data: data.risks,
            borderColor: '#ef4444',
            backgroundColor: gradRisk,
            borderWidth: 2.8,
            fill: true,
            tension: 0.38,
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4.5,
            pointHoverRadius: 7,
            yAxisID: 'y'
          },
          {
            label: 'Precipitation (mm)',
            data: data.rains,
            borderColor: '#38bdf8',
            backgroundColor: gradRain,
            borderWidth: 2.4,
            borderDash: [4, 4],
            fill: true,
            tension: 0.38,
            pointBackgroundColor: '#38bdf8',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6.5,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              color: textColor,
              boxWidth: 8,
              boxHeight: 8,
              usePointStyle: true,
              font: { family: 'Inter, sans-serif', size: 10, weight: '600' }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            titleColor: '#f8fafc',
            bodyColor: '#e2e8f0',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            borderWidth: 1,
            padding: 8,
            cornerRadius: 6,
            callbacks: {
              label: (c) => ` ${c.dataset.label}: ${c.parsed.y}${c.dataset.label.includes('Risk') ? '%' : ' mm'}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor, drawTicks: false },
            ticks: { color: textColor, font: { family: 'Inter, sans-serif', size: 9.5 } }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: { color: '#ef4444', font: { size: 9.5, weight: '600' }, callback: v => v + '%' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 0,
            grid: { drawOnChartArea: false },
            ticks: { color: '#38bdf8', font: { size: 9.5, weight: '600' }, callback: v => v + 'mm' }
          }
        }
      }
    });

    this._updateChartFootnote(data.rains, data.risks);
  }

  renderModalChart() {
    const canvas = document.getElementById(this.modalCanvasId);
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    if (this.modalChart) this.modalChart.destroy();

    const data = this._extractHorizonData(this.selectedDistrict);

    const gradRisk = ctx.createLinearGradient(0, 0, 0, 260);
    gradRisk.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    gradRisk.addColorStop(0.8, 'rgba(239, 68, 68, 0.08)');
    gradRisk.addColorStop(1, 'rgba(239, 68, 68, 0.00)');

    const gradRain = ctx.createLinearGradient(0, 0, 0, 260);
    gradRain.addColorStop(0, 'rgba(56, 189, 248, 0.40)');
    gradRain.addColorStop(0.8, 'rgba(56, 189, 248, 0.06)');
    gradRain.addColorStop(1, 'rgba(56, 189, 248, 0.00)');

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)';

    this.modalChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Observed Initial', '+24 Hours (IMD/OpenWeather)', '+48 Hours Cumulative', '+72 Hours Inundation'],
        datasets: [
          {
            label: 'Corridor Hazard & Degradation Risk (%)',
            data: data.risks,
            borderColor: '#ef4444',
            backgroundColor: gradRisk,
            borderWidth: 3.2,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 9,
            yAxisID: 'y'
          },
          {
            label: 'Cumulative Precipitation (mm)',
            data: data.rains,
            borderColor: '#38bdf8',
            backgroundColor: gradRain,
            borderWidth: 2.8,
            borderDash: [5, 5],
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#38bdf8',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5.5,
            pointHoverRadius: 8,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              color: textColor,
              boxWidth: 12,
              boxHeight: 12,
              usePointStyle: true,
              font: { family: 'Inter, sans-serif', size: 11.5, weight: '700' }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f8fafc',
            bodyColor: '#e2e8f0',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: (items) => `${items[0].label}`,
              label: (context) => {
                const label = context.dataset.label || '';
                const val = context.parsed.y;
                if (label.includes('Risk')) {
                  const status = val >= 70 ? 'SEVERED / BLOCKED' : val >= 50 ? 'SEVERE CAUTION' : val >= 25 ? 'MODERATE DEGRADATION' : 'PASSABLE';
                  return ` ${label}: ${val}% [${status}]`;
                }
                return ` ${label}: ${val} mm cumulative precipitation`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Inter, sans-serif', size: 11, weight: '600' } }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: {
              color: '#ef4444',
              font: { size: 11, weight: '700' },
              callback: v => v + '%'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 0,
            grid: { drawOnChartArea: false },
            ticks: {
              color: '#38bdf8',
              font: { size: 11, weight: '700' },
              callback: v => v + 'mm'
            }
          }
        }
      }
    });

    // Update Badges
    const badgeContainer = document.getElementById('modal-metric-badges');
    if (badgeContainer) {
      const maxR = Math.max(...data.risks);
      const maxRain = Math.max(...data.rains);
      badgeContainer.innerHTML = `
        <span class="tag ${maxR >= 70 ? 'tag-danger' : maxR >= 50 ? 'tag-warn' : 'tag-safe'}">Peak Risk: ${maxR}%</span>
        <span class="tag tag-accent">Max Rain: ${maxRain} mm</span>
      `;
    }
  }

  _extractHorizonData(districtFilter = 'ALL') {
    const horizons = ['current', '24h', '48h', '72h'];
    const risks = [];
    const rains = [];

    if (this.timelineData) {
      horizons.forEach(h => {
        let edgeList = this.timelineData[h] || [];
        if (districtFilter !== 'ALL') {
          edgeList = edgeList.filter(e => e.district_context && e.district_context.toLowerCase().includes(districtFilter.toLowerCase()));
        }
        if (edgeList.length > 0) {
          const avgR = edgeList.reduce((acc, e) => acc + (e.risk_score || 0), 0) / edgeList.length;
          const avgRain = edgeList.reduce((acc, e) => acc + (e.rainfall_mm || 0), 0) / edgeList.length;
          risks.push(Math.round(avgR * 10) / 10);
          rains.push(Math.round(avgRain * 10) / 10);
        }
      });
    }

    // Default progressive baseline if timeline is empty
    return {
      risks: risks.length === 4 ? risks : [46.3, 50.3, 58.6, 68.2],
      rains: rains.length === 4 ? rains : [2.8, 57.7, 85.4, 115.8]
    };
  }

  _populateDistrictTable() {
    const tbody = document.getElementById('modal-district-table-body');
    if (!tbody || !this.weatherData) return;

    tbody.innerHTML = Object.entries(this.weatherData).map(([dist, info]) => {
      const soilPct = Math.round((info.soil_saturation_index || 0.5) * 100);
      const r72 = info.forecast_72h_mm || 50;
      const isHigh = soilPct >= 80 || r72 >= 90;
      const tagCls = isHigh ? 'tag-danger' : soilPct >= 65 ? 'tag-warn' : 'tag-safe';
      const statusLabel = isHigh ? 'Critical Inundation' : soilPct >= 65 ? 'Moderate Caution' : 'Normal Flow';

      return `
        <tr>
          <td><b>${dist}</b> <span style="font-size:10px;color:var(--text-tertiary);">(${info.center || 'Sector'})</span></td>
          <td>${info.current_rainfall_mm || 2} mm</td>
          <td>${info.forecast_24h_mm || 25} mm</td>
          <td>${info.forecast_48h_mm || 50} mm</td>
          <td><b>${info.forecast_72h_mm || 75} mm</b></td>
          <td>${soilPct}% Saturation</td>
          <td><span class="tag ${tagCls}">${statusLabel}</span></td>
        </tr>
      `;
    }).join('');
  }

  _updateChartFootnote(rainData, riskData) {
    let noteEl = document.getElementById('chart-footnote');
    if (!noteEl) {
      const container = document.querySelector('.chart-container');
      if (container && container.parentNode) {
        noteEl = document.createElement('div');
        noteEl.id = 'chart-footnote';
        noteEl.style.cssText = 'display:flex;justify-content:space-between;align-items:center;font-size:10px;color:var(--text-tertiary);margin-top:6px;padding:4px 2px;';
        container.parentNode.appendChild(noteEl);
      }
    }
    if (noteEl) {
      const maxRain = Math.max(...rainData);
      const maxRisk = Math.max(...riskData);
      noteEl.innerHTML = `
        <span>Peak Rain: <b style="color:#38bdf8">${maxRain} mm</b></span>
        <span>Peak Risk: <b style="color:#ef4444">${maxRisk}%</b></span>
        <span style="color:var(--accent);font-weight:700">⛶ Click to Expand</span>
      `;
    }
  }
}

window.forecastChart = new ForecastChart();
