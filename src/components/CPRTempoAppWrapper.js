import React, { useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';

// This is a wrapper component for your existing CPRTempoApp
// It ensures the app refreshes properly when reset happens
const CPRTempoAppWrapper = ({ children }) => {
  const { refreshTrigger, activeSection, seconds, ventilationActive, epiActive } = useAppState();
  
  // Monitor key state values and log them
  useEffect(() => {
    console.log("CPRTempoApp state:", {
      refreshTrigger,
      activeSection,
      seconds,
      ventilationActive,
      epiActive
    });
  }, [refreshTrigger, activeSection, seconds, ventilationActive, epiActive]);
  
  // Force component remount when refresh trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("Handling refresh trigger:", refreshTrigger);
      
      // Force redraw of all components
      const forceRedraw = () => {
        document.body.style.display = 'none';
        // Trigger layout recalculation
        void document.body.offsetHeight;
        document.body.style.display = '';
      };
      
      setTimeout(forceRedraw, 0);
    }
  }, [refreshTrigger]);
  
  return (
    // Set key to refreshTrigger to force remount when it changes
    <div key={refreshTrigger}>
      {children}
    </div>
  );
};

export default CPRTempoAppWrapper;