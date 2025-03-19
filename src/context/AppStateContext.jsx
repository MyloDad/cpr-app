import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import useAudio from '../hooks/useAudio';

// App constants
export const COLORS = {
  background: '#1e2126',     // Dark background
  logoRed: '#ff4136',        // Red from logo
  logoYellow: '#f4eb00ff',   // Yellow from logo
  pulseBlue: '#3498db',      // Blue for pulse check
  ventGreen: '#2ecc40',      // Green for ventilation
  white: '#ffffff',          // White text
  darkText: '#1a1a1a',       // Dark text for yellow buttons
  timerBg: '#2c3e50',        // Timer background
  sliderBg: '#ecf0f1',       // Slider background
};

// Create the context
const AppStateContext = createContext();

// Path to audio files
const AUDIO_PATH = '/audio/';

// Initial state - used for reset
const initialState = {
  activeSection: null,
  seconds: 0,
  pulseCheckTime: 0,
  pauseTime: 0,
  metronomeRunning: false,
  ventilationActive: false,
  ventilationRate: 11,
  showChargeMonitor: false,
  epiActive: false,
  epiTime: 0,
  epiCycles: 0,
  clockStarted: false,
  startTime: null,
  countdownAnnounced: {5: false, 4: false, 3: false, 2: false, 1: false},
  confirmReset: false,
  pulseFlashing: false,
  epiFlashing: false
};

export const AppStateProvider = ({ children }) => {
  // State variables
  const [activeSection, setActiveSection] = useState(initialState.activeSection);
  const [seconds, setSeconds] = useState(initialState.seconds);
  const [pulseCheckTime, setPulseCheckTime] = useState(initialState.pulseCheckTime);
  const [pauseTime, setPauseTime] = useState(initialState.pauseTime);
  const [metronomeRunning, setMetronomeRunning] = useState(initialState.metronomeRunning);
  const [ventilationActive, setVentilationActive] = useState(initialState.ventilationActive);
  const [ventilationRate, setVentilationRate] = useState(initialState.ventilationRate);
  const [showChargeMonitor, setShowChargeMonitor] = useState(initialState.showChargeMonitor);
  const [epiActive, setEpiActive] = useState(initialState.epiActive);
  const [epiTime, setEpiTime] = useState(initialState.epiTime);
  const [epiCycles, setEpiCycles] = useState(initialState.epiCycles);
  const [clockStarted, setClockStarted] = useState(initialState.clockStarted);
  const [startTime, setStartTime] = useState(initialState.startTime);
  const [countdownAnnounced, setCountdownAnnounced] = useState(initialState.countdownAnnounced);
  const [confirmReset, setConfirmReset] = useState(initialState.confirmReset);
  const [pulseFlashing, setPulseFlashing] = useState(initialState.pulseFlashing);
  const [epiFlashing, setEpiFlashing] = useState(initialState.epiFlashing);
  
  // Force UI refresh - Add this new state
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refs for safer interval handling
  const timerIntervalRef = useRef(null);
  const pulseIntervalRef = useRef(null);
  const ventilationIntervalRef = useRef(null);
  const epiIntervalRef = useRef(null);
  const clockIntervalRef = useRef(null);

  // Refs for circular function dependencies
  const startPulseCountdownRef = useRef(null);
  const startPauseCountdownRef = useRef(null);

  // Audio hooks
  const { initAudio, playSound, stopSound, unlockAudio } = useAudio();

  // Initialize all audio files
  useEffect(() => {
    // Initialize audio pools for all sounds we'll use
    initAudio('metronome', `${AUDIO_PATH}click.mp3`, 5);  // More instances for rapid clicks
    initAudio('ventilate', `${AUDIO_PATH}ventilate.mp3`, 3);
    initAudio('chargeMonitor', `${AUDIO_PATH}charge_monitor.mp3`);
    initAudio('stopCompression', `${AUDIO_PATH}stop_compression.mp3`);
    initAudio('1', `${AUDIO_PATH}numbers/1.mp3`);
    initAudio('2', `${AUDIO_PATH}numbers/2.mp3`);
    initAudio('3', `${AUDIO_PATH}numbers/3.mp3`);
    initAudio('4', `${AUDIO_PATH}numbers/4.mp3`);
    initAudio('5', `${AUDIO_PATH}numbers/5.mp3`);
    
    // Unlock audio for iOS on first user interaction
    document.addEventListener('click', unlockAudio, { once: true });
    
    return () => {
      document.removeEventListener('click', unlockAudio);
    };
  }, [initAudio, unlockAudio]);

  // Reset all features to their initial state - ENHANCED RESET FUNCTION
  const resetAllFeatures = useCallback(() => {
    console.log("RESET FUNCTION CALLED");
    
    // 1. First, stop all sounds
    try {
      if (typeof stopSound === 'function') {
        stopSound('metronome');
        stopSound('ventilate');
        stopSound('chargeMonitor');
        stopSound('stopCompression');
      }
    } catch (e) {
      console.error("Error stopping sounds:", e);
    }
    
    // 2. Clear all intervals
    console.log("Clearing all intervals");
    
    // Clear timer interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Clear pulse interval
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    
    // Clear ventilation interval
    if (ventilationIntervalRef.current) {
      clearInterval(ventilationIntervalRef.current);
      ventilationIntervalRef.current = null;
    }
    
    // Clear epi interval
    if (epiIntervalRef.current) {
      clearInterval(epiIntervalRef.current);
      epiIntervalRef.current = null;
    }
    
    // Clear clock interval
    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current);
      clockIntervalRef.current = null;
    }
    
    // 3. Reset all state variables
    console.log("Resetting all state variables");
    
    setActiveSection(initialState.activeSection);
    setSeconds(initialState.seconds);
    setPulseCheckTime(initialState.pulseCheckTime);
    setPauseTime(initialState.pauseTime);
    setMetronomeRunning(initialState.metronomeRunning);
    setVentilationActive(initialState.ventilationActive);
    setShowChargeMonitor(initialState.showChargeMonitor);
    setEpiActive(initialState.epiActive);
    setEpiTime(initialState.epiTime);
    setEpiCycles(initialState.epiCycles);
    setClockStarted(initialState.clockStarted);
    setStartTime(initialState.startTime);
    setCountdownAnnounced(initialState.countdownAnnounced);
    setConfirmReset(initialState.confirmReset);
    setPulseFlashing(initialState.pulseFlashing);
    setEpiFlashing(initialState.epiFlashing);
    
    // 4. Trigger a UI refresh
    setRefreshTrigger(prev => prev + 1);
    
    console.log("Reset completed");
  }, [stopSound]); // Only depend on stopSound

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
  
  // Reset the main clock
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
      setStartTime(new Date());
    }
    
    setVentilationActive(prev => !prev);
  }, [clockStarted, startClock, activeSection, ventilationActive, epiActive]);

  // Metronome functions
  const handleMetronomeClick = useCallback(() => {
    // Start the main timer if this is the first feature activated
    if (!clockStarted && !activeSection && !ventilationActive && !epiActive) {
      startClock();
      setStartTime(new Date());
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
  }, [activeSection, clockStarted, startClock, ventilationActive, epiActive, startTime]);

  // Define startPulseCountdown with reference to the ref instead of direct function
  const startPulseCountdown = useCallback(() => {
    // Clear any existing interval first
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
    }
    
    // Reset the counter to 0
    setPulseCheckTime(0);
    
    pulseIntervalRef.current = setInterval(() => {
      setPulseCheckTime(prevTime => {
        const newTime = prevTime + 1;
        
        // Show charge monitor warning at 1:45 (105 seconds)
        if (newTime === 105) {
          setShowChargeMonitor(true);
          playSound('chargeMonitor');
          setPulseFlashing(true);
        }

        // Countdown for last 5 seconds - directly matching the timer display
        if (newTime === 115) playSound('5'); // 1:55
        if (newTime === 116) playSound('4'); // 1:56
        if (newTime === 117) playSound('3'); // 1:57
        if (newTime === 118) playSound('2'); // 1:58
        if (newTime === 119) playSound('1'); // 1:59
        
        // Handle the "stopCompression" at exactly 2:00 (120 seconds)
        if (newTime === 120) {
          playSound('stopCompression');
          setPulseFlashing(false);
          
          // Clear this interval and start the pause countdown
          clearInterval(pulseIntervalRef.current);
          startPauseCountdownRef.current();
          
          return 120; // Keep it at 120
        }
        
        return newTime;
      });
    }, 1000);
  }, [playSound]);

  // Reimplemented to count up instead of down
  const startPauseCountdown = useCallback(() => {
    // Reset the pause counter to 0
    setPauseTime(0);
    
    // Start a new interval for the pause countdown
    pulseIntervalRef.current = setInterval(() => {
      setPauseTime(prevPauseTime => {
        const newTime = prevPauseTime + 1;
        
        // When pause countdown reaches 10 seconds
        if (newTime >= 10) {
          // Auto-restart the pulse check countdown
          setPulseCheckTime(0);
          setShowChargeMonitor(false);
          setCountdownAnnounced({ 5: false, 4: false, 3: false, 2: false, 1: false });
          
          // Clear this interval and restart the pulse countdown
          clearInterval(pulseIntervalRef.current);
          startPulseCountdownRef.current();
          
          return 0; // Reset the pause time for next time
        }
        
        return newTime;
      });
    }, 1000);
  }, []);

  // Assign the functions to the refs after they're defined
  useEffect(() => {
    startPulseCountdownRef.current = startPulseCountdown;
    startPauseCountdownRef.current = startPauseCountdown;
  }, [startPulseCountdown, startPauseCountdown]);

  // Handle pulse check click
  const handlePulseCheckClick = useCallback(() => {
    // Start the main timer if this is the first feature activated
    if (!clockStarted && !activeSection && !ventilationActive && !epiActive) {
      startClock();
      setStartTime(new Date());
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
      setPulseCheckTime(0);    // Start at 0 for count up
      setPauseTime(0);         // Start at 0 for count up
      setShowChargeMonitor(false);
      setCountdownAnnounced({5: false, 4: false, 3: false, 2: false, 1: false});
      
      // Start the main pulse check countdown using the ref
      startPulseCountdownRef.current();
    }
  }, [activeSection, clockStarted, startClock, ventilationActive, epiActive]);




  // Epinephrine functions - modified for count-up and cycle counting
  const handleEpinephrineClick = useCallback(() => {
    // Start the main timer if this is the first feature activated
    if (!clockStarted && !activeSection && !ventilationActive && !epiActive) {
      startClock();
      setStartTime(new Date());
    }
    
    // Toggle or reset epinephrine state
    if (epiActive) {
      // If already active, restart the timer and increment cycle count
      setEpiTime(0);
      setEpiCycles(prev => prev + 1);
      setEpiFlashing(false);
    } else {
      // If turning on, set initial state with cycle count of 1 (first dose)
      setEpiTime(0);
      setEpiCycles(1); // Start at 1 instead of 0
      setEpiActive(true);
    }
  }, [clockStarted, startClock, activeSection, ventilationActive, epiActive]);

  // Add a function to turn off epinephrine completely (long press or separate button)
  const turnOffEpinephrine = useCallback(() => {
    setEpiActive(false);
    setEpiTime(0);
    setEpiCycles(0); // Reset cycles to 0 when turning off completely
    setEpiFlashing(false);
    
    // Clear interval
    if (epiIntervalRef.current) {
      clearInterval(epiIntervalRef.current);
      epiIntervalRef.current = null;
    }
  }, []);

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
// Detection for iOS device
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Metronome timer effect - OPTIMIZED FOR iOS
useEffect(() => {
  if (!metronomeRunning) return;
  
  // Clear any existing timers
  if (timerIntervalRef.current) {
    clearTimeout(timerIntervalRef.current);
    timerIntervalRef.current = null;
  }
  
  const bpm = 110; // Fixed BPM
  if (bpm <= 0) return;
  
  // Calculate the beat interval in milliseconds
  const beatInterval = (60 / bpm) * 1000;
  
  // iOS has stricter background processing limitations,
  // so we'll use a different strategy
  if (isIOS()) {
    console.log("Using iOS-optimized metronome strategy");
    
    // For iOS, we'll use a simpler approach with more aggressive scheduling
    // to combat Safari's aggressive throttling
    
    let intervalId = null;
    
    // Play the first beat immediately
    playSound('metronome');
    
    // Use setInterval for iOS - more reliable on iOS than the scheduled approach
    // We'll create a pre-scheduled buffer of beats
    intervalId = setInterval(() => {
      // Play sound on each interval
      playSound('metronome');
    }, beatInterval);
    
    // Store the interval ID for cleanup
    timerIntervalRef.current = intervalId;
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  } else {
    // Desktop browsers can use the more precise scheduling approach
    console.log("Using desktop-optimized metronome strategy");
    
    // Track when the next beat should occur
    let nextBeatTime = performance.now();
    
    // Function to schedule the next beat
    const scheduleNextBeat = () => {
      // Get current time
      const now = performance.now();
      
      // Calculate when the next beat should happen
      // If we've drifted, this will auto-correct by scheduling
      // the next beat relative to when it should have occurred
      nextBeatTime = Math.max(now, nextBeatTime + beatInterval);
      
      // Calculate time until next beat
      const timeUntilNextBeat = nextBeatTime - now;
      
      // Schedule the next beat
      timerIntervalRef.current = setTimeout(() => {
        // Play the metronome sound
        playSound('metronome');
        
        // Schedule the next beat
        scheduleNextBeat();
      }, timeUntilNextBeat);
    };
    
    // Play the first beat immediately
    playSound('metronome');
    nextBeatTime = performance.now() + beatInterval;
    
    // Schedule future beats
    scheduleNextBeat();
  }
  
  // Clean up on unmount or when metronome stops
  return () => {
    if (timerIntervalRef.current) {
      if (isIOS()) {
        clearInterval(timerIntervalRef.current);
      } else {
        clearTimeout(timerIntervalRef.current);
      }
      timerIntervalRef.current = null;
    }
  };
}, [metronomeRunning, playSound]);

  // Ventilation timer effect
  useEffect(() => {
    if (!ventilationActive) return;
    
    if (ventilationIntervalRef.current) {
      clearInterval(ventilationIntervalRef.current);
      ventilationIntervalRef.current = null;
    }
    
    if (ventilationRate <= 0) return;
    
    const intervalTime = (60 / ventilationRate) * 1000;
    
    // Play immediately on start
    playSound('ventilate');
    
    ventilationIntervalRef.current = setInterval(() => {
      playSound('ventilate');
    }, intervalTime);
    
    return () => {
      if (ventilationIntervalRef.current) {
        clearInterval(ventilationIntervalRef.current);
        ventilationIntervalRef.current = null;
      }
    };
  }, [ventilationActive, ventilationRate, playSound]);

  // Epinephrine timer effect - modified for count-up
  useEffect(() => {
    if (!epiActive) {
      if (epiIntervalRef.current) {
        clearInterval(epiIntervalRef.current);
        epiIntervalRef.current = null;
      }
      setEpiFlashing(false); // Ensure flashing stops when deactivated
      return;
    }
    
    // Add epiTime to dependencies by using it inside the effect
    // This addresses the missing dependency warning
    const currentEpiTime = epiTime;
    
    // Reset timer to 0 when activated (only if it was just activated)
    if (currentEpiTime === 0 && epiIntervalRef.current === null) {
      setEpiTime(0);
    }
    
    epiIntervalRef.current = setInterval(() => {
      setEpiTime(prevTime => {
        const newTime = prevTime + 1;
        
        // Start flashing when we reach 4:45 (285 seconds)
        if (newTime === 285) {
          setEpiFlashing(true);
        }
        
        // Continue counting up indefinitely until button is clicked again
        // No automatic cycle increment based on time
        return newTime;
      });
    }, 1000);
    
    return () => {
      if (epiIntervalRef.current) {
        clearInterval(epiIntervalRef.current);
        epiIntervalRef.current = null;
      }
    };
  }, [epiActive, epiTime]); 

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

  // Cleanup all intervals on unmount
  useEffect(() => {
    return () => {
      [timerIntervalRef, pulseIntervalRef, ventilationIntervalRef, epiIntervalRef, clockIntervalRef].forEach(ref => {
        if (ref && ref.current) {
          clearInterval(ref.current);
          ref.current = null;
        }
      });
    };
  }, []);

  // Effect to monitor key state changes for debugging
  useEffect(() => {
    console.log("State update:", {
      activeSection,
      seconds,
      clockStarted,
      ventilationActive,
      epiActive,
      refreshTrigger
    });
  }, [activeSection, seconds, clockStarted, ventilationActive, epiActive, refreshTrigger]);

  // Exposed context value
  const contextValue = {
    // State
    activeSection,
    seconds,
    pulseCheckTime,
    pauseTime,
    metronomeRunning, 
    ventilationActive,
    ventilationRate,
    showChargeMonitor,
    epiActive,
    epiTime,
    epiCycles,
    clockStarted,
    startTime,
    countdownAnnounced,
    confirmReset,
    pulseFlashing,
    epiFlashing,
    refreshTrigger, // Add the refresh trigger to the context
    
    // Actions
    setVentilationRate,
    handleTimerClick,
    resetClock,
    cancelReset,
    toggleVentilation,
    handleMetronomeClick,
    handlePulseCheckClick,
    handleEpinephrineClick,
    turnOffEpinephrine,
    resetAllFeatures,
    
    // Utilities
    formatTime,
    formatClock,
    COLORS
  };

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

// Custom hook to use the app state
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};