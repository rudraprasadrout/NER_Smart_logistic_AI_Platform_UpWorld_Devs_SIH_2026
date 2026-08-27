import React, { useState } from 'react';
import { Sparkles, Play, AlertTriangle, CheckCircle, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { runWhatIfSimulation } from '../services/api';

export default function WhatIfSimulator({ trains = [], stations = [] }) {
  const [targetTrain, setTargetTrain] = useState('12301');
  const [targetStation, setTargetStation] = useState('CNB');
  const [holdMinutes, setHoldMinutes] = useState(20);
  const [tsrSpeed, setTsrSpeed] = useState(0);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await runWhatIfSimulation({
        target_train_no: targetTrain || null,
        target_station_code: targetStation,
        additional_hold_min: parseFloat(holdMinutes),
        apply_tsr_kmph: tsrSpeed > 0 ? parseInt(tsrSpeed) : null
      });
      setSimulationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Simulation Controls Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '8px', borderRadius: '10px' }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Operations Control Center (OCC) — "What-If" Cascading Simulator
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Test hypothetical dispatch disruptions, station holds, or track closures to forecast network-wide propagation in real time.
            </p>
          </div>
        </div>

        {/* Input Parameters Form */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'flex-end', background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          {/* Target Train */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              Perturbed Train (Source)
            </label>
            <select
              value={targetTrain}
              onChange={(e) => setTargetTrain(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
            >
              <option value="">-- System / Track Only --</option>
              {trains.map((t) => (
                <option key={t.train_no} value={t.train_no}>
                  {t.train_no} — {t.train_name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Station */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              Disruption Junction / Station
            </label>
            <select
              value={targetStation}
              onChange={(e) => setTargetStation(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
            >
              {stations.map((s) => (
                <option key={s.station_code} value={s.station_code}>
                  {s.station_code} — {s.station_name}
                </option>
              ))}
            </select>
          </div>

          {/* Hold Duration Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              <span>Additional Hold:</span>
              <span className="font-mono" style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>+{holdMinutes} minutes</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={holdMinutes}
              onChange={(e) => setHoldMinutes(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-amber)' }}
            />
          </div>

          {/* Action Button */}
          <div>
            <button
              onClick={handleRunSimulation}
              disabled={isLoading}
              className="btn btn-accent"
              style={{ width: '100%', padding: '10px', justifyContent: 'center', fontSize: '0.9rem' }}
            >
              <Play size={16} />
              {isLoading ? 'Simulating GNN Graph...' : 'Simulate Cascading Impact'}
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Results View */}
      {simulationResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* High-Level Impact Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Impacted Trains
              </div>
              <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                {simulationResult.impact_summary.total_trains_impacted} Trains
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Downstream on same corridor
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Cascaded Delay
              </div>
              <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fb7185', marginTop: '4px' }}>
                +{simulationResult.impact_summary.total_network_delay_minutes} min
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                System-wide passenger delay burden
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Network Health Index
              </div>
              <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: simulationResult.impact_summary.network_health_score > 70 ? '#34d399' : '#fbbf24', marginTop: '4px' }}>
                {simulationResult.impact_summary.network_health_score} / 100
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Corridor flow stability score
              </div>
            </div>
          </div>

          {/* AI Recommended Mitigations */}
          <div className="glass-panel" style={{ padding: '18px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={18} color="#34d399" />
              <h4 className="font-display" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>
                Proactive OCC Dispatcher Recommendations
              </h4>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
              {simulationResult.recommended_mitigations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>

          {/* Detailed Impacted Trains Table */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
              Cascading Delay Distribution Across Corridor
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {simulationResult.impacted_trains.map((tr) => {
                const isPrimary = tr.impact_type === 'PRIMARY_PERTURBATION';
                return (
                  <div
                    key={tr.train_no}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr 120px 120px 100px',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: isPrimary ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: isPrimary ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--border-subtle)',
                      borderRadius: '10px'
                    }}
                  >
                    <div>
                      <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem', color: isPrimary ? '#fb7185' : 'var(--accent-cyan)' }}>
                        {tr.train_no}
                      </span>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Priority: {tr.priority}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tr.train_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tr.impact_type}</div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Original: <span className="font-mono">{tr.original_delay_min}m</span>
                    </div>

                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fbbf24' }}>
                      Sim: <span className="font-mono">{tr.simulated_delay_min}m</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${tr.risk_level === 'CRITICAL' ? 'badge-rose' : 'badge-amber'}`}>
                        +{tr.delay_delta_min}m
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
