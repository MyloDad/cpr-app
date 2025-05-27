import React from 'react';
import { useAppState } from '../../context/AppStateContext';

const AppHeader = () => {
  const { COLORS } = useAppState();

  return (
    <>
      {/* Logo Image */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '4px',        // Reduced from 10px
        paddingTop: '4px'           // Added some breathing room at the top
      }}>
        <img 
          src="/central-pierce-logo.png" 
          alt="Central Pierce Fire & Rescue" 
          style={{ 
            maxWidth: '70%',         // Shrunk from 80%
            height: 'auto',
            maxHeight: '80px',       // Shrunk from 120px
            marginBottom: '2px'      // Reduced spacing
          }} 
        />
      </div>
      
      {/* App Title */}
      <div>
        <h1 style={{ 
          margin: '0 0 4px 0',       // Reduced bottom margin
          color: COLORS.logoRed, 
          fontSize: '24px',          // Shrunk from 32px
          textAlign: 'center',
          fontWeight: '600'          // Slightly less bold for compactness
        }}>
          ArrestPro
        </h1>
      </div>
    </>
  );
};

export default AppHeader;
