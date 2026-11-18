import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

// Filter deprecated THREE.Clock console warning in Three.js 0.187+
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('THREE.Clock')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
