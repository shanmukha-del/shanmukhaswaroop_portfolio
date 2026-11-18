import {
  SerializedSeekController,
  VideoPresentationAdapter,
  CanvasPresentationAdapter
} from '../SerializedSeekController.js';

class InstrumentedMockVideo implements VideoPresentationAdapter {
  private _currentTime = 0;
  public seeking = false;
  public readyState = 4; // HAVE_ENOUGH_DATA
  public paused = true;
  public supportsRVFC = true;

  // Concurrency & lifecycle instrumentation
  public unresolvedHardwareSeeks = 0;
  public maxConcurrentHardwareSeeks = 0;
  public totalHardwareSeeksDispatched = 0;
  public overlapViolations = 0;

  private listeners: Record<string, Function[]> = {};
  public rvfcCallbacks: Map<number, (now: number, meta: { mediaTime: number; presentationTime?: number }) => void> = new Map();
  public rvfcHandleSeq = 0;

  get currentTime(): number {
    return this._currentTime;
  }

  set currentTime(val: number) {
    this.totalHardwareSeeksDispatched++;
    this.unresolvedHardwareSeeks++;
    if (this.unresolvedHardwareSeeks > 1) {
      this.overlapViolations++;
    }
    this.maxConcurrentHardwareSeeks = Math.max(
      this.maxConcurrentHardwareSeeks,
      this.unresolvedHardwareSeeks
    );
    this._currentTime = val;
    this.seeking = true;
  }

  addEventListener(event: string, listener: any): void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  removeEventListener(event: string, listener: any): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  pause(): void {
    this.paused = true;
  }

  requestVideoFrameCallback?(callback: (now: number, metadata: { mediaTime: number; presentationTime?: number }) => void): number {
    const handle = ++this.rvfcHandleSeq;
    this.rvfcCallbacks.set(handle, callback);
    return handle;
  }

  cancelVideoFrameCallback?(handle: number): void {
    this.rvfcCallbacks.delete(handle);
  }

  public fireRVFCCallbackDirectly(mediaTime: number): void {
    const callbacks = Array.from(this.rvfcCallbacks.entries());
    this.rvfcCallbacks.clear();
    callbacks.forEach(([_, cb]) => cb(Date.now(), { mediaTime, presentationTime: 1000 }));
  }

  public fireSeekedEventDirectly(): void {
    this.seeking = false;
    this.unresolvedHardwareSeeks = Math.max(0, this.unresolvedHardwareSeeks - 1);
    const handlers = [...(this.listeners['seeked'] || [])];
    handlers.forEach(h => h());
  }

  public fireReadinessEventDirectly(event: string = 'canplay', newReadyState: number = 4): void {
    this.readyState = newReadyState;
    const handlers = [...(this.listeners[event] || [])];
    handlers.forEach(h => h());
  }

  public async settleFullSeek(targetTime: number, order: 'seeked-first' | 'rvfc-first' = 'seeked-first', delayMs: number = 5): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        this._currentTime = targetTime;
        if (order === 'seeked-first') {
          this.fireSeekedEventDirectly();
          if (this.supportsRVFC) {
            this.fireRVFCCallbackDirectly(targetTime);
          }
        } else {
          if (this.supportsRVFC) {
            this.fireRVFCCallbackDirectly(targetTime);
          }
          this.fireSeekedEventDirectly();
        }
        resolve();
      }, delayMs);
    });
  }
}

class MockCanvas implements CanvasPresentationAdapter {
  public width = 1280;
  public height = 720;
  public drawCalls: Array<{ source: any; dx: number; dy: number }> = [];

  drawImage(source: any, dx: number, dy: number, _dw: number, _dh: number): void {
    this.drawCalls.push({ source, dx, dy });
  }

  clear(): void {
    this.drawCalls = [];
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

async function runRegressionTestSuite() {
  console.log('=== RUNNING SERIALIZED SEEK CONTROLLER REGRESSION TEST SUITE ===\n');
  let passed = 0;

  // Race 1: An old rVFC callback arriving before the matching seeked event
  {
    console.log('[Regression 1] Old rVFC callback before matching seeked event');
    const video = new InstrumentedMockVideo();
    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    controller.requestSeek(2.0);
    assert(video.unresolvedHardwareSeeks === 1, 'Exactly one hardware seek active');
    assert(controller.getState().isHardwareSeeking === true, 'Controller must track active hardware seek');

    video.fireRVFCCallbackDirectly(0.5);

    assert(controller.getState().isHardwareSeeking === true, 'Hardware seek gate must REMAIN LOCKED after stale rVFC');
    assert(video.unresolvedHardwareSeeks === 1, 'Unresolved hardware seeks must stay at 1');
    assert(controller.getState().staleSeeksDiscarded === 1, 'Stale rVFC must be recorded');
    assert(canvas.drawCalls.length === 0, 'No frame drawn for mismatched rVFC');

    await video.settleFullSeek(2.0, 'seeked-first');

    assert(controller.getState().isHardwareSeeking === false, 'Settled cleanly');
    assert(video.maxConcurrentHardwareSeeks === 1, 'Concurrency never exceeded 1');
    console.log('  -> PASS: Stale rVFC did not prematurely release hardware seek gate.\n');
    passed++;
  }

  // Race 2: Mismatched rVFC timestamp while native seek is active
  {
    console.log('[Regression 2] Mismatched rVFC timestamp while native seek is active');
    const video = new InstrumentedMockVideo();
    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    controller.requestSeek(5.0);
    video.fireRVFCCallbackDirectly(4.0);

    assert(controller.getState().isHardwareSeeking === true, 'Hardware gate remains closed');
    assert(controller.getState().matchingFramePresented === false, 'Matching frame not marked presented');
    assert(canvas.drawCalls.length === 0, 'Canvas untouched');

    await video.settleFullSeek(5.0);
    assert(controller.getState().lastPresentedMediaTime === 5.0, '5.0 presented');
    assert(video.maxConcurrentHardwareSeeks === 1, 'Max concurrent hardware seeks == 1');
    console.log('  -> PASS: Mismatched rVFC timestamp rejected without dropping hardware lock.\n');
    passed++;
  }

  // Race 3: Freeze followed by resume while previous seek is unresolved
  {
    console.log('[Regression 3] Freeze followed by resume while previous seek is unresolved');
    const video = new InstrumentedMockVideo();
    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    controller.requestSeek(1.0);
    await video.settleFullSeek(1.0);
    assert(canvas.drawCalls.length === 1, 'Baseline frame 1.0 drawn');

    controller.requestSeek(8.0);
    assert(video.unresolvedHardwareSeeks === 1, 'Seek 8.0 dispatched');

    controller.freeze();
    assert(controller.getState().isFrozen === true, 'Frozen');
    assert(controller.getState().isHardwareSeeking === true, 'Native seek 8.0 remains unresolved in hardware');

    controller.resume(3.0);
    assert(controller.getState().isFrozen === false, 'Unfrozen');
    assert(controller.getState().pendingTarget === 3.0, '3.0 stored in pendingTarget');
    assert(video.unresolvedHardwareSeeks === 1, 'NO second hardware seek dispatched yet!');

    await video.settleFullSeek(8.0);

    assert(controller.getState().activeDispatchedTarget === 3.0, 'Seek 3.0 dispatched only after 8.0 settled');
    assert(video.unresolvedHardwareSeeks === 1, 'Current hardware seeks stays strictly at 1');

    await video.settleFullSeek(3.0);
    assert(controller.getState().lastPresentedMediaTime === 3.0, 'Target 3.0 presented');
    assert(video.overlapViolations === 0, 'Zero hardware seek overlap violations!');
    assert(video.maxConcurrentHardwareSeeks === 1, 'Maximum concurrent hardware seeks strictly 1');

    console.log('  -> PASS: Previous seek settled before pending seek dispatched; zero overlap.\n');
    passed++;
  }

  // Race 4: A stale rVFC callback arriving after freeze and resume
  {
    console.log('[Regression 4 / Defect 1] Stale rVFC arriving after freeze and resume');
    const video = new InstrumentedMockVideo();
    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    let capturedCallbackA: any = null;
    const origRequestRVFC = video.requestVideoFrameCallback?.bind(video);
    video.requestVideoFrameCallback = (cb) => {
      const handle = origRequestRVFC ? origRequestRVFC(cb) : 1;
      if (!capturedCallbackA) {
        capturedCallbackA = cb;
      }
      return handle;
    };

    controller.requestSeek(2.0);
    assert(controller.getState().activeSeekGeneration === 1, 'Seek A generation is 1');
    assert(capturedCallbackA !== null, 'Callback for Seek A captured');

    controller.freeze();
    assert(controller.getState().isFrozen === true, 'Controller is frozen');

    video.fireSeekedEventDirectly();

    controller.resume(4.0);
    const stateB = controller.getState();
    assert(stateB.activeDispatchedTarget === 4.0, 'Seek B is active at 4.0');
    const seekBGeneration = stateB.activeSeekGeneration;
    assert(video.rvfcCallbacks.size === 1, 'Seek B registered exactly 1 rVFC callback');

    capturedCallbackA(Date.now(), { mediaTime: 2.0, presentationTime: 1000 });

    assert(controller.getState().staleSeeksDiscarded >= 1, 'Old rVFC recorded as stale');
    assert(controller.getState().lastPresentedMediaTime !== 2.0, 'Old frame 2.0 must NOT be presented');
    assert(video.rvfcCallbacks.size === 1, 'Seek A did NOT register a new rVFC or clobber Seek B');
    assert(controller.getState().activeSeekGeneration === seekBGeneration, 'Seek B generation remains active');

    await video.settleFullSeek(4.0);
    assert(controller.getState().lastPresentedMediaTime === 4.0, 'Only valid Seek B presented');
    assert(video.maxConcurrentHardwareSeeks === 1, 'Concurrency strictly 1');

    console.log('  -> PASS: Stale rVFC cleanly discarded without re-registering or handle collision.\n');
    passed++;
  }

  // Race 5: A late native seeked event with a pending target
  {
    console.log('[Regression 5] Late native seeked event with pending target');
    const video = new InstrumentedMockVideo();
    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    controller.requestSeek(1.0);
    controller.requestSeek(7.0);
    assert(controller.getState().pendingTarget === 7.0, '7.0 queued in pendingTarget');

    await video.settleFullSeek(1.0);

    assert(controller.getState().isHardwareSeeking === true, 'Seek 7.0 dispatched');
    assert(controller.getState().activeDispatchedTarget === 7.0, 'Dispatched target is 7.0');

    await video.settleFullSeek(7.0);
    assert(controller.getState().lastPresentedMediaTime === 7.0, '7.0 presented');
    assert(video.overlapViolations === 0, 'Zero overlap violations');
    console.log('  -> PASS: Late seeked cleanly dispatched pending target without overlap.\n');
    passed++;
  }

  // Race 6: Both possible orderings of seeked and matching rVFC
  {
    console.log('[Regression 6] Both event orderings (seeked-first and rvfc-first)');
    const video = new InstrumentedMockVideo();
    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    controller.requestSeek(2.0);
    video.currentTime = 2.0;
    video.fireSeekedEventDirectly();
    assert(controller.getState().nativeSeekSettled === true, 'Native seek marked settled');
    assert(controller.getState().matchingFramePresented === false, 'Frame not presented yet');
    video.fireRVFCCallbackDirectly(2.0);
    assert(controller.getState().lastPresentedMediaTime === 2.0, 'Order 6A settled and drawn');

    controller.requestSeek(4.0);
    video.currentTime = 4.0;
    video.fireRVFCCallbackDirectly(4.0);
    assert(controller.getState().matchingFramePresented === true, 'Frame presented to canvas');
    assert(controller.getState().isHardwareSeeking === true, 'Hardware seek gate remains active until seeked fires!');
    video.fireSeekedEventDirectly();
    assert(controller.getState().isHardwareSeeking === false, 'Order 6B completed cleanly without duplicate draw');
    assert(controller.getState().lastPresentedMediaTime === 4.0, 'Order 6B presented correctly');
    assert(canvas.drawCalls.length === 2, 'Exactly 2 frames drawn for the 2 seeks');

    console.log('  -> PASS: Both event orderings handled cleanly without duplicate completion.\n');
    passed++;
  }

  // Race 7: Repeated freeze/resume without overlapping hardware seeks (10 cycles)
  {
    console.log('[Regression 7] Repeated freeze/resume without overlapping hardware seeks (10 cycles)');
    const video = new InstrumentedMockVideo();
    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    for (let i = 1; i <= 10; i++) {
      const targetA = i * 0.5;
      const targetB = targetA + 0.25;

      controller.requestSeek(targetA);
      controller.requestSeek(targetB);
      controller.freeze();
      controller.resume(targetA);

      if (video.unresolvedHardwareSeeks > 0) {
        await video.settleFullSeek(targetA);
      }
      if (video.unresolvedHardwareSeeks > 0) {
        await video.settleFullSeek(targetA);
      }

      assert(video.maxConcurrentHardwareSeeks === 1, `Cycle ${i}: max concurrent seeks must be 1`);
      assert(video.overlapViolations === 0, `Cycle ${i}: zero overlap violations`);
    }

    assert(video.maxConcurrentHardwareSeeks === 1, 'Final check: max concurrent seeks == 1');
    assert(video.overlapViolations === 0, 'Final check: zero overlap violations');
    console.log('  -> PASS: 10 cycles executed with strictly 1 concurrent hardware seek at all times.\n');
    passed++;
  }

  // Test 8: Fallback mode (Browsers without requestVideoFrameCallback)
  {
    console.log('[Test 8] Fallback mode verification (no rVFC)');
    const video = new InstrumentedMockVideo();
    video.supportsRVFC = false;
    video.requestVideoFrameCallback = undefined;

    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    controller.requestSeek(7.5);
    await video.settleFullSeek(7.5);

    assert(controller.getState().lastPresentedMediaTime === 7.5, 'Fallback mode presented target 7.5');
    assert(canvas.drawCalls.length === 1, 'Fallback mode drew frame to canvas');
    assert(video.maxConcurrentHardwareSeeks === 1, 'Max concurrent hardware seeks == 1');
    console.log('  -> PASS: Fallback mode operates with full serialization and zero overlaps.\n');
    passed++;
  }

  // Test 9: Same-time seek on paused video
  {
    console.log('[Test 9] Same-time seek on paused video');
    const video = new InstrumentedMockVideo();
    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    assert(video.currentTime === 0, 'Initial currentTime is 0');
    assert(video.paused === true, 'Video is paused');

    controller.requestSeek(0.0);

    assert(controller.getState().isHardwareSeeking === false, 'Hardware seeking gate must NOT be locked');
    assert(video.unresolvedHardwareSeeks === 0, 'Zero unresolved hardware seeks');
    assert(video.totalHardwareSeeksDispatched === 0, 'No redundant native seek dispatched to video element');
    assert(controller.getState().canvasSnapshotValid === true, 'Canvas snapshot marked valid');
    assert(controller.getState().lastPresentedMediaTime === 0, 'Media time presented');
    assert(canvas.drawCalls.length === 1, 'Canvas drew current frame');

    controller.requestSeek(2.5);
    assert(controller.getState().isHardwareSeeking === true, 'New hardware seek dispatched immediately');
    assert(video.totalHardwareSeeksDispatched === 1, 'Native seek dispatched to 2.5');
    await video.settleFullSeek(2.5);

    assert(controller.getState().lastPresentedMediaTime === 2.5, '2.5 presented');
    assert(video.maxConcurrentHardwareSeeks === 1, 'Concurrency strictly 1');

    console.log('  -> PASS: Same-time seek handled via safe immediate presentation without locking hardware gate.\n');
    passed++;
  }

  // Test 10: CRITICAL LIFECYCLE 1 & 2 — seeked fires when readyState < 2, freeze occurs, then resume with new target
  {
    console.log('[Test 10] Freeze during pending frame readiness, followed by resume with new target');
    const video = new InstrumentedMockVideo();
    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    // Step 1: Seek A is dispatched
    controller.requestSeek(1.0);
    assert(video.unresolvedHardwareSeeks === 1, 'Seek A dispatched');
    assert(controller.getState().isHardwareSeeking === true, 'Seeking A');

    // Step 2: Native seeked fires while video.seeking === false but video.readyState < 2
    video.readyState = 1; // HAVE_METADATA < HAVE_CURRENT_DATA
    video.fireSeekedEventDirectly();

    // Verify native settlement state: hardware seek has settled!
    assert(controller.getState().nativeSeekSettled === true, 'nativeSeekSettled must be true');
    assert(controller.getState().unresolvedHardwareSeeksCount === 0, 'unresolvedHardwareSeeksCount must be 0');
    assert(video.unresolvedHardwareSeeks === 0, 'Hardware is not seeking');
    assert(canvas.drawCalls.length === 0, 'No canvas draw yet while readyState < 2');

    // Step 3: freeze() is called before readiness arrives
    controller.freeze();
    assert(controller.getState().isFrozen === true, 'Controller is frozen');
    assert(controller.getState().nativeSeekSettled === true, 'nativeSeekSettled preserved during freeze');

    // Step 4: resume(4.0) is called with a new target
    controller.resume(4.0);

    // CRITICAL ASSERTION: The controller must NOT remain locked!
    // It must detect that Seek A had already settled in hardware, finalize A, and dispatch 4.0!
    assert(controller.getState().isHardwareSeeking === true, 'Target 4.0 must be actively seeking');
    assert(controller.getState().activeDispatchedTarget === 4.0, 'Dispatched target must be 4.0');
    assert(video.totalHardwareSeeksDispatched === 2, 'Exactly 2 hardware seeks dispatched (1.0 then 4.0)');
    assert(video.unresolvedHardwareSeeks === 1, 'Exactly 1 unresolved hardware seek (for 4.0)');
    assert(video.maxConcurrentHardwareSeeks === 1, 'Concurrency never exceeded 1!');

    // Step 5: Settle Seek B (4.0) with full readiness
    video.readyState = 4;
    await video.settleFullSeek(4.0);

    assert(controller.getState().isHardwareSeeking === false, 'Operation 4.0 completed cleanly');
    assert(controller.getState().lastPresentedMediaTime === 4.0, 'Target 4.0 presented to canvas');
    assert(canvas.drawCalls.length === 1, 'Only target 4.0 drawn to canvas');

    console.log('  -> PASS: Freeze during pending readiness safely finalized stale seek; resumed target dispatched cleanly.\n');
    passed++;
  }

  // Test 11: CRITICAL LIFECYCLE 3 — Readiness arrives AFTER resume
  {
    console.log('[Test 11] Readiness arrives AFTER resume');
    const video = new InstrumentedMockVideo();
    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    // Establish initial baseline frame 0.5
    controller.requestSeek(0.5);
    await video.settleFullSeek(0.5);
    assert(canvas.drawCalls.length === 1, 'Baseline frame 0.5 drawn');

    // Seek A to 2.0, seeked arrives with readyState = 1
    controller.requestSeek(2.0);
    video.readyState = 1;
    video.fireSeekedEventDirectly();
    assert(controller.getState().nativeSeekSettled === true, 'Seek A native seek settled');

    // Freeze while waiting for readiness
    controller.freeze();

    // Resume with Seek B (5.0) BEFORE readiness for Seek A has arrived
    controller.resume(5.0);
    assert(controller.getState().activeDispatchedTarget === 5.0, 'Seek B (5.0) dispatched');

    // Now delayed readiness or rVFC for Seek A arrives
    video.fireRVFCCallbackDirectly(2.0);
    video.fireReadinessEventDirectly('canplay', 4);

    // CRITICAL: Stale frame 2.0 must NOT overwrite the canvas!
    assert(canvas.drawCalls.length === 1, 'Stale frame 2.0 must NOT be drawn to canvas');
    assert(controller.getState().lastPresentedMediaTime === 0.5, 'Last presented media time remains baseline 0.5');

    // Settle Seek B (5.0)
    video.fireSeekedEventDirectly();
    video.fireRVFCCallbackDirectly(5.0);

    assert(controller.getState().lastPresentedMediaTime === 5.0, 'Valid frame 5.0 presented');
    assert(canvas.drawCalls.length === 2, 'Exactly 2 frames drawn (baseline 0.5 and target 5.0)');
    assert(video.maxConcurrentHardwareSeeks === 1, 'Concurrency strictly 1');

    console.log('  -> PASS: Delayed readiness arriving after resume rejected cleanly; canvas snapshot protected.\n');
    passed++;
  }

  // Test 12: CRITICAL LIFECYCLE 4 — Readiness arrives BEFORE resume (while frozen)
  {
    console.log('[Test 12] Readiness arrives BEFORE resume (while frozen)');
    const video = new InstrumentedMockVideo();
    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    controller.requestSeek(1.0);
    video.readyState = 1;
    video.fireSeekedEventDirectly();

    // Freeze before readiness
    controller.freeze();

    // Readiness arrives while still frozen
    video.readyState = 4;
    video.fireReadinessEventDirectly('canplay', 4);

    // Stale frame must not be drawn while frozen
    assert(canvas.drawCalls.length === 0, 'No frame drawn while frozen');

    // Resume with target 6.0
    controller.resume(6.0);
    assert(controller.getState().activeDispatchedTarget === 6.0, '6.0 dispatched');
    await video.settleFullSeek(6.0);

    assert(controller.getState().lastPresentedMediaTime === 6.0, 'Target 6.0 presented');
    assert(canvas.drawCalls.length === 1, 'Only 6.0 drawn');
    assert(video.maxConcurrentHardwareSeeks === 1, 'Concurrency strictly 1');

    console.log('  -> PASS: Readiness arriving before resume discarded safely; resume proceeded normally.\n');
    passed++;
  }

  // Test 13: CRITICAL LIFECYCLE 5 — Freeze and resume without supplying a new target
  {
    console.log('[Test 13] Freeze and resume without supplying a new target');
    const video = new InstrumentedMockVideo();
    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    controller.requestSeek(2.0);
    video.readyState = 1;
    video.fireSeekedEventDirectly();

    controller.freeze();
    assert(controller.getState().isFrozen === true, 'Frozen');

    // Resume WITHOUT arguments
    controller.resume();

    // Controller must finalize stale seek and return to idle without locking
    assert(controller.getState().isFrozen === false, 'Unfrozen');
    assert(controller.getState().isHardwareSeeking === false, 'isHardwareSeeking must be false');
    assert(controller.getState().pendingTarget === null, 'pendingTarget must be null');
    assert(video.unresolvedHardwareSeeks === 0, 'Zero unresolved hardware seeks');

    // Subsequent seek to 7.0 must work immediately without obstruction
    video.readyState = 4;
    controller.requestSeek(7.0);
    assert(controller.getState().isHardwareSeeking === true, 'Seek 7.0 dispatched immediately');
    await video.settleFullSeek(7.0);

    assert(controller.getState().lastPresentedMediaTime === 7.0, '7.0 presented');
    assert(video.maxConcurrentHardwareSeeks === 1, 'Concurrency strictly 1');

    console.log('  -> PASS: Resume with no target safely cleared settled state without hardware lock.\n');
    passed++;
  }

  // Test 14: CRITICAL LIFECYCLE 6 & 7 & 8 — Multiple freeze/resume cycles while waiting for readiness
  {
    console.log('[Test 14] Multiple freeze/resume cycles while waiting for readiness (5 cycles)');
    const video = new InstrumentedMockVideo();
    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    video.readyState = 1; // Keep readyState low

    for (let i = 1; i <= 5; i++) {
      const target = i * 1.0;
      if (i === 1) {
        controller.requestSeek(target);
      } else {
        controller.resume(target);
      }

      // Native seeked fires with low readyState
      video.fireSeekedEventDirectly();
      assert(controller.getState().nativeSeekSettled === true, `Cycle ${i}: nativeSeekSettled must be true`);
      assert(controller.getState().unresolvedHardwareSeeksCount === 0, `Cycle ${i}: unresolvedHardwareSeeksCount == 0`);

      // Freeze before readiness
      controller.freeze();
      assert(controller.getState().isFrozen === true, `Cycle ${i}: frozen`);
      assert(video.maxConcurrentHardwareSeeks === 1, `Cycle ${i}: concurrency never exceeded 1`);
      assert(video.overlapViolations === 0, `Cycle ${i}: zero overlap violations`);
    }

    // Now resume with final target 9.0 and elevate readyState to 4
    controller.resume(9.0);
    assert(controller.getState().activeDispatchedTarget === 9.0, 'Final target 9.0 dispatched');
    assert(video.unresolvedHardwareSeeks === 1, 'Exactly 1 active seek for 9.0');

    video.readyState = 4;
    await video.settleFullSeek(9.0);

    assert(controller.getState().lastPresentedMediaTime === 9.0, 'Final target 9.0 validly presented');
    assert(canvas.drawCalls.length === 1, 'Only final target 9.0 drawn to canvas');
    assert(video.maxConcurrentHardwareSeeks === 1, 'Concurrency strictly 1 throughout all 5 cycles');
    assert(video.overlapViolations === 0, 'Zero overlap violations throughout all cycles');

    console.log('  -> PASS: 5 freeze/resume cycles while waiting for readiness handled with strict 1-flight concurrency.\n');
    passed++;
  }

  // Test 15: CRITICAL LIFECYCLE 9 — Stale frame never overwrites frozen canvas snapshot
  {
    console.log('[Test 15] Canvas snapshot protection: stale frame cannot overwrite snapshot');
    const video = new InstrumentedMockVideo();
    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    // Establish baseline frame 1.0
    controller.requestSeek(1.0);
    await video.settleFullSeek(1.0);
    assert(canvas.drawCalls.length === 1, 'Baseline frame 1.0 drawn');
    assert(controller.getState().canvasSnapshotValid === true, 'Snapshot marked valid');

    // Seek to 8.0, native seeked arrives with readyState = 1
    controller.requestSeek(8.0);
    video.readyState = 1;
    video.fireSeekedEventDirectly();

    // Freeze
    controller.freeze();

    // Simulate readiness callback and rVFC callback arriving for 8.0 while frozen
    video.fireReadinessEventDirectly('canplay', 4);
    video.fireRVFCCallbackDirectly(8.0);

    // Canvas must still hold ONLY the baseline frame!
    assert(canvas.drawCalls.length === 1, 'Canvas draw count must remain exactly 1');
    assert(controller.getState().lastPresentedMediaTime === 1.0, 'Presented time remains 1.0');
    assert(controller.getState().canvasSnapshotValid === true, 'Canvas snapshot remains valid');

    console.log('  -> PASS: Stale frame rejected; canvas snapshot preserved flawlessly.\n');
    passed++;
  }

  // Test 16: Fallback Mode (No rVFC) — Freeze during pending readiness
  {
    console.log('[Test 16] Fallback mode (No rVFC): Freeze during pending readiness and resume');
    const video = new InstrumentedMockVideo();
    video.supportsRVFC = false;
    video.requestVideoFrameCallback = undefined;

    const canvas = new MockCanvas();
    const controller = new SerializedSeekController(video, canvas, { fps: 24 });

    controller.requestSeek(2.0);
    video.readyState = 1;
    video.fireSeekedEventDirectly();
    assert(controller.getState().nativeSeekSettled === true, 'Native seek settled');

    controller.freeze();
    controller.resume(4.5);

    assert(controller.getState().activeDispatchedTarget === 4.5, 'Target 4.5 dispatched in fallback mode');
    assert(video.maxConcurrentHardwareSeeks === 1, 'Max concurrent hardware seeks == 1');

    video.readyState = 4;
    video.fireSeekedEventDirectly();

    assert(controller.getState().lastPresentedMediaTime === 4.5, 'Fallback mode presented target 4.5');
    assert(canvas.drawCalls.length === 1, 'Canvas drew 4.5');

    console.log('  -> PASS: Fallback mode handles freeze during pending readiness cleanly.\n');
    passed++;
  }

  console.log(`=== ALL ${passed}/16 REGRESSION TESTS PASSED SUCCESSFULLY ===`);
}

runRegressionTestSuite().catch(err => {
  console.error(err);
  process.exit(1);
});
