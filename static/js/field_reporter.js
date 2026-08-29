const QUEUE_KEY = 'pathner_offline_reports_queue';

class FieldReporter {
  constructor() {
    this.queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    this.simulatedOffline = false;
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('online', () => { 
      if (!this.simulatedOffline) {
        this.updateOnlineStatus(true); 
        this.syncQueuedReports(); 
      }
    });
    window.addEventListener('offline', () => {
      this.updateOnlineStatus(false);
    });

    // Offline simulation toggle
    const simBtn = document.getElementById('btn-toggle-sim-offline');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        this.simulatedOffline = !this.simulatedOffline;
        simBtn.classList.toggle('active', this.simulatedOffline);
        simBtn.innerHTML = this.simulatedOffline 
          ? '<span>🟢 Restore Online & Sync</span>' 
          : '<span>📡 Simulate Offline Mode (Zero Signal)</span>';
        
        this.updateOnlineStatus(!this.simulatedOffline && navigator.onLine);
        if (!this.simulatedOffline && navigator.onLine) {
          this.syncQueuedReports();
        }
      });
    }

    // Demo incident auto-filler
    const demoBtn = document.getElementById('btn-fill-demo');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        this.populateDemoIncident();
      });
    }
  }

  populateDemoIncident() {
    const nameEl = document.getElementById('rep-name');
    const edgeEl = document.getElementById('rep-edge-id');
    const hazardEl = document.getElementById('rep-hazard-type');
    const sevEl = document.getElementById('rep-severity');
    const latEl = document.getElementById('rep-lat');
    const lonEl = document.getElementById('rep-lon');
    const descEl = document.getElementById('rep-desc');

    if (nameEl) nameEl.value = 'BRO 758 Task Force (Patrol Team Beta)';
    if (hazardEl) hazardEl.value = 'Major Landslide / Debris';
    if (sevEl) sevEl.value = 'Critical (Road Completely Severed)';
    if (latEl) latEl.value = '25.1084';
    if (lonEl) lonEl.value = '92.3613';
    if (descEl) descEl.value = 'Massive boulder slip & mudflow blocking NH-6 Lubha Bridge approach. Both lanes severed, 40m stretch covered in 3m debris.';
    
    if (edgeEl && edgeEl.options.length > 1) {
      edgeEl.selectedIndex = 1;
    }

    // Visual feedback
    const toast = document.getElementById('sync-status-msg');
    if (toast) {
      toast.style.color = '#10b981';
      toast.textContent = '⚡ Demo incident data loaded! Click "Submit Incident Report" below.';
      setTimeout(() => { toast.textContent = ''; }, 4000);
    }
  }

  updateOnlineStatus(isOnline) {
    const banner = document.getElementById('network-status-banner');
    if (!banner) return;
    if (isOnline && !this.simulatedOffline) {
      banner.className = 'net-banner online';
      banner.innerHTML = '<span>Network: <b>ONLINE</b></span><span>Auto-Sync Active</span>';
    } else {
      banner.className = 'net-banner offline';
      banner.innerHTML = `<span>Network: <b>${this.simulatedOffline ? 'SIMULATED OFFLINE (Hill Valley Mode)' : 'OFFLINE'}</b></span><span>Local Storage Queue Active</span>`;
    }
  }

  async submitReport(reportData) {
    reportData.client_report_id = 'rep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    reportData.timestamp = new Date().toISOString();

    const isOffline = this.simulatedOffline || !navigator.onLine;

    if (isOffline) {
      this.queueReportLocally(reportData);
      return { 
        status: 'queued_offline', 
        message: '⚡ OFFLINE MODE: Report securely saved to browser LocalStorage queue. It will automatically transmit when online signal is restored.' 
      };
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
      return { status: 'queued_offline', message: 'Network unreachable. Saved to local queue.' };
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
    if (banner) {
      banner.style.color = '#6366f1';
      banner.textContent = `🔄 Auto-syncing ${this.queue.length} queued field reports to Central Control Room...`;
    }

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
      } catch (e) { 
        break; 
      }
    }

    this.queue = this.queue.filter(r => !synced.includes(r.client_report_id));
    localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    this.renderQueueList();

    if (banner) {
      if (synced.length > 0) {
        banner.style.color = '#10b981';
        banner.textContent = `✅ Successfully synced ${synced.length} field report(s) to Control Room!`;
        setTimeout(() => { banner.textContent = ''; }, 4500);
      } else {
        banner.textContent = '';
      }
    }
  }

  renderQueueList() {
    const list = document.getElementById('queue-items');
    const countEl = document.getElementById('queue-count');
    if (countEl) countEl.textContent = this.queue.length;
    if (!list) return;

    if (!this.queue.length) {
      list.innerHTML = '<div style="color:var(--text-tertiary);font-size:12px;text-align:center;padding:12px">No pending offline reports. All reports are synced!</div>';
      return;
    }

    list.innerHTML = this.queue.map((r, i) => `
      <div class="queue-item" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:10px;border-radius:8px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-weight:700;font-size:12px;color:#f8fafc">#${i+1} · ${r.hazard_type}</span>
          <span class="tag tag-warn" style="font-size:10px">Queued Offline</span>
        </div>
        <div style="font-size:11px;color:#94a3b8">${r.description || 'No description provided'}</div>
        <div style="font-size:10px;color:#64748b;margin-top:4px">Officer: ${r.reporter_name} · Lat: ${r.lat}, Lon: ${r.lon}</div>
      </div>
    `).join('');
  }
}

window.fieldReporter = new FieldReporter();
