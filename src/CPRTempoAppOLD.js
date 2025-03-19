import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HeartPulse, Clock, Syringe, Wind } from 'lucide-react';
import styles from './CPRTempoApp.module.css';

// Create a simplified version that will definitely compile
const CPRTempoApp = () => {
  // State variables
  const [activeSection, setActiveSection] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [pulseCheckTime, setPulseCheckTime] = useState(120); // 2 minutes countdown
  const [pauseTime, setPauseTime] = useState(10); // 10 second pause countdown
  const [metronomeRunning, setMetronomeRunning] = useState(false);
  const [ventilationActive, setVentilationActive] = useState(false);
  const [ventilationRate, setVentilationRate] = useState(11); // Default ventilation rate
  const [showChargeMonitor, setShowChargeMonitor] = useState(false);
  const [epiActive, setEpiActive] = useState(false);
  const [epiTime, setEpiTime] = useState(300); // 5 minutes countdown
  const [epiCycles, setEpiCycles] = useState(0); // Counter for epinephrine cycles
  const [clockStarted, setClockStarted] = useState(false);
  const [startTime, setStartTime] = useState(null); // Track when the metronome was started
  const [countdownAnnounced, setCountdownAnnounced] = useState({5: false, 4: false, 3: false, 2: false, 1: false}); // Track announced numbers
  const [confirmReset, setConfirmReset] = useState(false); // State for reset confirmation

  const [pulseFlashing, setPulseFlashing] = useState(false); // For pulse button flashing in last 5 seconds
  const [epiFlashing, setEpiFlashing] = useState(false); // For epinephrine button flashing in last 5 seconds


  // Refs for safer interval handling
  const audioContextRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const pulseIntervalRef = useRef(null);
  const ventilationIntervalRef = useRef(null);
  const epiIntervalRef = useRef(null);
  const clockIntervalRef = useRef(null);
  const lastSpeechRef = useRef("");

  // Brand colors from logo
  const COLORS = {
    background: '#1e2126',     // Dark background
    logoRed: '#ff4136',        // Red from logo
    logoYellow: '#f4eb00ff',     // Yellow from logo
    pulseBlue: '#3498db',      // Blue for pulse check
    ventGreen: '#2ecc40',      // Green for ventilation
    white: '#ffffff',          // White text
    darkText: '#1a1a1a',       // Dark text for yellow buttons
    timerBg: '#2c3e50',        // Timer background
    sliderBg: '#ecf0f1',       // Slider background
  };

  // Play speech synthesis - prevent duplicates by tracking last phrase
  const playSpeech = useCallback((text) => {
    // Don't repeat the same text twice in a row
    if (lastSpeechRef.current === text && window.speechSynthesis.speaking) {
      return;
    }
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.volume = 1.0;
      
      // Add onend callback to reset lastSpeechRef when speech completes
      utterance.onend = () => {
        if (lastSpeechRef.current === text) {
          lastSpeechRef.current = "";  // Reset after speaking completes
        }
      };
      
      window.speechSynthesis.speak(utterance);
      lastSpeechRef.current = text;
    }
  }, []);

  // Create audio context
  const createAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.error("Failed to create audio context:", e);
      }
    }
    return audioContextRef.current;
  }, []);

  // Get audio context
  const getAudioContext = useCallback(() => {
    return audioContextRef.current;
  }, []);

  // Start the main clock
  const startClock = useCallback(() => {
    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current);
    }
    
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    
    clockIntervalRef.current = interval;
    setClockStarted(true);
  }, []);
  
  // Reset the main clock - with confirmation
  const resetClock = useCallback(() => {
    setSeconds(0);
    setConfirmReset(false);
    
    // Only start the clock if there's an active feature
    if (!clockStarted && (activeSection || ventilationActive || epiActive)) {
      startClock();
    } else if (!activeSection && !ventilationActive && !epiActive) {
      // If everything is inactive, just reset without starting
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
      setClockStarted(false);
    }
  }, [clockStarted, startClock, activeSection, ventilationActive, epiActive]);
  
  // Handle timer click to show confirmation
  const handleTimerClick = useCallback(() => {
    // If timer is already at 0, no need for confirmation
    if (seconds === 0) return;
    
    // Show confirmation dialog
    setConfirmReset(true);
  }, [seconds]);
  
  // Cancel reset
  const cancelReset = useCallback(() => {
    setConfirmReset(false);
  }, []);

  // Toggle ventilation
  const toggleVentilation = useCallback(() => {
    // Start the main timer if this is the first feature activated
    if (!clockStarted && !activeSection && !ventilationActive && !epiActive) {
      startClock();
      setStartTime(new Date()); // Set start time when first activated
    }
    
    setVentilationActive(prev => !prev);
  }, [clockStarted, startClock, activeSection, ventilationActive, epiActive]);

  // Play metronome click
  const playMetronomeClick = useCallback(() => {
    try {
      const ctx = getAudioContext() || createAudioContext();
      if (!ctx) return;
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      oscillator.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  }, [getAudioContext, createAudioContext]);

  // Play ventilate sound
  const playVentilateSound = useCallback(() => {
    if ('speechSynthesis' in window && !window.speechSynthesis.speaking) {
      playSpeech("ventilate");
    }
  }, [playSpeech]);

  // Handle Metronome button click
  const handleMetronomeClick = useCallback(() => {
    createAudioContext();
    
    // Start the main timer if this is the first feature activated
    if (!clockStarted && !activeSection && !ventilationActive && !epiActive) {
      startClock();
      setStartTime(new Date()); // Set start time when first activated
    }
    
    if (activeSection === 'metronome' || activeSection === 'pulse+metronome') {
      if (activeSection === 'pulse+metronome') {
        setActiveSection('pulse');
      } else {
        setActiveSection(null);
      }
    } else {
      if (activeSection === 'pulse') {
        setActiveSection('pulse+metronome');
      } else {
        setActiveSection('metronome');
        // Only set start time if it hasn't been set yet
        if (!startTime) {
          setStartTime(new Date());
        }
      }
    }
  }, [activeSection, createAudioContext, clockStarted, startClock, ventilationActive, epiActive, startTime]);

// Handle Pulse check button click
const handlePulseCheckClick = useCallback(() => {
  // Start the main timer if this is the first feature activated
  if (!clockStarted && !activeSection && !ventilationActive && !epiActive) {
    startClock();
    setStartTime(new Date()); // Set start time when first activated
  }
  
  if (activeSection === 'pulse' || activeSection === 'pulse+metronome') {
    if (activeSection === 'pulse+metronome') {
      setActiveSection('metronome');
    } else {
      setActiveSection(null);
    }
    
    // Clear both intervals to be safe
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    
    setPulseFlashing(false); // Stop flashing
  } else {
    if (activeSection === 'metronome') {
      setActiveSection('pulse+metronome');
    } else {
      setActiveSection('pulse');
    }
    
    // Reset all values
    setPulseCheckTime(120);
    setPauseTime(10);
    setShowChargeMonitor(false);
    setCountdownAnnounced({5: false, 4: false, 3: false, 2: false, 1: false});
    lastSpeechRef.current = ""; // Reset last speech to allow new announcements
    
    // Start the main pulse check countdown
    startPulseCountdown();
  }
}, [activeSection, playSpeech, countdownAnnounced, clockStarted, startClock, ventilationActive, epiActive]);

// Separate function to start pulse countdown
const startPulseCountdown = useCallback(() => {
  // Clear any existing interval first
  if (pulseIntervalRef.current) {
    clearInterval(pulseIntervalRef.current);
  }
  
  pulseIntervalRef.current = setInterval(() => {
    setPulseCheckTime(prevTime => {
      // Show charge monitor warning at 15 seconds
      if (prevTime === 15) {
        setShowChargeMonitor(true);
        if (!window.speechSynthesis.speaking) {
          playSpeech("Charge monitor");
        }
      }
      if (prevTime === 15) {
        setPulseFlashing(true);
      }

      // Countdown for last 5 seconds
      if (prevTime <= 5 && prevTime > 0) {
        if (!countdownAnnounced[prevTime] && !window.speechSynthesis.speaking) {
          playSpeech(prevTime.toString());
          setCountdownAnnounced(prev => ({ ...prev, [prevTime]: true }));
          
          if (prevTime === 1) {
            setTimeout(() => {
              if (!window.speechSynthesis.speaking) {
                playSpeech("Stop compression");
              }
            }, 1000);
          }
        }
      }
      
      // When pulse check countdown reaches zero
      if (prevTime === 0) {
        setPulseFlashing(false);
        
        // Clear this interval and start the pause countdown
        clearInterval(pulseIntervalRef.current);
        startPauseCountdown();
        
        return 0; // Keep it at zero
      }
      
      return prevTime - 1;
    });
  }, 1000);
}, [playSpeech, countdownAnnounced]);

// Separate function to start pause countdown
const startPauseCountdown = useCallback(() => {
  // Start a new interval for the pause countdown
  pulseIntervalRef.current = setInterval(() => {
    setPauseTime(prevPauseTime => {
      // When pause countdown finishes
      if (prevPauseTime <= 1) {
        // Auto-restart the pulse check countdown
        setPulseCheckTime(120);
        setShowChargeMonitor(false);
        setCountdownAnnounced({ 5: false, 4: false, 3: false, 2: false, 1: false });
        lastSpeechRef.current = ""; // Reset last speech
        
        // Clear this interval and restart the pulse countdown
        clearInterval(pulseIntervalRef.current);
        startPulseCountdown();
        
        return 10; // Reset the pause time for next time
      }
      
      return prevPauseTime - 1;
    });
  }, 1000);
}, [startPulseCountdown]);
  
  // Handle Epinephrine button click
  const handleEpinephrineClick = useCallback(() => {
    // Start the main timer if this is the first feature activated
    if (!clockStarted && !activeSection && !ventilationActive && !epiActive) {
      startClock();
      setStartTime(new Date()); // Set start time when first activated
    }
    
    // Toggle epinephrine state
    setEpiActive(prev => {
      if (prev) {
        // If turning off, reset time and counter and stop flashing
        setEpiTime(300);
        setEpiCycles(0);
        setEpiFlashing(false);
      } else {
        // If turning on, set initial state
        setEpiTime(300);
      }
      return !prev;
    });
  }, [clockStarted, startClock, activeSection, ventilationActive, epiActive]);

  // Update metronome state based on activeSection
  useEffect(() => {
    if (activeSection === 'metronome' || activeSection === 'pulse+metronome') {
      setMetronomeRunning(true);
    } else {
      setMetronomeRunning(false);
    }
    
    if (!activeSection && !ventilationActive && !epiActive && clockStarted) {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
      setSeconds(0);
      setClockStarted(false);
    }
  }, [activeSection, ventilationActive, epiActive, clockStarted]);

  // Metronome timer effect
  useEffect(() => {
    if (!metronomeRunning) return;
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    const bpm = 110; // Fixed BPM
    if (bpm <= 0) return;
    
    const intervalTime = (60 / bpm) * 1000;
    timerIntervalRef.current = setInterval(playMetronomeClick, intervalTime);
    
    playMetronomeClick();
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [metronomeRunning, playMetronomeClick]);

  // Ventilation timer effect
  useEffect(() => {
    if (!ventilationActive) return;
    
    if (ventilationIntervalRef.current) {
      clearInterval(ventilationIntervalRef.current);
      ventilationIntervalRef.current = null;
    }
    
    if (ventilationRate <= 0) return;
    
    const intervalTime = (60 / ventilationRate) * 1000;
    ventilationIntervalRef.current = setInterval(playVentilateSound, intervalTime);
    
    playVentilateSound();
    
    return () => {
      if (ventilationIntervalRef.current) {
        clearInterval(ventilationIntervalRef.current);
        ventilationIntervalRef.current = null;
      }
    };
  }, [ventilationActive, ventilationRate, playVentilateSound]);

  // Epinephrine timer effect
  useEffect(() => {
    if (!epiActive) {
      if (epiIntervalRef.current) {
        clearInterval(epiIntervalRef.current);
        epiIntervalRef.current = null;
      }
      setEpiFlashing(false); // Ensure flashing stops when deactivated
      return;
    }
    
    epiIntervalRef.current = setInterval(() => {
      setEpiTime(prevTime => {
        // Start flashing during last 15 seconds of cycle
        if (prevTime === 15) {
          setEpiFlashing(true);
        }
        
        if (prevTime <= 0) {
          // Increment the cycle counter when a full cycle completes
          setEpiCycles(prev => prev + 1);
          setEpiFlashing(false); // Stop flashing when the cycle completes
          setEpiTime(300);
          return 300;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => {
      if (epiIntervalRef.current) {
        clearInterval(epiIntervalRef.current);
        epiIntervalRef.current = null;
      }
    };
  }, [epiActive]);

  // Update current time every second
  useEffect(() => {
    const timeUpdateInterval = setInterval(() => {
      // Just for updating "now" clock display
      if (clockStarted) {
        setSeconds(prev => prev);
      }
    }, 1000);
    
    return () => clearInterval(timeUpdateInterval);
  }, [clockStarted]);

  // Cleanup all intervals on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      [timerIntervalRef, pulseIntervalRef, ventilationIntervalRef, epiIntervalRef, clockIntervalRef].forEach(ref => {
        if (ref && ref.current) {
          clearInterval(ref.current);
          ref.current = null;
        }
      });
    };
  }, []);

  // Format seconds to MM:SS
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Format time as 24-hour clock HH:MM
  const formatClock = (date) => {
    if (!date) return "--:--";
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

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

  // Render the UI
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
      {/* Logo and Title Section */}
  {/* Logo Image */}
  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
  <img 
    src="/central-pierce-logo.png" 
    alt="Central Pierce Fire & Rescue" 
    style={{ 
      maxWidth: '80%', 
      height: 'auto',
      maxHeight: '120px',
      marginBottom: '5px'
    }} 
  />
</div>
        <div>
        {/* App Title */}
        <h1 style={{ 
          margin: '0 0 5px 0',
          color: COLORS.logoRed, 
          fontSize: '32px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          ArrestPro
        </h1>
      </div>

      {/* Timer Display with click to reset - with confirmation */}
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

      {/* Main Buttons */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '8px',
        margin: '0 0 8px 0'
        }}>
        {/* Metronome Button */}


{/* Metronome Button */}
<button
  onClick={handleMetronomeClick}
  style={{
    ...buttonBaseStyle,
    backgroundColor: (activeSection === 'metronome' || activeSection === 'pulse+metronome') 
      ? COLORS.logoRed 
      : COLORS.background,
    color: (activeSection === 'metronome' || activeSection === 'pulse+metronome') 
      ? COLORS.white 
      : COLORS.logoRed,
    border: (activeSection === 'metronome' || activeSection === 'pulse+metronome')
      ? 'none'
      : `1px solid ${COLORS.logoRed}`
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

{/* Pulse Check Button */}
<button
  onClick={handlePulseCheckClick}
  style={{
    ...buttonBaseStyle,
    backgroundColor: showChargeMonitor 
      ? COLORS.pulseBlue 
      : (activeSection === 'pulse' || activeSection === 'pulse+metronome') 
        ? COLORS.pulseBlue 
        : COLORS.background,
    color: (activeSection === 'pulse' || activeSection === 'pulse+metronome') 
      ? COLORS.white 
      : COLORS.pulseBlue,
    border: (activeSection === 'pulse' || activeSection === 'pulse+metronome') 
      ? 'none' 
      : `1px solid ${COLORS.pulseBlue}`,
    animation: pulseFlashing ? 'flashAlternate 1s infinite' : 'none'
  }}
>
  <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
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
  {(activeSection === 'pulse' || activeSection === 'pulse+metronome') && (
    <div style={{ 
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '22px',
      fontWeight: 'bold'
    }}>
      {pulseCheckTime > 0 ? (
        <div>{Math.floor(pulseCheckTime / 60) + ":" + (pulseCheckTime % 60).toString().padStart(2, '0')}</div>
      ) : (
        <div>{Math.floor(pauseTime / 60) + ":" + (pauseTime % 60).toString().padStart(2, '0')}</div>
      )}
    </div>
  )}
</button>

{/* Epinephrine Button */}
<button
  onClick={handleEpinephrineClick}
  style={{
    ...buttonBaseStyle,
    backgroundColor: epiActive 
      ? COLORS.logoYellow 
      : COLORS.background,
    color: epiActive 
      ? COLORS.darkText 
      : COLORS.logoYellow,
    border: epiActive 
      ? 'none' 
      : `1px solid ${COLORS.logoYellow}`,
    animation: epiFlashing ? 'flash 1s infinite' : 'none'  
  }}
>
  <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
    <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center' }}>
      <Syringe size={42} />
    </div>
    <div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '2px' }}>
        Epinephrine
      </div>
      <div style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.9 }}>
        5-min countdown
      </div>
      {epiActive && 
        <div style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.9 }}>
          cycles: {epiCycles}
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
      fontWeight: 'bold'
    }}>
      {Math.floor(epiTime / 60)}:{(epiTime % 60).toString().padStart(2, '0')}
    </div>
  )}
</button>

{/* Ventilation Button */}
<button
  onClick={toggleVentilation}
  style={{
    ...buttonBaseStyle,
    backgroundColor: ventilationActive 
      ? COLORS.ventGreen 
      : COLORS.background,
    color: ventilationActive 
      ? COLORS.white 
      : COLORS.ventGreen,
    border: ventilationActive 
      ? 'none' 
      : `1px solid ${COLORS.ventGreen}`
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



      </div>

      {/* Ventilation Rate Control - compact slider */}
      {ventilationActive && (
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
                  ${COLORS.ventGreen} 0%, 
                  ${COLORS.ventGreen} ${(ventilationRate-5)/15*100}%, 
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
      )}

      {/* Animation style for the pulse flash */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes flash {
          0% { background-color: ${COLORS.logoYellow}; }
          50% { background-color: #ffffff; } 
          100% { background-color: ${COLORS.logoYellow}; }
          }     
          
          @keyframes flashAlternate {
            0% {
              background-color: ${COLORS.pulseBlue};
              color: inherit;
            }
            50% {
              background-color: #ffffff;
              color: black;
            }
            100% {
              background-color: ${COLORS.pulseBlue};
              color: inherit;
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
            background: ${COLORS.white};
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          }
          
          input[type=range]::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: ${COLORS.white};
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
            background-color: ${COLORS.background};
          }
        `
      }} />
    </div>
  );
};

export default CPRTempoApp;