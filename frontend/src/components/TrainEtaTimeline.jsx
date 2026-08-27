import React from 'react';
import { Clock, ShieldAlert, Cpu, Sparkles, Navigation, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

export default function TrainEtaTimeline({ 
  etaData, 
  selectedModel, 
  onChangeModel, 
  forceFallback, 
  onToggleFallback,
  onOpenExplain
}) {
  if (!etaData) {
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading dynamic ETA forecast...
      </div>
    );
  }

  const { train_no, train_name, model_applied, is_degraded_fallback, degradation_reason, current_telemetry, stops_timeline = [] } = etaData;

  const modelOptions = [
    { id: 'CORE_GNN_SPATIAL', label: 'GNN Graph Model (Core)', icon: Cpu, badge: 'Network-Aware' },
    { id: 'BASELINE_B_GBM', label: 'GBM Tabular (Baseline B)', icon: Layers, badge: 'Isolated Regressor' },
    { id: 'BASELINE_A_RULE', label: 'Rule-Based (Baseline A)', icon: Clock, badge: 'Static Timetable' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {train_no}
            </span>
            <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {train_name}
            </h2>
            {is_degraded_fallback && (
              <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={12} /> Low Confidence Fallback
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Current Speed: <strong style={{ color: '#fff' }}>{current_telemetry?.speed_kmph} km/h</strong></span>
            <span>Corridor Pos: <strong style={{ color: '#fff' }}>{current_telemetry?.current_distance_km} km</strong></span>
            <span>Live Delay: <strong style={{ color: current_telemetry?.current_delay_min > 0 ? '#fbbf24' : '#34d399' }}>+{current_telemetry?.current_delay_min} min</strong></span>
          </div>
        </div>

        {/* Model Switcher & Fallback Simulation Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            {modelOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedModel === opt.id && !forceFallback;
              return (
                <button
                  key={opt.id}
                  onClick={() => onChangeModel(opt.id)}
                  disabled={forceFallback}
                  className="btn"
                  style={{
                    background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    border: isSelected ? '1px solid var(--border-active)' : '1px solid transparent',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    opacity: forceFallback ? 0.4 : 1
                  }}
                >
                  <Icon size={14} />
                  {opt.label.split(' ')[0]}
                </button>
              );
            })}
          </div>

          <button
            onClick={onToggleFallback}
            className={`btn ${forceFallback ? 'btn-danger' : 'btn-glass'}`}
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            title="Simulate telemetry drop and test automatic graceful degradation fallback"
          >
            <ShieldAlert size={14} />
            {forceFallback ? 'Restore Live Telemetry' : 'Simulate Telemetry Loss'}
          </button>

          <button
            onClick={onOpenExplain}
            className="btn btn-accent"
            style={{ fontSize: '0.75rem', padding: '6px 14px' }}
          >
            <Sparkles size={14} />
            Explain Delay (XAI)
          </button>
        </div>
      </div>

      {/* Degradation Warning Banner */}
      {is_degraded_fallback && (
        <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={20} color="#fb7185" />
          <div style={{ fontSize: '0.8rem', color: '#fecdd3' }}>
            <strong>Graceful Degradation Mode Active:</strong> {degradation_reason}
          </div>
        </div>
      )}

      {/* Station Timeline Table / Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {stops_timeline.map((stop, index) => {
          const isPassed = stop.status === 'PASSED';
          const isCurrent = stop.status === 'CURRENT';
          const isUpcoming = stop.status === 'UPCOMING';
          const bounds = stop.uncertainty_bounds || {};
          const isTight = bounds.is_tight;

          return (
            <div
              key={stop.station_code}
              className="glass-panel"
              style={{
                padding: '14px 18px',
                background: isCurrent 
                  ? 'rgba(2, 132, 199, 0.15)' 
                  : (isPassed ? 'rgba(15, 23, 42, 0.3)' : 'rgba(18, 24, 40, 0.6)'),
                border: isCurrent ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                opacity: isPassed ? 0.6 : 1,
                display: 'grid',
                gridTemplateColumns: '120px 140px 180px 1fr 140px',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              {/* Station Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isPassed && <CheckCircle2 size={15} color="#64748b" />}
                  {isCurrent && <span className="pulse-dot" style={{ backgroundColor: '#00f2fe' }} />}
                  {isUpcoming && <Navigation size={14} color="#38bdf8" />}
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {stop.station_code}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {stop.station_name}
                </div>
              </div>

              {/* Distance Remaining */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div>Distance: <strong>{stop.distance_km} km</strong></div>
                {isUpcoming && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                    {stop.dist_remaining_km} km away
                  </div>
                )}
              </div>

              {/* Scheduled vs Predicted Arrival */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Sched: <span className="font-mono" style={{ textDecoration: stop.predicted_delay_min > 0 ? 'line-through' : 'none' }}>{stop.sched_arrival}</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: stop.predicted_delay_min > 0 ? '#fbbf24' : '#34d399' }}>
                  ETA: <span className="font-mono">{stop.expected_eta}</span>
                  {stop.predicted_delay_min > 0 && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, marginLeft: '6px' }}>
                      (+{Math.round(stop.predicted_delay_min)}m)
                    </span>
                  )}
                </div>
              </div>

              {/* Shrinking Confidence Window */}
              <div>
                {isUpcoming ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        90% Confidence Window: <strong className="font-mono" style={{ color: '#fff' }}>{stop.eta_window}</strong>
                      </span>
                      <span className={`badge ${isTight ? 'badge-emerald' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                        {isTight ? '🎯 High Precision (±' + Math.round(bounds.window_width_min/2) + 'm)' : 'Horizonal (±' + Math.round(bounds.window_width_min/2) + 'm)'}
                      </span>
                    </div>

                    {/* Progress Bar of Uncertainty */}
                    <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, Math.max(15, (1.0 - (bounds.window_width_min / 40.0)) * 100))}%`,
                          background: isTight 
                            ? 'linear-gradient(90deg, #10b981, #34d399)' 
                            : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                          borderRadius: '3px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {isPassed ? 'Completed' : 'At Platform'}
                  </span>
                )}
              </div>

              {/* Status Badge */}
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${isPassed ? 'btn-glass' : (isCurrent ? 'badge-cyan' : 'badge-emerald')}`}>
                  {stop.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
