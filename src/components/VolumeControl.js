import React from 'react';
import { useAppState } from '../context/AppStateContext';

const VolumeControl = () => {
  const { setMetronomeVolume, COLORS } = useAppState();
  
  return (
    <div style={{ 
      padding: '8px', 
      marginBottom: '12px',
      backgroundColor: COLORS.timerBg,
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <label 
        htmlFor="metronome-volume" 
        style={{ 
          color: COLORS.white, 
          marginRight: '10px',
          fontSize: '14px'
        }}
      >
        Metronome Volume:
      </label>
      <input
        id="metronome-volume"
        type="range"
        min="0"
        max="1"
        step="0.1"
        defaultValue="0.5"
        onChange={(e) => setMetronomeVolume(parseFloat(e.target.value))}
        style={{ 
          flexGrow: 1,
          maxWidth: '150px',
          height: '20px',
          accentColor: COLORS.logoYellow
        }}
      />
    </div>
  );
};

export default VolumeControl;