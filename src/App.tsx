import React, { Suspense, lazy } from 'react';
import './styles/theme.css';
import { CinematicVideoScroller } from './components/cinematic/CinematicVideoScroller';
import { AppShell } from './components/shell/AppShell';
import { RealmView } from './components/content/RealmView';
import { Minimap } from './components/navigation/Minimap';

// Code-split Three.js WebGL canvas environment
const PersistentCanvas = lazy(() => import('./components/canvas/PersistentCanvas'));

export const App: React.FC = () => {
  const isCanvasOnly =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('canvasOnly') === '1';

  if (isCanvasOnly) {
    return (
      <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: '#030308' }} />}>
        <PersistentCanvas />
      </Suspense>
    );
  }

  return (
    <>
      {/* Master 8-Video Scroll-Controlled Cinematic Engine (Layer 0) */}
      <CinematicVideoScroller />

      {/* Persistent Single WebGL 3D Canvas (Layer 1, subtle depth on subsequent worlds, null on opening) */}
      <Suspense fallback={null}>
        <PersistentCanvas />
      </Suspense>

      {/* Minimal Subordinate HUD & Floating Interactive Realm Bar (Layer 2, null on opening) */}
      <AppShell>
        <RealmView />
      </AppShell>

      {/* On-Demand Minimap Overlay (Layer 3, modal on request, null when closed) */}
      <Minimap />
    </>
  );
};

export default App;
