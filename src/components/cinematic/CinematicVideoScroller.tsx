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

  const lastDispatchedSeekTimeRef = useRef<number>(-1);
  const isTransitioningRef = useRef<boolean>(false);

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

  // Synchronize Background Video with Real Page Scroll (Single requestAnimationFrame Scheduler)
  useEffect(() => {
    let rafId: number | null = null;
    let isScheduled = false;

    const sectionIds = [
      'chapter-0',
      'chapter-1',
      'chapter-2',
      'chapter-3',
      'chapter-4',
      'chapter-5',
      'chapter-6',
      'chapter-7'
    ];

    const syncScrollToVideo = () => {
      isScheduled = false;

      const viewportHeight = window.innerHeight || 800;
      const viewportMid = viewportHeight * 0.45;

      let detectedChapter = currentChapterRef.current;
      let detectedProgress = 0;
      let foundActive = false;

      // Check each section in document order
      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= viewportMid && rect.bottom > viewportMid) {
            detectedChapter = i;
            const scrollableDist = el.offsetHeight - viewportHeight;
            if (scrollableDist > 0) {
              detectedProgress = Math.max(0, Math.min(1, (-rect.top) / scrollableDist));
            } else {
              detectedProgress = Math.max(0, Math.min(1, (viewportMid - rect.top) / el.offsetHeight));
            }
            foundActive = true;
            break;
          }
        }
      }

      // If past the bottom of Chapter 7 (e.g. inside footer), lock to end of Chapter 7
      if (!foundActive) {
        const lastEl = document.getElementById('chapter-7');
        if (lastEl) {
          const lastRect = lastEl.getBoundingClientRect();
          if (lastRect.bottom <= viewportMid) {
            detectedChapter = 7;
            detectedProgress = 1.0;
            foundActive = true;
          }
        }
      }

      // If above Chapter 0, lock to start of Chapter 0
      if (!foundActive) {
        detectedChapter = 0;
        detectedProgress = 0.0;
      }

      const targetVideoTime = Math.max(0, Math.min(15.0, detectedProgress * 15.0));

      // Handle chapter transition if section changed
      if (detectedChapter !== currentChapterRef.current && !isTransitioningRef.current) {
        isTransitioningRef.current = true;
        currentChapterRef.current = detectedChapter;

        const nextChapter = CHAPTERS[detectedChapter] || CHAPTERS[0];
        const targetUrl = resolveMediaUrl(nextChapter.src);
        const nextSlot = activeSlotRef.current === 'A' ? 'B' : 'A';
        const nextVideo = nextSlot === 'A' ? videoRefA.current : videoRefB.current;
        const nextController = nextSlot === 'A' ? controllerRefA.current : controllerRefB.current;

        if (nextSlot === 'A') {
          setSlotSrcA(targetUrl);
        } else {
          setSlotSrcB(targetUrl);
        }

        if (nextVideo) {
          initVideo(nextVideo, targetVideoTime);
          nextController?.requestSeek(targetVideoTime);
        }

        setActiveSlot(nextSlot);
        navigationStore.navigateToChapter(detectedChapter, targetVideoTime);

        setTimeout(() => {
          isTransitioningRef.current = false;
        }, 150);
      } else {
        // Coalesce seeks: seek if difference is >= 0.04s (approx 1 frame at 24fps) or at boundaries
        const timeDiff = Math.abs(targetVideoTime - lastDispatchedSeekTimeRef.current);
        const isBoundary = targetVideoTime <= 0.05 || targetVideoTime >= 14.95;

        if (timeDiff >= 0.04 || isBoundary) {
          lastDispatchedSeekTimeRef.current = targetVideoTime;
          const activeController = activeSlotRef.current === 'A' ? controllerRefA.current : controllerRefB.current;
          activeController?.requestSeek(targetVideoTime);
        }
      }
    };

    const handleScroll = () => {
      if (!isScheduled) {
        isScheduled = true;
        rafId = window.requestAnimationFrame(syncScrollToVideo);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Initial sync
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      className="cinematic-video-background-layer"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: '#000000'
      }}
    >
      {/* Slot A Native Video */}
      <video
        ref={setRefA}
        src={slotSrcA}
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: activeSlot === 'A' ? 1 : 0,
          transition: 'opacity 0.35s ease-in-out',
          pointerEvents: 'none'
        }}
      />

      {/* Slot B Native Video */}
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
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: activeSlot === 'B' ? 1 : 0,
            transition: 'opacity 0.35s ease-in-out',
            pointerEvents: 'none'
          }}
        />
      ) : null}
    </div>
  );
};

export default CinematicVideoScroller;
