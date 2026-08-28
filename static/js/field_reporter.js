const QUEUE_KEY = 'pathner_offline_reports_queue';

class FieldReporter {
  constructor() {
    this.queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('online', () => { this.updateOnlineStatus(true); this.syncQueuedReports(); });
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
  }

  updateOnlineStatus(isOnline) {
    const banner = document.getElementById('network-status-banner');
    if (!banner) return;
    if (isOnline) {
      banner.className = 'net-banner online';
      banner.innerHTML = '<span>Network: <b>ONLINE</b></span><span>Auto-Sync Active</span>';
    } else {
      banner.className = 'net-banner offline';
      banner.innerHTML = '<span>Network: <b>OFFLINE</b></span><span>Reports queued locally</span>';
    }
  }

  async submitReport(reportData) {
    reportData.client_report_id = 'rep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    reportData.timestamp = new Date().toISOString();

    if (!navigator.onLine) {
      this.queueReportLocally(reportData);
      return { status: 'queued_offline', message: 'Saved to offline local storage.' };
    }

    try {
      const res = await fetch('/api/v1/reports/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      return await res.json();
    } catch (err) {
      console.warn('Network error, queuing locally:', err);
      this.queueReportLocally(reportData);
      return { status: 'queued_offline', message: 'Saved to local queue due to network error.' };
    }
  }

  queueReportLocally(report) {
    this.queue.push(report);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    this.renderQueueList();
  }

  async syncQueuedReports() {
    if (!this.queue.length) return;
    const banner = document.getElementById('sync-status-msg');
    if (banner) banner.textContent = `Syncing ${this.queue.length} reports...`;

    const pending = [...this.queue];
    const synced = [];
    for (const report of pending) {
      try {
        const res = await fetch('/api/v1/reports/incident', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        });
        if (res.ok) synced.push(report.client_report_id);
      } catch { break; }
    }

    this.queue = this.queue.filter(r => !synced.includes(r.client_report_id));
    localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    this.renderQueueList();
    if (banner) banner.textContent = synced.length ? `Synced ${synced.length} reports.` : '';
  }

  renderQueueList() {
    const el = document.getElementById('queued-reports-list');
    if (!el) return;
    if (!this.queue.length) {
      el.innerHTML = '<div style="color:var(--text-tertiary);font-size:12px">Queue empty. All reports synced.</div>';
      return;
    }
    el.innerHTML = this.queue.map((r, i) => `
      <div class="queue-item">
        <div>
          <b>#${i + 1} ${r.hazard_type}</b> — ${(r.description || '').substr(0, 30)}...
          <div style="font-size:10px;color:var(--text-tertiary)">${new Date(r.timestamp).toLocaleTimeString()}</div>
        </div>
        <span class="tag tag-warn">Queued</span>
      </div>`).join('');
  }
}

window.fieldReporter = new FieldReporter();
