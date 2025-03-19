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
  const { ventilationActive, COLORS } = useAppState();
  
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