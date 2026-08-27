import React from 'react';
import { Train, Activity, Play, Pause, RotateCcw, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  simulatorState, 
  onSimControl, 
  activeTrainsCount = 7 
}) {
  const isRunning = simulatorState?.is_running ?? true;

  const tabs = [
    { id: 'network', label: 'Network & Map', icon: Activity },
    { id: 'timeline', label: 'Dynamic ETA Timeline', icon: Train },
    { id: 'whatif', label: 'What-If Simulator', icon: Sparkles, highlight: true },
    { id: 'stations', label: 'Station Boards', icon: ShieldCheck },
    { id: 'feeder', label: 'Feeder & Last-Mile', icon: AlertTriangle },
    { id: 'benchmark', label: 'Model Benchmarks', icon: ShieldCheck }
  ];

  return (
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      {/* Brand & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
        }}>
          <Train size={24} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              RailPulse
            </h1>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>SIH #26028</span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span className="pulse-dot" style={{ backgroundColor: '#10b981' }} />
              Live Graph GNN
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Network-Aware Dynamic Train ETA & Cascading Decision Support
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn"
              style={{
                background: isActive 
                  ? (tab.highlight ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(56, 189, 248, 0.2)')
                  : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? (tab.highlight ? '1px solid #818cf8' : '1px solid var(--border-active)') : '1px solid transparent',
                padding: '6px 14px',
                fontSize: '0.82rem',
                borderRadius: '8px',
                fontWeight: isActive ? 600 : 500
              }}
            >
              <Icon size={16} color={isActive ? (tab.highlight ? '#ffffff' : '#38bdf8') : 'currentColor'} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Simulator Quick Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sim Time:</span>
          <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            {Math.floor((simulatorState?.simulation_time_sec || 0) / 60)}m {(Math.floor(simulatorState?.simulation_time_sec || 0) % 60)}s
          </span>
        </div>

        <button
          onClick={() => onSimControl(isRunning ? 'PAUSE' : 'PLAY')}
          className={`btn ${isRunning ? 'btn-glass' : 'btn-primary'}`}
          style={{ padding: '6px 12px' }}
          title={isRunning ? 'Pause Simulation' : 'Resume Simulation'}
        >
          {isRunning ? <Pause size={15} /> : <Play size={15} />}
          {isRunning ? 'Pause' : 'Resume'}
        </button>

        <button
          onClick={() => onSimControl('RESET')}
          className="btn btn-glass"
          style={{ padding: '6px 12px' }}
          title="Reset Simulation State"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </header>
  );
}
