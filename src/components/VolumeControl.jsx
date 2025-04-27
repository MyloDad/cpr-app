import React from 'react';
import { useAppState } from '../context/AppStateContext';

const VolumeControl = () => {
  const { 
    metronomeVolume, 
    setMetronomeVolume, 
    voiceVolume, 
    setVoiceVolume, 
    COLORS 
  } = useAppState();
  
  return (
    <div style={{ 
      padding: '12px', 
      marginBottom: '12px',
      backgroundColor: COLORS.timerBg,
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <label 
          htmlFor="metronome-volume" 
          style={{ 
            color: COLORS.white, 
            marginRight: '10px',
            fontSize: '14px',
            width: '120px'
          }}
        >
          Metronome:
        </label>
        <input
          id="metronome-volume"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={metronomeVolume}
          onChange={(e) => setMetronomeVolume(parseFloat(e.target.value))}
          style={{ 
            flexGrow: 1,
            height: '24px',
            accentColor: COLORS.logoYellow
          }}
        />
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <label 
          htmlFor="voice-volume" 
          style={{ 
            color: COLORS.white, 
            marginRight: '10px',
            fontSize: '14px',
            width: '120px'
          }}
        >
          Voice Prompts:
        </label>
        <input
          id="voice-volume"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={voiceVolume}
          onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
          style={{ 
            flexGrow: 1,
            height: '24px',
            accentColor: COLORS.logoRed
          }}
        />
      </div>
    </div>
  );
};

export default VolumeControl;