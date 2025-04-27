//src/hooks/useAudio.js

import { useRef, useCallback, useEffect } from 'react';

// Detection for iOS device
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// The AudioPool helps manage multiple audio instances for concurrent playback
class AudioPool {
  constructor(src, poolSize = 3, volume = 1.0) {
    this.src = src;
    this.poolSize = poolSize;
    
    // Set different volume levels based on platform
    // Keep metronome louder on iOS since iOS is reducing volume
    this.volume = isIOS() ? 
      (src.includes('click.mp3') ? 0.2 : 1.0) :  // On iOS: metronome at 80%, others at 100%
      (src.includes('click.mp3') ? 1.0 : 1.0);   // On desktop: metronome at 20%, others at 100%
    
    this.audioElements = [];
    this.currentIndex = 0;
    
    console.log(`Creating audio pool for ${src} with volume ${this.volume}`);
    
    // Create the audio pool
    for (let i = 0; i < poolSize; i++) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      
      // Force load the audio data
      if (isIOS()) {
        audio.load();
      }
      
      // Set the volume - ensuring it applies
      audio.volume = this.volume;
      
      this.audioElements.push(audio);
    }
  }
  
  play() {
    // Get the next audio element in the pool
    const audio = this.audioElements[this.currentIndex];
    
    // Reset the audio if it's already playing or has played
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
    
    // Ensure volume is correct (in case it was changed)
    audio.volume = this.volume;
    
    // On iOS, we need a stronger reset before playing
    if (isIOS()) {
      try {
        // This can help with iOS audio issues
        audio.currentTime = 0;
        
        // Double-check volume
        audio.volume = this.volume;
      } catch (e) {
        console.warn('iOS audio reset error:', e);
      }
    }
    
    // Play the audio and handle any errors for iOS
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Auto-play prevented (iOS often requires user interaction first)
        console.warn('Audio play prevented:', error);
      });
    }
    
    // Move to the next audio element for the next call
    this.currentIndex = (this.currentIndex + 1) % this.poolSize;
    
    return audio;
  }
  
  stop() {
    this.audioElements.forEach(audio => {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch (e) {
        // iOS sometimes throws errors on setting currentTime
        console.warn('Error resetting audio time:', e);
      }
    });
  }
}

const useAudio = () => {
  // Reference to hold our audio pools
  const audioPoolsRef = useRef({});
  const audioUnlockedRef = useRef(false);
  
  // Initialize an audio pool for a specific sound
  const initAudio = useCallback((id, src, poolSize = 3) => {
    if (!audioPoolsRef.current[id]) {
      audioPoolsRef.current[id] = new AudioPool(src, poolSize);
      
      // For iOS, try to load all the audio immediately
      if (isIOS() && !audioUnlockedRef.current) {
        const audio = audioPoolsRef.current[id].audioElements[0];
        audio.load();
      }
    }
  }, []);
  
  // Play a sound by its ID - with enhanced iOS handling
  const playSound = useCallback((id) => {
    const pool = audioPoolsRef.current[id];
    if (pool) {
      try {
        // Special handling for iOS devices
        if (isIOS()) {
          // This helps ensure audio plays reliably on iOS
          const audio = pool.play();
          
          // Return the audio element
          return audio;
        } else {
          // Normal handling for other platforms
          return pool.play();
        }
      } catch (e) {
        console.error(`Error playing sound "${id}":`, e);
        return null;
      }
    } else {
      console.error(`Audio pool with ID "${id}" not found`);
      return null;
    }
  }, []);
  
  // Stop all instances of a sound
  const stopSound = useCallback((id) => {
    const pool = audioPoolsRef.current[id];
    if (pool) {
      pool.stop();
    }
  }, []);
  
  // Clean up all audio elements on unmount
  useEffect(() => {
    return () => {
      // Store reference to current audio pools to avoid the React Hook warning
      const currentAudioPools = { ...audioPoolsRef.current };
      Object.values(currentAudioPools).forEach(pool => {
        pool.stop();
      });
    };
  }, []);
  
  // Improved iOS audio unlocking
  const unlockAudio = useCallback(() => {
    // More aggressive audio unlocking for iOS
    if (isIOS() && !audioUnlockedRef.current) {
      console.log("Attempting to unlock iOS audio...");
      
      // Array of different methods to try unlocking audio
      const unlockMethods = [
        // Method 1: Silent audio
        () => {
          const silentAudio = new Audio();
          silentAudio.play().then(() => {
            console.log("Unlocked audio with silent audio");
            audioUnlockedRef.current = true;
          }).catch(e => console.warn("Silent audio unlock failed:", e));
        },
        
        // Method 2: Play each audio source once at zero volume
        () => {
          Object.values(audioPoolsRef.current).forEach(pool => {
            const audio = pool.audioElements[0];
            const originalVolume = audio.volume;
            audio.volume = 0;
            audio.play().then(() => {
              audio.pause();
              audio.currentTime = 0;
              audio.volume = originalVolume;
              console.log("Unlocked audio by playing sample");
              audioUnlockedRef.current = true;
            }).catch(e => console.warn("Sample audio unlock failed:", e));
          });
        },
        
        // Method 3: WebAudio context unlock
        () => {
          try {
            // Create a web audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
              const audioCtx = new AudioContext();
              
              // Create and play a silent sound
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              gainNode.gain.value = 0;
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.start(0);
              oscillator.stop(0.001);
              
              console.log("Attempted WebAudio context unlock");
              audioUnlockedRef.current = true;
            }
          } catch (e) {
            console.warn("WebAudio unlock failed:", e);
          }
        }
      ];
      
      // Try each method
      unlockMethods.forEach(method => method());
    }
    
    // Mark as unlocked for non-iOS devices
    if (!isIOS()) {
      audioUnlockedRef.current = true;
    }
  }, []);
  
  return {
    initAudio,
    playSound,
    stopSound,
    unlockAudio
  };
};

export default useAudio;