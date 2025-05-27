import { useRef, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { NativeAudio } from '@capacitor-community/native-audio';

const CLICK_VOLUME = 0.5;
const VOICE_VOLUME = 1.0;

const useNativeAudio = () => {
  const initialized = useRef(false);
  const audioMap = useRef({});
  
  const isNative = Capacitor.isNativePlatform();
  const isIOS = Capacitor.getPlatform() === 'ios';

  // 🎯 ADD: Web AudioContext for better timing (only for metronome)
  const audioContext = useRef(null);
  const clickBuffer = useRef(null);

  const initAudio = useCallback(async (id, src, poolSize = 1) => {
    if (audioMap.current[id]) return;
  
    try {
      if (isNative) {
        const assetId = id;
        const volume = src.includes('click.mp3') ? CLICK_VOLUME : VOICE_VOLUME;
  
        await NativeAudio.preload({
          assetId,
          assetPath: src,
          volume,
          isUrl: false,
        });
  
        audioMap.current[id] = { id: assetId, native: true, volume };
      } else {
        if (!audioContext.current) {
          audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        }
  
        // 🎯 Use AudioContext for these IDs
        const useContextIds = ['chargeMonitor', '1', '2', '3', '4', '5'];
        if (useContextIds.includes(id)) {
          const response = await fetch(src);
          const arrayBuffer = await response.arrayBuffer();
          const decodedBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
  
          audioMap.current[id] = {
            buffer: decodedBuffer,
            volume: VOICE_VOLUME,
            useContext: true,
          };
        } else if (id === 'metronome') {
          // metronome already handled via AudioContext
          const response = await fetch(src);
          const arrayBuffer = await response.arrayBuffer();
          const decodedBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
  
          clickBuffer.current = decodedBuffer;
  
          audioMap.current[id] = {
            buffer: decodedBuffer,
            native: false,
          };
        } else {
          // default fallback to <audio> tag pooling
          const audioPool = Array(poolSize).fill(null).map(() => {
            const audio = new Audio(src);
            audio.preload = 'auto';
            audio.volume = VOICE_VOLUME;
            return audio;
          });
  
          audioMap.current[id] = {
            pool: audioPool,
            currentIndex: 0,
            native: false,
            volume: VOICE_VOLUME,
          };
        }
      }
    } catch (error) {
      console.error(`Failed to initialize audio: ${id}`, error);
    }
  }, [isNative]);
  

  const playSound = useCallback(async (id) => {
    const audio = audioMap.current[id];
    if (!audio) {
      console.warn(`Audio not found: ${id}`);
      return null;
    }
  
    try {
      if (audio.native) {
        await NativeAudio.play({ assetId: audio.id, time: 0 });
        return { id: audio.id };
      } else if (audio.useContext && audio.buffer && audioContext.current) {
        const source = audioContext.current.createBufferSource();
        source.buffer = audio.buffer;
  
        const gainNode = audioContext.current.createGain();
        gainNode.gain.value = audio.volume || 1.0;
  
        source.connect(gainNode).connect(audioContext.current.destination);
        source.start(0);
  
        console.log(`✅ Played from buffer: ${id}`);
        return source;
      } else {

        if (audio.useContext && audio.buffer && audioContext.current) {
          const source = audioContext.current.createBufferSource();
          source.buffer = audio.buffer;
        
          const gainNode = audioContext.current.createGain();
          gainNode.gain.value = audio.volume || 1.0;
        
          source.connect(gainNode).connect(audioContext.current.destination);
          source.start(0);
        
          console.log(`✅ Played from buffer: ${id}`);
          return source;
        }
        


        const pool = audio.pool;
        const currentIndex = audio.currentIndex;
        const element = pool[currentIndex];
  
        if (!element.paused) {
          element.pause();
          element.currentTime = 0;
        }
  
        element.play().catch(e => console.warn('Audio play prevented:', e));
        audio.currentIndex = (currentIndex + 1) % pool.length;
  
        return element;
      }
    } catch (error) {
      console.error(`Failed to play sound: ${id}`, error);
      return null;
    }
  }, []);
  

  const stopSound = useCallback(async (id) => {
    const audio = audioMap.current[id];
    if (!audio) return;

    try {
      if (audio.native) {
        await NativeAudio.stop({ assetId: audio.id });
      } else {
        if (id === 'metronome') {
          // Nothing to stop for AudioContext click
          return;
        }
        audio.pool.forEach(element => {
          element.pause();
          element.currentTime = 0;
        });
      }
    } catch (error) {
      console.error(`Failed to stop sound: ${id}`, error);
    }
  }, []);

  const setVolume = useCallback(async (id, volume) => {
    const audio = audioMap.current[id];
    if (!audio) return;

    try {
      if (audio.native) {
        await NativeAudio.setVolume({ assetId: audio.id, volume });
        audio.volume = volume;
      } else {
        if (id !== 'metronome') {
          audio.pool.forEach(element => { element.volume = volume; });
          audio.volume = volume;
        }
      }
    } catch (error) {
      console.error(`Failed to set volume for ${id}`, error);
    }
  }, []);

  const unlockAudio = useCallback(() => {
    if (isNative) {
      console.log('Audio unlocking not needed on native platforms');
      return;
    }
  
    console.log('Unlocking web audio...');
  
    try {
      if (audioContext.current && audioContext.current.state === 'suspended') {
        audioContext.current.resume().then(() => {
          console.log('AudioContext resumed successfully');
        }).catch((e) => {
          console.warn('AudioContext resume failed', e);
        });
      }
    } catch (e) {
      console.warn('AudioContext resume error', e);
    }
  
    // ❌ NO MORE forced silent plays of sounds individually
  }, [isNative]);
  
  
  

  const releaseResources = useCallback(async () => {
    try {
      if (isNative) {
        for (const id in audioMap.current) {
          if (audioMap.current[id].native) {
            await NativeAudio.unload({ assetId: audioMap.current[id].id });
          }
        }
      } else {
        for (const id in audioMap.current) {
          if (!audioMap.current[id].native && audioMap.current[id].pool) {
            audioMap.current[id].pool.forEach(element => {
              element.pause();
              element.src = '';
            });
          }
        }
      }
      
      audioMap.current = {};
      initialized.current = false;

      if (audioContext.current) {
        audioContext.current.close();
        audioContext.current = null;
      }
    } catch (error) {
      console.error('Failed to release audio resources', error);
    }
  }, [isNative]);

  useEffect(() => {
    if (initialized.current) return;

    const initializeAudio = async () => {
      initialized.current = true;
    };

    initializeAudio();
    return () => { releaseResources(); };
  }, [releaseResources]);

  return {
    initAudio,
    playSound,
    stopSound,
    setVolume,
    unlockAudio,
    releaseResources,
    isNative,
  };
};

export default useNativeAudio;
