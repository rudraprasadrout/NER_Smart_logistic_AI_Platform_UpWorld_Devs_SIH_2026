class IsolationPanel {
  constructor() { this.data = null; this.filter = 'ALL'; this.query = ''; }

  init() {
    const search = document.getElementById('iso-search');
    if (search) search.addEventListener('input', e => { this.query = e.target.value.toLowerCase(); this.draw(); });
    document.querySelectorAll('.filter-chip[data-filter]').forEach(c => {
      c.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip[data-filter]').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        this.filter = c.dataset.filter;
        this.draw();
      });
    });
  }

  render(d) {
    this.data = d;
    const s = d.summary;
    this._animateNumber('kpi-iso-pop', s.total_isolated_population || 0);
    this._animateNumber('kpi-iso-count', s.isolated_count || 0);
    this._animateNumber('kpi-risk-pop', s.total_at_risk_population || 0);
    this._animateNumber('kpi-blocked', s.severed_corridors_count || 0);
    this.draw();
  }

  _animateNumber(id, targetVal) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = Number(targetVal).toLocaleString();
    el.classList.remove('kpi-pulse');
    void el.offsetWidth; // Trigger reflow for CSS animation
    el.classList.add('kpi-pulse');
  }

  draw() {
    const el = document.getElementById('iso-list');
    if (!el || !this.data) return;

    let items = this.data.settlements.filter(s => !s.is_hub);
    if (this.filter === 'ISOLATED') items = items.filter(s => s.status === 'ISOLATED');
    else if (this.filter === 'AT_RISK') items = items.filter(s => s.status === 'AT_RISK');
    if (this.query) items = items.filter(s => s.name.toLowerCase().includes(this.query) || s.district.toLowerCase().includes(this.query));

    if (!items.length) { el.innerHTML = '<div style="text-align:center;color:var(--text-tertiary);padding:24px;font-size:12px;">No matching settlements.</div>'; return; }

    const displayItems = items.slice(0, 60);
    el.innerHTML = displayItems.map(s => {
      const cls = s.status === 'ISOLATED' ? 's-isolated' : s.status === 'AT_RISK' ? 's-at-risk' : 's-safe';
      const tagCls = s.status === 'ISOLATED' ? 'tag-danger' : s.status === 'AT_RISK' ? 'tag-warn' : 'tag-safe';
      const label = s.status === 'ISOLATED' ? 'Isolated' : s.status === 'AT_RISK' ? 'At Risk' : 'Reachable';
      return `
        <div class="s-card ${cls}" data-lat="${s.lat}" data-lon="${s.lon}">
          <div class="s-card-top">
            <span class="s-card-name">${s.name}</span>
            <span class="tag ${tagCls}">${label}</span>
          </div>
          <div class="s-card-meta">${s.district}, ${s.state}</div>
          <div class="s-card-stats">
            <span>Pop: <b>${s.population.toLocaleString()}</b></span>
            <span>Buffer: <b>${s.buffer_days}d</b></span>
            ${s.status === 'ISOLATED' ? `<span style="color:var(--status-danger)">Cut-off: <b>${s.isolation_duration_hours}h</b></span>` : ''}
          </div>
          <div class="s-card-reason">${s.isolation_reason}</div>
        </div>`;
    }).join('');

    el.querySelectorAll('.s-card').forEach(card => {
      card.addEventListener('click', () => {
        window.mapEngine?.zoomToNode(+card.dataset.lat, +card.dataset.lon);
      });
    });
  }

  _set(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
}

window.isolationPanel = new IsolationPanel();
