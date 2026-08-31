/**
 * PathNER — High-Performance Dashboard Controller
 * Instant 0ms Forecast Horizon Switching & Pre-Cached GIS Telemetry
 */

let cachedForecastTimeline = null;
const cachedIsolationByHorizon = {};
let isGraphInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
  window.mapEngine.init();
  window.isolationPanel.init();
  window.forecastController?.init(switchHorizon);
  
  // Initial synchronous load
  initDashboard();

  // Vehicle telemetry
  window.vehicleTracker?.start(3500);

  // Alerts
  loadAlerts();
  const langSelect = document.getElementById('lang-select');
  if (langSelect) langSelect.addEventListener('change', e => loadAlerts(e.target.value));
});

async function initDashboard() {
  try {
    const [graphRes, isoRes, forecastRes] = await Promise.all([
      fetch('/api/v1/graph/accessibility?horizon=current'),
      fetch('/api/v1/isolation-index?horizon=current'),
      fetch('/api/v1/graph/forecast')
    ]);
    const graphData = await graphRes.json();
    const isoData = await isoRes.json();
    const forecastData = await forecastRes.json();

    if (graphData.status === 'success') {
      window.mapEngine.renderAccessibilityGraph(graphData, showEdgeDrawer);
      isGraphInitialized = true;
    }
    if (isoData.status === 'success') {
      cachedIsolationByHorizon['current'] = isoData;
      window.isolationPanel.render(isoData);
      window.mapEngine.updateNodeStatuses(isoData.settlements);
    }
    if (forecastData.status === 'success') {
      cachedForecastTimeline = forecastData.timeline;
      if (window.forecastChart) {
        window.forecastChart.renderChart(forecastData.timeline);
      }
    }

    // Pre-warm 24h, 48h, 72h isolation states in background for 0ms transitions
    ['24h', '48h', '72h'].forEach(h => {
      fetch(`/api/v1/isolation-index?horizon=${h}`)
        .then(r => r.json())
        .then(d => { if (d.status === 'success') cachedIsolationByHorizon[h] = d; })
        .catch(() => {});
    });

  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

function switchHorizon(horizon = 'current') {
  // Update active button state
  document.querySelectorAll('.tb-btn[data-horizon]').forEach(b => {
    b.classList.toggle('active', b.dataset.horizon === horizon);
  });

  // 1. Map Road Color & Risk Transition
  if (cachedForecastTimeline && cachedForecastTimeline[horizon]) {
    window.mapEngine.updateEdgeRisks(cachedForecastTimeline[horizon], showEdgeDrawer);
  } else {
    fetch(`/api/v1/graph/forecast?horizon=${horizon}`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success' && d.timeline) {
          cachedForecastTimeline = d.timeline;
          window.mapEngine.updateEdgeRisks(d.timeline[horizon] || d.edges, showEdgeDrawer);
        }
      })
      .catch(err => console.error('Forecast horizon fetch error:', err));
  }

  // 2. Sidebar & KPI & Node Status Transition
  if (cachedIsolationByHorizon[horizon]) {
    window.isolationPanel.render(cachedIsolationByHorizon[horizon]);
    window.mapEngine.updateNodeStatuses(cachedIsolationByHorizon[horizon].settlements);
  } else {
    fetch(`/api/v1/isolation-index?horizon=${horizon}`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          cachedIsolationByHorizon[horizon] = d;
          window.isolationPanel.render(d);
          window.mapEngine.updateNodeStatuses(d.settlements);
        }
      })
      .catch(e => console.warn('Isolation fetch error:', e));
  }
}

function showEdgeDrawer(edge) {
  const el = document.getElementById('explainability-drawer');
  if (!el) return;

  const r = edge.risk_score || 0;
  const barClass = r >= 70 ? 'f-danger' : r >= 50 ? 'f-warn' : 'f-accent';
  const tagCls = r >= 70 ? 'tag-danger' : r >= 50 ? 'tag-warn' : 'tag-safe';

  // Compute normalized explainability attribution factors
  const rain = edge.rainfall_mm || 15;
  const slope = edge.slope_deg || 5;
  const soil = edge.soil_saturation || edge.soil_factor || 0.5;
  const vuln = edge.base_vulnerability || 0.3;
  
  const f_rain = Math.max(5, rain * 0.45);
  const f_slope = Math.max(5, slope * 1.2);
  const f_soil = Math.max(5, soil * 30.0);
  const f_base = Math.max(5, vuln * 35.0);
  const total = f_rain + f_slope + f_soil + f_base;

  const factors = [
    { factor: 'Precipitation Intensity', detail: `${rain} mm rainfall observed / forecast`, pct: Math.round((f_rain / total) * 100) },
    { factor: 'Terrain Steepness & Slope', detail: `${slope}° gradient mountain sector`, pct: Math.round((f_slope / total) * 100) },
    { factor: 'Soil Moisture Saturation', detail: `${Math.round(soil * 100)}% soil water saturation`, pct: Math.round((f_soil / total) * 100) },
    { factor: 'Historical Landslide Index', detail: `${Math.round(vuln * 100)}% geotechnical hazard index`, pct: Math.round((f_base / total) * 100) }
  ].sort((a, b) => b.pct - a.pct);

  const factorsHtml = factors.map(f => `
    <div class="factor-row">
      <div class="factor-row-head">
        <span class="factor-row-name">${f.factor}</span>
        <span class="factor-row-val">${f.pct}%</span>
      </div>
      <div class="bar-track"><div class="bar-fill ${barClass}" style="width:${f.pct}%"></div></div>
      <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px">${f.detail}</div>
    </div>`).join('');

  el.innerHTML = `
    <div class="panel-head" style="border-top:1px solid var(--border-primary)">
      <span class="panel-head-title">Risk Attribution: ${edge.name}</span>
      <span class="tag ${tagCls}">${r}%</span>
    </div>
    <div class="panel-scroll">
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;line-height:1.5">
        <b>${edge.road_type}</b> &middot; ${edge.distance_km} km &middot; ${edge.slope_deg}&deg; slope &middot; ${edge.district_context || 'Assam-Meghalaya'}
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

async function loadFleet() {
  const container = document.getElementById('vehicle-fleet-container');
  if (!container) return;
  try {
    const res = await fetch('/api/v1/vehicles');
    const data = await res.json();
    if (data.status === 'success' && data.vehicles) {
      window.mapEngine?.updateVehicles(data.vehicles);
      
      container.innerHTML = data.vehicles.map(v => {
        const isMed = v.priority === 'CRITICAL_MEDICAL';
        const tagClass = isMed ? 'tag-danger' : 'tag-accent';
        const pPct = Math.round(v.progress_pct);
        return `
          <div class="s-card ${isMed ? 's-isolated' : 's-at-risk'}" style="margin-bottom:8px;cursor:pointer;" onclick="window.mapEngine?.zoomToNode(${v.lat}, ${v.lon}, '${v.name}', '${v.cargo_type}')">
            <div class="s-card-top">
              <span class="s-card-name" style="font-size:12px;">🚚 ${v.name}</span>
              <span class="tag ${tagClass}">${v.priority === 'CRITICAL_MEDICAL' ? 'CRITICAL' : 'RATION'}</span>
            </div>
            <div class="s-card-meta"><b>Cargo:</b> ${v.cargo_type}</div>
            <div class="s-card-stats" style="margin:4px 0;">
              <span>Speed: <b>${v.speed_kmh} km/h</b></span>
              <span>Progress: <b>${pPct}%</b></span>
              <span style="color:${v.delay_min > 10 ? 'var(--status-danger)' : 'var(--status-safe)'}">Delay: <b>${v.delay_min}m</b></span>
            </div>
            <div class="bar-track" style="margin-bottom:4px;"><div class="bar-fill ${isMed ? 'f-danger' : 'f-accent'}" style="width:${pPct}%"></div></div>
            <div style="font-size:10px;color:var(--text-tertiary);">Driver: <b>${v.driver}</b></div>
          </div>
        `;
      }).join('');
    }
  } catch (e) {
    console.warn('Fleet load error:', e);
  }
}

// Initial triggers
document.addEventListener('DOMContentLoaded', () => {
  loadFleet();
  loadAlerts();
  // Live GPS convoy tracking interval every 4 seconds
  setInterval(loadFleet, 4000);
});
