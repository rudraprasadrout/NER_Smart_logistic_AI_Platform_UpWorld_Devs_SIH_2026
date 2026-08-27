import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, Navigation, Train, ArrowRight } from 'lucide-react';
import { fetchStationArrivals } from '../services/api';

export default function StationBoard({ stations = [], selectedStationCode, onSelectStation }) {
  const [currentStation, setCurrentStation] = useState(selectedStationCode || 'CNB');
  const [boardData, setBoardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedStationCode) {
      setCurrentStation(selectedStationCode);
    }
  }, [selectedStationCode]);

  useEffect(() => {
    let isMounted = true;
    const loadArrivals = async () => {
      setIsLoading(true);
      try {
        const data = await fetchStationArrivals(currentStation);
        if (isMounted) setBoardData(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadArrivals();
    const interval = setInterval(loadArrivals, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentStation]);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Header with Station Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {boardData?.station_code || currentStation}
            </span>
            <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {boardData?.station_name || 'Station Arrival Display'}
            </h2>
            <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
              Zone: {boardData?.zone || 'NCR'}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Total Platforms: {boardData?.total_platforms || 10} | Approaching Trains: {boardData?.active_arrivals_count || 0}
          </p>
        </div>

        {/* Station Select Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Select Station:</label>
          <select
            value={currentStation}
            onChange={(e) => {
              setCurrentStation(e.target.value);
              if (onSelectStation) onSelectStation(e.target.value);
            }}
            style={{
              padding: '8px 14px',
              background: '#0f172a',
              border: '1px solid var(--border-active)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            {stations.map((s) => (
              <option key={s.station_code} value={s.station_code}>
                {s.station_code} — {s.station_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Arrival Board List */}
      {boardData?.arrivals && boardData.arrivals.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {boardData.arrivals.map((arr) => {
            const isLate = arr.predicted_delay_min > 5;
            const isApproaching = arr.status === 'APPROACHING';

            return (
              <div
                key={arr.train_no}
                className="glass-panel"
                style={{
                  padding: '14px 18px',
                  background: isApproaching ? 'rgba(2, 132, 199, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                  border: isApproaching ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                  display: 'grid',
                  gridTemplateColumns: '110px 90px 1fr 140px 180px 120px',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                {/* Train No & Platform */}
                <div>
                  <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-cyan)' }}>
                    {arr.train_no}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {arr.direction} Track
                  </div>
                </div>

                <div>
                  <span className="badge badge-purple" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    {arr.platform}
                  </span>
                </div>

                {/* Train Name */}
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{arr.train_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{arr.type}</div>
                </div>

                {/* Sched vs Expected */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Sched: <span className="font-mono">{arr.scheduled_arrival}</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isLate ? '#fbbf24' : '#34d399' }}>
                    ETA: <span className="font-mono">{arr.expected_eta}</span>
                  </div>
                </div>

                {/* Confidence Window */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Confidence Window:
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                    {arr.eta_window}
                  </div>
                </div>

                {/* Distance & Status */}
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${arr.status === 'AT_PLATFORM' ? 'badge-rose' : (isApproaching ? 'badge-cyan' : 'btn-glass')}`}>
                    {arr.status}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {arr.dist_remaining_km} km away
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No upcoming train arrivals currently recorded for this station.
        </div>
      )}
    </div>
  );
}
