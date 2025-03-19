import React from 'react';
import { useAppState } from '../../context/AppStateContext';

const AppHeader = () => {
  const { COLORS } = useAppState();
  
  return (
    <>
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
    </>
  );
};

export default AppHeader;