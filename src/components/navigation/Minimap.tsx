import React, { useEffect } from 'react';
import { useNavigation } from '../../store/useNavigation';
import { navigationStore } from '../../store/navigationStore';
import { WORLDS_DATA } from '../../data/portfolioData';

/**
 * Minimap - Functional, on-demand world navigator.
 * Appears only when explicitly toggled.
 * Does NOT permanently obstruct the cinematic video content.
 * Completely hidden on Chapter 0 (Opening Cinematic).
 */
export const Minimap: React.FC = () => {
  const { isMinimapOpen, activeRealmIndex, isOpeningCinematicActive } = useNavigation();

  // Keyboard shortcut: Press 'M' to toggle minimap, '0'-'6' for direct realm jump
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'm' || e.key === 'M') {
        navigationStore.toggleMinimap();
      } else if (e.key >= '0' && e.key <= '6') {
        navigationStore.navigateToRealm(parseInt(e.key, 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isOpeningCinematicActive || !isMinimapOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 35,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        pointerEvents: 'auto'
      }}
      onClick={() => navigationStore.setMinimapOpen(false)}
    >
      <div
        style={{
          width: '380px',
          maxWidth: '92vw',
          padding: '1.5rem',
          background: 'rgba(10, 13, 26, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          color: '#ffffff'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '0.6rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#ffffff'
              }}
            >
              REALM NAVIGATOR
            </span>
          </div>
          <button
            onClick={() => navigationStore.setMinimapOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem'
            }}
          >
            ✕ CLOSE
          </button>
        </div>

        {/* 2D Realm Map Matrix */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '200px',
            background: 'rgba(5, 7, 16, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '4px',
            marginBottom: '1rem',
            overflow: 'hidden'
          }}
        >
          {/* Central Universe Beacon */}
          <button
            onClick={() => {
              navigationStore.navigateToRealm(0);
              navigationStore.setMinimapOpen(false);
            }}
            title="Main Voxel Universe [Key 0]"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '0.3rem 0.6rem',
              background: activeRealmIndex === 0 ? '#8a2be2' : 'rgba(138, 43, 226, 0.4)',
              border: '1px solid #a855f7',
              borderRadius: '3px',
              color: '#fff',
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              zIndex: 3
            }}
          >
            UNIVERSE
          </button>

          {/* 6 Realm Coordinates */}
          {WORLDS_DATA.map((world, idx) => {
            const realmNum = idx + 1;
            const isActive = activeRealmIndex === realmNum;
            const leftPercent = 50 + (world.coordinates.x / 110) * 40;
            const topPercent = 50 + (world.coordinates.z / 110) * 40;

            return (
              <button
                key={world.id}
                onClick={() => {
                  navigationStore.navigateToRealm(realmNum);
                  navigationStore.setMinimapOpen(false);
                }}
                title={`${world.name} [Key ${realmNum}]`}
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: 'translate(-50%, -50%)',
                  padding: '0.2rem 0.5rem',
                  background: isActive ? world.themeColor : 'rgba(14, 16, 34, 0.8)',
                  border: `1px solid ${world.accentColor}`,
                  borderRadius: '3px',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  zIndex: isActive ? 5 : 2
                }}
              >
                0{realmNum}
              </button>
            );
          })}
        </div>

        {/* Quick List of Realms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {WORLDS_DATA.map((world, idx) => {
            const realmNum = idx + 1;
            const isActive = activeRealmIndex === realmNum;
            return (
              <div
                key={world.id}
                onClick={() => {
                  navigationStore.navigateToRealm(realmNum);
                  navigationStore.setMinimapOpen(false);
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.4rem 0.6rem',
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: world.accentColor }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#fff' }}>
                    0{realmNum} {world.name}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                  KEY [{realmNum}]
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Minimap;
