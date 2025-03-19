import React from 'react';
import { useAppState } from '../../context/AppStateContext';

const Timer = () => {
  const { 
    seconds, 
    startTime, 
    confirmReset, 
    handleTimerClick, 
    resetClock, 
    cancelReset, 
    formatTime, 
    formatClock, 
    COLORS 
  } = useAppState();

  // Timer display styles
  const timerDisplayStyle = {
    backgroundColor: COLORS.timerBg,
    color: COLORS.white,
    borderRadius: '10px',
    padding: '10px',
    textAlign: 'center',
    position: 'relative',
    boxShadow: '0 3px 6px rgba(0,0,0,0.16)',
    marginBottom: '12px',
  };

  return (
    <div
      onClick={handleTimerClick}
      title="Click to reset timer"
      style={timerDisplayStyle}
    >
      <div style={{ 
        fontSize: '44px', 
        fontWeight: 'bold',
        lineHeight: '1.2',
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
      }}>
        {formatTime(seconds)}
      </div>
      <div style={{ marginTop: '2px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%',
          fontSize: '0.9rem'
        }}>
          <div>
            <span style={{ fontWeight: 'bold', color: COLORS.white }}>Start: </span>
            <span style={{ fontFamily: 'sans-serif', color: COLORS.white }}>{formatClock(startTime)}</span>
          </div>
          <div>
            <span style={{ fontWeight: 'bold', color: COLORS.white }}>Now: </span>
            <span style={{ fontFamily: 'sans-serif', color: COLORS.white }}>{formatClock(new Date())}</span>
          </div>
        </div>
      </div>
      
      {/* Reset Confirmation Dialog */}
      {confirmReset && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '8px',
          zIndex: 10
        }}>
          <div style={{ color: COLORS.white, marginBottom: '12px', textAlign: 'center', padding: '0 10px' }}>
            Reset timer to 00:00?
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); resetClock(); }}
              style={{
                backgroundColor: COLORS.logoRed,
                color: COLORS.white,
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Reset
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); cancelReset(); }}
              style={{
                backgroundColor: '#7f8c8d',
                color: COLORS.white,
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;