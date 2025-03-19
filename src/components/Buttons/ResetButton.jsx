import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

const ResetButton = () => {
  const { resetAllFeatures, refreshTrigger, COLORS } = useAppState();
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Debug effect to monitor when resetAllFeatures changes
  useEffect(() => {
    console.log("ResetButton: resetAllFeatures type =", typeof resetAllFeatures);
  }, [resetAllFeatures]);
  
  // Monitor refresh trigger
  useEffect(() => {
    console.log("ResetButton: Refresh trigger updated =", refreshTrigger);
  }, [refreshTrigger]);
  
  const handleResetClick = () => {
    if (!showConfirm) {
      console.log("Step 1: First click - showing confirmation");
      setShowConfirm(true);
      // Auto-hide confirmation after 3 seconds if not clicked
      setTimeout(() => {
        console.log("Confirmation timeout - hiding confirmation");
        setShowConfirm(false);
      }, 3000);
    } else {
      console.log("Step 2: Confirm click - calling resetAllFeatures");
      
      // Make sure resetAllFeatures is a function before calling it
      if (typeof resetAllFeatures === 'function') {
        try {
          resetAllFeatures();
          console.log("resetAllFeatures called successfully");
          
          // Force a UI refresh with a DOM update
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            console.log("Window resize event dispatched to force UI update");
          }, 100);
        } catch (error) {
          console.error("Error calling resetAllFeatures:", error);
        }
      } else {
        console.error("resetAllFeatures is not a function:", resetAllFeatures);
      }
      
      setShowConfirm(false);
    }
  };

  // Add a hard reset option for testing
  const forceHardReset = () => {
    try {
      // Force page reload - last resort approach
      window.location.reload();
    } catch (e) {
      console.error("Error during hard reset:", e);
    }
  };

  return (
    <div>
      <button
        onClick={handleResetClick}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          backgroundColor: showConfirm ? COLORS.logoRed : COLORS.timerBg,
          color: COLORS.white,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          zIndex: 1000
        }}
      >
        <RotateCcw size={24} />
        {showConfirm && (
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '0',
              backgroundColor: COLORS.logoRed,
              color: COLORS.white,
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap'
            }}
          >
            Tap again to reset all
          </div>
        )}
      </button>
      
      {/* Hidden emergency reset button - only show in development */}

    </div>
  );
};

export default ResetButton;