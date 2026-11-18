import React, { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { VoxelScene } from './VoxelScene';
import { useNavigation } from '../../store/useNavigation';

const WebGLTelemetry: React.FC = () => {
  const { gl, scene } = useThree();

  useEffect(() => {
    try {
      const context = gl.getContext();
      const isWebGL2 =
        typeof WebGL2RenderingContext !== 'undefined' && context instanceof WebGL2RenderingContext;
      const debugInfo = context.getExtension('WEBGL_debug_renderer_info');
      const unmaskedRenderer = debugInfo
        ? context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : 'N/A';
      const unmaskedVendor = debugInfo
        ? context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : 'N/A';
      const version = context.getParameter(context.VERSION);
      const renderer = context.getParameter(context.RENDERER);

      const width = gl.domElement.width || 1;
      const height = gl.domElement.height || 1;
      const pixelBuffer = new Uint8Array(4);
      context.readPixels(
        Math.floor(width / 2),
        Math.floor(height / 2),
        1,
        1,
        context.RGBA,
        context.UNSIGNED_BYTE,
        pixelBuffer
      );

      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint');
      const fpEntry = paintEntries.find((e) => e.name === 'first-paint');
      const resources = performance.getEntriesByType('resource').map((r: any) => ({
        name: r.name,
        initiatorType: r.initiatorType,
        duration: Math.round(r.duration * 100) / 100,
        transferSize: r.transferSize,
        encodedBodySize: r.encodedBodySize,
        decodedBodySize: r.decodedBodySize
      }));

      const auditData = {
        webgl: {
          isWebGL2,
          version,
          renderer,
          unmaskedRenderer,
          unmaskedVendor,
          maxTextureSize: context.getParameter(context.MAX_TEXTURE_SIZE),
          centerPixelSample: Array.from(pixelBuffer),
          sceneChildrenCount: scene.children.length,
          canvasWidth: width,
          canvasHeight: height
        },
        performance: {
          firstPaintMs: fpEntry ? Math.round(fpEntry.startTime * 100) / 100 : null,
          firstContentfulPaintMs: fcpEntry ? Math.round(fcpEntry.startTime * 100) / 100 : null,
          resources
        }
      };

      (window as any).__AUDIT_DATA__ = auditData;

      let el = document.getElementById('audit-telemetry-dump');
      if (!el) {
        el = document.createElement('script');
        el.id = 'audit-telemetry-dump';
        el.setAttribute('type', 'application/json');
        document.body.appendChild(el);
      }
      el.textContent = JSON.stringify(auditData, null, 2);
    } catch (e) {
      console.warn('Telemetry collection error:', e);
    }
  }, [gl, scene]);

  return null;
};

export const PersistentCanvas: React.FC = () => {
  const navState = useNavigation();

  // On the opening screen, WebGL is completely inactive to keep the video pure and unobstructed
  if (navState.isOpeningCinematicActive) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1, // Directly above video presentation canvas (z-index 0)
        pointerEvents: 'none',
        background: 'transparent'
      }}
    >
      <Canvas
        camera={{ position: [0, 25, 60], fov: 50, near: 0.1, far: 1000 }}
        dpr={navState.qualityMode === 'power-saving' ? [1, 1] : [1, 2]}
        gl={{
          antialias: navState.qualityMode !== 'power-saving',
          powerPreference: 'high-performance',
          alpha: true,
          depth: true,
          stencil: false
        }}
      >
        <WebGLTelemetry />
        <VoxelScene navState={navState} />
      </Canvas>
    </div>
  );
};

export default PersistentCanvas;
