import React, { useEffect, useRef, useState } from 'react';

export interface HangingAdventureCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  icon?: string;
  delay?: number;
  onClick?: () => void;
  clickable?: boolean;
  actionLabel?: string;
  style?: React.CSSProperties;
  className?: string;
  swayIntensity?: number; // 0 to 1
}

/**
 * HangingAdventureCard - Heavy 3D Temple Run carved wood & stone card
 * suspended by twin forged iron/brass chains from an overhead mounting beam.
 * Features physical pendulum gravity entrance, subtle inertial scroll sway,
 * authentic metal chain links, and tactile hover response.
 */
export const HangingAdventureCard: React.FC<HangingAdventureCardProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = '#d4af37',
  children,
  icon,
  delay = 0.1,
  onClick,
  clickable = false,
  actionLabel,
  style = {},
  className = '',
  swayIntensity = 1
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [scrollSway, setScrollSway] = useState(0);

  // IntersectionObserver to trigger physical drop-in when section enters viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Subtle inertial sway reacting to native page scroll velocity
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    let timeoutId: any = null;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const velocity = currentY - lastScrollY;
          lastScrollY = currentY;

          // Bounded inertial sway angle (max ±2.2 degrees)
          const angle = Math.max(-2.2, Math.min(2.2, velocity * 0.08 * swayIntensity));
          setScrollSway(angle);

          // Spring damp back to 0 when scroll stops
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setScrollSway(0);
          }, 120);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [swayIntensity]);

  return (
    <div
      ref={containerRef}
      className={`hanging-card-wrapper ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        transformOrigin: '50% 0px',
        transform: inView ? `rotateZ(${scrollSway}deg)` : 'translateY(-30px)',
        opacity: inView ? 1 : 0,
        transition: inView
          ? 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease'
          : 'none',
        animationDelay: `${delay}s`,
        ...style
      }}
    >
      {/* 1. Overhead Support Beam with Brass Mounting Studs */}
      <div
        className="hanging-overhead-beam"
        style={{
          width: '92%',
          maxWidth: '380px',
          height: '10px',
          background: 'linear-gradient(180deg, #3d2617 0%, #1a0f08 100%)',
          border: '1px solid #8b5a2b',
          borderBottom: '2px solid #0d0804',
          borderRadius: '3px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 28px',
          zIndex: 2
        }}
      >
        {/* Left Mounting Bracket & Shackle */}
        <div
          style={{
            width: '10px',
            height: '14px',
            background: 'linear-gradient(180deg, #5c4033 0%, #2b1d14 100%)',
            border: '1px solid #d4af37',
            borderRadius: '2px',
            marginTop: '-2px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}
        />
        {/* Right Mounting Bracket & Shackle */}
        <div
          style={{
            width: '10px',
            height: '14px',
            background: 'linear-gradient(180deg, #5c4033 0%, #2b1d14 100%)',
            border: '1px solid #d4af37',
            borderRadius: '2px',
            marginTop: '-2px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}
        />
      </div>

      {/* 2. Twin Forged Metal Chains Connecting Beam to Card */}
      <div
        style={{
          width: '92%',
          maxWidth: '380px',
          height: '42px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 30px',
          pointerEvents: 'none'
        }}
      >
        {/* Left Chain SVG */}
        <svg width="8" height="42" viewBox="0 0 8 42" fill="none" style={{ filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.8))' }}>
          {/* Link 1 */}
          <rect x="1" y="0" width="6" height="12" rx="3" stroke="#a17b4a" strokeWidth="2" fill="#2b1d14" />
          {/* Link 2 */}
          <rect x="2" y="8" width="4" height="12" rx="2" stroke="#d4af37" strokeWidth="1.5" fill="#1f150e" />
          {/* Link 3 */}
          <rect x="1" y="16" width="6" height="12" rx="3" stroke="#a17b4a" strokeWidth="2" fill="#2b1d14" />
          {/* Link 4 */}
          <rect x="2" y="24" width="4" height="12" rx="2" stroke="#d4af37" strokeWidth="1.5" fill="#1f150e" />
          {/* Bottom Shackle Pin */}
          <circle cx="4" cy="38" r="3" fill="#d4af37" stroke="#5c4033" strokeWidth="1" />
        </svg>

        {/* Right Chain SVG */}
        <svg width="8" height="42" viewBox="0 0 8 42" fill="none" style={{ filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.8))' }}>
          {/* Link 1 */}
          <rect x="1" y="0" width="6" height="12" rx="3" stroke="#a17b4a" strokeWidth="2" fill="#2b1d14" />
          {/* Link 2 */}
          <rect x="2" y="8" width="4" height="12" rx="2" stroke="#d4af37" strokeWidth="1.5" fill="#1f150e" />
          {/* Link 3 */}
          <rect x="1" y="16" width="6" height="12" rx="3" stroke="#a17b4a" strokeWidth="2" fill="#2b1d14" />
          {/* Link 4 */}
          <rect x="2" y="24" width="4" height="12" rx="2" stroke="#d4af37" strokeWidth="1.5" fill="#1f150e" />
          {/* Bottom Shackle Pin */}
          <circle cx="4" cy="38" r="3" fill="#d4af37" stroke="#5c4033" strokeWidth="1" />
        </svg>
      </div>

      {/* 3. 3D Carved Wood / Stone Card Body */}
      <div
        onClick={clickable ? onClick : undefined}
        className="adventure-3d-card"
        style={{
          width: '100%',
          marginTop: '-6px',
          cursor: clickable ? 'pointer' : 'default',
          position: 'relative'
        }}
      >
        {/* Top Edge Fastening Eyelet Plates */}
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            left: '26px',
            width: '14px',
            height: '7px',
            background: 'linear-gradient(180deg, #d4af37 0%, #8b5a2b 100%)',
            borderRadius: '2px',
            border: '1px solid #1a0f08',
            boxShadow: '0 2px 4px rgba(0,0,0,0.7)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            right: '26px',
            width: '14px',
            height: '7px',
            background: 'linear-gradient(180deg, #d4af37 0%, #8b5a2b 100%)',
            borderRadius: '2px',
            border: '1px solid #1a0f08',
            boxShadow: '0 2px 4px rgba(0,0,0,0.7)'
          }}
        />

        {/* Card Header Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.6rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {icon && (
              <span style={{ fontSize: '1.3rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
                {icon}
              </span>
            )}
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: '#fef3c7',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                }}
              >
                {title}
              </h3>
              {subtitle && (
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.04em'
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {badge && (
            <span
              style={{
                padding: '0.2rem 0.55rem',
                background: 'rgba(0, 0, 0, 0.5)',
                border: `1px solid ${badgeColor}`,
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: badgeColor,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
              }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Card Content Text */}
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.86rem',
            lineHeight: 1.6,
            color: '#cbd5e1',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
          }}
        >
          {children}
        </div>

        {/* Clickable Action Callout */}
        {clickable && actionLabel && (
          <div
            style={{
              marginTop: '0.85rem',
              paddingTop: '0.6rem',
              borderTop: '1px solid rgba(212, 175, 55, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: '#fef3c7',
                fontWeight: 700,
                letterSpacing: '0.06em'
              }}
            >
              {actionLabel}
            </span>
            <span style={{ color: '#d4af37', fontSize: '0.9rem' }}>➔</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HangingAdventureCard;
