import React, { useState, useEffect } from 'react';
import { Car, Bell, Send, CheckCircle2, ShieldAlert, Clock, Plus } from 'lucide-react';
import { fetchFeederSubscriptions, fetchFeederTriggers, subscribeFeeder } from '../services/api';

export default function FeederManager({ trains = [], stations = [] }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    train_no: '12301',
    destination_station: 'CNB',
    passenger_name: '',
    contact_or_webhook: '',
    threshold_window_min: 8,
    transport_mode: 'CAB_AGGREGATOR'
  });

  const loadData = async () => {
    try {
      const [subs, trigs] = await Promise.all([
        fetchFeederSubscriptions(),
        fetchFeederTriggers()
      ]);
      setSubscriptions(subs);
      setTriggers(trigs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await subscribeFeeder(form);
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0284c7, #10b981)', padding: '10px', borderRadius: '12px' }}>
            <Car size={22} color="#fff" />
          </div>
          <div>
            <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Automated Feeder & Last-Mile Multimodal Dispatch
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Automatically triggers cab aggregators, EV feeder shuttles, or passenger SMS when ETA confidence window narrows below threshold ($\le \pm 5-8$ min).
            </p>
          </div>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Register Feeder Hook
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Active Subscriptions List */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={16} color="var(--accent-cyan)" />
            Active Subscriptions ({subscriptions.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    Train {sub.train_no} → {sub.destination_station}
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                    {sub.transport_mode.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Passenger: <strong>{sub.passenger_name || 'Anonymous'}</strong> ({sub.contact_or_webhook})
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Trigger threshold: Window width &le; {sub.threshold_window_min} min
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispatch Trigger Log */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} color="var(--accent-emerald)" />
            Live Dispatch & Notification Feed ({triggers.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {triggers.map((trig) => (
              <div
                key={trig.trigger_id}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderRadius: '10px',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-mono" style={{ fontWeight: 700, color: '#34d399', fontSize: '0.85rem' }}>
                    {trig.trigger_id} — {trig.station_code}
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                    {trig.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#e2e8f0', margin: '6px 0' }}>
                  {trig.message}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>Confirmed ETA: <strong style={{ color: '#fff' }}>{trig.confirmed_eta}</strong></span>
                  <span>{trig.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(6px)' }}>
          <div className="glass-panel-glow" style={{ width: '100%', maxWidth: '480px', padding: '24px', background: '#0f172a' }}>
            <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
              Register Last-Mile / Feeder Hook
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Select Train</label>
                <select
                  value={form.train_no}
                  onChange={(e) => setForm({ ...form, train_no: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff' }}
                >
                  {trains.map((t) => (
                    <option key={t.train_no} value={t.train_no}>{t.train_no} — {t.train_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Destination Station</label>
                <select
                  value={form.destination_station}
                  onChange={(e) => setForm({ ...form, destination_station: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff' }}
                >
                  {stations.map((s) => (
                    <option key={s.station_code} value={s.station_code}>{s.station_code} — {s.station_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Passenger Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Sharma"
                  value={form.passenger_name}
                  onChange={(e) => setForm({ ...form, passenger_name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Contact Phone or Webhook URL</label>
                <input
                  type="text"
                  required
                  placeholder="+91-9876543210 or https://cab.api/hook"
                  value={form.contact_or_webhook}
                  onChange={(e) => setForm({ ...form, contact_or_webhook: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Trigger Threshold Window (mins)</label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={form.threshold_window_min}
                  onChange={(e) => setForm({ ...form, threshold_window_min: parseFloat(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
