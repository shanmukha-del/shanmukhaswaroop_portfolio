/**
 * Navigation & Application State Store
 * Lightweight, zero-dependency reactive store for world navigation, HUD controls,
 * minimap telemetry, video synchronization, and responsive device layout.
 */

import { WORLDS_DATA } from '../data/portfolioData';
import { WorldData } from '../types/portfolio';

export type QualityMode = 'high' | 'balanced' | 'power-saving';
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface NavigationState {
  currentChapterIndex: number; // 0..7 (0 = Opening Cinematic, 1 = Main Universe, 2..7 = Realms 1..6)
  chapterTime: number; // 0..15s
  activeRealmIndex: number; // 0 = Universe Overview, 1..6 = Realms
  targetRealmIndex: number;
  isTransitioning: boolean;
  transitionProgress: number; // 0 to 1
  transitionDirection: 'forward' | 'backward';
  isMinimapOpen: boolean;
  qualityMode: QualityMode;
  fps: number;
  deviceType: DeviceType;
  viewportWidth: number;
  viewportHeight: number;
  isMobileMenuOpen: boolean;
  activeProjectModalId: string | null;

  // Cinematic opening & video engine integration
  isOpeningCinematicActive: boolean;
  openingCinematicTime: number; // 0 to 15s
  isDetailPanelOpen: boolean;
  activeVideoUrl: string;
}

type Listener = (state: NavigationState) => void;

class NavigationStore {
  private state: NavigationState = {
    currentChapterIndex: 0,
    chapterTime: 0,
    activeRealmIndex: 0,
    targetRealmIndex: 0,
    isTransitioning: false,
    transitionProgress: 0,
    transitionDirection: 'forward',
    isMinimapOpen: false,
    qualityMode: 'high',
    fps: 60,
    deviceType: 'desktop',
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
    isMobileMenuOpen: false,
    activeProjectModalId: null,

    isOpeningCinematicActive: true, // Default: begins with approved opening
    openingCinematicTime: 0,
    isDetailPanelOpen: false,
    activeVideoUrl: '/videos/01_Opening_Cinematic.mp4'
  };

  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.updateViewport(window.innerWidth, window.innerHeight);
      window.addEventListener('resize', this.handleResize);

      try {
        const params = new URLSearchParams(window.location.search);
        const chapterParam = params.get('chapter');
        const realmParam = params.get('realm');
        const minimapParam = params.get('minimap');
        const openingParam = params.get('opening');
        const skipIntroParam = params.get('skipIntro');
        const tParam = params.get('t');

        if (tParam !== null) {
          const parsedT = parseFloat(tParam);
          if (!isNaN(parsedT)) {
            this.state.chapterTime = parsedT;
            this.state.openingCinematicTime = parsedT;
          }
        }

        if (chapterParam !== null) {
          const ch = parseInt(chapterParam, 10);
          if (!isNaN(ch) && ch >= 0 && ch <= 7) {
            this.state.currentChapterIndex = ch;
            this.state.isOpeningCinematicActive = ch === 0;
            const r = ch === 0 ? 0 : ch === 1 ? 0 : ch - 1;
            this.state.activeRealmIndex = r;
            this.state.targetRealmIndex = r;
            this.state.activeVideoUrl = this.getVideoUrlForChapter(ch);
          }
        } else if (skipIntroParam === '1' || skipIntroParam === 'true' || realmParam !== null) {
          this.state.currentChapterIndex = 1;
          this.state.isOpeningCinematicActive = false;
          this.state.activeVideoUrl = '/videos/02_Main_Voxel_Universe.mp4';
        } else if (openingParam === '1' || openingParam === 'true') {
          this.state.currentChapterIndex = 0;
          this.state.isOpeningCinematicActive = true;
          this.state.activeVideoUrl = '/videos/01_Opening_Cinematic.mp4';
        }

        if (realmParam !== null && chapterParam === null) {
          const r = parseInt(realmParam, 10);
          if (!isNaN(r) && r >= 0 && r <= 6) {
            this.state.activeRealmIndex = r;
            this.state.targetRealmIndex = r;
            this.state.currentChapterIndex = r === 0 ? 1 : r + 1;
            this.state.activeVideoUrl = this.getVideoUrlForRealm(r);
            this.state.isOpeningCinematicActive = false;
          }
        }
        if (minimapParam === '1' || minimapParam === 'true') {
          this.state.isMinimapOpen = true;
        }
      } catch {
        // Ignore URL parsing errors
      }

      (window as any).__NAV_STORE__ = this;
    }
  }

  private getVideoUrlForRealm(realmNumber: number): string {
    switch (realmNumber) {
      case 0:
        return '/videos/02_Main_Voxel_Universe.mp4';
      case 1:
        return '/videos/03_Origin_Village.mp4';
      case 2:
        return '/videos/04_Creators_Workshop.mp4';
      case 3:
        return '/videos/05_Project_Kingdom.mp4';
      case 4:
        return '/videos/06_Trial_Grounds.mp4';
      case 5:
        return '/videos/07_Achievement_Realm.mp4';
      case 6:
        return '/videos/08_World_Builder.mp4';
      default:
        return '/videos/02_Main_Voxel_Universe.mp4';
    }
  }

  private handleResize = () => {
    this.updateViewport(window.innerWidth, window.innerHeight);
  };

  private updateViewport(width: number, height: number) {
    let device: DeviceType = 'desktop';
    if (width < 768) {
      device = 'mobile';
    } else if (width <= 1024) {
      device = 'tablet';
    }

    this.setState({
      viewportWidth: width,
      viewportHeight: height,
      deviceType: device
    });
  }

  public getState(): NavigationState {
    return this.state;
  }

  public setState(partial: Partial<NavigationState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.state));
  }

  // Cinematic chapter and world actions
  public navigateToChapter(chapterIndex: number, initialTime: number = 0): void {
    const clampedIndex = Math.min(Math.max(chapterIndex, 0), 7);
    const isOpening = clampedIndex === 0;
    const realmIdx = clampedIndex === 0 ? 0 : clampedIndex === 1 ? 0 : clampedIndex - 1;
    const targetVideo = this.getVideoUrlForChapter(clampedIndex);

    this.setState({
      currentChapterIndex: clampedIndex,
      chapterTime: initialTime,
      activeRealmIndex: realmIdx,
      targetRealmIndex: realmIdx,
      isOpeningCinematicActive: isOpening,
      openingCinematicTime: isOpening ? initialTime : 0,
      activeVideoUrl: targetVideo,
      isMobileMenuOpen: false
    });
  }

  public setChapterTime(time: number): void {
    this.setState({
      chapterTime: time,
      openingCinematicTime: this.state.currentChapterIndex === 0 ? time : this.state.openingCinematicTime
    });
  }

  public enterUniverse(): void {
    this.navigateToChapter(1, 0);
  }

  public replayOpening(): void {
    this.navigateToChapter(0, 0);
  }

  public setOpeningCinematicTime(time: number): void {
    this.setChapterTime(time);
  }

  public getVideoUrlForChapter(chapterIndex: number): string {
    switch (chapterIndex) {
      case 0:
        return '/videos/01_Opening_Cinematic.mp4';
      case 1:
        return '/videos/02_Main_Voxel_Universe.mp4';
      case 2:
        return '/videos/03_Origin_Village.mp4';
      case 3:
        return '/videos/04_Creators_Workshop.mp4';
      case 4:
        return '/videos/05_Project_Kingdom.mp4';
      case 5:
        return '/videos/06_Trial_Grounds.mp4';
      case 6:
        return '/videos/07_Achievement_Realm.mp4';
      case 7:
        return '/videos/08_World_Builder.mp4';
      default:
        return '/videos/01_Opening_Cinematic.mp4';
    }
  }

  public toggleDetailPanel(): void {
    this.setState({ isDetailPanelOpen: !this.state.isDetailPanelOpen });
  }

  public setDetailPanelOpen(open: boolean): void {
    this.setState({ isDetailPanelOpen: open });
  }

  // Action methods
  public navigateToRealm(realmNumber: number): void {
    if (realmNumber < 0 || realmNumber > 6) return;
    const targetChapter = realmNumber === 0 ? 1 : realmNumber + 1;
    this.navigateToChapter(targetChapter, 0);
  }

  public nextRealm(): void {
    const next = (this.state.activeRealmIndex + 1) % 7;
    this.navigateToRealm(next);
  }

  public previousRealm(): void {
    const prev = (this.state.activeRealmIndex - 1 + 7) % 7;
    this.navigateToRealm(prev);
  }

  public toggleMinimap(): void {
    this.setState({ isMinimapOpen: !this.state.isMinimapOpen });
  }

  public setMinimapOpen(open: boolean): void {
    this.setState({ isMinimapOpen: open });
  }

  public setQualityMode(mode: QualityMode): void {
    this.setState({ qualityMode: mode });
  }

  public updateFPS(fps: number): void {
    this.setState({ fps: Math.round(fps) });
  }

  public toggleMobileMenu(): void {
    this.setState({ isMobileMenuOpen: !this.state.isMobileMenuOpen });
  }

  public setMobileMenuOpen(open: boolean): void {
    this.setState({ isMobileMenuOpen: open });
  }

  public openProjectModal(id: string): void {
    this.setState({ activeProjectModalId: id });
  }

  public closeProjectModal(): void {
    this.setState({ activeProjectModalId: null });
  }

  public getActiveWorld(): WorldData | null {
    if (this.state.activeRealmIndex === 0) return null; // 0 = Universe overview
    return WORLDS_DATA[this.state.activeRealmIndex - 1] || null;
  }
}

export const navigationStore = new NavigationStore();
