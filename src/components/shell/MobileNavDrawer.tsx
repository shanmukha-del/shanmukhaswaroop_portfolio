import React from 'react';
import { useNavigation } from '../../store/useNavigation';
import { navigationStore, QualityMode } from '../../store/navigationStore';
import { DEVELOPER_PROFILE, WORLDS_DATA } from '../../data/portfolioData';

export const MobileNavDrawer: React.FC = () => {
  const { isMobileMenuOpen, activeRealmIndex, qualityMode } = useNavigation();

  if (!isMobileMenuOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(3, 3, 8, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={() => navigationStore.setMobileMenuOpen(false)}
    >
      <div
        className="glass-panel-elevated"
        style={{
          width: '85%',
          maxWidth: '360px',
          height: '100%',
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
          borderLeft: '1px solid rgba(0, 240, 255, 0.3)',
          background: 'rgba(8, 10, 22, 0.96)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
              REALM NAVIGATION
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {DEVELOPER_PROFILE.name}
            </div>
          </div>
          <button
            onClick={() => navigationStore.setMobileMenuOpen(false)}
            className="btn-runic"
            style={{ padding: '0.4rem 0.6rem', minHeight: '36px' }}
          >
            &#x2715;
          </button>
        </div>

        <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

        {/* Realm Navigation List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Realm 0: Overview */}
          <button
            onClick={() => navigationStore.navigateToRealm(0)}
            className={`btn-runic ${activeRealmIndex === 0 ? 'active' : ''}`}
            style={{
              justifyContent: 'flex-start',
              padding: '0.8rem 1rem',
              borderColor: activeRealmIndex === 0 ? 'var(--color-realm-0)' : 'transparent',
              background: activeRealmIndex === 0 ? 'rgba(138, 43, 226, 0.2)' : 'rgba(14, 16, 34, 0.6)'
            }}
          >
            <span style={{ color: 'var(--color-realm-0)', fontWeight: 700 }}>[0]</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700 }}>Main Voxel Universe</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Overview &amp; Prologue</div>
            </div>
          </button>

          {/* Realms 1 to 6 */}
          {WORLDS_DATA.map((w, idx) => {
            const realmNum = idx + 1;
            const isActive = activeRealmIndex === realmNum;

            return (
              <button
                key={w.id}
                onClick={() => navigationStore.navigateToRealm(realmNum)}
                className={`btn-runic ${isActive ? 'active' : ''}`}
                style={{
                  justifyContent: 'flex-start',
                  padding: '0.8rem 1rem',
                  borderColor: isActive ? w.accentColor : 'transparent',
                  background: isActive ? `${w.themeColor}33` : 'rgba(14, 16, 34, 0.6)'
                }}
              >
                <span style={{ color: w.accentColor, fontWeight: 700 }}>[{realmNum}]</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>{w.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{w.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

        {/* Quick Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            EXPERIENCE PREFERENCES
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={qualityMode}
              onChange={(e) => navigationStore.setQualityMode(e.target.value as QualityMode)}
              style={{
                width: '100%',
                padding: '0.6rem',
                background: 'rgba(14, 16, 34, 0.85)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '4px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem'
              }}
            >
              <option value="high">HIGH RES (2x DPR)</option>
              <option value="balanced">BALANCED</option>
              <option value="power-saving">POWER SAVER</option>
            </select>
          </div>
        </div>

        {/* Social Links */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
            <a
              href={DEVELOPER_PROFILE.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-runic"
              style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem', textDecoration: 'none' }}
            >
              GITHUB
            </a>
            <a
              href={DEVELOPER_PROFILE.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-runic"
              style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem', textDecoration: 'none' }}
            >
              LINKEDIN
            </a>
            <a
              href={`mailto:${DEVELOPER_PROFILE.socialLinks.email}`}
              className="btn-runic"
              style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem', textDecoration: 'none' }}
            >
              EMAIL
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
