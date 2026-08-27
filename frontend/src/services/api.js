const API_BASE = '/api/v1';

export const fetchTrains = async () => {
  const res = await fetch(`${API_BASE}/trains`);
  if (!res.ok) throw new Error('Failed to fetch trains');
  return res.json();
};

export const fetchTrainEta = async (trainNo, modelType = 'CORE_GNN_SPATIAL', forceFallback = false) => {
  const res = await fetch(`${API_BASE}/train/${trainNo}/eta?model_type=${modelType}&force_fallback=${forceFallback}`);
  if (!res.ok) throw new Error(`Failed to fetch ETA for train ${trainNo}`);
  return res.json();
};

export const fetchTrainExplain = async (trainNo) => {
  const res = await fetch(`${API_BASE}/train/${trainNo}/eta/explain`);
  if (!res.ok) throw new Error(`Failed to fetch explainability for train ${trainNo}`);
  return res.json();
};

export const fetchTrainHistory = async (trainNo) => {
  const res = await fetch(`${API_BASE}/train/${trainNo}/history`);
  if (!res.ok) throw new Error(`Failed to fetch history for train ${trainNo}`);
  return res.json();
};

export const fetchStations = async () => {
  const res = await fetch(`${API_BASE}/stations`);
  if (!res.ok) throw new Error('Failed to fetch stations');
  return res.json();
};

export const fetchStationArrivals = async (stationCode) => {
  const res = await fetch(`${API_BASE}/station/${stationCode}/arrivals`);
  if (!res.ok) throw new Error(`Failed to fetch arrivals for station ${stationCode}`);
  return res.json();
};

export const runWhatIfSimulation = async (payload) => {
  const res = await fetch(`${API_BASE}/whatif`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to execute What-If simulation');
  return res.json();
};

export const fetchSimulatorState = async () => {
  const res = await fetch(`${API_BASE}/simulator/state`);
  if (!res.ok) throw new Error('Failed to fetch simulator state');
  return res.json();
};

export const controlSimulator = async (action, timeScale = null) => {
  const res = await fetch(`${API_BASE}/simulator/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, time_scale: timeScale })
  });
  if (!res.ok) throw new Error(`Failed to control simulator with action ${action}`);
  return res.json();
};

export const injectTelemetryEvent = async (trainNo, eventType, value) => {
  const res = await fetch(`${API_BASE}/events/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ train_no: trainNo, event_type: eventType, value })
  });
  if (!res.ok) throw new Error('Failed to inject telemetry event');
  return res.json();
};

export const setSpeedRestriction = async (sectionId, speedKmph) => {
  const res = await fetch(`${API_BASE}/simulator/tsr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section_id: sectionId, speed_kmph: speedKmph })
  });
  if (!res.ok) throw new Error('Failed to set speed restriction');
  return res.json();
};

export const fetchFeederSubscriptions = async () => {
  const res = await fetch(`${API_BASE}/feeder/subscriptions`);
  if (!res.ok) return [];
  return res.json();
};

export const fetchFeederTriggers = async () => {
  const res = await fetch(`${API_BASE}/feeder/triggers`);
  if (!res.ok) return [];
  return res.json();
};

export const subscribeFeeder = async (payload) => {
  const res = await fetch(`${API_BASE}/feeder/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create feeder subscription');
  return res.json();
};
