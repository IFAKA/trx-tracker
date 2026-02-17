import { useState, useEffect } from 'react';
import { TodayScreen } from './components/TodayScreen';
import { PairingScreen } from './components/PairingScreen';
import { BlockerScreen } from './components/BlockerScreen';
import { MicroBreakScreen } from './components/MicroBreakScreen';
import './App.css';

type Route = 'main' | 'pairing' | 'blocker' | 'micro-break';

function App() {
  const [route, setRoute] = useState<Route>('main');

  useEffect(() => {
    // Check URL path for routing (Tauri creates different windows with different paths)
    const path = window.location.pathname;
    if (path.includes('/pairing')) {
      setRoute('pairing');
    } else if (path.includes('/blocker')) {
      setRoute('blocker');
    } else if (path.includes('/micro-break')) {
      setRoute('micro-break');
    } else {
      setRoute('main');
    }
  }, []);

  // Render based on route
  switch (route) {
    case 'pairing':
      return <PairingScreen onClose={() => setRoute('main')} />;
    case 'blocker':
      return <BlockerScreen />;
    case 'micro-break':
      return <MicroBreakScreen />;
    case 'main':
    default:
      return <TodayScreen />;
  }
}

export default App;
