/**
 * PathNER — Dashboard Controller (v2)
 */
document.addEventListener('DOMContentLoaded', () => {
  window.mapEngine.init();
  window.isolationPanel.init();
  window.forecastController?.init(loadDashboardState);
  loadDashboardState('current');

  // Forecast bar buttons
  document.querySelectorAll('.tb-btn[data-horizon]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tb-btn[data-horizon]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadDashboardState(btn.dataset.horizon);
    });
  });

  // Vehicle telemetry
  window.vehicleTracker?.start(3500);

  // Alerts
  loadAlerts();
  const langSelect = document.getElementById('lang-select');
  if (langSelect) langSelect.addEventListener('change', e => loadAlerts(e.target.value));
});

async function loadDashboardState(horizon = 'current') {
  try {
    const [graphRes, isoRes, forecastRes] = await Promise.all([
      fetch(`/api/v1/graph/accessibility?horizon=${horizon}`),
      fetch(`/api/v1/isolation-index?horizon=${horizon}`),
      fetch('/api/v1/graph/forecast')
    ]);
    const graphData = await graphRes.json();
    const isoData = await isoRes.json();
    const forecastData = await forecastRes.json();

    if (graphData.status === 'success') {
      window.mapEngine.renderAccessibilityGraph(graphData, showEdgeDrawer);
    }
    if (isoData.status === 'success') {
      window.isolationPanel.render(isoData);
    }
    if (forecastData.status === 'success' && window.forecastChart) {
      window.forecastChart.renderChart(forecastData.timeline);
    }
  } catch (err) { console.error('Dashboard load error:', err); }
}

function showEdgeDrawer(edge) {
  const el = document.getElementById('explainability-drawer');
  if (!el) return;

  const barClass = edge.risk_score >= 70 ? 'f-danger' : edge.risk_score >= 50 ? 'f-warn' : 'f-accent';
  const tagCls = edge.risk_score >= 70 ? 'tag-danger' : edge.risk_score >= 50 ? 'tag-warn' : 'tag-safe';

  let factorsHtml = '';
  if (edge.factors?.length) {
    factorsHtml = edge.factors.map(f => `
      <div class="factor-row">
        <div class="factor-row-head">
          <span class="factor-row-name">${f.factor}</span>
          <span class="factor-row-val">${f.percentage}%</span>
        </div>
        <div class="bar-track"><div class="bar-fill ${barClass}" style="width:${f.percentage}%"></div></div>
        <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px">${f.detail}</div>
      </div>`).join('');
  }

  el.innerHTML = `
    <div class="panel-head" style="border-top:1px solid var(--border-primary)">
      <span class="panel-head-title">Risk Attribution: ${edge.name}</span>
      <span class="tag ${tagCls}">${edge.risk_score}%</span>
    </div>
    <div class="panel-scroll">
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;line-height:1.5">
        <b>${edge.road_type}</b> &middot; ${edge.distance_km} km &middot; ${edge.slope_deg}&deg; slope
      </div>
      <div style="font-size:11px;font-weight:700;color:var(--text-heading);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">
        SHAP Hazard Attribution
      </div>
      ${factorsHtml}
    </div>`;
}

async function loadAlerts(lang = 'en') {
  const el = document.getElementById('alerts-list-container');
  if (!el) return;
  try {
    const res = await fetch(`/api/v1/alerts?lang=${lang}`);
    const data = await res.json();
    if (data.status === 'success') {
      el.innerHTML = data.alerts.map(a => `
        <div class="alert-item ${a.severity === 'CRITICAL' ? '' : 'a-warn'}">
          <div class="alert-item-title">${a.title}</div>
          <div class="alert-item-body">${a.message}</div>
          <div class="alert-item-time">${new Date(a.timestamp).toLocaleString()}</div>
        </div>`).join('');
    }
  } catch (err) { console.warn('Alert load error:', err); }
}
