/**
 * PathNER — Professional GIS Map Engine (v7.0)
 * High-Visibility Dual-Stroke Corridors, Interactive Layer HUD, and Circular Badge Styling
 */

class MapEngine {
  constructor(id = 'map-container') {
    this.id = id;
    this.map = null;
    this.currentTileLayer = null;
    this.currentBasemap = 'dark';
    this.canvasRenderer = null;
    this.edges = {};
    this.nodes = {};
    this.canvasMarkers = [];
    this.vehicles = {};
    this.routeLayers = [];
    
    // Layer visibility state
    this.layersVisible = {
      roads: true,
      hubs: true,
      alerts: true,
      network: true,
      fleet: true
    };

    this.basemaps = {
      dark: {
        name: 'Dark Tactical',
        icon: '🌌',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        attr: 'Tiles © Esri — Dark Canvas'
      },
      satellite: {
        name: 'Satellite',
        icon: '🛰️',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attr: 'Tiles © Esri — Satellite Imagery'
      },
      light: {
        name: 'Streets',
        icon: '🗺️',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attr: '© OpenStreetMap contributors'
      },
      topo: {
        name: 'Topographic',
        icon: '🏔️',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attr: 'Tiles © Esri — Topographic'
      }
    };
  }

  init(center = [25.5788, 91.8933], zoom = 9) {
    if (this.map) return;
    this.map = L.map(this.id, { 
      center, 
      zoom, 
      zoomControl: true, 
      attributionControl: false,
      preferCanvas: true
    });

    this.canvasRenderer = L.canvas({ padding: 0.5 });

    const savedTheme = localStorage.getItem('pathner_basemap') || (localStorage.getItem('pathner_theme') === 'light' ? 'light' : 'dark');
    this.setBasemap(savedTheme);
    this.addBasemapSwitcherWidget();
    this.addLayerFilterWidget();
    this.addFloatingLegendWidget();
  }

  setBasemap(type) {
    if (!this.map || !this.basemaps[type]) return;
    this.currentBasemap = type;
    localStorage.setItem('pathner_basemap', type);

    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }

    const bm = this.basemaps[type];
    this.currentTileLayer = L.tileLayer(bm.url, {
      maxZoom: 19,
      attribution: bm.attr
    }).addTo(this.map);

    document.querySelectorAll('.map-style-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.style === type);
    });
  }

  switchTileLayer(theme) {
    this.setBasemap(theme === 'light' ? 'light' : 'dark');
  }

  addBasemapSwitcherWidget() {
    const container = document.getElementById(this.id);
    if (!container || container.querySelector('.map-style-switcher')) return;

    const switcher = document.createElement('div');
    switcher.className = 'map-style-switcher';
    
    Object.entries(this.basemaps).forEach(([key, val]) => {
      const btn = document.createElement('button');
      btn.className = `map-style-btn ${this.currentBasemap === key ? 'active' : ''}`;
      btn.dataset.style = key;
      btn.innerHTML = `<span>${val.icon}</span> <span>${val.name}</span>`;
      btn.title = `Switch to ${val.name} Basemap`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setBasemap(key);
      });
      switcher.appendChild(btn);
    });

    container.appendChild(switcher);
  }

  addLayerFilterWidget() {
    const container = document.getElementById(this.id);
    if (!container || container.querySelector('.map-layer-hud')) return;

    const hud = document.createElement('div');
    hud.className = 'map-layer-hud';
    hud.innerHTML = `
      <button class="map-layer-toggle active" data-layer="roads">🛣️ Roads</button>
      <button class="map-layer-toggle active" data-layer="hubs">🟣 Hubs</button>
      <button class="map-layer-toggle active" data-layer="alerts">⚠️ Chokepoints</button>
      <button class="map-layer-toggle active" data-layer="network">⚡ All Nodes (GPU)</button>
      <button class="map-layer-toggle active" data-layer="fleet">🚚 Fleet</button>
    `;

    hud.querySelectorAll('.map-layer-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const layer = btn.dataset.layer;
        this.layersVisible[layer] = !this.layersVisible[layer];
        btn.classList.toggle('active', this.layersVisible[layer]);
        this.applyLayerVisibility();
      });
    });

    container.appendChild(hud);
  }

  applyLayerVisibility() {
    // Roads
    Object.values(this.edges).forEach(l => {
      if (this.layersVisible.roads) {
        if (l.casing && !this.map.hasLayer(l.casing)) this.map.addLayer(l.casing);
        if (l.line && !this.map.hasLayer(l.line)) this.map.addLayer(l.line);
      } else {
        if (l.casing) this.map.removeLayer(l.casing);
        if (l.line) this.map.removeLayer(l.line);
      }
    });

    // Strategic DOM Badge Nodes
    Object.entries(this.nodes).forEach(([id, m]) => {
      const isHub = m._isHub;
      const isAlert = m._isAlert;

      let show = true;
      if (isHub && !this.layersVisible.hubs) show = false;
      if (isAlert && !this.layersVisible.alerts) show = false;

      if (show) {
        if (!this.map.hasLayer(m)) this.map.addLayer(m);
      } else {
        this.map.removeLayer(m);
      }
    });

    // GPU Canvas Network Nodes
    this.canvasMarkers.forEach(cm => {
      if (this.layersVisible.network) {
        if (!this.map.hasLayer(cm)) this.map.addLayer(cm);
      } else {
        this.map.removeLayer(cm);
      }
    });

    // Vehicles
    Object.values(this.vehicles).forEach(v => {
      if (this.layersVisible.fleet) {
        if (!this.map.hasLayer(v)) this.map.addLayer(v);
      } else {
        this.map.removeLayer(v);
      }
    });
  }

  addFloatingLegendWidget() {
    const container = document.getElementById(this.id);
    if (!container || container.querySelector('.map-floating-legend')) return;

    const legend = document.createElement('div');
    legend.className = 'map-floating-legend';
    legend.innerHTML = `
      <div class="map-floating-legend-title">
        <span>Accessibility Network</span>
        <span id="legend-status-badge" style="font-size:9px;color:#10b981">● Live (GPU)</span>
      </div>
      <div class="legend-item">
        <span class="legend-swatch-line" style="background:#10b981"></span>
        <span>Passable Corridor (<50% Risk)</span>
      </div>
      <div class="legend-item">
        <span class="legend-swatch-line" style="background:#f59e0b"></span>
        <span>Caution Corridor (50–69% Risk)</span>
      </div>
      <div class="legend-item">
        <span class="legend-swatch-line" style="background:#ef4444;border:1px dashed #fff"></span>
        <span>Blocked / Landslide (≥70%)</span>
      </div>
      <div class="legend-item" style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1)">
        <span class="legend-swatch-dot" style="background:#6366f1"></span>
        <span>Strategic Supply Hub</span>
      </div>
      <div class="legend-item">
        <span class="legend-swatch-dot" style="background:#ef4444"></span>
        <span>Severed / Isolated Node</span>
      </div>
      <div class="legend-item">
        <span class="legend-swatch-dot" style="background:#38bdf8;width:7px;height:7px"></span>
        <span>Network Junction (GPU Canvas)</span>
      </div>
      <div class="legend-item">
        <span class="legend-swatch-dot" style="background:#8b5cf6"></span>
        <span>Relief Convoy Fleet</span>
      </div>
    `;

    container.appendChild(legend);
  }

  renderAccessibilityGraph(data, onEdgeClick) {
    if (!this.map) return;
    
    // Clear previous layers
    Object.values(this.edges).forEach(l => {
      if (l.casing) this.map.removeLayer(l.casing);
      if (l.line) this.map.removeLayer(l.line);
    });
    Object.values(this.nodes).forEach(m => this.map.removeLayer(m));
    this.canvasMarkers.forEach(cm => this.map.removeLayer(cm));
    this.edges = {};
    this.nodes = {};
    this.canvasMarkers = [];

    const renderer = this.canvasRenderer || L.canvas({ padding: 0.5 });

    // 1. Render Dual-Stroke High-Contrast Road Corridors
    data.edges.forEach(e => {
      if (!e.geometry || e.geometry.length < 2) return;
      const r = e.risk_score;
      let color = '#10b981', w = 4.5, dash = null, isBlocked = r >= 70;
      if (isBlocked) { color = '#ef4444'; w = 5.5; dash = '6,6'; }
      else if (r >= 50) { color = '#f59e0b'; w = 4.5; }
      else if (r >= 25) { color = '#fbbf24'; w = 4.0; }

      // Underlay casing for sharp contrast against satellite and bright backgrounds
      const casing = L.polyline(e.geometry, {
        color: '#000000',
        weight: w + 2.5,
        opacity: 0.75,
        lineCap: 'round',
        lineJoin: 'round',
        renderer
      }).addTo(this.map);

      // Main colored road line
      const line = L.polyline(e.geometry, { 
        color, 
        weight: w, 
        opacity: 0.95, 
        dashArray: dash, 
        lineCap: 'round', 
        lineJoin: 'round',
        renderer
      }).addTo(this.map);

      line.bindTooltip(
        `<div style="font-weight:800;font-size:12px;">${e.name}</div>` +
        `<div style="font-size:11px;margin-top:2px;">Risk Score: <b style="color:${color}">${r}%</b> · ${e.severity || 'Normal'}</div>` +
        `<div style="font-size:10px;color:#94a3b8">${e.distance_km} km · ${e.slope_deg}° slope</div>`,
        { sticky: true }
      );
      line.on('click', () => onEdgeClick && onEdgeClick(e));
      this.edges[e.id] = { casing, line };
    });

    // 2. Render Network Nodes with GPU Canvas & Strategic DOM Badges
    data.nodes.forEach(n => {
      const isHub = n.type === 'supply_hub' || Boolean(n.alias && n.alias.includes('hub'));
      const status = n.status || 'REACHABLE';
      const isIsolated = status === 'ISOLATED';
      const isAtRisk = status === 'AT_RISK';
      const isProminent = isHub || isIsolated || Boolean(n.alias);

      if (isProminent) {
        // High-visibility DOM Badges for Hubs and Critical Chokepoints
        let cls = isHub ? 'm-hub' : (isIsolated ? 'm-isolated' : 'm-at-risk');
        let label = isHub ? 'H' : (isIsolated ? '!' : '▲');
        let size = isHub ? [28, 28] : [20, 20];

        const icon = L.divIcon({
          className: `node-marker ${cls}`,
          html: `<span style="font-size:${isHub ? 12 : 10}px;font-weight:900;color:#ffffff;line-height:1">${label}</span>`,
          iconSize: size, 
          iconAnchor: [size[0]/2, size[1]/2]
        });

        const marker = L.marker([n.lat, n.lon], { icon }).addTo(this.map);
        marker._isHub = isHub;
        marker._isAlert = isIsolated || isAtRisk;

        marker.bindTooltip(
          `<div style="font-weight:700;font-size:11px">${n.name}</div>` +
          `<div style="font-size:10px;color:#94a3b8">${n.district} · <span style="color:${isIsolated ? '#ef4444' : isAtRisk ? '#f59e0b' : '#10b981'}">${status}</span></div>`,
          { sticky: true }
        );
        marker.bindPopup(
          `<div class="popup-name">${n.name}</div>` +
          `<div class="popup-district">${n.district}, ${n.state}</div>` +
          `<div class="popup-stat"><span>Reachability:</span> <span class="tag tag-${isIsolated ? 'danger' : isAtRisk ? 'warn' : 'safe'}">${status}</span></div>` +
          `<div class="popup-stat"><span>Hub Distance:</span> <b>${n.min_hub_hops >= 0 ? n.min_hub_hops + ' hops' : 'Cut off (Unreachable)'}</b></div>` +
          `<div class="popup-stat"><span>Population:</span> <b>${n.population ? n.population.toLocaleString() : 'N/A'}</b></div>` +
          `<div class="popup-stat"><span>Supply Buffer:</span> <b>${n.buffer_days || '—'} days</b></div>` +
          (n.isolation_reason ? `<div class="popup-desc">${n.isolation_reason}</div>` : '') +
          `<div style="margin-top:8px;text-align:right"><a href="/routes?to=${n.id}" class="btn btn-accent" style="font-size:10px;padding:3px 8px">Dispatch Relief &rarr;</a></div>`
        );

        this.nodes[n.id] = marker;
      } else {
        // Fast Hardware-Accelerated GPU Canvas Circle Markers for all network points
        const fillColor = isAtRisk ? '#f59e0b' : '#38bdf8';
        const circle = L.circleMarker([n.lat, n.lon], {
          renderer,
          radius: 3.5,
          color: '#0f172a',
          weight: 1,
          fillColor,
          fillOpacity: 0.85
        }).addTo(this.map);

        circle.bindTooltip(
          `<div style="font-weight:700;font-size:11px">${n.name}</div><div style="font-size:10px;color:#94a3b8">${n.district} &middot; ${status}</div>`,
          { sticky: true }
        );
        circle.bindPopup(
          `<div class="popup-name">${n.name}</div>` +
          `<div class="popup-district">${n.district}, ${n.state}</div>` +
          `<div class="popup-stat"><span>Status:</span> <span class="tag tag-${isAtRisk ? 'warn' : 'safe'}">${status}</span></div>` +
          `<div style="margin-top:6px;text-align:right"><a href="/routes?to=${n.id}" class="btn btn-accent" style="font-size:10px;padding:2px 6px">Route Here &rarr;</a></div>`
        );

        this.canvasMarkers.push(circle);
      }
    });

    this.applyLayerVisibility();
  }

  updateEdgeRisks(horizonEdges, onEdgeClick) {
    if (!horizonEdges || !this.map) return;
    horizonEdges.forEach(e => {
      const stored = this.edges[e.edge_id || e.id];
      if (!stored || !stored.line) return;
      const r = e.risk_score;
      let color = '#10b981', w = 4.5, dash = null, isBlocked = r >= 70;
      if (isBlocked) { color = '#ef4444'; w = 5.5; dash = '6,6'; }
      else if (r >= 50) { color = '#f59e0b'; w = 4.5; }
      else if (r >= 25) { color = '#fbbf24'; w = 4.0; }

      stored.line.setStyle({ color, weight: w, dashArray: dash });
      stored.edgeData = { ...(stored.edgeData || {}), ...e };
      
      stored.line.unbindTooltip();
      stored.line.bindTooltip(
        `<div style="font-weight:800;font-size:12px;">${e.name || stored.edgeData?.name || 'Road Corridor'}</div>` +
        `<div style="font-size:11px;margin-top:2px;">Risk Score: <b style="color:${color}">${r}%</b> · ${e.severity || 'Normal'}</div>` +
        `<div style="font-size:10px;color:#94a3b8">${e.distance_km || stored.edgeData?.distance_km || 10} km · ${e.rainfall_mm || 0} mm rain</div>`,
        { sticky: true }
      );
      if (onEdgeClick) {
        stored.line.off('click');
        stored.line.on('click', () => onEdgeClick(stored.edgeData));
      }
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
          html: '<span style="font-size:12px;font-weight:800;color:#fff">🚚</span>',
          iconSize: [26, 26], iconAnchor: [13, 13]
        });
        const m = L.marker(ll, { icon }).addTo(this.map);
        m.bindPopup(
          `<div class="popup-name">${v.name}</div>` +
          `<div class="popup-district">${v.cargo_type}</div>` +
          `<div class="popup-stat"><span>Priority:</span> <span class="tag tag-accent">${v.priority}</span></div>` +
          `<div class="popup-stat"><span>Status:</span> <b>${v.status}</b></div>` +
          `<div class="popup-stat"><span>Speed:</span> <b>${v.speed_kmh} km/h</b></div>` +
          `<div class="popup-stat"><span>Driver:</span> <b>${v.driver}</b></div>`
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

    // 1. Draw Default Shortest Route (High-contrast Orange/Red Dashed with Black Casing)
    if (def && def.polyline_geometry && def.polyline_geometry.length >= 2) {
      const defCasing = L.polyline(def.polyline_geometry, {
        color: '#000000',
        weight: 7,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.map);
      this.routeLayers.push(defCasing);

      const defLine = L.polyline(def.polyline_geometry, {
        color: '#f97316',
        weight: 5,
        opacity: 0.95,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.map);
      
      defLine.bindPopup(`
        <div style="font-weight:800;color:#f97316;font-size:13px;margin-bottom:4px">⚠️ Standard Shortest Path</div>
        <div style="font-size:11px">Distance: <b>${def.total_distance_km} km</b> · Time: <b>${def.total_time_hours}h</b></div>
        <div style="font-size:11px;color:var(--status-danger)">Avg Risk: <b>${def.avg_risk_score}%</b> (${def.blocked_segments_count} blocked choke points)</div>
      `);
      this.routeLayers.push(defLine);
      def.polyline_geometry.forEach(p => bounds.push(p));
    }

    // 2. Draw AI Recommended Safe Route (Vibrant Emerald with Heavy Dark Casing)
    if (safe && safe.polyline_geometry && safe.polyline_geometry.length >= 2) {
      const safeCasing = L.polyline(safe.polyline_geometry, {
        color: '#000000',
        weight: 9,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.map);
      this.routeLayers.push(safeCasing);

      const safeLine = L.polyline(safe.polyline_geometry, {
        color: '#10b981',
        weight: 6,
        opacity: 1.0,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.map);
      
      safeLine.bindPopup(`
        <div style="font-weight:800;color:#10b981;font-size:13px;margin-bottom:4px">🛡️ AI Recommended Safe Path</div>
        <div style="font-size:11px">Distance: <b>${safe.total_distance_km} km</b> · Time: <b>${safe.total_time_hours}h</b></div>
        <div style="font-size:11px;color:var(--status-safe)">Avg Risk: <b>${safe.avg_risk_score}%</b> (0 blocked segments)</div>
      `);
      this.routeLayers.push(safeLine);
      safe.polyline_geometry.forEach(p => bounds.push(p));
    }

    // 3. Start & Destination Pins accurately anchored to coordinate
    if (routeData.from) {
      const fromIcon = L.divIcon({
        className: 'route-pin-wrapper',
        html: `<div class="route-pin-start">🟢 ORIGIN: ${routeData.from.name}</div><div class="pin-point start-point"></div>`,
        iconSize: [220, 36],
        iconAnchor: [110, 34]
      });
      const startMarker = L.marker([routeData.from.lat, routeData.from.lon], { icon: fromIcon }).addTo(this.map);
      startMarker.bindPopup(`<b>Supply Origin:</b> ${routeData.from.name}<br><small>${routeData.from.district}, ${routeData.from.state}</small>`);
      this.routeLayers.push(startMarker);
    }

    if (routeData.to) {
      const toIcon = L.divIcon({
        className: 'route-pin-wrapper',
        html: `<div class="route-pin-dest">🏁 DESTINATION: ${routeData.to.name}</div><div class="pin-point dest-point"></div>`,
        iconSize: [240, 36],
        iconAnchor: [120, 34]
      });
      const endMarker = L.marker([routeData.to.lat, routeData.to.lon], { icon: toIcon }).addTo(this.map);
      endMarker.bindPopup(`<b>Relief Destination:</b> ${routeData.to.name}<br><small>${routeData.to.district}, ${routeData.to.state}</small>`);
      this.routeLayers.push(endMarker);
    }

    if (bounds.length > 0) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [70, 70] });
    }
  }

  zoomToNode(lat, lon) {
    if (this.map) this.map.flyTo([lat, lon], 12, { animate: true, duration: 0.8 });
  }
}

window.mapEngine = new MapEngine();
