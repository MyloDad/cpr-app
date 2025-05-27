//src/components/Buttons/VentialationButton.jsx

import React from 'react';
import { Wind } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

const VentilationButton = () => {
  const { 
    ventilationActive, 
    ventilationRate,
    toggleVentilation, 
    COLORS 
  } = useAppState();

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

  return (
    <button
      onClick={toggleVentilation}
      style={{
        ...buttonBaseStyle,
        backgroundColor: ventilationActive 
          ? COLORS.logoYellow 
          : COLORS.background,
        color: ventilationActive 
          ? COLORS.black 
          : COLORS.logoYellow,
        border: ventilationActive 
          ? 'none' 
          : `1px solid ${COLORS.logoYellow}`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center' }}>
          <Wind size={42} />
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '2px' }}>
            Ventilation
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.9 }}>
            {ventilationRate} breaths/min
          </div>
        </div>
      </div>
    </button>
  );
};

export default VentilationButton;