import React, { useEffect, useRef } from 'react';
import { SerializedSeekController } from '../../video/SerializedSeekController';
import { useNavigation } from '../../store/useNavigation';
import { navigationStore } from '../../store/navigationStore';
import { resolveMediaUrl } from '../../utils/mediaUrl';

export const ScrollControlledOpeningVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controllerRef = useRef<SerializedSeekController | null>(null);
  const currentTimeRef = useRef<number>(0);
  const lastTouchYRef = useRef<number | null>(null);
  const { isOpeningCinematicActive, openingCinematicTime } = useNavigation();

  const videoUrl = resolveMediaUrl('videos/01_Opening_Cinematic.mp4');

  // Callback ref to configure native video element synchronously as soon as it mounts
  const setVideoRef = (video: HTMLVideoElement | null) => {
    videoRef.current = video;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.pause();

      const initialTime = Math.min(Math.max(openingCinematicTime || 0, 0), 15.0);
      currentTimeRef.current = initialTime;

      // Force synchronous load and seek to initial frame so browser decodes it immediately
      try {
        video.load();
        video.currentTime = initialTime;
      } catch {
        // Handled once metadata loads
      }
    }
  };

  useEffect(() => {
    if (!isOpeningCinematicActive || !videoRef.current) return;

    const video = videoRef.current;
    video.muted = true;
    video.defaultMuted = true;
    video.pause();
    try {
      if (video.readyState < 1) {
        video.load();
      }
    } catch {
      // Ignored
    }

    const initialTime = Math.min(Math.max(openingCinematicTime || 0, 0), 15.0);
    currentTimeRef.current = initialTime;

    const controller = new SerializedSeekController(video, null, {
      fps: 24,
      onFramePresented: (mediaTime) => {
        currentTimeRef.current = mediaTime;
        navigationStore.setOpeningCinematicTime(mediaTime);
      }
    });

    controllerRef.current = controller;

    // Dispatch seek immediately to ensure exact frame rendering
    controller.requestSeek(initialTime);

    // Expose for testing & verification
    (window as any).__OPENING_VIDEO__ = {
      video,
      controller,
      getCurrentTime: () => currentTimeRef.current,
      seekTo: (t: number) => {
        const clamped = Math.min(Math.max(t, 0), 15.0);
        currentTimeRef.current = clamped;
        video.pause();
        controller.requestSeek(clamped);
      }
    };

    // Scroll-driven frame control: Map scroll delta to 15-second timeline
    // 3000px total scroll travel = 0.005 seconds per pixel
    const SECONDS_PER_PIXEL = 0.005;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      video.pause(); // Strictly paused at all times

      const delta = e.deltaY;
      const prevTime = currentTimeRef.current;
      const targetTime = Math.min(Math.max(prevTime + delta * SECONDS_PER_PIXEL, 0), 15.0);

      currentTimeRef.current = targetTime;
      controller.requestSeek(targetTime);

      // If user reaches the end of the opening cinematic and continues scrolling down
      if (prevTime >= 14.9 && delta > 0) {
        navigationStore.enterUniverse();
      }
    };

    // Mobile touch interaction
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        lastTouchYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && lastTouchYRef.current !== null) {
        e.preventDefault();
        video.pause();

        const currentY = e.touches[0].clientY;
        const delta = lastTouchYRef.current - currentY;
        lastTouchYRef.current = currentY;

        const prevTime = currentTimeRef.current;
        const targetTime = Math.min(Math.max(prevTime + delta * SECONDS_PER_PIXEL * 1.5, 0), 15.0);

        currentTimeRef.current = targetTime;
        controller.requestSeek(targetTime);

        if (prevTime >= 14.9 && delta > 0) {
          navigationStore.enterUniverse();
        }
      }
    };

    const handleTouchEnd = () => {
      lastTouchYRef.current = null;
    };

    // Keyboard controls for accessibility and testing (ArrowDown/Up, PageDown/Up)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        video.pause();
        const next = Math.min(currentTimeRef.current + 0.5, 15.0);
        currentTimeRef.current = next;
        controller.requestSeek(next);
        if (next >= 14.95) {
          navigationStore.enterUniverse();
        }
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        video.pause();
        const prev = Math.max(currentTimeRef.current - 0.5, 0);
        currentTimeRef.current = prev;
        controller.requestSeek(prev);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      controller.destroy();
      controllerRef.current = null;
    };
  }, [isOpeningCinematicActive, openingCinematicTime]);

  if (!isOpeningCinematicActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        background: '#000000',
        overflow: 'hidden',
        cursor: 'ns-resize'
      }}
    >
      <video
        ref={setVideoRef}
        src={videoUrl}
        muted
        playsInline
        preload="auto"
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          display: 'block',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default ScrollControlledOpeningVideo;
