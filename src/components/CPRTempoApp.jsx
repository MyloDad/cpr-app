//src/components/CPRTempoApp.jsx

import React from 'react';
import { AppStateProvider } from '../context/AppStateContext';
import AppHeader from './Header/AppHeader';
import Timer from './Timer/Timer';
import MetronomeButton from './Buttons/MetronomeButton';
import PulseCheckButton from './Buttons/PulseCheckButton';
import EpinephrineButton from './Buttons/EpinephrineButton.jsx';
import VentilationButton from './Buttons/VentilationButton';
import VentilationSlider from './Controls/VentilationSlider';

import { useAppState } from '../context/AppStateContext';

// CSS for flash animations
const globalStyles = `
  @keyframes flash {
    0% { background-color: #2ecc40 !important; }
    50% { background-color: #3af04fff !important; } 
    100% { background-color: #2ecc40 !important; }
  }     
  
  @keyframes flashAlternate {
    0% {
      background-color: #3498db !important;
      color: white !important;
    }
    50% {
      background-color: #ffffff !important;
      color: black !important;
    }
    100% {
      background-color: #3498db !important;
      color: white !important;
    }
  }
  
  /* Improve button styles for mobile */
  button {
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }
  
  /* Custom slider styles */
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    cursor: pointer;
  }
  
  input[type=range]::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    cursor: pointer;
    border: none;
  }
  
  /* Full height mobile container */
  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
    background-color: #1e2126;
  }
`;

// The main app content
const AppContent = () => {
  const { ventilationActive, COLORS, metronomeFlash } = useAppState();

  const [audioUnlocked, setAudioUnlocked] = React.useState(false);

  React.useEffect(() => {
    const unlock = () => {
      let audioCtx;

        if (typeof AudioContext !== 'undefined') {
          audioCtx = new AudioContext();
        } else if (typeof window !== 'undefined' && typeof window.webkitAudioContext !== 'undefined') {
          audioCtx = new window.webkitAudioContext();
        } else {
          console.warn('No supported AudioContext found.');
          return;
        }

  
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
  
      setAudioUnlocked(true);
    };
  
    window.addEventListener('touchstart', unlock, { once: true });
    window.addEventListener('click', unlock, { once: true });
  
    return () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };
  }, []);
  
  if (!audioUnlocked) {
    return (
      <div style={{
        height: '100vh',
        backgroundColor: COLORS.background,
        color: COLORS.white,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px',
        textAlign: 'center',
      }}>
        <img 
          src="/central-pierce-logo.png" 
          alt="Central Pierce Fire & Rescue"
          style={{
            maxWidth: '60%',
            height: 'auto',
            maxHeight: '100px',
            marginBottom: '20px',
            opacity: 0.9,
          }}
        />
        <h1 style={{
          fontSize: '28px',
          color: COLORS.logoRed,
          marginBottom: '10px',
        }}>
          ArrestPro
        </h1>
        <p style={{
          fontSize: '18px',
          opacity: 0.85,
          marginBottom: '8px',
        }}>
          Tap anywhere to begin
        </p>
        <p style={{
          fontSize: '14px',
          opacity: 0.5,
          marginTop: '8px',
        }}>
          Audio is required for full functionality
        </p>
      </div>
    );
  }
  
  
  return (
    <div style={{ 
      backgroundColor: COLORS.background, 
      minHeight: '100vh',
      maxWidth: '100%',
      margin: '0 auto',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <AppHeader />
      <Timer />
      
      {metronomeFlash && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Soft white overlay
    pointerEvents: 'none',
    zIndex: 9999,
    animation: 'flashFade 0.1s linear forwards'
  }} />
)}



      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '8px',
        margin: '0 0 8px 0'
      }}>
        <MetronomeButton />
        <PulseCheckButton />
        <EpinephrineButton />
        <VentilationButton />
      </div>
      
      {ventilationActive && <VentilationSlider />}
      
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
    </div>
  );
};

// Main component with provider wrapper
const CPRTempoApp = () => {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
};

export default CPRTempoApp;