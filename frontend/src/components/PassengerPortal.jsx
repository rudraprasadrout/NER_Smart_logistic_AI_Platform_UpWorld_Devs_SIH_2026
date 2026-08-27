import React, { useState } from 'react';
import { Train, Search, Clock, Navigation, CheckCircle2, AlertCircle, Car, ArrowRight, Sparkles, Phone, ShieldCheck, MapPin } from 'lucide-react';
import StationBoard from './StationBoard';

export default function PassengerPortal({
  trains = [],
  stations = [],
  selectedTrainNo,
  onSelectTrain,
  etaData,
  explainData,
  onOpenFeederModal
}) {
  const [passengerTab, setPassengerTab] = useState('train'); // 'train' or 'station'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStationCode, setSelectedStationCode] = useState('CNB');

  const filteredTrains = trains.filter(t => 
    t.train_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.train_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentTrain = trains.find(t => t.train_no === selectedTrainNo) || trains[0];
  const isLate = (currentTrain?.delay_minutes || 0) > 5;
  const stops = etaData?.stops_timeline || [];

  // Find next upcoming stop
  const nextStop = stops.find(s => s.status === 'UPCOMING') || stops[stops.length - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Passenger View Sub-Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setPassengerTab('train')}
            className="btn"
            style={{
              background: passengerTab === 'train' ? '#0ea5e9' : 'transparent',
              color: passengerTab === 'train' ? '#fff' : 'var(--text-sub)',
              fontSize: '0.82rem',
              padding: '7px 16px'
            }}
          >
            <Train size={15} /> Track My Train
          </button>
          <button
            onClick={() => setPassengerTab('station')}
            className="btn"
            style={{
              background: passengerTab === 'station' ? '#0ea5e9' : 'transparent',
              color: passengerTab === 'station' ? '#fff' : 'var(--text-sub)',
              fontSize: '0.82rem',
              padding: '7px 16px'
            }}
          >
            <MapPin size={15} /> Station Live Board
          </button>
        </div>

        {passengerTab === 'train' && (
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search train no. or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px' }}
            />
          </div>
        )}
      </div>

      {passengerTab === 'station' ? (
        <StationBoard
          stations={stations}
          selectedStationCode={selectedStationCode}
          onSelectStation={setSelectedStationCode}
        />
      ) : (
        <>
          {/* Quick Popular Train Chips */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {filteredTrains.map((t) => {
              const isSelected = selectedTrainNo === t.train_no;
              const trainLate = (t.delay_minutes || 0) > 5;
              return (
                <button
                  key={t.train_no}
                  onClick={() => onSelectTrain(t.train_no)}
                  className="btn"
                  style={{
                    background: isSelected ? '#0284c7' : 'var(--bg-card)',
                    color: '#fff',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}
                >
                  <span className="font-mono" style={{ fontWeight: 700 }}>{t.train_no}</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.85, marginLeft: '4px' }}>
                    {t.train_name.split(' ')[0]}
                  </span>
                  <span className={`badge ${trainLate ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: '0.62rem', marginLeft: '6px' }}>
                    {trainLate ? `+${Math.round(t.delay_minutes)}m` : 'On Time'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Train Live Status Hero Card */}
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(180deg, #151e32 0%, #111827 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {currentTrain?.train_no}
                  </span>
                  <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                    {currentTrain?.train_name}
                  </h2>
                  <span className={`badge ${isLate ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: '0.75rem' }}>
                    {isLate ? `Delayed by ~${Math.round(currentTrain?.delay_minutes || 0)} min` : 'Running On Time'}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginTop: '4px' }}>
                  {currentTrain?.source} <ArrowRight size={13} style={{ display: 'inline', margin: '0 4px' }} /> {currentTrain?.destination} &bull; Priority: {currentTrain?.type}
                </div>
              </div>

              {/* Speed & Live Status Badges */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CURRENT SPEED</div>
                  <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
                    {Math.round(currentTrain?.speed_kmph || 0)} <span style={{ fontSize: '0.7rem' }}>km/h</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>NETWORK PROGRESS</div>
                  <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                    {Math.round(currentTrain?.current_distance_km || 0)} <span style={{ fontSize: '0.7rem' }}>km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Stop Spotlight Box */}
            {nextStop && (
              <div style={{ background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.25)', borderRadius: '12px', padding: '16px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em' }}>
                    NEXT UPCOMING STATION
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                    {nextStop.station_name} ({nextStop.station_code})
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                    Distance remaining: <strong>{nextStop.dist_remaining_km} km</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                    Expected Arrival Time (Dynamic ETA)
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: isLate ? '#fbbf24' : '#34d399' }}>
                    {nextStop.expected_eta}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                    Arrival Window: <strong style={{ color: '#fff' }}>{nextStop.eta_window}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Passenger Friendly Delay Reason (Explainability) */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Sparkles size={18} color="var(--primary)" />
              <h3 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                Why is this arrival time predicted?
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.6 }}>
              {explainData?.executive_summary || "Train is progressing smoothly along the corridor with clear signal blocks ahead."}
            </p>

            {/* Multimodal Feeder Trigger Callout */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                <Car size={16} color="#34d399" />
                <span>Need last-mile connectivity? Auto-dispatch cab or SMS alert when ETA is confirmed.</span>
              </div>
              <button
                onClick={onOpenFeederModal}
                className="btn btn-primary"
                style={{ fontSize: '0.78rem', padding: '6px 14px' }}
              >
                Set Last-Mile Alert
              </button>
            </div>
          </div>

          {/* Clean Station-by-Station Journey Timeline */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
              Route & Station Schedule Progression
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stops.map((stop, i) => {
                const isPassed = stop.status === 'PASSED';
                const isCurrent = stop.status === 'CURRENT';
                const isUpcoming = stop.status === 'UPCOMING';

                return (
                  <div
                    key={stop.station_code}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 16px',
                      background: isCurrent ? 'rgba(14, 165, 233, 0.12)' : (isPassed ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)'),
                      border: isCurrent ? '1px solid var(--border-focus)' : '1px solid var(--border)',
                      borderRadius: '10px',
                      opacity: isPassed ? 0.6 : 1
                    }}
                  >
                    {/* Status Circle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px' }}>
                      {isPassed && <CheckCircle2 size={18} color="#64748b" />}
                      {isCurrent && <span className="pulse-dot" style={{ backgroundColor: '#0ea5e9' }} />}
                      {isUpcoming && <Navigation size={16} color="#38bdf8" />}
                    </div>

                    {/* Station Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          {stop.station_code}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#f8fafc' }}>
                          {stop.station_name}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Distance: {stop.distance_km} km {isUpcoming ? `(${stop.dist_remaining_km} km away)` : ''}
                      </div>
                    </div>

                    {/* Scheduled Time */}
                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SCHEDULED</div>
                      <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                        {stop.sched_arrival}
                      </div>
                    </div>

                    {/* Dynamic Predicted ETA */}
                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>EXPECTED ETA</div>
                      <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 700, color: stop.predicted_delay_min > 0 ? '#fbbf24' : '#34d399' }}>
                        {stop.expected_eta}
                      </div>
                      {isUpcoming && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>
                          {stop.eta_window}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
