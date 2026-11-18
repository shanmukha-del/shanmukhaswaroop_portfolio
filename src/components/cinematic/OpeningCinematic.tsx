import React from 'react';
import { useNavigation } from '../../store/useNavigation';
import { navigationStore } from '../../store/navigationStore';
import { globalVideoEngine } from '../video/VideoPresentationCanvas';

export const OpeningCinematic: React.FC = () => {
  const { isOpeningCinematicActive, openingCinematicTime, deviceType } = useNavigation();

  if (!isOpeningCinematicActive) return null;

  const t = openingCinematicTime; // 0 to 15s

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    navigationStore.setOpeningCinematicTime(newTime);
    if (globalVideoEngine) {
      globalVideoEngine.scrubTo(newTime);
    }
  };

  const handleEnterUniverse = () => {
    navigationStore.enterUniverse();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20, // Above canvas and HUD
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: deviceType === 'mobile' ? '1.5rem 1rem' : '2.5rem 3rem',
        background: 'transparent',
        pointerEvents: 'auto',
        color: '#fff',
        fontFamily: 'var(--font-sans)',
        userSelect: 'none'
      }}
    >
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              background: '#8a2be2',
              boxShadow: '0 0 10px #8a2be2'
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              color: 'var(--color-realm-0)'
            }}
          >
            CHAPTER 00 // PROLOGUE : GENESIS
          </span>
        </div>

        <button
          onClick={handleEnterUniverse}
          className="btn-runic"
          style={{
            fontSize: '0.75rem',
            padding: '0.4rem 1rem',
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}
        >
          SKIP TO UNIVERSE &#9654;&#9654;
        </button>
      </div>

      {/* Center Cinematic Stage - Dynamic Content based on Opening Time */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          maxWidth: '850px',
          margin: '0 auto',
          transition: 'all 0.5s ease'
        }}
      >
        {/* Phase 1: Pure Black & Vertical Violet Line (0s - 2.8s) */}
        {t < 2.8 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
            <div
              style={{
                width: '3px',
                height: '140px',
                background: 'linear-gradient(to bottom, transparent, #8a2be2, #00f0ff, transparent)',
                boxShadow: '0 0 25px #8a2be2, 0 0 50px #8a2be2',
                animation: 'pulse 1.5s infinite ease-in-out'
              }}
            />
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                letterSpacing: '0.2em',
                color: 'rgba(255, 255, 255, 0.6)'
              }}
            >
              [ INITIALIZING DIMENSIONAL VOID ]
            </div>
          </div>
        )}

        {/* Phase 2: Portal Ignition (2.8s - 6.2s) */}
        {t >= 2.8 && t < 6.2 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.25em',
                color: '#a855f7'
              }}
            >
              // NEXUS GATEWAY DETECTED
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: deviceType === 'mobile' ? '1.8rem' : '2.8rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, #fff 30%, #8a2be2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(138, 43, 226, 0.5)'
              }}
            >
              PORTAL TRANSITION
            </h2>
          </div>
        )}

        {/* Phase 3: Metallic Developer Name Reveal (6.2s - 10.0s) */}
        {t >= 6.2 && t < 10.0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.25em',
                color: '#00f0ff'
              }}
            >
              BEYOND THE BLOCKS PRESENTS
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: deviceType === 'mobile' ? '2.2rem' : '4.2rem',
                fontWeight: 900,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 25px rgba(138, 43, 226, 0.6))',
                margin: '0.2rem 0'
              }}
            >
              K. SHANMUKHASWAROOP
            </h1>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: deviceType === 'mobile' ? '0.85rem' : '1.1rem',
                fontWeight: 600,
                color: 'var(--color-realm-0)',
                letterSpacing: '0.12em'
              }}
            >
              DEVELOPER &amp; CREATIVE TECHNOLOGIST
            </div>
          </div>
        )}

        {/* Phase 4: Approved Character Reveal & Enter Universe CTA (10.0s - 15.0s) */}
        {t >= 10.0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                color: '#34d399'
              }}
            >
              CHARACTER IDENTITY // VERIFIED PROFILE
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.6rem',
                marginBottom: '0.5rem'
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '3px',
                  background: 'rgba(14, 16, 34, 0.85)',
                  border: '1px solid rgba(138, 43, 226, 0.5)',
                  color: '#c084fc'
                }}
              >
                NAVY FUTURISTIC HOODIE
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '3px',
                  background: 'rgba(14, 16, 34, 0.85)',
                  border: '1px solid rgba(0, 240, 255, 0.5)',
                  color: '#38bdf8'
                }}
              >
                VIOLET ACCENTS &amp; HEADPHONES
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '3px',
                  background: 'rgba(14, 16, 34, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#e2e8f0'
                }}
              >
                BLACK CARGO PANTS &amp; SNEAKERS
              </span>
            </div>

            <button
              onClick={handleEnterUniverse}
              className="btn-runic"
              style={{
                fontSize: deviceType === 'mobile' ? '1rem' : '1.2rem',
                padding: '0.9rem 2.5rem',
                borderColor: '#8a2be2',
                background: 'rgba(138, 43, 226, 0.35)',
                boxShadow: '0 0 35px rgba(138, 43, 226, 0.7)',
                color: '#fff',
                cursor: 'pointer',
                letterSpacing: '0.1em'
              }}
            >
              ENTER VOXEL UNIVERSE &#9654;
            </button>
          </div>
        )}
      </div>

      {/* Bottom Timeline Scrubber */}
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
          background: 'rgba(10, 11, 24, 0.75)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          padding: '0.8rem 1.4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            CINEMATIC TIMELINE // SCRUBBER
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-realm-0)' }}>
            {t.toFixed(1)}s / 15.0s
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="15"
          step="0.05"
          value={t}
          onChange={handleScrub}
          style={{
            width: '100%',
            accentColor: '#8a2be2',
            cursor: 'pointer'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          <span>0.0s: Void</span>
          <span>3.0s: Portal</span>
          <span>7.0s: Name Reveal</span>
          <span>11.0s: Character</span>
          <span>15.0s: Universe</span>
        </div>
      </div>
    </div>
  );
};

export default OpeningCinematic;
