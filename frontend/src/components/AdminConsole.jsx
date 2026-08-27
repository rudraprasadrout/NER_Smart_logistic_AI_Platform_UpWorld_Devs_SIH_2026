import React, { useState } from 'react';
import { Activity, Sparkles, AlertTriangle, ShieldCheck, Gauge, Zap, Play, Pause, RotateCcw, Cpu, Car } from 'lucide-react';
import NetworkMap from './NetworkMap';
import WhatIfSimulator from './WhatIfSimulator';
import BenchmarkView from './BenchmarkView';
import FeederManager from './FeederManager';

export default function AdminConsole({
  trains = [],
  stations = [],
  selectedTrainNo,
  onSelectTrain,
  onSelectStation,
  onApplyTsr,
  onInjectDelay,
  simulatorState,
  onSimControl
}) {
  const [adminTab, setAdminTab] = useState('corridor'); // 'corridor' | 'whatif' | 'injector' | 'benchmark' | 'feeder'
  const isRunning = simulatorState?.is_running ?? true;

  // Disruption Form State
  const [injTrain, setInjTrain] = useState('12301');
  const [injDelay, setInjDelay] = useState(15);
  const [tsrSection, setTsrSection] = useState('CNB-FTP');
  const [tsrSpeed, setTsrSpeed] = useState(30);

  const tabs = [
    { id: 'corridor', label: 'Corridor Network Map', icon: Activity },
    { id: 'whatif', label: 'What-If Dispatch Sandbox', icon: Sparkles },
    { id: 'injector', label: 'Disruption & Speed Controls', icon: Zap },
    { id: 'benchmark', label: 'Model Benchmarks & GNN', icon: Cpu },
    { id: 'feeder', label: 'Feeder Webhook Hub', icon: Car }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* OCC Admin Sub-Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'linear-gradient(90deg, #151e32 0%, #1e1b4b 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#6366f1', padding: '8px', borderRadius: '10px' }}>
            <ShieldCheck size={20} color="#fff" />
          </div>
          <div>
            <h2 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Operations Control Center (OCC) — Northern & North Central Railway
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
              Real-Time Network GNN Inference, Block Occupancy & Decision-Support System
            </p>
          </div>
        </div>

        {/* Sim Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => onSimControl(isRunning ? 'PAUSE' : 'PLAY')}
            className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            {isRunning ? 'Pause Sim' : 'Resume Sim'}
          </button>
          <button
            onClick={() => onSimControl('RESET')}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 10px' }}
            title="Reset simulation telemetry"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className="btn"
              style={{
                background: isActive ? '#6366f1' : 'var(--bg-card)',
                color: isActive ? '#fff' : 'var(--text-sub)',
                border: isActive ? '1px solid #818cf8' : '1px solid var(--border)',
                padding: '8px 16px',
                fontSize: '0.82rem',
                flexShrink: 0
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* View Content based on Tab */}
      {adminTab === 'corridor' && (
        <NetworkMap
          stations={stations}
          trains={trains}
          selectedTrainNo={selectedTrainNo}
          onSelectTrain={onSelectTrain}
          onSelectStation={onSelectStation}
          onApplyTsr={onApplyTsr}
        />
      )}

      {adminTab === 'whatif' && (
        <WhatIfSimulator trains={trains} stations={stations} />
      )}

      {adminTab === 'injector' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Inject Delay Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <AlertTriangle size={20} color="var(--warning)" />
              <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Inject Train Perturbation (Delay)
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '16px' }}>
              Simulate an unplanned signal hold, engine issue, or passenger alarm chain pulling to test how the GNN propagates delay downstream.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '4px' }}>Select Target Train</label>
                <select
                  value={injTrain}
                  onChange={(e) => setInjTrain(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {trains.map((t) => (
                    <option key={t.train_no} value={t.train_no}>{t.train_no} — {t.train_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '4px' }}>Delay To Add (Minutes): +{injDelay} min</label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={injDelay}
                  onChange={(e) => setInjDelay(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--warning)' }}
                />
              </div>

              <button
                onClick={() => onInjectDelay(injTrain, injDelay)}
                className="btn btn-primary"
                style={{ marginTop: '8px', justifyContent: 'center' }}
              >
                Apply +{injDelay}m Delay to Train {injTrain}
              </button>
            </div>
          </div>

          {/* Speed Restriction (TSR) Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Gauge size={20} color="var(--primary)" />
              <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Temporary Speed Restriction (TSR)
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '16px' }}>
              Issue engineering cautionary speed restrictions (e.g. 30 km/h for track maintenance) and watch section transit times update dynamically.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '4px' }}>Select Section</label>
                <select
                  value={tsrSection}
                  onChange={(e) => setTsrSection(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="NDLS-GZB">NDLS-GZB (New Delhi - Ghaziabad)</option>
                  <option value="CNB-FTP">CNB-FTP (Kanpur - Fatehpur)</option>
                  <option value="PRYJ-MZP">PRYJ-MZP (Prayagraj - Mirzapur)</option>
                  <option value="MZP-DDU">MZP-DDU (Mirzapur - DDU)</option>
                  <option value="PNBE-KIUL">PNBE-KIUL (Patna - Kiul)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '4px' }}>Cautionary Speed Limit: {tsrSpeed} km/h</label>
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="10"
                  value={tsrSpeed}
                  onChange={(e) => setTsrSpeed(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={() => onApplyTsr(tsrSection, tsrSpeed)}
                  className="btn btn-indigo"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Apply {tsrSpeed} km/h TSR
                </button>
                <button
                  onClick={() => onApplyTsr(tsrSection, 0)}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center' }}
                >
                  Clear TSR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {adminTab === 'benchmark' && (
        <BenchmarkView />
      )}

      {adminTab === 'feeder' && (
        <FeederManager trains={trains} stations={stations} />
      )}
    </div>
  );
}
