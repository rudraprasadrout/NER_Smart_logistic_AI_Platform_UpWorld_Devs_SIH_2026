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
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    const attribution = theme === 'light'
      ? '© OpenStreetMap contributors'
      : 'Tiles © Esri — Esri, DeLorme, NAVTEQ';
    this.tile = L.tileLayer(url, { maxZoom: 18, attribution }).addTo(this.map);
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

    const def = routeData.default_route;
    const safe = routeData.ai_recommended_route;
    const bounds = [];

    // 1. Draw Default Shortest Route (Dashed orange/red showing the direct path)
    if (def && def.polyline_geometry && def.polyline_geometry.length >= 2) {
      const defLine = L.polyline(def.polyline_geometry, {
        color: '#f97316',
        weight: 5,
        opacity: 0.75,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.map);
      
      defLine.bindPopup(`
        <div style="font-weight:700;color:#f97316;font-size:12px;margin-bottom:4px">Standard Shortest Route</div>
        <div style="font-size:11px;color:var(--text-secondary)">Distance: <b>${def.total_distance_km} km</b></div>
        <div style="font-size:11px;color:var(--text-secondary)">Est. Travel Time: <b>${def.total_time_hours}h</b></div>
        <div style="font-size:11px;color:var(--status-danger)">Avg Risk Score: <b>${def.avg_risk_score}%</b></div>
        <div style="font-size:11px;color:var(--status-danger)">Blocked Sectors: <b>${def.blocked_segments_count}</b></div>
      `);
      this.routeLayers.push(defLine);
      def.polyline_geometry.forEach(p => bounds.push(p));
    }

    // 2. Draw AI Recommended Safe Route (Solid vibrant emerald/indigo showing safest path)
    if (safe && safe.polyline_geometry && safe.polyline_geometry.length >= 2) {
      const safeLine = L.polyline(safe.polyline_geometry, {
        color: '#10b981',
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.map);
      
      safeLine.bindPopup(`
        <div style="font-weight:700;color:#10b981;font-size:12px;margin-bottom:4px">AI Recommended Safe Route</div>
        <div style="font-size:11px;color:var(--text-secondary)">Distance: <b>${safe.total_distance_km} km</b></div>
        <div style="font-size:11px;color:var(--text-secondary)">Est. Travel Time: <b>${safe.total_time_hours}h</b></div>
        <div style="font-size:11px;color:var(--status-safe)">Avg Risk Score: <b>${safe.avg_risk_score}%</b></div>
        <div style="font-size:11px;color:var(--status-safe)">Blocked Sectors: <b>${safe.blocked_segments_count}</b></div>
      `);
      this.routeLayers.push(safeLine);
      safe.polyline_geometry.forEach(p => bounds.push(p));
    }

    // 3. Add Origin and Destination Waypoint Markers
    if (routeData.from) {
      const fromIcon = L.divIcon({
        className: 'node-marker m-hub',
        html: '<span style="font-size:10px;font-weight:800;color:#fff">START</span>',
        iconSize: [44, 20],
        iconAnchor: [22, 10]
      });
      const startMarker = L.marker([routeData.from.lat, routeData.from.lon], { icon: fromIcon }).addTo(this.map);
      startMarker.bindPopup(`<b>Origin:</b> ${routeData.from.name}`);
      this.routeLayers.push(startMarker);
    }

    if (routeData.to) {
      const toIcon = L.divIcon({
        className: 'node-marker m-danger',
        html: '<span style="font-size:10px;font-weight:800;color:#fff">DEST</span>',
        iconSize: [40, 20],
        iconAnchor: [20, 10]
      });
      const endMarker = L.marker([routeData.to.lat, routeData.to.lon], { icon: toIcon }).addTo(this.map);
      endMarker.bindPopup(`<b>Destination:</b> ${routeData.to.name}`);
      this.routeLayers.push(endMarker);
    }

    if (bounds.length > 0) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
    }
  }

  zoomToNode(lat, lon) {
    if (this.map) this.map.flyTo([lat, lon], 12, { animate: true, duration: 0.8 });
  }
}

window.mapEngine = new MapEngine();
