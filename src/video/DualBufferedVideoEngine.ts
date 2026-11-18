/**
 * DualBufferedVideoEngine
 * 
 * Orchestrates dual-buffered video elements (videoA and videoB) crossfading smoothly
 * via HTML5 Canvas 2D presentation, backed by SerializedSeekController for strictly
 * serialized hardware seeks, zero seek collisions, and stutter-free scrubbing.
 */

import { SerializedSeekController, CanvasPresentationAdapter } from './SerializedSeekController';
import { resolveMediaUrl } from '../utils/mediaUrl';

export type VideoPlaybackMode = 'loop' | 'scrub' | 'once';

export interface DualBufferOptions {
  fps?: number;
  onTimeUpdate?: (currentTime: number, duration: number, activeUrl: string) => void;
  onVideoEnded?: (finishedUrl: string) => void;
}

export class DualBufferedVideoEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  // Dual video slots
  private videoA: HTMLVideoElement;
  private videoB: HTMLVideoElement;
  private controllerA: SerializedSeekController | null = null;
  private controllerB: SerializedSeekController | null = null;

  // Active slot tracking: 'A' | 'B'
  private activeSlot: 'A' | 'B' = 'A';
  private currentUrlA: string = '';
  private currentUrlB: string = '';

  // Crossfade state
  private isCrossfading: boolean = false;
  private crossfadeProgress: number = 1; // 1 = fully on activeSlot
  private crossfadeDuration: number = 800; // ms
  private crossfadeStartTime: number = 0;

  // Playback configuration
  private mode: VideoPlaybackMode = 'loop';
  private isPlaying: boolean = false;
  private animationFrameId: number | null = null;
  private options: DualBufferOptions;

  constructor(options: DualBufferOptions = {}) {
    this.options = options;

    // Create dual native video elements
    this.videoA = this.createVideoElement();
    this.videoB = this.createVideoElement();
  }

  private createVideoElement(): HTMLVideoElement {
    if (typeof document === 'undefined') {
      return {} as HTMLVideoElement;
    }
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;
    video.preload = 'auto';
    video.style.position = 'fixed';
    video.style.top = '-9999px';
    video.style.left = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);
    return video;
  }

  public mount(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });

    const canvasAdapterA: CanvasPresentationAdapter = {
      width: canvas.width,
      height: canvas.height,
      drawImage: (source, dx, dy, dw, dh) => {
        if (this.ctx && this.activeSlot === 'A') {
          this.ctx.drawImage(source, dx, dy, dw, dh);
        }
      }
    };

    const canvasAdapterB: CanvasPresentationAdapter = {
      width: canvas.width,
      height: canvas.height,
      drawImage: (source, dx, dy, dw, dh) => {
        if (this.ctx && this.activeSlot === 'B') {
          this.ctx.drawImage(source, dx, dy, dw, dh);
        }
      }
    };

    this.controllerA = new SerializedSeekController(this.videoA, canvasAdapterA, { fps: this.options.fps ?? 24 });
    this.controllerB = new SerializedSeekController(this.videoB, canvasAdapterB, { fps: this.options.fps ?? 24 });

    this.startRenderLoop();
  }

  /**
   * Transition to a new video asset.
   * If already playing this URL, does not reload.
   * If slot A is active, preloads slot B and initiates smooth crossfade.
   */
  public transitionTo(url: string, mode: VideoPlaybackMode = 'loop', crossfadeMs: number = 800): void {
    const activeUrl = this.activeSlot === 'A' ? this.currentUrlA : this.currentUrlB;
    if (activeUrl === url) {
      this.mode = mode;
      return;
    }

    const nextSlot = this.activeSlot === 'A' ? 'B' : 'A';
    const nextVideo = nextSlot === 'A' ? this.videoA : this.videoB;

    if (nextSlot === 'A') {
      this.currentUrlA = url;
    } else {
      this.currentUrlB = url;
    }

    this.mode = mode;
    nextVideo.loop = mode === 'loop';
    nextVideo.src = resolveMediaUrl(url);
    nextVideo.currentTime = 0;
    nextVideo.load();

    const onCanPlay = () => {
      nextVideo.removeEventListener('canplay', onCanPlay);
      nextVideo.play().catch(() => {});

      // Begin crossfade
      this.activeSlot = nextSlot;
      this.isCrossfading = true;
      this.crossfadeDuration = crossfadeMs;
      this.crossfadeStartTime = performance.now();
      this.crossfadeProgress = 0;
    };

    nextVideo.addEventListener('canplay', onCanPlay, { once: true });
  }

  /**
   * Scrub video to an exact timestamp using SerializedSeekController single-flight gate.
   */
  public scrubTo(timestamp: number): void {
    const controller = this.activeSlot === 'A' ? this.controllerA : this.controllerB;
    if (controller) {
      controller.requestSeek(timestamp);
    }
  }

  public play(): void {
    const activeVideo = this.activeSlot === 'A' ? this.videoA : this.videoB;
    activeVideo.play().catch(() => {});
    this.isPlaying = true;
  }

  public pause(): void {
    this.videoA.pause();
    this.videoB.pause();
    this.isPlaying = false;
  }

  public getActiveVideo(): HTMLVideoElement {
    return this.activeSlot === 'A' ? this.videoA : this.videoB;
  }

  public getCurrentTime(): number {
    return this.getActiveVideo().currentTime || 0;
  }

  public getDuration(): number {
    return this.getActiveVideo().duration || 15;
  }

  public getActiveUrl(): string {
    return this.activeSlot === 'A' ? this.currentUrlA : this.currentUrlB;
  }

  public getPlaybackMode(): VideoPlaybackMode {
    return this.mode;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private startRenderLoop = (): void => {
    const render = () => {
      this.paintFrame();
      this.animationFrameId = requestAnimationFrame(render);
    };
    this.animationFrameId = requestAnimationFrame(render);
  };

  private paintFrame(): void {
    if (!this.canvas || !this.ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const now = performance.now();

    // Update crossfade progress
    if (this.isCrossfading) {
      const elapsed = now - this.crossfadeStartTime;
      this.crossfadeProgress = Math.min(1, elapsed / this.crossfadeDuration);
      if (this.crossfadeProgress >= 1) {
        this.isCrossfading = false;
        // Pause inactive slot
        const inactiveVideo = this.activeSlot === 'A' ? this.videoB : this.videoA;
        inactiveVideo.pause();
      }
    }

    const activeVideo = this.activeSlot === 'A' ? this.videoA : this.videoB;
    const inactiveVideo = this.activeSlot === 'A' ? this.videoB : this.videoA;

    // Draw inactive background if crossfading
    if (this.isCrossfading && inactiveVideo && inactiveVideo.readyState >= 2) {
      this.ctx.globalAlpha = 1;
      this.ctx.drawImage(inactiveVideo, 0, 0, w, h);

      // Draw active video on top with fading alpha
      if (activeVideo && activeVideo.readyState >= 2) {
        this.ctx.globalAlpha = this.crossfadeProgress;
        this.ctx.drawImage(activeVideo, 0, 0, w, h);
      }
    } else {
      // Normal single video render
      if (activeVideo && activeVideo.readyState >= 2) {
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(activeVideo, 0, 0, w, h);
      }
    }

    // Reset alpha
    this.ctx.globalAlpha = 1;

    // Time update callback
    if (this.options.onTimeUpdate && activeVideo) {
      this.options.onTimeUpdate(activeVideo.currentTime, activeVideo.duration, this.getActiveUrl());
    }
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.controllerA) this.controllerA.destroy();
    if (this.controllerB) this.controllerB.destroy();

    try {
      if (this.videoA && this.videoA.parentNode) this.videoA.parentNode.removeChild(this.videoA);
      if (this.videoB && this.videoB.parentNode) this.videoB.parentNode.removeChild(this.videoB);
    } catch {
      // Ignore cleanup error
    }
  }
}
