import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HeartPulse, Timer, Clock, Syringe } from 'lucide-react';
import styles from './CPRTempoApp.module.css';

const CPRTempoApp = () => {
  // State variables
  const [activeSection, setActiveSection] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [pulseCheckTime, setPulseCheckTime] = useState(120); // 2 minutes countdown
  const [pauseTime, setPauseTime] = useState(10); // 10 second pause countdown
  const [metronomeRunning, setMetronomeRunning] = useState(false);
  const [ventilationActive, setVentilationActive] = useState(false);
  const [isVentilating, setIsVentilating] = useState(false);
  const [ventilationProgress, setVentilationProgress] = useState(100);
  const [bpm, setBpm] = useState(110); // Standard CPR compression rate
  const [ventilationRate, setVentilationRate] = useState(11); // Default ventilation rate
  const [showChargeMonitor, setShowChargeMonitor] = useState(false);
  const [epiActive, setEpiActive] = useState(false);
  const [epiTime, setEpiTime] = useState(300); // 5 minutes countdown
  const [clockStarted, setClockStarted] = useState(false);

  // Refs for safer interval handling
  const audioContextRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const pulseIntervalRef = useRef(null);
  const ventilationIntervalRef = useRef(null);
  const epiIntervalRef = useRef(null);
  const clockIntervalRef = useRef(null);

  // Create audio context safely
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

  // Safely get current audio context
  const getAudioContext = useCallback(() => {
    return audioContextRef.current;
  }, []);

  // Start the main clock
  const startClock = useCallback(() => {
    // Clear any existing interval first
    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current);
    }
   
    // Create new interval
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
   
    // Save reference and mark as started
    clockIntervalRef.current = interval;
    setClockStarted(true);
  }, []);

  // Reset the main clock
  const resetClock = useCallback(() => {
    setSeconds(0);
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

  // Toggle ventilation
  const toggleVentilation = useCallback(() => {
    setIsVentilating(prev => !prev);
    setVentilationActive(prev => !prev);
  }, []);

  // Play metronome click with useCallback to avoid recreation on each render
  const playMetronomeClick = useCallback(() => {
    try {
      // Create audio context if needed
      const ctx = getAudioContext() || createAudioContext();
      if (!ctx) return;
     
      // Make sure context is running
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
     
      // Create and play metronome sound
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      oscillator.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.error("Error playing metronome sound:", e);
    }
  }, [getAudioContext, createAudioContext]);

  // Play ventilation sound with useCallback
  const playVentilateSound = useCallback(() => {
    try {
      // Try speech synthesis first
      if ('speechSynthesis' in window) {
        try {
          const utterance = new SpeechSynthesisUtterance("ventilate");
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          window.speechSynthesis.speak(utterance);
          return;
        } catch (e) {
          console.error("Speech synthesis failed:", e);
        }
      }
     
      // Fallback to audio tone
      const ctx = getAudioContext() || createAudioContext();
      if (!ctx) return;
     
      // Make sure context is running
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
     
      // Create and play ventilation sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = 400;
      gainNode.gain.value = 0.6;
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.error("Error playing ventilation sound:", e);
    }
  }, [getAudioContext, createAudioContext]);

  // Update metronome state based on activeSection
  useEffect(() => {
    if (activeSection === 'metronome' || activeSection === 'pulse+metronome') {
      setMetronomeRunning(true);
    } else {
      setMetronomeRunning(false);
    }
    
    // Check if all features are inactive and reset/stop clock if needed
    if (!activeSection && !ventilationActive && !epiActive && clockStarted) {
      // Clear the clock interval to stop it
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
      // Reset the clock to 0
      setSeconds(0);
      setClockStarted(false);
    }
  }, [activeSection, ventilationActive, epiActive, clockStarted]);

  // Metronome timer effect
  useEffect(() => {
    if (!metronomeRunning) return;
   
    // Clear any existing timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
   
    // Safety check
    if (bpm <= 0) return;
   
    // Calculate interval and start metronome
    const intervalTime = (60 / bpm) * 1000;
    timerIntervalRef.current = setInterval(playMetronomeClick, intervalTime);
   
    // Play first beat immediately
    playMetronomeClick();
   
    // Cleanup function
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [metronomeRunning, bpm, playMetronomeClick]);

  // Ventilation timer effect
  useEffect(() => {
    if (!ventilationActive) return;
   
    // Clear any existing ventilation timer
    if (ventilationIntervalRef.current) {
      clearInterval(ventilationIntervalRef.current);
      ventilationIntervalRef.current = null;
    }
   
    // Safety check
    if (ventilationRate <= 0) return;
    
    // Calculate interval and start ventilation prompts
    const intervalTime = (60 / ventilationRate) * 1000;
    ventilationIntervalRef.current = setInterval(playVentilateSound, intervalTime);
   
    // Play first ventilation prompt immediately
    playVentilateSound();
   
    // Cleanup function
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
      return;
    }
   
    // Start countdown
    epiIntervalRef.current = setInterval(() => {
      setEpiTime(prevTime => {
        if (prevTime <= 0) {
          setEpiTime(300);
          return 300;
        }
        return prevTime - 1;
      });
    }, 1000);
   
    // Cleanup function
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

  // Handle Metronome button click
  const handleMetronomeClick = useCallback(() => {
    // Initialize audio on first click
    createAudioContext();
   
    // Make sure clock is started
    if (!clockStarted) {
      startClock();
    }
   
    // Handle state toggling with composite states
    if (activeSection === 'metronome' || activeSection === 'pulse+metronome') {
      // Turn off metronome - preserve pulse if active
      if (activeSection === 'pulse+metronome') {
        setActiveSection('pulse');
      } else {
        setActiveSection(null);
      }
    } else {
      // Turn on metronome - preserve pulse if active
      if (activeSection === 'pulse') {
        setActiveSection('pulse+metronome');
      } else {
        setActiveSection('metronome');
      }
    }
  }, [activeSection, createAudioContext, clockStarted, startClock]);

  // Handle Pulse check button click
  const handlePulseCheckClick = useCallback(() => {
    // Toggle pulse check state
    if (activeSection === 'pulse' || activeSection === 'pulse+metronome') {
      // Turning off pulse check - preserve other active states
      if (activeSection === 'pulse+metronome') {
        setActiveSection('metronome');
      } else {
        setActiveSection(null);
      }
     
      // Clear interval
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
    } else {
      // Turning on pulse check - preserve other active states
      if (activeSection === 'metronome') {
        setActiveSection('pulse+metronome');
      } else {
        setActiveSection('pulse');
      }
     
      // Reset countdown times
      setPulseCheckTime(120);
      setPauseTime(10);
      setShowChargeMonitor(false);
     
      // Start countdown
      pulseIntervalRef.current = setInterval(() => {
        setPulseCheckTime(prevTime => {
          // Show charge monitor warning at 15 seconds
          if (prevTime === 15) {
            setShowChargeMonitor(true);
          }
         
          // Handle timeout
          if (prevTime === 0) {
            // Start pause countdown
            setPauseTime(pauseTime => {
              if (pauseTime <= 1) {
                // Auto-restart when pause countdown finishes
                setPulseCheckTime(120);
                setShowChargeMonitor(false);
                return 10;
              }
              return pauseTime - 1;
            });
            return 0;
          }
         
          // Normal countdown
          return prevTime - 1;
        });
      }, 1000);
    }
  }, [activeSection]);

  // Handle Epinephrine button click
  const handleEpinephrineClick = useCallback(() => {
    // Toggle epinephrine state
    setEpiActive(prev => {
      if (prev) {
        // If turning off, reset time
        setEpiTime(300);
      }
      return !prev;
    });
  }, []);

  // Cleanup all intervals on unmount
  useEffect(() => {
    return () => {
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
     
      // Clear all intervals
      [timerIntervalRef, pulseIntervalRef, ventilationIntervalRef, epiIntervalRef, clockIntervalRef].forEach(ref => {
        if (ref && ref.current) {
          clearInterval(ref.current);
          ref.current = null;
        }
      });
    };
  }, []);

  // Render the UI
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>ArrestPro</h1>
      </header>

      <div className={styles.appContainer}>
        {/* Timer Display with click to reset */}
        <div
          className={styles.timerDisplay}
          onClick={resetClock}
          title="Click to reset timer"
        >
          <div className={styles.timerText}>
            {formatTime(seconds)}
          </div>
          <div className={styles.statusIndicators}>
            <div className={styles.statusContainer}>
              <span>Metronome: </span>
              <span className={`${styles.statusDot} ${metronomeRunning ? styles.dotActive : styles.dotInactive}`}></span>
              <span className={styles.statusLabel}>Ventilation: </span>
              <span className={`${styles.statusDot} ${ventilationActive ? styles.dotActive : styles.dotInactive}`}></span>
            </div>
          </div>
        </div>

        {/* Main Buttons */}
        <div className={styles.buttonGrid}>
          {/* Metronome Button */}
          <button
            onClick={handleMetronomeClick}
            className={`${styles.button} ${
              (activeSection === 'metronome' || activeSection === 'pulse+metronome') 
                ? styles.metronomeButtonActive 
                : styles.metronomeButton
            }`}
          >
            <div className={styles.buttonContent}>
              <Clock className={styles.buttonIcon} size={24} />
              <div className={styles.buttonTextContainer}>
                <div className={styles.buttonTitle}>Metronome</div>
                <div className={styles.buttonSubtext}>110 BPM - Start Compressions</div>
              </div>
            </div>
          </button>
         
          {/* Ventilation Button */}
          <button
            onClick={toggleVentilation}
            className={`${styles.button} ${
              ventilationActive ? styles.ventilationButtonActive : styles.ventilationButton
            }`}
          >
            <div className={styles.buttonContent}>
              <div className={`${styles.buttonIcon} relative w-8 h-8 flex items-center justify-center`}>
                {ventilationActive ? (
                  <div className="absolute">
                    <div
                      className={styles.ventilationCircle}
                      style={{
                        width: `${ventilationProgress}%`,
                        height: `${ventilationProgress}%`
                      }}
                    ></div>
                  </div>
                ) : (
                  <div className="text-2xl">🫁</div>
                )}
              </div>
              <div className={styles.buttonTextContainer}>
                <div className={styles.buttonTitle}>Ventilation</div>
                <div className={styles.buttonSubtext}>{ventilationRate} breaths/min</div>
              </div>
            </div>
          </button>
         
          {/* Pulse Check Button */}
          <button
            onClick={handlePulseCheckClick}
            className={`${styles.button} ${
              (activeSection === 'pulse' || activeSection === 'pulse+metronome')
                ? styles.pulseButtonActive 
                : styles.pulseButton
            }`}
          >
            <div className={styles.buttonContent}>
              <HeartPulse className={styles.buttonIcon} size={24} />
              <div className={styles.buttonTextContainer}>
                <div className={styles.buttonTitle}>Pulse Check</div>
                <div className={styles.buttonSubtext}>2-Minute Countdown</div>
                {(activeSection === 'pulse' || activeSection === 'pulse+metronome') && (
                  <div className={`${styles.countdownDisplay} ${
                    showChargeMonitor ? styles.chargeMonitor : ''
                  }`}>
                    {pulseCheckTime > 0 ? (
                      <>
                        <div>{Math.floor(pulseCheckTime / 60) + ":" + (pulseCheckTime % 60).toString().padStart(2, '0')}</div>
                        {showChargeMonitor && <div className={styles.chargeMonitor}>CHARGE MONITOR</div>}
                      </>
                    ) : (
                      <div className={styles.pauseIndicator}>
                        PAUSE {pauseTime}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </button>
         
          {/* Epinephrine Button */}
          <button
            onClick={handleEpinephrineClick}
            className={`${styles.button} ${
              epiActive ? styles.epiButtonActive : styles.epiButton
            }`}
          >
            <div className={styles.buttonContent}>
              <Syringe className={styles.buttonIcon} size={24} />
              <div className={styles.buttonTextContainer}>
                <div className={styles.buttonTitle}>Epinephrine</div>
                {epiActive && (
                  <div className={styles.countdownDisplay}>
                    {Math.floor(epiTime / 60)}:{(epiTime % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Metronome Rate Control */}
        {(activeSection === 'metronome' || activeSection === 'pulse+metronome') && (
          <div className={styles.sliderContainer}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>Compression Rate: {bpm} BPM</span>
            </div>
            <input
              type="range"
              min="80"
              max="120"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className={`${styles.slider} ${styles.metronomeSlider}`}
            />
            <div className={styles.sliderTicks}>
              <span>80</span>
              <span>100</span>
              <span>120</span>
            </div>
          </div>
        )}
       
        {/* Ventilation Rate Control */}
        {ventilationActive && (
          <div className={styles.sliderContainer}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>Ventilation Rate: {ventilationRate} breaths/min</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              value={ventilationRate}
              onChange={(e) => setVentilationRate(parseInt(e.target.value))}
              className={`${styles.slider} ${styles.ventilationSlider}`}
            />
            <div className={styles.sliderTicks}>
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CPRTempoApp;