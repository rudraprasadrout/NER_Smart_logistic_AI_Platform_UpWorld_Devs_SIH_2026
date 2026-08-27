import React, { useState } from 'react';
import { Train, AlertCircle, Gauge, Activity, Navigation, Radio } from 'lucide-react';

export default function NetworkMap({ 
  stations = [], 
  trains = [], 
  selectedTrainNo, 
  onSelectTrain,
  onSelectStation,
  onApplyTsr
}) {
  const [hoveredEntity, setHoveredEntity] = useState(null);

  // Sort stations by corridor distance
  const sortedStations = [...stations].sort((a, b) => (a.corridor_km || 0) - (b.corridor_km || 0));
  const maxKm = sortedStations.length > 0 ? sortedStations[sortedStations.length - 1].corridor_km : 1532.0;

  // SVG dimensions
  const svgWidth = 1180;
  const svgHeight = 280;
  const paddingX = 70;
  const trackY = 140;

  const getStationX = (km) => {
    return paddingX + ((km / maxKm) * (svgWidth - 2 * paddingX));
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
      {/* Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={18} color="var(--accent-cyan)" />
          <h2 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Live High-Density Corridor Topology (NDLS — HWH)
          </h2>
          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
            1,532 km Quad/Double Track Network
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '4px', background: '#38bdf8', borderRadius: '2px', display: 'inline-block' }} />
            <span>DOWN Track</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '4px', background: '#818cf8', borderRadius: '2px', display: 'inline-block' }} />
            <span>UP Track</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span>Clear Block</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }} />
            <span>Occupied / Caution</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div style={{ width: '100%', overflowX: 'auto', background: 'rgba(6, 10, 18, 0.7)', borderRadius: '12px', padding: '10px 0', border: '1px solid rgba(255,255,255,0.05)' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', minWidth: '950px', height: 'auto', display: 'block' }}>
          <defs>
            {/* Glow filters */}
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="roseGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={trackY - 20} x2={svgWidth - paddingX} y2={trackY - 20} stroke="#1e293b" strokeWidth="3" />
          <line x1={paddingX} y1={trackY + 20} x2={svgWidth - paddingX} y2={trackY + 20} stroke="#1e293b" strokeWidth="3" />

          {/* Main DOWN & UP Rail Lines */}
          <line x1={paddingX} y1={trackY - 14} x2={svgWidth - paddingX} y2={trackY - 14} stroke="url(#trackGrad)" strokeWidth="2.5" />
          <line x1={paddingX} y1={trackY + 14} x2={svgWidth - paddingX} y2={trackY + 14} stroke="#475569" strokeWidth="2" strokeDasharray="6 3" />

          {/* Station Nodes */}
          {sortedStations.map((st, i) => {
            const cx = getStationX(st.corridor_km || 0);
            const isMajor = (st.platforms || 4) >= 7 || ['NDLS', 'CNB', 'PRYJ', 'DDU', 'PNBE', 'HWH'].includes(st.station_code);
            const isHovered = hoveredEntity?.type === 'station' && hoveredEntity?.code === st.station_code;

            return (
              <g 
                key={st.station_code} 
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectStation && onSelectStation(st.station_code)}
                onMouseEnter={() => setHoveredEntity({ type: 'station', code: st.station_code, name: st.station_name, ...st })}
                onMouseLeave={() => setHoveredEntity(null)}
              >
                {/* Station Pole Line */}
                <line x1={cx} y1={trackY - 45} x2={cx} y2={trackY + 45} stroke={isMajor ? '#38bdf8' : '#334155'} strokeWidth={isMajor ? '1.5' : '1'} strokeDasharray={isMajor ? 'none' : '2 2'} opacity="0.6" />

                {/* Node Circle */}
                <circle
                  cx={cx}
                  cy={trackY}
                  r={isMajor ? (isHovered ? 9 : 7) : (isHovered ? 6 : 4.5)}
                  fill={isMajor ? '#0284c7' : '#1e293b'}
                  stroke={isMajor ? '#38bdf8' : '#64748b'}
                  strokeWidth={isMajor ? 2.5 : 1.5}
                  filter={isMajor ? 'url(#cyanGlow)' : undefined}
                />

                {/* Station Code Label (Alternating Top/Bottom for readability) */}
                <text
                  x={cx}
                  y={i % 2 === 0 ? trackY - 52 : trackY + 62}
                  textAnchor="middle"
                  fill={isMajor ? '#f8fafc' : '#94a3b8'}
                  fontSize={isMajor ? '11px' : '9.5px'}
                  fontWeight={isMajor ? '700' : '500'}
                  fontFamily="var(--font-mono)"
                >
                  {st.station_code}
                </text>

                {/* Platform count badge for major hubs */}
                {isMajor && (
                  <text
                    x={cx}
                    y={i % 2 === 0 ? trackY - 65 : trackY + 74}
                    textAnchor="middle"
                    fill="var(--accent-cyan)"
                    fontSize="7.5px"
                  >
                    PF:{st.platforms}
                  </text>
                )}
              </g>
            );
          })}

          {/* Animated Train Entity Glyphs */}
          {trains.map((train) => {
            const trKm = train.current_distance_km || 0;
            const tx = getStationX(trKm);
            const isDown = train.direction === 'DOWN';
            const ty = isDown ? trackY - 14 : trackY + 14;
            const isSelected = selectedTrainNo === train.train_no;
            const isLate = (train.delay_minutes || 0) > 15;
            const isVB = train.type?.includes('Vande') || train.priority === 1;

            const markerColor = isSelected ? '#00f2fe' : (isLate ? '#f43f5e' : (isVB ? '#a855f7' : '#38bdf8'));

            return (
              <g
                key={train.train_no}
                transform={`translate(${tx}, ${ty})`}
                style={{ cursor: 'pointer', transition: 'transform 0.5s ease-out' }}
                onClick={() => onSelectTrain && onSelectTrain(train.train_no)}
                onMouseEnter={() => setHoveredEntity({ type: 'train', ...train })}
                onMouseLeave={() => setHoveredEntity(null)}
              >
                {/* Selection pulse halo */}
                {isSelected && (
                  <circle r="18" fill="none" stroke="#00f2fe" strokeWidth="2" opacity="0.8" className="pulse-dot" />
                )}

                {/* Train Body Symbol */}
                <rect
                  x="-12"
                  y="-8"
                  width="24"
                  height="16"
                  rx="4"
                  fill="#0f172a"
                  stroke={markerColor}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  filter={isSelected || isLate ? 'url(#roseGlow)' : undefined}
                />

                {/* Direction arrow */}
                <path
                  d={isDown ? 'M -4 -3 L 4 0 L -4 3 Z' : 'M 4 -3 L -4 0 L 4 3 Z'}
                  fill={markerColor}
                />

                {/* Train No Pill */}
                <g transform="translate(0, -18)">
                  <rect
                    x="-24"
                    y="-9"
                    width="48"
                    height="14"
                    rx="7"
                    fill={isSelected ? '#0284c7' : 'rgba(15, 23, 42, 0.9)'}
                    stroke={markerColor}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="8.5px"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                  >
                    {train.train_no}
                  </text>
                </g>

                {/* Delay badge */}
                {(train.delay_minutes || 0) > 0 && (
                  <g transform="translate(0, 18)">
                    <rect
                      x="-18"
                      y="-7"
                      width="36"
                      height="12"
                      rx="6"
                      fill={isLate ? 'rgba(244, 63, 94, 0.9)' : 'rgba(245, 158, 11, 0.9)'}
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="7.5px"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      +{Math.round(train.delay_minutes)}m
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Live Train Quick Carousel / Roster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginTop: '16px' }}>
        {trains.map((tr) => {
          const isSelected = selectedTrainNo === tr.train_no;
          const isLate = (tr.delay_minutes || 0) > 15;

          return (
            <div
              key={tr.train_no}
              onClick={() => onSelectTrain(tr.train_no)}
              className={isSelected ? 'glass-panel-glow' : 'glass-panel'}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                background: isSelected ? 'rgba(2, 132, 199, 0.15)' : 'rgba(18, 24, 40, 0.6)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? 'var(--accent-cyan)' : '#f8fafc' }}>
                  {tr.train_no}
                </span>
                <span className={`badge ${isLate ? 'badge-rose' : (tr.delay_minutes > 0 ? 'badge-amber' : 'badge-emerald')}`} style={{ fontSize: '0.65rem' }}>
                  {tr.delay_minutes > 0 ? `+${Math.round(tr.delay_minutes)} min` : 'On Time'}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '3px' }}>
                {tr.train_name}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>{tr.speed_kmph ? `${Math.round(tr.speed_kmph)} km/h` : 'Stopped'}</span>
                <span className="font-mono">{Math.round(tr.current_distance_km || 0)} km</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
