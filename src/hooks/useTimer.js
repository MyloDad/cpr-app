import { useState, useCallback, useRef } from 'react';
import useInterval from './useInterval';

const useTimer = (initialSeconds = 0) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const intervalRef = useRef(null);

  // Start the timer
  const startTimer = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      setStartTime(prev => prev || new Date());
    }
  }, [isRunning]);

  // Stop the timer
  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Reset the timer
  const resetTimer = useCallback((autoStart = false) => {
    setSeconds(initialSeconds);
    setStartTime(autoStart ? new Date() : null);
    setIsRunning(autoStart);
  }, [initialSeconds]);

  // Use the custom interval hook for the timer
  useInterval(() => {
    if (isRunning) {
      setSeconds(prev => prev + 1);
    }
  }, isRunning ? 1000 : null);

  return {
    seconds,
    isRunning,
    startTime,
    startTimer,
    stopTimer,
    resetTimer,
    setSeconds
  };
};

export default useTimer;