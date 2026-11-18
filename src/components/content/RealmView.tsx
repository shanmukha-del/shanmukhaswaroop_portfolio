import React, { useState } from 'react';
import { useNavigation } from '../../store/useNavigation';
import { WORLDS_DATA } from '../../data/portfolioData';

/**
 * RealmView - Minimal, non-intrusive interactive layer.
 * Zero UI on Opening Screen.
 * On subsequent worlds, displays a subtle, sleek bottom indicator with interactive chips.
 * When clicked, focused detail modal sheets display verified project/hackathon facts.
 * The video remains 100% unobstructed during scroll exploration.
 */
export const RealmView: React.FC = () => {
  const { currentChapterIndex, isOpeningCinematicActive } = useNavigation();
  const [activeItemModal, setActiveItemModal] = useState<{
    title: string;
    subtitle: string;
    category: string;
    details: string[];
    link?: string;
  } | null>(null);

  if (isOpeningCinematicActive || currentChapterIndex === 0) {
    return null;
  }

  const isOverview = currentChapterIndex === 1;
  const currentWorld = !isOverview && currentChapterIndex >= 2 ? WORLDS_DATA[currentChapterIndex - 2] : null;

  return (
    <>
      {/* Bottom Minimal Interactive Realm Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.6rem',
          maxWidth: '92vw',
          pointerEvents: 'auto'
        }}
      >
        {/* Subtle Realm Badge & Subtitle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            padding: '0.45rem 1.1rem',
            background: 'rgba(5, 7, 15, 0.75)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${currentWorld?.accentColor || '#8a2be2'}44`,
            borderRadius: '24px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: currentWorld?.accentColor || '#8a2be2',
              boxShadow: `0 0 10px ${currentWorld?.accentColor || '#8a2be2'}`
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#ffffff'
            }}
          >
            {isOverview ? 'MAIN VOXEL UNIVERSE' : `REALM 0${currentChapterIndex - 1} // ${currentWorld?.name.toUpperCase()}`}
          </span>
          <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.8rem' }}>•</span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)'
            }}
          >
            {isOverview ? 'SCROLL TO EXPLORE 6 REALMS' : currentWorld?.subtitle}
          </span>
        </div>

        {/* Interactive Clickable Pills for Specific Realms */}
        {/* World 03: Project Kingdom - 4 Verified Projects */}
        {currentWorld?.id === 'project-kingdom' && currentWorld.projects && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {currentWorld.projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() =>
                  setActiveItemModal({
                    title: proj.title,
                    subtitle: proj.subtitle,
                    category: proj.districtName,
                    details: [proj.overview, ...proj.verifiedFeatures]
                  })
                }
                style={{
                  padding: '0.35rem 0.85rem',
                  background: 'rgba(0, 240, 255, 0.12)',
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                  borderRadius: '16px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                📁 {proj.title}
              </button>
            ))}
          </div>
        )}

        {/* World 04: Trial Grounds - 4 Confirmed Hackathons */}
        {currentWorld?.id === 'trial-grounds' && currentWorld.challenges && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {currentWorld.challenges.map((c) => (
              <button
                key={c.id}
                onClick={() =>
                  setActiveItemModal({
                    title: c.eventName,
                    subtitle: `${c.projectOrChallenge} • ${c.result}`,
                    category: 'Verified Hackathon Milestone',
                    details: [c.description]
                  })
                }
                style={{
                  padding: '0.35rem 0.85rem',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '16px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                ⚔️ {c.eventName} ({c.result})
              </button>
            ))}
          </div>
        )}

        {/* World 05: Achievement Realm - 4 Visual Monuments */}
        {currentWorld?.id === 'achievement-realm' && currentWorld.achievements && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {currentWorld.achievements.map((ach) => (
              <button
                key={ach.id}
                onClick={() =>
                  setActiveItemModal({
                    title: ach.event,
                    subtitle: `${ach.projectOrDomain} • ${ach.distinction}`,
                    category: ach.representation,
                    details: [ach.summary]
                  })
                }
                style={{
                  padding: '0.35rem 0.85rem',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '16px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                🏆 {ach.event}
              </button>
            ))}
          </div>
        )}

        {/* World 06: World Builder - ApexCode & CODEVISION */}
        {currentWorld?.id === 'world-builder' && currentWorld.verifiedOverview && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            <a
              href={currentWorld.verifiedOverview.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.35rem 0.85rem',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '16px',
                color: '#60a5fa',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              🌐 {currentWorld.verifiedOverview.companyName} ↗
            </a>
            <button
              onClick={() =>
                setActiveItemModal({
                  title: 'CODEVISION 2K26',
                  subtitle: 'Independent Technology Event',
                  category: 'Event Organization Experience',
                  details: [
                    'Organized CODEVISION 2K26, coordinating event technology challenges, technical sessions, and student development activities.',
                    'THE NEXT CHAPTER IS STILL BEING BUILT.'
                  ]
                })
              }
              style={{
                padding: '0.35rem 0.85rem',
                background: 'rgba(138, 43, 226, 0.2)',
                border: '1px solid rgba(138, 43, 226, 0.5)',
                borderRadius: '16px',
                color: '#c084fc',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              ⚡ CODEVISION 2K26
            </button>
          </div>
        )}
      </div>

      {/* Focused Detail Modal Sheet */}
      {activeItemModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            pointerEvents: 'auto'
          }}
          onClick={() => setActiveItemModal(null)}
        >
          <div
            style={{
              maxWidth: '540px',
              width: '100%',
              background: 'rgba(11, 14, 28, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '1.8rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
              color: '#ffffff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    color: '#00f0ff',
                    textTransform: 'uppercase'
                  }}
                >
                  {activeItemModal.category}
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    margin: '0.2rem 0'
                  }}
                >
                  {activeItemModal.title}
                </h2>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {activeItemModal.subtitle}
                </div>
              </div>
              <button
                onClick={() => setActiveItemModal(null)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: '#fff',
                  padding: '0.3rem 0.6rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                ✕ CLOSE
              </button>
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', marginTop: '0.8rem' }}>
              {activeItemModal.details.map((paragraph, idx) => (
                <p
                  key={idx}
                  style={{
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                    marginBottom: '0.6rem'
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RealmView;
