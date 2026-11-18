import React, { useEffect, useRef } from 'react';
import { DualBufferedVideoEngine } from '../../video/DualBufferedVideoEngine';
import { useNavigation } from '../../store/useNavigation';
import { navigationStore } from '../../store/navigationStore';

export let globalVideoEngine: DualBufferedVideoEngine | null = null;

export const VideoPresentationCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<DualBufferedVideoEngine | null>(null);
  const { activeVideoUrl, viewportWidth, viewportHeight, isOpeningCinematicActive } = useNavigation();

  useEffect(() => {
    if (isOpeningCinematicActive || !canvasRef.current) return;

    const engine = new DualBufferedVideoEngine({
      fps: 24,
      onTimeUpdate: (currentTime) => {
        if (navigationStore.getState().isOpeningCinematicActive) {
          navigationStore.setOpeningCinematicTime(currentTime);
        }
      }
    });

    engine.mount(canvasRef.current);
    engineRef.current = engine;
    globalVideoEngine = engine;

    // Load initial video asset
    const initialUrl = navigationStore.getState().activeVideoUrl;
    engine.transitionTo(initialUrl, 'loop', 500);

    return () => {
      engine.destroy();
      engineRef.current = null;
      globalVideoEngine = null;
    };
  }, []);

  // Update canvas sizing on viewport change
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = viewportWidth;
      canvasRef.current.height = viewportHeight;
    }
  }, [viewportWidth, viewportHeight]);

  // Synchronize active video transitions
  useEffect(() => {
    if (engineRef.current && activeVideoUrl && !isOpeningCinematicActive) {
      engineRef.current.transitionTo(activeVideoUrl, 'loop', 750);
    }
  }, [activeVideoUrl, isOpeningCinematicActive]);

  if (isOpeningCinematicActive) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0, // Behind WebGL scene and HUD
        pointerEvents: 'none',
        overflow: 'hidden',
        background: '#020205'
      }}
    >
      <canvas
        ref={canvasRef}
        width={viewportWidth}
        height={viewportHeight}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: 0.92,
          filter: 'contrast(1.08) saturate(1.12)'
        }}
      />
      {/* Cinematic vignette gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at center, transparent 35%, rgba(2, 2, 8, 0.45) 75%, rgba(1, 1, 4, 0.85) 100%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default VideoPresentationCanvas;
