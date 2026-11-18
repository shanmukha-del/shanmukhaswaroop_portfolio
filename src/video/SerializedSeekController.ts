/**
 * SerializedSeekController
 * 
 * Production video scrubbing engine ensuring strictly serialized hardware seeks,
 * separation of native seek settlement from compositor frame presentation,
 * robust lifecycle management during freeze/resume under pending frame readiness,
 * generation-based stale seek rejection, safe handling of same-time seeks,
 * and rock-solid canvas snapshot freezing.
 */

export interface VideoPresentationAdapter {
  currentTime: number;
  seeking: boolean;
  readyState: number;
  paused?: boolean;
  pause(): void;
  requestVideoFrameCallback?(callback: (now: number, metadata: { mediaTime: number; presentationTime?: number }) => void): number;
  cancelVideoFrameCallback?(handle: number): void;
  addEventListener(event: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(event: string, listener: EventListenerOrEventListenerObject): void;
}

export interface CanvasPresentationAdapter {
  width: number;
  height: number;
  drawImage(source: any, dx: number, dy: number, dw: number, dh: number): void;
}

export interface SeekControllerOptions {
  fps?: number;
  frameToleranceSeconds?: number;
  onFramePresented?: (mediaTime: number, seekId: number, metadata?: any) => void;
  onStateChange?: (state: SeekControllerState) => void;
}

export interface SeekControllerState {
  isHardwareSeeking: boolean;
  isFrozen: boolean;
  activeSeekGeneration: number;
  activeDispatchedSeekId: number | null;
  activeDispatchedTarget: number | null;
  nativeSeekSettled: boolean;
  matchingFramePresented: boolean;
  pendingTarget: number | null;
  lastPresentedMediaTime: number | null;
  canvasSnapshotValid: boolean;
  totalSeeksDispatched: number;
  staleSeeksDiscarded: number;
  framesDrawnToCanvas: number;
  unresolvedHardwareSeeksCount: number;
  maxObservedConcurrentSeeks: number;
}

export class SerializedSeekController {
  private video: VideoPresentationAdapter;
  private canvas: CanvasPresentationAdapter | null;
  private fps: number;
  private frameTolerance: number;

  // Discrete state tracking
  private isHardwareSeeking = false;
  private isFrozen = false;
  private activeSeekGeneration = 0;
  private activeDispatchedSeekId: number | null = null;
  private activeDispatchedTarget: number | null = null;
  private nativeSeekSettled = false;
  private matchingFramePresented = false;
  private pendingTarget: number | null = null;
  private lastPresentedMediaTime: number | null = null;
  private canvasSnapshotValid = false;

  // Instrumentation metrics
  private totalSeeksDispatched = 0;
  private staleSeeksDiscarded = 0;
  private framesDrawnToCanvas = 0;
  private unresolvedHardwareSeeksCount = 0;
  private maxObservedConcurrentSeeks = 0;

  private activeRVFCHandle: number | null = null;
  private seekedListener: () => void;
  private pendingReadinessListener: (() => void) | null = null;
  private readonly readinessEvents = ['loadeddata', 'canplay', 'canplaythrough', 'playing'];

  private onFramePresented?: (mediaTime: number, seekId: number, metadata?: any) => void;
  private onStateChange?: (state: SeekControllerState) => void;

  constructor(
    video: VideoPresentationAdapter,
    canvas: CanvasPresentationAdapter | null = null,
    options: SeekControllerOptions = {}
  ) {
    this.video = video;
    this.canvas = canvas;
    this.fps = options.fps ?? 24;
    this.frameTolerance = options.frameToleranceSeconds ?? (1 / this.fps) * 1.5;
    this.onFramePresented = options.onFramePresented;
    this.onStateChange = options.onStateChange;

    this.seekedListener = () => this.handleSeekedEvent();
    this.video.addEventListener('seeked', this.seekedListener);
  }

  public destroy(): void {
    this.video.removeEventListener('seeked', this.seekedListener);
    this.cleanupRVFC();
    this.cleanupReadinessWait();
  }

  public getState(): SeekControllerState {
    return {
      isHardwareSeeking: this.isHardwareSeeking,
      isFrozen: this.isFrozen,
      activeSeekGeneration: this.activeSeekGeneration,
      activeDispatchedSeekId: this.activeDispatchedSeekId,
      activeDispatchedTarget: this.activeDispatchedTarget,
      nativeSeekSettled: this.nativeSeekSettled,
      matchingFramePresented: this.matchingFramePresented,
      pendingTarget: this.pendingTarget,
      lastPresentedMediaTime: this.lastPresentedMediaTime,
      canvasSnapshotValid: this.canvasSnapshotValid,
      totalSeeksDispatched: this.totalSeeksDispatched,
      staleSeeksDiscarded: this.staleSeeksDiscarded,
      framesDrawnToCanvas: this.framesDrawnToCanvas,
      unresolvedHardwareSeeksCount: this.unresolvedHardwareSeeksCount,
      maxObservedConcurrentSeeks: this.maxObservedConcurrentSeeks
    };
  }

  /**
   * Request a seek to a specified media time.
   * Enforces single-flight serialization: if an unresolved native seek
   * is in flight, stores only the newest requested timestamp in pendingTarget.
   * Safely handles same-time seeks and pending frame readiness states.
   */
  public requestSeek(targetTime: number): void {
    if (this.isFrozen) {
      this.isFrozen = false;
    }

    // Detect if previous operation already completed native hardware seek
    // while presentation was pending or frozen
    if (this.isHardwareSeeking && this.nativeSeekSettled && !this.video.seeking) {
      this.staleSeeksDiscarded++;
      this.finalizeStaleSettledOperation();
    }

    if (this.isHardwareSeeking) {
      // Coalesce incoming scroll target; keep ONLY newest pending target
      this.pendingTarget = targetTime;
      this.notifyState();
      return;
    }

    // Edge case: target matches current playback position on a paused video
    if (this.isSameTimeSeek(targetTime) && this.video.readyState >= 2) {
      this.presentSameTimeFrame(targetTime);
      return;
    }

    this.dispatchHardwareSeek(targetTime);
  }

  /**
   * Evaluates whether a requested target time corresponds to the current video playback position
   * within subframe tolerance on a paused media element.
   */
  private isSameTimeSeek(targetTime: number): boolean {
    const isPaused = this.video.paused !== false; // true if paused or property omitted
    const isAtTarget = Math.abs(this.video.currentTime - targetTime) < (0.5 / this.fps);
    return isPaused && isAtTarget;
  }

  /**
   * Directly presents the currently buffered frame for a same-time request without
   * issuing an unneeded native hardware seek that may not fire 'seeked'.
   */
  private presentSameTimeFrame(_targetTime: number): void {
    this.activeSeekGeneration++;
    const currentGeneration = this.activeSeekGeneration;

    if (this.canvas) {
      this.canvas.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      this.canvasSnapshotValid = true;
      this.framesDrawnToCanvas++;
    }

    this.lastPresentedMediaTime = this.video.currentTime;
    this.matchingFramePresented = true;

    if (this.onFramePresented) {
      this.onFramePresented(this.video.currentTime, currentGeneration);
    }

    this.notifyState();
  }

  /**
   * Dispatches a single native hardware seek to video.currentTime.
   * INVARIANT: Never called while previous native seek is unresolved.
   */
  private dispatchHardwareSeek(targetTime: number): void {
    if (this.unresolvedHardwareSeeksCount > 0) {
      throw new Error(`CRITICAL INVARIANT VIOLATION: Dispatched seek while previous native seek unresolved! Current count: ${this.unresolvedHardwareSeeksCount}`);
    }

    this.cleanupRVFC();
    this.cleanupReadinessWait();

    this.isHardwareSeeking = true;
    this.nativeSeekSettled = false;
    this.matchingFramePresented = false;
    this.activeSeekGeneration++;
    const currentSeekId = this.activeSeekGeneration;
    this.activeDispatchedSeekId = currentSeekId;
    this.activeDispatchedTarget = targetTime;

    this.totalSeeksDispatched++;
    this.unresolvedHardwareSeeksCount++;
    this.maxObservedConcurrentSeeks = Math.max(
      this.maxObservedConcurrentSeeks,
      this.unresolvedHardwareSeeksCount
    );

    // For browsers supporting rVFC, register presentation callback
    if (typeof this.video.requestVideoFrameCallback === 'function') {
      this.activeRVFCHandle = this.video.requestVideoFrameCallback(
        (_now: number, metadata: { mediaTime: number; presentationTime?: number }) => {
          this.activeRVFCHandle = null;
          this.handleRVFCPresentation(metadata.mediaTime, currentSeekId, metadata);
        }
      );
    }

    // Dispatch hardware seek
    this.video.currentTime = targetTime;
    this.notifyState();
  }

  /**
   * Handles compositor frame presentation via requestVideoFrameCallback.
   * Enforces strict operation identity: older or invalid callbacks are discarded
   * without re-registering and without handle collisions.
   */
  private handleRVFCPresentation(
    mediaTime: number,
    dispatchedSeekId: number | null,
    metadata?: any
  ): void {
    // Check if this callback matches the current active dispatched seek operation
    const isOperationActive =
      dispatchedSeekId !== null &&
      dispatchedSeekId === this.activeDispatchedSeekId &&
      dispatchedSeekId === this.activeSeekGeneration &&
      this.isHardwareSeeking &&
      !this.isFrozen;

    if (!isOperationActive) {
      // Callback is from an old generation, controller is frozen, or operation already settled.
      // Discard cleanly without re-registering or touching handles.
      this.staleSeeksDiscarded++;
      this.notifyState();
      return;
    }

    const target = this.activeDispatchedTarget;
    const isWithinTolerance =
      target !== null && Math.abs(mediaTime - target) <= this.frameTolerance;

    if (!isWithinTolerance) {
      // Operation is active and valid, but compositor presented an interim frame not yet at target mediaTime.
      this.staleSeeksDiscarded++;

      // ONLY re-register if the EXACT same operation is still actively seeking and not frozen:
      if (
        typeof this.video.requestVideoFrameCallback === 'function' &&
        !this.isFrozen &&
        this.isHardwareSeeking &&
        this.activeDispatchedSeekId === dispatchedSeekId &&
        this.activeSeekGeneration === dispatchedSeekId
      ) {
        this.activeRVFCHandle = this.video.requestVideoFrameCallback(
          (_now: number, meta: { mediaTime: number; presentationTime?: number }) => {
            this.activeRVFCHandle = null;
            this.handleRVFCPresentation(meta.mediaTime, dispatchedSeekId, meta);
          }
        );
      }
      this.notifyState();
      return;
    }

    // Both generation, active seek ID, and mediaTime tolerance are valid!
    if (this.canvas) {
      this.canvas.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      this.canvasSnapshotValid = true;
      this.framesDrawnToCanvas++;
    }

    this.lastPresentedMediaTime = mediaTime;
    this.matchingFramePresented = true;

    if (this.onFramePresented && dispatchedSeekId !== null) {
      this.onFramePresented(mediaTime, dispatchedSeekId, metadata);
    }

    // If native seeked event has ALSO settled and frame data is ready, complete operation
    if (this.nativeSeekSettled && this.video.readyState >= 2) {
      this.cleanupReadinessWait();
      this.tryCompleteOperation();
    } else {
      this.notifyState();
    }
  }

  /**
   * Handles native HTMLMediaElement 'seeked' event.
   * Separates native seek settlement from frame readiness.
   * Native settlement resets unresolvedHardwareSeeksCount, guaranteeing
   * an already-settled seek is never treated as unresolved hardware work.
   */
  private handleSeekedEvent(): void {
    if (this.video.seeking) {
      // Browser reports hardware seek is still unresolved
      return;
    }

    // Native hardware seek has settled
    this.nativeSeekSettled = true;
    this.unresolvedHardwareSeeksCount = 0;

    const currentDispatchedId = this.activeDispatchedSeekId;
    const isStale =
      currentDispatchedId === null ||
      currentDispatchedId !== this.activeSeekGeneration ||
      this.isFrozen;

    if (isStale) {
      // Operation was superseded or frozen while in-flight.
      // Settle hardware seek and discard presentation.
      this.staleSeeksDiscarded++;
      this.cleanupRVFC();
      this.cleanupReadinessWait();
      this.tryCompleteOperation();
      return;
    }

    // Check frame readiness
    if (this.video.readyState < 2) {
      // Native seek settled, but frame data is not yet available (readyState < HAVE_CURRENT_DATA).
      // DO NOT DISCARD the seeked event! Wait for frame readiness.
      this.attachReadinessWait(currentDispatchedId);
      this.notifyState();
      return;
    }

    // If readyState >= 2, process presentation settlement
    this.processPresentationSettlement(currentDispatchedId);
  }

  /**
   * Processes presentation validation and completion once native seek is settled and readyState >= 2.
   */
  private processPresentationSettlement(dispatchedSeekId: number): void {
    // If browser supports rVFC:
    if (typeof this.video.requestVideoFrameCallback === 'function') {
      if (this.matchingFramePresented) {
        // Order 2: Matching rVFC fired before or concurrently with seeked! Both conditions met.
        this.cleanupReadinessWait();
        this.tryCompleteOperation();
      } else {
        // Order 1: Seeked fired before rVFC. Native seek settled; wait for matching rVFC frame.
        this.notifyState();
      }
      return;
    }

    // Fallback mode for browsers without rVFC:
    const target = this.activeDispatchedTarget;
    const isWithinTolerance =
      target !== null && Math.abs(this.video.currentTime - target) <= this.frameTolerance;

    if (isWithinTolerance) {
      if (this.canvas) {
        this.canvas.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        this.canvasSnapshotValid = true;
        this.framesDrawnToCanvas++;
      }
      this.lastPresentedMediaTime = this.video.currentTime;
      this.matchingFramePresented = true;
      if (this.onFramePresented) {
        this.onFramePresented(this.video.currentTime, dispatchedSeekId);
      }
    } else {
      this.staleSeeksDiscarded++;
    }

    this.cleanupReadinessWait();
    this.tryCompleteOperation();
  }

  /**
   * Handles readiness transition (loadeddata / canplay) when seeked fired with readyState < 2.
   */
  private handleReadinessSettled(dispatchedSeekId: number): void {
    if (
      this.isFrozen ||
      this.activeDispatchedSeekId !== dispatchedSeekId ||
      this.activeSeekGeneration !== dispatchedSeekId
    ) {
      // Callback belongs to an older/stale operation or controller is frozen
      this.staleSeeksDiscarded++;
      this.cleanupRVFC();
      return;
    }

    if (this.video.readyState >= 2) {
      this.processPresentationSettlement(dispatchedSeekId);
    } else {
      // Re-attach if still not ready
      this.attachReadinessWait(dispatchedSeekId);
    }
  }

  private attachReadinessWait(dispatchedSeekId: number): void {
    this.cleanupReadinessWait();

    const onReady = () => {
      this.cleanupReadinessWait();
      this.handleReadinessSettled(dispatchedSeekId);
    };

    this.pendingReadinessListener = onReady;
    for (const evt of this.readinessEvents) {
      this.video.addEventListener(evt, onReady);
    }
  }

  private cleanupReadinessWait(): void {
    if (this.pendingReadinessListener) {
      for (const evt of this.readinessEvents) {
        this.video.removeEventListener(evt, this.pendingReadinessListener);
      }
      this.pendingReadinessListener = null;
    }
  }

  private cleanupRVFC(): void {
    if (this.activeRVFCHandle !== null && this.video.cancelVideoFrameCallback) {
      this.video.cancelVideoFrameCallback(this.activeRVFCHandle);
      this.activeRVFCHandle = null;
    }
  }

  /**
   * Safely finalizes an operation whose native hardware seek has already settled,
   * releasing the hardware seek gate without waiting for further seeked events.
   */
  private finalizeStaleSettledOperation(): void {
    this.cleanupReadinessWait();
    this.cleanupRVFC();
    this.unresolvedHardwareSeeksCount = 0;
    this.isHardwareSeeking = false;
    this.activeDispatchedSeekId = null;
    this.activeDispatchedTarget = null;
    this.nativeSeekSettled = false;
    this.matchingFramePresented = false;
  }

  /**
   * Completes the active operation only after hardware seek has settled
   * AND matching presentation verified. Releases hardware gate and dispatches newest pending.
   */
  private tryCompleteOperation(): void {
    this.cleanupReadinessWait();
    this.unresolvedHardwareSeeksCount = 0;
    this.isHardwareSeeking = false;
    this.activeDispatchedSeekId = null;
    this.activeDispatchedTarget = null;
    this.nativeSeekSettled = false;
    this.matchingFramePresented = false;

    // Dispatch coalesced newest pending target if present and un-frozen
    if (this.pendingTarget !== null && !this.isFrozen) {
      const nextTarget = this.pendingTarget;
      this.pendingTarget = null;
      if (this.isSameTimeSeek(nextTarget) && this.video.readyState >= 2) {
        this.presentSameTimeFrame(nextTarget);
      } else {
        this.dispatchHardwareSeek(nextTarget);
      }
    } else {
      this.notifyState();
    }
  }

  /**
   * Freeze presentation: invalidates generation and cancels presentation callbacks.
   * Preserves native settlement state.
   */
  public freeze(): void {
    this.isFrozen = true;
    this.activeSeekGeneration++; // Invalidate presentation generations
    this.pendingTarget = null;

    this.cleanupRVFC();
    this.cleanupReadinessWait();

    try {
      this.video.pause();
    } catch {
      // ignore
    }

    this.notifyState();
  }

  /**
   * Resume scrubbing:
   * - Detects if previous operation already settled in hardware while presentation was pending.
   * - If so, safely finalizes the stale operation and dispatches newest target immediately.
   * - If native seek is genuinely unresolved, stores target in pendingTarget.
   * - Retains canvas snapshot until new valid frame is actually presented.
   */
  public resume(newTarget?: number): void {
    this.isFrozen = false;
    const target = typeof newTarget === 'number' ? newTarget : this.pendingTarget;
    this.pendingTarget = null;

    // Detect if previous operation already completed native hardware seek
    // while presentation was pending or frozen
    if (this.isHardwareSeeking && this.nativeSeekSettled && !this.video.seeking) {
      this.staleSeeksDiscarded++;
      this.finalizeStaleSettledOperation();
    }

    if (typeof target === 'number') {
      if (this.isHardwareSeeking) {
        // Native seek is still genuinely in flight in hardware.
        // Store newest target in pendingTarget; dispatched upon native settlement.
        this.pendingTarget = target;
        this.notifyState();
      } else {
        if (this.isSameTimeSeek(target) && this.video.readyState >= 2) {
          this.presentSameTimeFrame(target);
        } else {
          this.dispatchHardwareSeek(target);
        }
      }
    } else {
      this.notifyState();
    }
  }

  private notifyState(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }
}
