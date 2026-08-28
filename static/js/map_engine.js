class MapEngine {
  constructor(id = 'map-container') {
    this.id = id;
    this.map = null;
    this.tile = null;
    this.edges = {};
    this.nodes = {};
    this.vehicles = {};
    this.routeLayers = [];
  }

  init(center = [25.5788, 91.8933], zoom = 9) {
    if (this.map) return;
    this.map = L.map(this.id, { center, zoom, zoomControl: true, attributionControl: false });
    this.switchTileLayer(localStorage.getItem('pathner_theme') || 'dark');
  }

  switchTileLayer(theme) {
    if (!this.map) return;
    if (this.tile) this.map.removeLayer(this.tile);
    const url = theme === 'light'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    this.tile = L.tileLayer(url, { maxZoom: 18, subdomains: 'abcd' }).addTo(this.map);
  }

  renderAccessibilityGraph(data, onEdgeClick) {
    if (!this.map) return;
    Object.values(this.edges).forEach(l => this.map.removeLayer(l));
    Object.values(this.nodes).forEach(m => this.map.removeLayer(m));
    this.edges = {};
    this.nodes = {};

    // Edges
    data.edges.forEach(e => {
      if (!e.geometry || e.geometry.length < 2) return;
      const r = e.risk_score;
      let color = '#34d399', w = 4, dash = null;
      if (r >= 70) { color = '#ef4444'; w = 5.5; dash = '5,7'; }
      else if (r >= 50) { color = '#f97316'; w = 4.5; }
      else if (r >= 25) { color = '#fbbf24'; w = 4; }

      const line = L.polyline(e.geometry, { color, weight: w, opacity: 0.9, dashArray: dash, lineCap: 'round', lineJoin: 'round' }).addTo(this.map);
      line.bindTooltip(
        `<div style="font-weight:700;font-size:12px;">${e.name}</div>` +
        `<div style="font-size:11px;margin-top:2px;">Risk: <b style="color:${color}">${r}%</b> · ${e.severity}</div>` +
        `<div style="font-size:10px;color:var(--text-tertiary)">${e.distance_km} km · ${e.slope_deg}° slope · ${e.rainfall_mm || 0}mm rain</div>`,
        { sticky: true }
      );
      line.on('click', () => onEdgeClick && onEdgeClick(e));
      this.edges[e.id] = line;
    });

    // Nodes
    data.nodes.forEach(n => {
      let cls = 'm-safe', label = '', size = [16, 16];
      if (n.type === 'supply_hub') { cls = 'm-hub'; label = 'H'; size = [26, 26]; }
      else if (n.status === 'ISOLATED') { cls = 'm-isolated'; label = '!'; size = [22, 22]; }
      else if (n.status === 'AT_RISK') { cls = 'm-at-risk'; label = ''; size = [20, 20]; }

      const icon = L.divIcon({
        className: `node-marker ${cls}`,
        html: label ? `<span style="font-size:11px;font-weight:800;color:#fff">${label}</span>` : '',
        iconSize: size, iconAnchor: [size[0]/2, size[1]/2]
      });

      const marker = L.marker([n.lat, n.lon], { icon }).addTo(this.map);
      marker.bindPopup(
        `<div class="popup-name">${n.name}</div>` +
        `<div class="popup-district">${n.district}, ${n.state}</div>` +
        `<div class="popup-stat"><b>Population:</b> ${n.population ? n.population.toLocaleString() : 'N/A'}</div>` +
        `<div class="popup-stat"><b>Supply buffer:</b> ${n.buffer_days || '—'} days</div>` +
        (n.description ? `<div class="popup-desc">${n.description}</div>` : '')
      );
      this.nodes[n.id] = marker;
    });
  }

  updateVehicleMarkers(vehicles) {
    if (!this.map) return;
    vehicles.forEach(v => {
      const ll = [v.lat, v.lon];
      if (this.vehicles[v.id]) {
        this.vehicles[v.id].setLatLng(ll);
      } else {
        const icon = L.divIcon({
          className: 'node-marker m-vehicle',
          html: '<span style="font-size:10px;font-weight:800;color:#fff">V</span>',
          iconSize: [24, 24], iconAnchor: [12, 12]
        });
        const m = L.marker(ll, { icon }).addTo(this.map);
        m.bindPopup(
          `<div class="popup-name">${v.name}</div>` +
          `<div class="popup-stat"><b>Cargo:</b> ${v.cargo_type}</div>` +
          `<div class="popup-stat"><b>Priority:</b> ${v.priority}</div>` +
          `<div class="popup-stat"><b>Status:</b> ${v.status}</div>` +
          `<div class="popup-stat"><b>Driver:</b> ${v.driver}</div>`
        );
        this.vehicles[v.id] = m;
      }
    });
  }

  drawRouteComparison(routeData) {
    this.routeLayers.forEach(l => this.map.removeLayer(l));
    this.routeLayers = [];
    if (!routeData) return;
    const safe = routeData.ai_recommended_route;
    if (safe && safe.polyline_geometry) {
      const line = L.polyline(safe.polyline_geometry, {
        color: '#6366f1', weight: 6, opacity: 0.95, lineCap: 'round', lineJoin: 'round'
      }).addTo(this.map);
      this.routeLayers.push(line);
      this.map.fitBounds(line.getBounds(), { padding: [40, 40] });
    }
  }

  zoomToNode(lat, lon) {
    if (this.map) this.map.flyTo([lat, lon], 12, { animate: true, duration: 0.8 });
  }
}

window.mapEngine = new MapEngine();
