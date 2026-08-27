import React from 'react';
import { Train, User, ShieldCheck, Clock, Radio, Search } from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  onSelectRole, 
  simulatorState 
}) {
  const isPassenger = currentRole === 'passenger';

  return (
    <nav style={{
      background: 'rgba(17, 24, 39, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '12px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: isPassenger ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isPassenger ? '0 4px 14px rgba(14, 165, 233, 0.4)' : '0 4px 14px rgba(99, 102, 241, 0.4)',
          transition: 'all 0.3s ease'
        }}>
          <Train size={20} color="#ffffff" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              RailPulse
            </span>
            <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
              Indian Railways
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
            {isPassenger ? 'Passenger Live Train & Arrival Companion' : 'Operations Control Center (OCC) Dashboard'}
          </p>
        </div>
      </div>

      {/* Role Switcher Pill (User vs Admin) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="role-switcher">
          <button
            onClick={() => onSelectRole('passenger')}
            className={`role-btn ${isPassenger ? 'active-passenger' : ''}`}
          >
            <User size={15} />
            Passenger View
          </button>
          <button
            onClick={() => onSelectRole('admin')}
            className={`role-btn ${!isPassenger ? 'active-admin' : ''}`}
          >
            <ShieldCheck size={15} />
            OCC Admin / Control Room
          </button>
        </div>

        {/* Live Network Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
          <span className="pulse-dot" style={{ backgroundColor: '#10b981' }} />
          <span style={{ color: 'var(--text-sub)' }}>GNN Live:</span>
          <span className="font-mono" style={{ color: '#fff', fontWeight: 600 }}>
            {Math.floor((simulatorState?.simulation_time_sec || 0) / 60)}m {(Math.floor(simulatorState?.simulation_time_sec || 0) % 60)}s
          </span>
        </div>
      </div>
    </nav>
  );
}
