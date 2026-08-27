import React from 'react';
import { Sparkles, AlertOctagon, Gauge, Shield, CloudRain, CheckCircle, X } from 'lucide-react';

export default function ExplainabilityView({ explainData, onClose }) {
  if (!explainData) return null;

  const { train_no, current_delay_min, severity_badge, executive_summary, factor_percentages = {}, root_cause_events = [] } = explainData;

  const factors = [
    { key: 'cascading_headway_pct', label: 'Cascading Headway Blockage', color: '#f59e0b', icon: AlertOctagon },
    { key: 'speed_restrictions_pct', label: 'Engineering Speed Restrictions (TSR)', color: '#38bdf8', icon: Gauge },
    { key: 'platform_dwell_pct', label: 'Junction Platform / Interlocking Queue', color: '#a855f7', icon: Shield },
    { key: 'weather_visibility_pct', label: 'Weather & Visibility Hazards', color: '#10b981', icon: CloudRain }
  ];

  return (
    <div className="glass-panel-glow" style={{ padding: '24px', margin: '16px 0', border: '1px solid var(--accent-indigo)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '8px', borderRadius: '10px' }}>
            <Sparkles size={20} color="var(--accent-indigo)" />
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Explainable AI (XAI) Attribution — Train {train_no}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Graph Attention Network (GAT) Node & Edge Decomposition
            </span>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="btn btn-glass" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Executive Summary Card */}
      <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '6px' }}>
          Operational Impact Narrative
        </div>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#f1f5f9' }}>
          {executive_summary}
        </p>
      </div>

      {/* Factor Percentage Decomposition Bars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {factors.map((f) => {
          const Icon = f.icon;
          const pct = factor_percentages[f.key] || 0;

          return (
            <div key={f.key} className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Icon size={15} color={f.color} />
                  <span>{f.label.split(' ')[0]}</span>
                </div>
                <span className="font-mono" style={{ fontSize: '1rem', fontWeight: 700, color: f.color }}>
                  {pct}%
                </span>
              </div>

              <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: f.color,
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Root Cause Event Log */}
      {root_cause_events.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Identified Upstream & Corridor Bottleneck Events
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {root_cause_events.map((evt, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${evt.severity === 'HIGH' ? '#f43f5e' : '#38bdf8'}`
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                    {evt.factor} {evt.at_station ? `(Approaching ${evt.at_station})` : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {evt.detail}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                    +{evt.impact_min} min impact
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
