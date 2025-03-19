import React from 'react';
import { useAppState } from '../../context/AppStateContext';

const TimerDisplay = ({ seconds }) => {
  const { formatTime, COLORS } = useAppState();
  
  return (
    <div style={{ 
      fontSize: '44px', 
      fontWeight: 'bold',
      lineHeight: '1.2',
      textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
      color: COLORS.white
    }}>
      {formatTime(seconds)}
    </div>
  );
};

export default TimerDisplay;