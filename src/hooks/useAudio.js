import { useRef, useCallback, useEffect } from 'react';

// The AudioPool helps manage multiple audio instances for concurrent playback
class AudioPool {
  constructor(src, poolSize = 3) {
    this.src = src;
    this.poolSize = poolSize;
    this.audioElements = [];
    this.currentIndex = 0;
    
    // Create the audio pool
    for (let i = 0; i < poolSize; i++) {
      const audio = new Audio(src);
      audio.preload = 'auto';
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
      audio.currentTime = 0;
    });
  }
}

const useAudio = () => {
  // Reference to hold our audio pools
  const audioPoolsRef = useRef({});
  
  // Initialize an audio pool for a specific sound
  const initAudio = useCallback((id, src, poolSize = 3) => {
    if (!audioPoolsRef.current[id]) {
      audioPoolsRef.current[id] = new AudioPool(src, poolSize);
    }
  }, []);
  
  // Play a sound by its ID
  const playSound = useCallback((id) => {
    const pool = audioPoolsRef.current[id];
    if (pool) {
      return pool.play();
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
      Object.values(audioPoolsRef.current).forEach(pool => {
        pool.stop();
      });
    };
  }, []);
  
  // iOS requires user interaction to play sounds
  // This function can be called in response to any user interaction
  // to initialize audio playback capability
  const unlockAudio = useCallback(() => {
    // Create and play a silent audio element
    const audio = new Audio();
    audio.play().catch(() => {
      // Silent catch - this is expected on first call before user interaction
    });
  }, []);
  
  return {
    initAudio,
    playSound,
    stopSound,
    unlockAudio
  };
};

export default useAudio;