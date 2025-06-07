import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import useNativeAudio from '../hooks/useNativeAudio';

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

// Get the correct audio path based on platform
const getAudioPath = () => {
  if (Capacitor.isNativePlatform()) {
    // For native platforms, use relative paths to the assets directory
    return ''; // The path will be handled by Capacitor's asset system
  } else {
    // For web, use the public folder path
    return '/audio/';
  }
};




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
  epiFlashing: false,
  metronomeVolume: 0.5,
  voiceVolume: 1.0
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
  const [metronomeVolume, setMetronomeVolume] = useState(initialState.metronomeVolume);
  const [voiceVolume, setVoiceVolume] = useState(initialState.voiceVolume);
  const [metronomeFlash, setMetronomeFlash] = useState(false);

 

  // Force UI refresh - Add this new state
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refs for safer interval handling
  const timerIntervalRef = useRef(null);
  const pulseIntervalRef = useRef(null);
  const ventilationIntervalRef = useRef(null);
  const epiIntervalRef = useRef(null);
  const clockIntervalRef = useRef(null);
  const metronomeTimerRef = useRef(null);
  const lastMetronomeTimeRef = useRef(0);
  const ventilationTimeoutRef = useRef(null);

  // Refs for circular function dependencies
  const startPulseCountdownRef = useRef(null);
  const startPauseCountdownRef = useRef(null);

  // Platform detection
  const isNative = Capacitor.isNativePlatform();
  const isIOS = Capacitor.getPlatform() === 'ios';

  // Audio path based on platform
  const AUDIO_PATH = getAudioPath();

  // Audio hooks - use the new native audio hook
  const { initAudio, playSound, stopSound, setVolume, unlockAudio, releaseResources } = useNativeAudio();

  const [metronomeReady, setMetronomeReady] = useState(false);

  // Initialize all audio files
  useEffect(() => {
    const audioPoolSize = isNative ? 1 : 5;
  
    const loadSounds = async () => {
      console.log('Loading audio files...');
  
      try {
        await initAudio('metronome', `${AUDIO_PATH}click.mp3`, audioPoolSize);
        console.log('Metronome loaded');
        await initAudio('ventilate', `${AUDIO_PATH}ventilate.mp3`, 3);
        await initAudio('chargeMonitor', `${AUDIO_PATH}charge_monitor.mp3`);
        await initAudio('stopCompression', `${AUDIO_PATH}stop_compression.mp3`);
        await initAudio('1', `${AUDIO_PATH}numbers/1.mp3`);
        await initAudio('2', `${AUDIO_PATH}numbers/2.mp3`);
        await initAudio('3', `${AUDIO_PATH}numbers/3.mp3`);
        await initAudio('4', `${AUDIO_PATH}numbers/4.mp3`);
        await initAudio('5', `${AUDIO_PATH}numbers/5.mp3`);
  
        console.log('All audio loaded successfully');
        setMetronomeReady(true);
      } catch (error) {
        console.error('Error loading audio files:', error);
      }
    };
  
    loadSounds(); // <== MAKE SURE THIS ACTUALLY RUNS
  
    if (!isNative) {
      document.addEventListener('click', unlockAudio, { once: true });
    } else {
      const appStateListener = App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          if (metronomeRunning) startMetronome();
          if (ventilationActive) startVentilation();
        } else {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          if (ventilationIntervalRef.current) clearInterval(ventilationIntervalRef.current);
        }
      });
  
      return () => {
        appStateListener.remove();
      };
    }
  
    return () => {
      if (!isNative) {
        document.removeEventListener('click', unlockAudio);
      }
    };
  }, []);
  
  

  // Update volumes when state changes
  useEffect(() => {
    setVolume('metronome', metronomeVolume);
  }, [metronomeVolume, setVolume]);
  
  useEffect(() => {
    // Set volume for all voice prompts
    ['ventilate', 'chargeMonitor', 'stopCompression', '1', '2', '3', '4', '5'].forEach(id => {
      setVolume(id, voiceVolume);
    });
  }, [voiceVolume, setVolume]);

  // Reset all features to their initial state
  const resetAllFeatures = useCallback(() => {
    console.log("RESET FUNCTION CALLED");
    
    // 1. First, stop all sounds
    try {
      stopSound('metronome');
      stopSound('ventilate');
      stopSound('chargeMonitor');
      stopSound('stopCompression');
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
    
    if (metronomeTimerRef.current) {
      clearInterval(metronomeTimerRef.current);
      metronomeTimerRef.current = null;
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

  // Start metronome - improved timing for native
  const startMetronome = useCallback(() => {
    if (metronomeTimerRef.current) {
      clearInterval(metronomeTimerRef.current);
      metronomeTimerRef.current = null;
    }
  
    const bpm = 110;
    const intervalMs = 60000 / bpm;
  
    // Play the first click immediately
    playSound('metronome');
    setMetronomeFlash(true);
    setTimeout(() => setMetronomeFlash(false), 100); // flash for 100ms
  
    // Schedule repeated clicks
    metronomeTimerRef.current = setInterval(() => {
      playSound('metronome');
      setMetronomeFlash(true);
      setTimeout(() => setMetronomeFlash(false), 100); // flash for 100ms
    }, intervalMs);
  }, [playSound]);
  
  
  
  // Stop metronome
  const stopMetronome = useCallback(() => {
    if (metronomeTimerRef.current) {
      clearInterval(metronomeTimerRef.current);
      metronomeTimerRef.current = null;
    }
    
    stopSound('metronome');
  }, [stopSound]);

  // Start ventilation timer

  const startVentilation = useCallback(() => {
    if (ventilationIntervalRef.current) {
      clearInterval(ventilationIntervalRef.current);
      ventilationIntervalRef.current = null;
    }
    if (ventilationTimeoutRef.current) {
      clearTimeout(ventilationTimeoutRef.current);
      ventilationTimeoutRef.current = null;
    }
  
    const intervalTime = (60 / ventilationRate) * 1000;
  
    // ✅ Play "ventilate" sound immediately on start
    playSound('ventilate');
  
    // ✅ THEN schedule the repeating ventilation sounds
    ventilationIntervalRef.current = setInterval(() => {
      playSound('ventilate');
    }, intervalTime);
  }, [playSound, ventilationRate]);
  
    

  // Toggle ventilation
  const toggleVentilation = useCallback(() => {
    // Start the main timer if this is the first feature activated
    if (!clockStarted && !activeSection && !ventilationActive && !epiActive) {
      startClock();
      setStartTime(new Date());
    }
    
    setVentilationActive(prev => {
      const newState = !prev;
      
      if (newState) {
        // Starting ventilation
        startVentilation();
      } else {
        // Stopping ventilation
        if (ventilationIntervalRef.current) {
          clearInterval(ventilationIntervalRef.current);
          ventilationIntervalRef.current = null;
        }
        stopSound('ventilate');
      }
      
      return newState;
    });
  }, [clockStarted, startClock, activeSection, ventilationActive, epiActive, startVentilation, stopSound]);

  // Metronome functions
  const handleMetronomeClick = useCallback(() => {
    if (!metronomeReady) {
      console.warn('Metronome not ready yet');
      return;
    }
  
    if (!clockStarted && !activeSection && !ventilationActive && !epiActive) {
      startClock();
      setStartTime(new Date());
    }
    
    if (activeSection === 'metronome' || activeSection === 'pulse+metronome') {
      if (activeSection === 'pulse+metronome') {
        setActiveSection('pulse');
        stopMetronome();
      } else {
        setActiveSection(null);
        stopMetronome();
      }
    } else {
      if (activeSection === 'pulse') {
        setActiveSection('pulse+metronome');
        startMetronome();
      } else {
        setActiveSection('metronome');
        startMetronome();
        if (!startTime) {
          setStartTime(new Date());
        }
      }
    }
  }, [
    metronomeReady, activeSection, clockStarted, startClock,
    ventilationActive, epiActive, startTime, startMetronome, stopMetronome
  ]);
  
  

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
      
        // Show charge monitor warning at 1:45
        if (newTime === 105) {
          console.log("🔊 Playing charge monitor");
          setShowChargeMonitor(true);
          playSound('chargeMonitor');
          setPulseFlashing(true);
        }
      
        // Countdown for last 5 seconds — ensure each only plays once
        if (newTime === 115 && !countdownAnnounced[5]) {
          console.log("🔊 5");
          playSound('5');
          setCountdownAnnounced(prev => ({ ...prev, 5: true }));
        }
        if (newTime === 116 && !countdownAnnounced[4]) {
          console.log("🔊 4");
          playSound('4');
          setCountdownAnnounced(prev => ({ ...prev, 4: true }));
        }
        if (newTime === 117 && !countdownAnnounced[3]) {
          console.log("🔊 3");
          playSound('3');
          setCountdownAnnounced(prev => ({ ...prev, 3: true }));
        }
        if (newTime === 118 && !countdownAnnounced[2]) {
          console.log("🔊 2");
          playSound('2');
          setCountdownAnnounced(prev => ({ ...prev, 2: true }));
        }
        if (newTime === 119 && !countdownAnnounced[1]) {
          console.log("🔊 1");
          playSound('1');
          setCountdownAnnounced(prev => ({ ...prev, 1: true }));
        }
      
        // At 2:00, stop pulse and start pause
        if (newTime === 120) {
          playSound('stopCompression');
          setPulseFlashing(false);
          clearInterval(pulseIntervalRef.current);
          startPauseCountdownRef.current();
          return 120;
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
      // Start metronome if not already running
      if (!metronomeTimerRef.current) {
        startMetronome();
      }
    } else {
      setMetronomeRunning(false);
      // Stop metronome if running
      if (metronomeTimerRef.current) {
        stopMetronome();
      }
    }
    
    if (!activeSection && !ventilationActive && !epiActive && clockStarted) {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
      setSeconds(0);
      setClockStarted(false);
    }
  }, [activeSection, ventilationActive, epiActive, clockStarted, startMetronome, stopMetronome]);

  // Ventilation timer effect
  useEffect(() => {
    if (!ventilationActive) {
      if (ventilationIntervalRef.current) {
        clearInterval(ventilationIntervalRef.current);
        ventilationIntervalRef.current = null;
        stopSound('ventilate');
      }
      return;
    }
    
    // If ventilation is active but interval isn't running, start it
    if (!ventilationIntervalRef.current) {
      startVentilation();
    }
    
    // If ventilation rate changes, restart the interval
    if (ventilationActive && ventilationIntervalRef.current) {
      clearInterval(ventilationIntervalRef.current);
      startVentilation();
    }
    
  }, [ventilationActive, ventilationRate, startVentilation, stopSound]);

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
    
    // Only start if not already running
    if (!epiIntervalRef.current) {
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
    }
    
    return () => {
      if (epiIntervalRef.current) {
        clearInterval(epiIntervalRef.current);
        epiIntervalRef.current = null;
      }
    };
  }, [epiActive]); 

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
      [timerIntervalRef, pulseIntervalRef, ventilationIntervalRef, epiIntervalRef, clockIntervalRef, metronomeTimerRef].forEach(ref => {
        if (ref && ref.current) {
          clearInterval(ref.current);
          ref.current = null;
        }
      });
      
      // Release audio resources
      releaseResources();
    };
  }, [releaseResources]);

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
    metronomeFlash,
    refreshTrigger,
    metronomeVolume,
    voiceVolume,
    isNative,
    isIOS,
    
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
    setMetronomeVolume,
    setVoiceVolume,
    
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
// This export needs to be OUTSIDE of the AppStateProvider component
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};