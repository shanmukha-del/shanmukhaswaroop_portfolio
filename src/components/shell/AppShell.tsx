import React from 'react';
import { useNavigation } from '../../store/useNavigation';
import { navigationStore } from '../../store/navigationStore';
import { DEVELOPER_PROFILE } from '../../data/portfolioData';
import { MobileNavDrawer } from './MobileNavDrawer';

interface AppShellProps {
  children?: React.ReactNode;
}

/**
 * AppShell - Sleek, non-intrusive fixed navigation header and mobile drawer.
 * Subordinate to the background cinematic video.
 * Completely hidden on Chapter 0 (Opening Cinematic).
 * Smoothly scrolls document to the selected chapter section.
 */
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { isOpeningCinematicActive, isMinimapOpen, currentChapterIndex, isMobileMenuOpen, deviceType } = useNavigation();

  const navLinks = [
    { label: 'HOME', chapter: 1 },
    { label: 'ABOUT', chapter: 2 },
    { label: 'SKILLS', chapter: 3 },
    { label: 'PROJECTS', chapter: 4 },
    { label: 'HACKATHONS', chapter: 5 },
    { label: 'ACHIEVEMENTS', chapter: 6 },
    { label: 'FINALE', chapter: 7 }
  ];

  const handleNavClick = (chapter: number) => {
    navigationStore.navigateToChapter(chapter, 0);
    const targetId = `chapter-${chapter}`;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isVisible = !isOpeningCinematicActive && currentChapterIndex > 0;

  return (
    <>
      {/* Top Fixed Navigation Bar */}
      {isVisible && (
        <header
          style={{
            position: 'fixed',
            top: deviceType === 'mobile' ? '0.75rem' : '1rem',
            left: deviceType === 'mobile' ? '0.75rem' : '1.5rem',
            right: deviceType === 'mobile' ? '0.75rem' : '1.5rem',
            height: deviceType === 'mobile' ? '46px' : '52px',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.2rem',
            background: 'rgba(15, 12, 10, 0.82)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(139, 90, 43, 0.4)',
            borderRadius: '6px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
            pointerEvents: 'auto',
            transition: 'opacity 0.3s ease, transform 0.3s ease'
          }}
        >
          {/* Left: Brand Wordmark */}
          <div
            onClick={() => handleNavClick(1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🏛️</span>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: deviceType === 'mobile' ? '0.82rem' : '0.92rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: '#fef3c7',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              BEYOND THE BLOCKS
            </div>
            {deviceType !== 'mobile' && (
              <>
                <span style={{ color: 'rgba(255, 255, 255, 0.25)', fontSize: '0.8rem' }}>•</span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.06em'
                  }}
                >
                  {DEVELOPER_PROFILE.name.toUpperCase()}
                </div>
              </>
            )}
          </div>

          {/* Center: Desktop Navigation Links */}
          {deviceType !== 'mobile' && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {navLinks.map((link) => {
                const isActive = currentChapterIndex === link.chapter;
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.chapter)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      background: isActive ? 'rgba(139, 90, 43, 0.35)' : 'transparent',
                      border: isActive ? '1px solid #d4af37' : '1px solid transparent',
                      borderRadius: '4px',
                      color: isActive ? '#fef3c7' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right: Minimap Button & Hamburger Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => navigationStore.toggleMinimap()}
              style={{
                padding: '0.35rem 0.75rem',
                background: isMinimapOpen ? 'rgba(202, 138, 4, 0.35)' : 'rgba(255, 255, 255, 0.06)',
                border: isMinimapOpen ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '4px',
                color: '#fef3c7',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🗺️</span>
              <span>{isMinimapOpen ? 'CLOSE MAP' : 'MINIMAP (M)'}</span>
            </button>

            {/* Mobile Hamburger Button */}
            {deviceType === 'mobile' && (
              <button
                onClick={() => navigationStore.toggleMobileMenu()}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isMobileMenuOpen ? 'rgba(202, 138, 4, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
                title="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>
            )}
          </div>
        </header>
      )}

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer />

      {/* Main Document Flow Content */}
      {children}
    </>
  );
};

export default AppShell;
