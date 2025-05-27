//src/components/Buttons/MetronomeButton.jsx

import React from 'react';
import { Clock } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

const MetronomeButton = () => {
  const { activeSection, handleMetronomeClick, COLORS } = useAppState();

  // Common button styles
  const buttonBaseStyle = {
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    position: 'relative',
    width: '100%',
    height: '84px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };
  
  const isActive = activeSection === 'metronome' || activeSection === 'pulse+metronome';

  return (
    <button
      onClick={handleMetronomeClick}
      style={{
        ...buttonBaseStyle,
        backgroundColor: isActive ? COLORS.logoRed : COLORS.background,
        color: isActive ? COLORS.white : COLORS.logoRed,
        border: isActive ? 'none' : `1px solid ${COLORS.logoRed}`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center' }}>
          <Clock size={42} />
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '2px' }}>
            Compressions
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.9 }}>
            110 beats/min
          </div>
        </div>
      </div>
    </button>
  );
};

export default MetronomeButton;