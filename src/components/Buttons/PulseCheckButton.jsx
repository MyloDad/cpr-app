import React, { useEffect, useState, useRef } from 'react';
import { HeartPulse } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

const PulseCheckButton = () => {
  const { 
    activeSection, 
    pulseCheckTime, 
    pauseTime,
    pulseFlashing,
    showChargeMonitor,
    handlePulseCheckClick, 
    COLORS 
  } = useAppState();
  
  const [progressWidth, setProgressWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  // Constants for pulse check timing
  const PULSE_CHECK_DURATION = 120; // 2:00 in seconds
  const CHARGE_MONITOR_TIME = 105;  // 1:45 in seconds
  
  // Update progress width based on current time
  useEffect(() => {
    if (activeSection === 'pulse' || activeSection === 'pulse+metronome') {
      if (pulseCheckTime < PULSE_CHECK_DURATION) {
        // Calculate progress percentage based on time elapsed
        if (pulseCheckTime <= CHARGE_MONITOR_TIME) {
          const progressPercentage = (pulseCheckTime / CHARGE_MONITOR_TIME) * 100;
          setProgressWidth(Math.min(progressPercentage, 100));
        } else {
          // After 1:45, keep at 100%
          setProgressWidth(100);
        }
      } 
      else if (pauseTime > 0) {
        setProgressWidth(100);
      }
    } else {
      // Reset when not active
      setProgressWidth(0);
    }
  }, [activeSection, pulseCheckTime, pauseTime]);

  // Manual flashing effect
  useEffect(() => {
    if (!pulseFlashing) {
      setIsVisible(true);
      return;
    }
    
    const flashInterval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 500);
    
    return () => clearInterval(flashInterval);
  }, [pulseFlashing]);

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
  
  const isActive = activeSection === 'pulse' || activeSection === 'pulse+metronome';
  
  // Format the display time
  const formatDisplayTime = () => {
    if (!isActive) return "2:00";
    
    if (pulseCheckTime < PULSE_CHECK_DURATION) {
      // Main countdown display (0:00 to 2:00)
      const minutes = Math.floor(pulseCheckTime / 60);
      const seconds = pulseCheckTime % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      // Pause countdown display (0:00 to 0:10)
      const minutes = Math.floor(pauseTime / 60);
      const seconds = pauseTime % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  return (
<button
  onClick={handlePulseCheckClick}
  style={{
    ...buttonBaseStyle,
    backgroundColor: !isActive 
      ? COLORS.background 
      : (pulseFlashing && !isVisible) 
        ? 'white' 
        : COLORS.background, // Use COLORS.background instead of undefined
    color: isActive 
      ? (pulseFlashing && !isVisible) ? '#3498db' : 'white'
      : COLORS.pulseBlue,
    border: isActive 
      ? 'none' 
      : `1px solid ${COLORS.pulseBlue}`,
  }}
>
  {/* Progress bar */}
  {isActive && (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: `${progressWidth}%`,
        backgroundColor: (pulseFlashing && !isVisible) ? 'white' : COLORS.pulseBlue,
        transition: 'width 1s linear',
        zIndex: 1
      }}
    />
      )}
      
      {/* Button content - positioned above the progress bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        height: '100%',
        position: 'relative',
        zIndex: 2, // Ensure content stays above the progress bar
        color: isActive 
          ? (pulseFlashing && !isVisible) ? '#3498db' : 'white'
          : COLORS.pulseBlue,
      }}>
        <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center' }}>
          <HeartPulse size={42} />
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '2px' }}>
            Pulse Check
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.9 }}>
            2-min countdown
          </div>
        </div>
      </div>
      
      {isActive && (
        <div style={{ 
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '22px',
          fontWeight: 'bold',
          zIndex: 2, // Ensure timer stays above the progress bar
          color: (pulseFlashing && !isVisible) ? '#3498db' : 'white'
        }}>
          {formatDisplayTime()}
        </div>
      )}
    </button>
  );
};

export default PulseCheckButton;