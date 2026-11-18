import React from 'react';
import { useNavigation } from '../../store/useNavigation';
import { navigationStore } from '../../store/navigationStore';
import { DEVELOPER_PROFILE } from '../../data/portfolioData';

interface AppShellProps {
  children?: React.ReactNode;
}

/**
 * AppShell - Minimal, non-intrusive header and layout shell.
 * Subordinate to the background cinematic video.
 * Completely hidden on Chapter 0 (Opening Cinematic).
 * All unapproved decorative brackets, FPS counters, and Gemini-style gradients removed.
 */
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { isOpeningCinematicActive, isMinimapOpen } = useNavigation();

  // On opening screen, zero UI overlays exist
  if (isOpeningCinematicActive) {
    return null;
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        minHeight: '100vh',
        overflowX: 'hidden',
        pointerEvents: 'none'
      }}
    >
      {/* Sleek Minimal Header */}
      <header
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1.5rem',
          right: '1.5rem',
          height: '48px',
          zIndex: 25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          background: 'rgba(5, 7, 15, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '6px',
          pointerEvents: 'auto'
        }}
      >
        {/* Left: Clean Brand Identity */}
        <div
          onClick={() => navigationStore.navigateToRealm(0)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#ffffff'
            }}
          >
            BEYOND THE BLOCKS
          </div>
          <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.8rem' }}>•</span>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              letterSpacing: '0.06em'
            }}
          >
            {DEVELOPER_PROFILE.name.toUpperCase()}
          </div>
        </div>

        {/* Right: Functional Minimap Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <button
            onClick={() => navigationStore.toggleMinimap()}
            style={{
              padding: '0.35rem 0.85rem',
              background: isMinimapOpen ? 'rgba(138, 43, 226, 0.35)' : 'rgba(255, 255, 255, 0.06)',
              border: isMinimapOpen ? '1px solid #8a2be2' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '4px',
              color: '#ffffff',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isMinimapOpen ? '#00f0ff' : '#8a2be2'
              }}
            />
            {isMinimapOpen ? 'CLOSE MAP' : 'MINIMAP (M)'}
          </button>
        </div>
      </header>

      {/* Main Content Area (Modal sheets / Interactive overlays) */}
      <main style={{ pointerEvents: 'none' }}>{children}</main>
    </div>
  );
};

export default AppShell;
