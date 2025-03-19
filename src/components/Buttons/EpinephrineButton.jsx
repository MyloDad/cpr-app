import React, { useState, useEffect } from 'react';
import { Syringe } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

const EpinephrineButton = () => {
  const { 
    epiActive, 
    epiTime,
    epiCycles,
    epiFlashing,
    handleEpinephrineClick, 
    COLORS 
  } = useAppState();

  // State for progress bar width
  const [progressWidth, setProgressWidth] = useState(0);
  // State for manual flashing
  const [isVisible, setIsVisible] = useState(true);
  
  // Constants for epinephrine timing
  const FULL_COLOR_TIME = 290; // 4:50 in seconds

  // Update progress width based on current time
  useEffect(() => {
    if (epiActive) {
      if (epiTime <= FULL_COLOR_TIME) {
        // Calculate progress percentage based on time elapsed (0 to 290 seconds)
        const progressPercentage = (epiTime / FULL_COLOR_TIME) * 100;
        setProgressWidth(Math.min(progressPercentage, 100));
      } else {
        // After 4:50, keep at 100%
        setProgressWidth(100);
      }
    } else {
      // Reset when not active
      setProgressWidth(0);
    }
  }, [epiActive, epiTime]);

  // Manual flashing effect
  useEffect(() => {
    if (!epiFlashing) {
      setIsVisible(true);
      return;
    }
    
    const flashInterval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 500);
    
    return () => clearInterval(flashInterval);
  }, [epiFlashing]);

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
    overflow: 'hidden',
  };

  // Format the time as MM:SS
  const formatEpiTime = () => {
    const minutes = Math.floor(epiTime / 60);
    const seconds = epiTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get cycle display text
  const getCycleText = () => {
    if (!epiActive) return "Start timer (dose 1)";
    if (epiCycles === 1) return "Tap for dose 2";
    return `Tap for dose ${epiCycles + 1}`;
  };

  return (
<button
  onClick={handleEpinephrineClick}
  style={{
    ...buttonBaseStyle,
    backgroundColor: !epiActive ? COLORS.background : COLORS.background, // Use COLORS.background instead of undefined
    color: epiActive ? 'white' : COLORS.ventGreen,
    border: epiActive ? 'none' : `1px solid ${COLORS.ventGreen}`,
  }}
>
      {/* Background for flashing */}
      {epiActive && epiFlashing && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isVisible ? COLORS.ventGreen : '#3af04fff',
            zIndex: 1,
            transition: 'background-color 0.25s ease'
          }}
        />
      )}
      
      {/* Normal progress bar - only visible when not flashing */}
      {epiActive && !epiFlashing && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progressWidth}%`,
            backgroundColor: COLORS.ventGreen,
            transition: 'width 1s linear',
            zIndex: 1
          }}
        />
      )}
      
      {/* Progress bar overlay when flashing - maintains progression */}
      {epiActive && epiFlashing && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progressWidth}%`, 
            backgroundColor: 'transparent', // Make it transparent to see the flashing background
            borderRight: '2px solid rgba(255,255,255,0.5)', // Subtle right border to mark progress
            zIndex: 2,
            pointerEvents: 'none'
          }}
        />
      )}
      
      {/* Button content - positioned above the progress bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        height: '100%',
        position: 'relative',
        zIndex: 3, // Increased z-index to stay above all layers
      }}>
        <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center' }}>
          <Syringe size={42} />
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '2px' }}>
            Epinephrine
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.9 }}>
            {getCycleText()}
          </div>
          {epiActive && 
            <div style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.9 }}>
              current dose: {epiCycles}
            </div>
          }
        </div>
      </div>
      
      {epiActive && (
        <div style={{ 
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '22px',
          fontWeight: 'bold',
          zIndex: 3 // Increased z-index to stay above all layers
        }}>
          {formatEpiTime()}
        </div>
      )}
    </button>
  );
};

export default EpinephrineButton;