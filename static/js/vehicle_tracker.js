class VehicleTracker {
  constructor() { this.timer = null; }

  start(intervalMs = 3000) {
    this.fetchVehicles();
    this.timer = setInterval(() => this.fetchVehicles(), intervalMs);
  }

  stop() { if (this.timer) clearInterval(this.timer); }

  async fetchVehicles() {
    try {
      const res = await fetch('/api/v1/vehicles');
      const data = await res.json();
      if (data.status === 'success' && window.mapEngine) {
        window.mapEngine.updateVehicleMarkers(data.vehicles);
        this.renderList(data.vehicles);
      }
    } catch (err) { console.warn('Vehicle fetch error:', err); }
  }

  renderList(vehicles) {
    const el = document.getElementById('vehicle-fleet-container');
    if (!el) return;
    el.innerHTML = vehicles.map(v => `
      <div class="s-card" style="border-left:3px solid #8b5cf6;cursor:pointer" data-lat="${v.lat}" data-lon="${v.lon}">
        <div class="s-card-top">
          <span class="s-card-name">${v.id}</span>
          <span class="tag tag-neutral">${v.status}</span>
        </div>
        <div class="s-card-meta">${v.cargo_type} &middot; ${v.driver}</div>
        <div class="s-card-stats">
          <span>Speed: <b>${v.speed_kmh} km/h</b></span>
          <span style="color:${v.delay_min > 0 ? 'var(--status-warn)' : 'var(--status-safe)'}">Delay: <b>+${v.delay_min}m</b></span>
        </div>
      </div>`).join('');

    el.querySelectorAll('.s-card').forEach(card => {
      card.addEventListener('click', () => window.mapEngine?.zoomToNode(+card.dataset.lat, +card.dataset.lon));
    });
  }
}

window.vehicleTracker = new VehicleTracker();
