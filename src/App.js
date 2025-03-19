import React from 'react';
import { AppStateProvider } from './context/AppStateContext';
import CPRTempoApp from './components/CPRTempoApp';
import CPRTempoAppWrapper from './components/CPRTempoAppWrapper';
import ResetButton from './components/Buttons/ResetButton';

function App() {
  return (
    <AppStateProvider>
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <CPRTempoAppWrapper>
          <CPRTempoApp />
        </CPRTempoAppWrapper>
        <ResetButton />
      </div>
    </AppStateProvider>
  );
}

export default App;