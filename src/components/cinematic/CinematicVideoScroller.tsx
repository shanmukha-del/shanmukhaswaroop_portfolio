import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SerializedSeekController } from '../../video/SerializedSeekController';
import { useNavigation } from '../../store/useNavigation';
import { navigationStore } from '../../store/navigationStore';
import { resolveMediaUrl } from '../../utils/mediaUrl';

export interface ChapterDef {
  index: number;
  id: string;
  title: string;
  src: string;
  realmNumber: number;
  duration: number; // exactly 15.0s for all 8 videos
}

export const CHAPTERS: ChapterDef[] = [
  { index: 0, id: 'opening', title: 'Opening Cinematic', src: 'videos/01_Opening_Cinematic.mp4', realmNumber: -1, duration: 15.0 },
  { index: 1, id: 'universe', title: 'Main Voxel Universe', src: 'videos/02_Main_Voxel_Universe.mp4', realmNumber: 0, duration: 15.0 },
  { index: 2, id: 'origin-village', title: 'The Origin Village', src: 'videos/03_Origin_Village.mp4', realmNumber: 1, duration: 15.0 },
  { index: 3, id: 'creators-workshop', title: "The Creator's Workshop", src: 'videos/04_Creators_Workshop.mp4', realmNumber: 2, duration: 15.0 },
  { index: 4, id: 'project-kingdom', title: 'The Project Kingdom', src: 'videos/05_Project_Kingdom.mp4', realmNumber: 3, duration: 15.0 },
  { index: 5, id: 'trial-grounds', title: 'The Trial Grounds', src: 'videos/06_Trial_Grounds.mp4', realmNumber: 4, duration: 15.0 },
  { index: 6, id: 'achievement-realm', title: 'The Achievement Realm', src: 'videos/07_Achievement_Realm.mp4', realmNumber: 5, duration: 15.0 },
  { index: 7, id: 'world-builder', title: 'The World Builder', src: 'videos/08_World_Builder.mp4', realmNumber: 6, duration: 15.0 }
];

export const CinematicVideoScroller: React.FC = () => {
  const { currentChapterIndex, chapterTime } = useNavigation();

  // Dual video slot elements & controllers
  const videoRefA = useRef<HTMLVideoElement | null>(null);
  const videoRefB = useRef<HTMLVideoElement | null>(null);
  const controllerRefA = useRef<SerializedSeekController | null>(null);
  const controllerRefB = useRef<SerializedSeekController | null>(null);

  // Active slot tracking: 'A' or 'B'
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const [slotSrcA, setSlotSrcA] = useState<string>(resolveMediaUrl(CHAPTERS[0].src));
  const [slotSrcB, setSlotSrcB] = useState<string>('');

  const activeSlotRef = useRef<'A' | 'B'>('A');
  activeSlotRef.current = activeSlot;

  const currentChapterRef = useRef<number>(currentChapterIndex || 0);
  currentChapterRef.current = currentChapterIndex || 0;

  const currentTimeRef = useRef<number>(chapterTime || 0);
  currentTimeRef.current = chapterTime || 0;

  const isTransitioningChapterRef = useRef<boolean>(false);
  const lastTouchYRef = useRef<number | null>(null);

  // Helper to initialize video element strictly paused
  const initVideo = (video: HTMLVideoElement | null, initialTime: number = 0) => {
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.pause();

    const applySeek = () => {
      try {
        video.currentTime = initialTime;
      } catch {
        // Ignored
      }
    };

    video.addEventListener('loadedmetadata', applySeek, { once: true });
    try {
      video.load();
      applySeek();
    } catch {
      // Ignored
    }
  };

  // Mount Slot A controller
  const setRefA = useCallback((video: HTMLVideoElement | null) => {
    videoRefA.current = video;
    if (video) {
      const initialTime = navigationStore.getState().chapterTime || 0;
      initVideo(video, initialTime);
      if (!controllerRefA.current) {
        controllerRefA.current = new SerializedSeekController(video, null, {
          fps: 24,
          onFramePresented: (mediaTime) => {
            if (activeSlotRef.current === 'A') {
              currentTimeRef.current = mediaTime;
              navigationStore.setChapterTime(mediaTime);
            }
          }
        });
        if (initialTime > 0) {
          controllerRefA.current.requestSeek(initialTime);
        }
      }
    }
  }, []);

  // Mount Slot B controller
  const setRefB = useCallback((video: HTMLVideoElement | null) => {
    videoRefB.current = video;
    if (video) {
      const initialTime = navigationStore.getState().chapterTime || 0;
      initVideo(video, initialTime);
      if (!controllerRefB.current) {
        controllerRefB.current = new SerializedSeekController(video, null, {
          fps: 24,
          onFramePresented: (mediaTime) => {
            if (activeSlotRef.current === 'B') {
              currentTimeRef.current = mediaTime;
              navigationStore.setChapterTime(mediaTime);
            }
          }
        });
        if (initialTime > 0) {
          controllerRefB.current.requestSeek(initialTime);
        }
      }
    }
  }, []);

  // Synchronize when currentChapterIndex or chapterTime changes via store
  useEffect(() => {
    const chapter = CHAPTERS[currentChapterIndex] || CHAPTERS[0];
    const targetUrl = resolveMediaUrl(chapter.src);
    const activeVideo = activeSlotRef.current === 'A' ? videoRefA.current : videoRefB.current;
    const currentSrc = activeVideo?.getAttribute('src') || '';

    if (!currentSrc.includes(chapter.src)) {
      // Switch to other slot to crossfade seamlessly
      const nextSlot = activeSlotRef.current === 'A' ? 'B' : 'A';
      const nextVideo = nextSlot === 'A' ? videoRefA.current : videoRefB.current;
      const nextController = nextSlot === 'A' ? controllerRefA.current : controllerRefB.current;

      if (nextSlot === 'A') {
        setSlotSrcA(targetUrl);
      } else {
        setSlotSrcB(targetUrl);
      }

      if (nextVideo) {
        initVideo(nextVideo, chapterTime || 0);
        nextController?.requestSeek(chapterTime || 0);
      }

      setActiveSlot(nextSlot);
    } else {
      const activeController = activeSlotRef.current === 'A' ? controllerRefA.current : controllerRefB.current;
      activeController?.requestSeek(chapterTime || 0);
    }
  }, [currentChapterIndex, chapterTime]);

  // Unified Scroll & Touch Input Handler
  useEffect(() => {
    const SECONDS_PER_PIXEL = 0.005; // 3000px scroll = 15s video

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const activeVideo = activeSlotRef.current === 'A' ? videoRefA.current : videoRefB.current;
      const activeController = activeSlotRef.current === 'A' ? controllerRefA.current : controllerRefB.current;
      if (!activeVideo || !activeController) return;

      activeVideo.pause(); // Strictly paused at all times

      const delta = e.deltaY;
      const prevTime = currentTimeRef.current;
      const targetTime = prevTime + delta * SECONDS_PER_PIXEL;
      const currentChapter = currentChapterRef.current;

      // Handle forward boundary
      if (targetTime >= 14.95) {
        if (currentChapter < CHAPTERS.length - 1) {
          if (!isTransitioningChapterRef.current) {
            isTransitioningChapterRef.current = true;
            navigationStore.navigateToChapter(currentChapter + 1, 0.0);
            setTimeout(() => {
              isTransitioningChapterRef.current = false;
            }, 300);
          }
          return;
        } else {
          // Clamp at end of final video
          currentTimeRef.current = 15.0;
          activeController.requestSeek(15.0);
          return;
        }
      }

      // Handle backward boundary
      if (targetTime <= 0.05) {
        if (currentChapter > 0) {
          if (!isTransitioningChapterRef.current) {
            isTransitioningChapterRef.current = true;
            navigationStore.navigateToChapter(currentChapter - 1, 14.95);
            setTimeout(() => {
              isTransitioningChapterRef.current = false;
            }, 300);
          }
          return;
        } else {
          // Clamp at start of opening video
          currentTimeRef.current = 0.0;
          activeController.requestSeek(0.0);
          return;
        }
      }

      // Normal within-chapter scrub
      currentTimeRef.current = targetTime;
      activeController.requestSeek(targetTime);
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
        const activeVideo = activeSlotRef.current === 'A' ? videoRefA.current : videoRefB.current;
        const activeController = activeSlotRef.current === 'A' ? controllerRefA.current : controllerRefB.current;
        if (!activeVideo || !activeController) return;

        activeVideo.pause();

        const currentY = e.touches[0].clientY;
        const delta = (lastTouchYRef.current - currentY) * 1.5;
        lastTouchYRef.current = currentY;

        const prevTime = currentTimeRef.current;
        const targetTime = prevTime + delta * SECONDS_PER_PIXEL;
        const currentChapter = currentChapterRef.current;

        if (targetTime >= 14.95 && currentChapter < CHAPTERS.length - 1) {
          if (!isTransitioningChapterRef.current) {
            isTransitioningChapterRef.current = true;
            navigationStore.navigateToChapter(currentChapter + 1, 0.0);
            setTimeout(() => {
              isTransitioningChapterRef.current = false;
            }, 300);
          }
          return;
        }

        if (targetTime <= 0.05 && currentChapter > 0) {
          if (!isTransitioningChapterRef.current) {
            isTransitioningChapterRef.current = true;
            navigationStore.navigateToChapter(currentChapter - 1, 14.95);
            setTimeout(() => {
              isTransitioningChapterRef.current = false;
            }, 300);
          }
          return;
        }

        const clamped = Math.min(Math.max(targetTime, 0), 15.0);
        currentTimeRef.current = clamped;
        activeController.requestSeek(clamped);
      }
    };

    const handleTouchEnd = () => {
      lastTouchYRef.current = null;
    };

    // Keyboard accessibility navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeVideo = activeSlotRef.current === 'A' ? videoRefA.current : videoRefB.current;
      const activeController = activeSlotRef.current === 'A' ? controllerRefA.current : controllerRefB.current;
      if (!activeVideo || !activeController) return;

      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        activeVideo.pause();
        const nextTime = currentTimeRef.current + 0.6;
        if (nextTime >= 14.95 && currentChapterRef.current < CHAPTERS.length - 1) {
          navigationStore.navigateToChapter(currentChapterRef.current + 1, 0.0);
        } else {
          const clamped = Math.min(nextTime, 15.0);
          currentTimeRef.current = clamped;
          activeController.requestSeek(clamped);
        }
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        activeVideo.pause();
        const prevTime = currentTimeRef.current - 0.6;
        if (prevTime <= 0.05 && currentChapterRef.current > 0) {
          navigationStore.navigateToChapter(currentChapterRef.current - 1, 14.95);
        } else {
          const clamped = Math.max(prevTime, 0.0);
          currentTimeRef.current = clamped;
          activeController.requestSeek(clamped);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        navigationStore.toggleMinimap();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    // Global verification hook
    (window as any).__CINEMATIC_ENGINE__ = {
      getCurrentChapter: () => currentChapterRef.current,
      getCurrentTime: () => currentTimeRef.current,
      getActiveSlot: () => activeSlotRef.current,
      seekTo: (time: number) => {
        const clamped = Math.min(Math.max(time, 0), 15.0);
        currentTimeRef.current = clamped;
        const ctrl = activeSlotRef.current === 'A' ? controllerRefA.current : controllerRefB.current;
        ctrl?.requestSeek(clamped);
      },
      jumpToChapter: (chapterIndex: number, time: number = 0) => {
        navigationStore.navigateToChapter(chapterIndex, time);
      }
    };

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#000000',
        overflow: 'hidden',
        cursor: 'ns-resize'
      }}
    >
      {/* Video Buffer A */}
      <video
        ref={setRefA}
        src={slotSrcA}
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          display: 'block',
          pointerEvents: 'none',
          opacity: activeSlot === 'A' ? 1 : 0,
          transition: 'opacity 0.35s ease-out'
        }}
      />

      {/* Video Buffer B (rendered only when valid source is available) */}
      {slotSrcB ? (
        <video
          ref={setRefB}
          src={slotSrcB}
          muted
          playsInline
          preload="auto"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            display: 'block',
            pointerEvents: 'none',
            opacity: activeSlot === 'B' ? 1 : 0,
            transition: 'opacity 0.35s ease-out'
          }}
        />
      ) : null}
    </div>
  );
};

export default CinematicVideoScroller;
