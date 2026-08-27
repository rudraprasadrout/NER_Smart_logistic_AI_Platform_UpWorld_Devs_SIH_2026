import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PassengerPortal from './components/PassengerPortal';
import AdminConsole from './components/AdminConsole';
import { 
  fetchTrains, 
  fetchStations, 
  fetchTrainEta, 
  fetchTrainExplain, 
  fetchSimulatorState, 
  controlSimulator,
  injectTelemetryEvent,
  setSpeedRestriction,
  subscribeFeeder
} from './services/api';
import { X, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState('passenger'); // 'passenger' | 'admin'
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedTrainNo, setSelectedTrainNo] = useState('12301');
  const [selectedStationCode, setSelectedStationCode] = useState('CNB');

  const [etaData, setEtaData] = useState(null);
  const [explainData, setExplainData] = useState(null);
  const [simulatorState, setSimulatorState] = useState(null);
  
  // Feeder Alert Subscription Modal
  const [showFeederModal, setShowFeederModal] = useState(false);
  const [feederSubmitted, setFeederSubmitted] = useState(false);
  const [feederForm, setFeederForm] = useState({
    passenger_name: 'Passenger',
    contact_or_webhook: '+91-9876543210',
    transport_mode: 'CAB_AGGREGATOR',
    threshold_window_min: 8
  });

  // Load initial static data (Stations & Trains)
  useEffect(() => {
    const init = async () => {
      try {
        const [stList, trList] = await Promise.all([
          fetchStations(),
          fetchTrains()
        ]);
        setStations(stList);
        setTrains(trList);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    init();
  }, []);

  // Poll / WebSocket for live simulation state & telemetry
  useEffect(() => {
    let ws = null;
    let pollInterval = null;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;
      
      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'TELEMETRY_UPDATE' || msg.type === 'INITIAL_STATE') {
              setSimulatorState(msg.data);
              if (msg.data.trains) {
                setTrains(msg.data.trains);
              }
            }
          } catch (e) {
            console.error('WS parse error:', e);
          }
        };

        ws.onerror = () => {
          startPollingFallback();
        };
      } catch (e) {
        startPollingFallback();
      }
    };

    const startPollingFallback = () => {
      if (!pollInterval) {
        pollInterval = setInterval(async () => {
          try {
            const state = await fetchSimulatorState();
            setSimulatorState(state);
            if (state.trains) setTrains(state.trains);
          } catch (err) {
            // Ignore error
          }
        }, 1500);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  // Fetch dynamic ETA and Explainability when selected train changes
  useEffect(() => {
    let isMounted = true;
    const loadEtaAndExplain = async () => {
      if (!selectedTrainNo) return;
      try {
        const [etaRes, explainRes] = await Promise.all([
          fetchTrainEta(selectedTrainNo, 'CORE_GNN_SPATIAL', false),
          fetchTrainExplain(selectedTrainNo)
        ]);
        if (isMounted) {
          setEtaData(etaRes);
          setExplainData(explainRes);
        }
      } catch (err) {
        console.error('ETA fetch error:', err);
      }
    };

    loadEtaAndExplain();
    const interval = setInterval(loadEtaAndExplain, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedTrainNo]);

  const handleSimControl = async (action) => {
    try {
      const res = await controlSimulator(action);
      setSimulatorState((prev) => ({ ...prev, is_running: res.is_running }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleInjectDelay = async (trainNo, delayMin) => {
    try {
      await injectTelemetryEvent(trainNo, 'DELAY_MIN', delayMin);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyTsr = async (sectionId, speedKmph) => {
    try {
      await setSpeedRestriction(sectionId, speedKmph);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeederSubmit = async (e) => {
    e.preventDefault();
    try {
      await subscribeFeeder({
        train_no: selectedTrainNo,
        destination_station: selectedStationCode || 'CNB',
        passenger_name: feederForm.passenger_name,
        contact_or_webhook: feederForm.contact_or_webhook,
        transport_mode: feederForm.transport_mode,
        threshold_window_min: feederForm.threshold_window_min
      });
      setFeederSubmitted(true);
      setTimeout(() => {
        setFeederSubmitted(false);
        setShowFeederModal(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Universal Top Navigation with Role Switcher */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        simulatorState={simulatorState}
      />

      {/* Main Workspace based on Selected Role */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1360px', width: '100%', margin: '0 auto' }}>
        {currentRole === 'passenger' ? (
          <PassengerPortal
            trains={trains}
            stations={stations}
            selectedTrainNo={selectedTrainNo}
            onSelectTrain={setSelectedTrainNo}
            etaData={etaData}
            explainData={explainData}
            onOpenFeederModal={() => setShowFeederModal(true)}
          />
        ) : (
          <AdminConsole
            trains={trains}
            stations={stations}
            selectedTrainNo={selectedTrainNo}
            onSelectTrain={setSelectedTrainNo}
            selectedStationCode={selectedStationCode}
            onSelectStation={setSelectedStationCode}
            onApplyTsr={handleApplyTsr}
            onInjectDelay={handleInjectDelay}
            simulatorState={simulatorState}
            onSimControl={handleSimControl}
          />
        )}
      </main>

      {/* Passenger Feeder Subscription Modal */}
      {showFeederModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(6px)' }}>
          <div className="card-elevated" style={{ width: '100%', maxWidth: '440px', padding: '24px', position: 'relative' }}>
            <button
              onClick={() => setShowFeederModal(false)}
              className="btn btn-secondary"
              style={{ position: 'absolute', right: '14px', top: '14px', padding: '6px' }}
            >
              <X size={16} />
            </button>

            {feederSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Alert Registered!</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginTop: '4px' }}>
                  You will be notified / auto-dispatched once arrival ETA window is confirmed within ±8 mins.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
                  Auto-Arrange Last-Mile Transport
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: '16px' }}>
                  Train {selectedTrainNo} &bull; Destination: {selectedStationCode || 'Next Station'}
                </p>

                <form onSubmit={handleFeederSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '4px' }}>Your Name</label>
                    <input
                      type="text"
                      required
                      value={feederForm.passenger_name}
                      onChange={(e) => setFeederForm({ ...feederForm, passenger_name: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '4px' }}>Mobile Number / WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={feederForm.contact_or_webhook}
                      onChange={(e) => setFeederForm({ ...feederForm, contact_or_webhook: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '4px' }}>Preferred Service</label>
                    <select
                      value={feederForm.transport_mode}
                      onChange={(e) => setFeederForm({ ...feederForm, transport_mode: e.target.value })}
                      style={{ width: '100%' }}
                    >
                      <option value="CAB_AGGREGATOR">Cab Auto-Dispatch (Ola / Uber integration)</option>
                      <option value="EV_FEEDER_BUS">Station EV Feeder Shuttle</option>
                      <option value="PASSENGER_SMS">Family WhatsApp / SMS Arrival Alert</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                    <button type="button" onClick={() => setShowFeederModal(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Set Live Alert
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ padding: '16px 24px', textAlign: 'center', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        RailPulse &copy; 2026 — Smart India Hackathon (SIH #26028) | Ministry of Railways (Indian Railways) Dynamic ETA Platform
      </footer>
    </div>
  );
}
