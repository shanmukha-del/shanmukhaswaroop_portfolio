import React from 'react';
import { useNavigation } from '../../store/useNavigation';
import { navigationStore, QualityMode } from '../../store/navigationStore';
import { DEVELOPER_PROFILE } from '../../data/portfolioData';

/**
 * MobileNavDrawer - Temple Run-inspired carved wood & stone navigation drawer.
 * Provides touch-friendly, fluid navigation across all 8 chapters.
 * Smoothly closes without scroll locking or screen jumps.
 */
export const MobileNavDrawer: React.FC = () => {
  const { isMobileMenuOpen, currentChapterIndex, qualityMode } = useNavigation();

  if (!isMobileMenuOpen) return null;

  const chapters = [
    { index: 0, icon: '🎬', name: 'Opening Cinematic', desc: 'Prologue & Portal' },
    { index: 1, icon: '🏛️', name: 'Main Voxel Universe', desc: 'Central Nexus' },
    { index: 2, icon: '🌿', name: '01 // Origin Village', desc: 'Foundations & Roots' },
    { index: 3, icon: '⚒️', name: "02 // Creator's Workshop", desc: 'Technologies & Skills' },
    { index: 4, icon: '🏰', name: '03 // Project Kingdom', desc: 'Things I Have Built' },
    { index: 5, icon: '⚔️', name: '04 // Trial Grounds', desc: 'Hackathons & Sprints' },
    { index: 6, icon: '🏆', name: '05 // Achievement Realm', desc: 'Milestones & Honors' },
    { index: 7, icon: '🌐', name: '06 // World Builder', desc: 'ApexCode & Finale' }
  ];

  const handleSelectChapter = (ch: number) => {
    navigationStore.navigateToChapter(ch, 0);
    navigationStore.setMobileMenuOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(3, 3, 8, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        pointerEvents: 'auto'
      }}
      onClick={() => navigationStore.setMobileMenuOpen(false)}
    >
      <div
        style={{
          width: '85%',
          maxWidth: '340px',
          height: '100%',
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background:
            'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.015) 0px, rgba(255, 255, 255, 0.015) 3px, transparent 3px, transparent 6px), linear-gradient(160deg, #1f1712 0%, #120d09 100%)',
          borderLeft: '3px solid #8b5a2b',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.9)',
          color: '#ffffff'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 800,
                color: '#fef3c7',
                letterSpacing: '0.08em',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              REALM NAVIGATOR
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                letterSpacing: '0.04em'
              }}
            >
              {DEVELOPER_PROFILE.name.toUpperCase()}
            </div>
          </div>
          <button
            onClick={() => navigationStore.setMobileMenuOpen(false)}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(180deg, #3d2617 0%, #20130a 100%)',
              border: '1px solid #8b5a2b',
              borderBottom: '3px solid #100a06',
              borderRadius: '4px',
              color: '#fef3c7',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ width: '100%', height: '1px', background: 'rgba(212, 175, 55, 0.25)' }} />

        {/* Chapters Navigation List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {chapters.map((ch) => {
            const isActive = currentChapterIndex === ch.index;
            return (
              <button
                key={ch.index}
                onClick={() => handleSelectChapter(ch.index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(202, 138, 4, 0.35) 0%, rgba(139, 90, 43, 0.2) 100%)'
                    : 'rgba(0, 0, 0, 0.3)',
                  border: isActive ? '1px solid #d4af37' : '1px solid rgba(139, 90, 43, 0.35)',
                  borderLeft: isActive ? '4px solid #f59e0b' : '1px solid rgba(139, 90, 43, 0.35)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
                  {ch.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: isActive ? '#fef3c7' : '#ffffff'
                    }}
                  >
                    {ch.name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {ch.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ width: '100%', height: '1px', background: 'rgba(212, 175, 55, 0.2)' }} />

        {/* Quality Preference */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            RENDER QUALITY
          </div>
          <select
            value={qualityMode}
            onChange={(e) => navigationStore.setQualityMode(e.target.value as QualityMode)}
            style={{
              padding: '0.5rem',
              background: '#150f0b',
              border: '1px solid #8b5a2b',
              borderRadius: '4px',
              color: '#fef3c7',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem'
            }}
          >
            <option value="high">HIGH RES (2x DPR)</option>
            <option value="balanced">BALANCED</option>
            <option value="power-saving">POWER SAVER</option>
          </select>
        </div>

        {/* Links Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <a
              href={DEVELOPER_PROFILE.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '0.45rem',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(139, 90, 43, 0.5)',
                borderRadius: '4px',
                color: '#fef3c7',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                textDecoration: 'none'
              }}
            >
              GITHUB
            </a>
            <a
              href={DEVELOPER_PROFILE.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '0.45rem',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(139, 90, 43, 0.5)',
                borderRadius: '4px',
                color: '#fef3c7',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                textDecoration: 'none'
              }}
            >
              LINKEDIN
            </a>
            <a
              href="https://apexcodenetwork.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '0.45rem',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '4px',
                color: '#60a5fa',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                textDecoration: 'none'
              }}
            >
              APEXCODE
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavDrawer;
