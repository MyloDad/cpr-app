import React from 'react';
import { useAppState } from '../../context/AppStateContext';

const VentilationSlider = () => {
  const { ventilationRate, setVentilationRate, COLORS } = useAppState();

  return (
    <div style={{ 
      backgroundColor: COLORS.sliderBg,
      padding: '10px',
      borderRadius: '8px',
      marginBottom: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        marginBottom: '5px',
        fontWeight: 'bold',
        fontSize: '15px',
        color: '#333'
      }}>
        Ventilation: {ventilationRate} breaths/min
      </div>
      <div style={{ position: 'relative' }}>
        <input
          type="range"
          min="5"
          max="20"
          value={ventilationRate}
          onChange={(e) => setVentilationRate(parseInt(e.target.value))}
          style={{ 
            width: '100%',
            height: '22px',
            appearance: 'none',
            borderRadius: '10px',
            background: `linear-gradient(to right, 
              ${COLORS.logoYellow} 0%, 
              ${COLORS.logoYellow} ${(ventilationRate-5)/15*100}%, 
              #ddd ${(ventilationRate-5)/15*100}%, 
              #ddd 100%)`,
            outline: 'none',
            transition: 'background 0.3s ease',
            cursor: 'pointer'
          }}
        />
        <div style={{ 
          position: 'absolute',
          left: `${(ventilationRate-5)/15*100}%`,
          top: '-4px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: COLORS.white,
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          transform: 'translateX(-12px)',
          pointerEvents: 'none'
        }}></div>
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        fontSize: '14px',
        marginTop: '5px',
        color: '#555'
      }}>
        <span>5</span>
        <span>10</span>
        <span>15</span>
        <span>20</span>
      </div>
    </div>
  );
};

export default VentilationSlider;