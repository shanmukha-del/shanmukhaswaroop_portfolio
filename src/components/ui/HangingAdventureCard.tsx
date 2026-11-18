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
 * Features:
 * - Physical pendulum gravity entrance
 * - Real-time cursor-responsive swinging (swings gently as mouse moves across screen)
 * - Proximity-weighted impulse with spring-damper settling (max ±4.0°)
 * - Native scroll-induced inertia
 * - Zero CPU overhead when settled
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
  const cardAssemblyRef = useRef<HTMLDivElement | null>(null);

  const [inView, setInView] = useState(false);
  const inViewRef = useRef(false);

  // Physics simulation state for cursor & scroll sway
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const scrollSwayRef = useRef(0);
  const lastMouseXRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isSimulatingRef = useRef(false);

  // IntersectionObserver to only simulate and render when visible in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setInView(visible);
        inViewRef.current = visible;
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Spring-damper physics loop
  const startPhysicsLoop = () => {
    if (isSimulatingRef.current) return;
    isSimulatingRef.current = true;

    const tick = () => {
      // Spring constant & natural damping for realistic heavy object
      const SPRING_K = 0.08;
      const DAMPING = 0.92;

      velocityRef.current += (0 - angleRef.current) * SPRING_K;
      velocityRef.current *= DAMPING;
      angleRef.current += velocityRef.current;

      // Bound to ±4.0 degrees max for controlled, authentic swing
      angleRef.current = Math.max(-4.0, Math.min(4.0, angleRef.current));

      const totalAngle = Math.max(-4.8, Math.min(4.8, angleRef.current + scrollSwayRef.current));

      if (cardAssemblyRef.current) {
        cardAssemblyRef.current.style.transform = `rotateZ(${totalAngle.toFixed(2)}deg)`;
      }

      // Check if settled (both angle and velocity near zero)
      if (Math.abs(angleRef.current) > 0.02 || Math.abs(velocityRef.current) > 0.01) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        angleRef.current = 0;
        velocityRef.current = 0;
        isSimulatingRef.current = false;
        if (cardAssemblyRef.current) {
          cardAssemblyRef.current.style.transform = `rotateZ(${scrollSwayRef.current.toFixed(2)}deg)`;
        }
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
  };

  // Cursor-responsive sway on mousemove
  useEffect(() => {
    // Only enable mouse physics on fine pointer desktop devices
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!inViewRef.current || !containerRef.current) return;

      if (lastMouseXRef.current === null) {
        lastMouseXRef.current = e.clientX;
        return;
      }

      const dx = e.clientX - lastMouseXRef.current;
      lastMouseXRef.current = e.clientX;

      if (Math.abs(dx) < 0.5) return;

      // Proximity-weighted impulse: closer cards react more noticeably
      const rect = containerRef.current.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cardCenterX, e.clientY - cardCenterY);

      // Effect radius of 650px
      const proximity = Math.max(0, 1 - dist / 650);

      if (proximity > 0.05) {
        // Natural physical drag: moving right imparts leftwards impulse on trailing suspended body
        const impulse = (-dx * 0.08) * proximity * swayIntensity;
        velocityRef.current += impulse;
        velocityRef.current = Math.max(-5.5, Math.min(5.5, velocityRef.current));
        startPhysicsLoop();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [swayIntensity]);

  // Scroll-induced inertial sway
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    let settleTimeout: any = null;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const velocity = currentY - lastScrollY;
          lastScrollY = currentY;

          // Bounded inertial sway angle (max ±2.0 degrees)
          const angle = Math.max(-2.0, Math.min(2.0, velocity * 0.06 * swayIntensity));
          scrollSwayRef.current = angle;

          if (cardAssemblyRef.current && !isSimulatingRef.current) {
            cardAssemblyRef.current.style.transform = `rotateZ(${angle.toFixed(2)}deg)`;
          }

          clearTimeout(settleTimeout);
          settleTimeout = setTimeout(() => {
            scrollSwayRef.current = 0;
            if (cardAssemblyRef.current && !isSimulatingRef.current) {
              cardAssemblyRef.current.style.transform = 'rotateZ(0deg)';
            }
          }, 140);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(settleTimeout);
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
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(-24px)',
        transition: 'opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transitionDelay: `${delay}s`,
        ...style
      }}
    >
      {/* 1. Stationary Overhead Support Beam with Heavy Brass Bolts */}
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
          zIndex: 3
        }}
      >
        {/* Left Overhead Anchor Eyelet */}
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
        {/* Right Overhead Anchor Eyelet */}
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

      {/* 2. Coherent Suspended Assembly (Chains + Shackle Brackets + 3D Card Body) */}
      {/* transformOrigin is at the exact top suspension pivot (0px) */}
      <div
        ref={cardAssemblyRef}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transformOrigin: '50% 0px',
          willChange: 'transform',
          transition: isSimulatingRef.current ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        {/* Twin Forged Metal Chains */}
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
          {/* Left Interlocking Chain */}
          <svg width="8" height="42" viewBox="0 0 8 42" fill="none" style={{ filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.8))' }}>
            <rect x="1" y="0" width="6" height="12" rx="3" stroke="#a17b4a" strokeWidth="2" fill="#2b1d14" />
            <rect x="2" y="8" width="4" height="12" rx="2" stroke="#d4af37" strokeWidth="1.5" fill="#1f150e" />
            <rect x="1" y="16" width="6" height="12" rx="3" stroke="#a17b4a" strokeWidth="2" fill="#2b1d14" />
            <rect x="2" y="24" width="4" height="12" rx="2" stroke="#d4af37" strokeWidth="1.5" fill="#1f150e" />
            <circle cx="4" cy="38" r="3" fill="#d4af37" stroke="#5c4033" strokeWidth="1" />
          </svg>

          {/* Right Interlocking Chain */}
          <svg width="8" height="42" viewBox="0 0 8 42" fill="none" style={{ filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.8))' }}>
            <rect x="1" y="0" width="6" height="12" rx="3" stroke="#a17b4a" strokeWidth="2" fill="#2b1d14" />
            <rect x="2" y="8" width="4" height="12" rx="2" stroke="#d4af37" strokeWidth="1.5" fill="#1f150e" />
            <rect x="1" y="16" width="6" height="12" rx="3" stroke="#a17b4a" strokeWidth="2" fill="#2b1d14" />
            <rect x="2" y="24" width="4" height="12" rx="2" stroke="#d4af37" strokeWidth="1.5" fill="#1f150e" />
            <circle cx="4" cy="38" r="3" fill="#d4af37" stroke="#5c4033" strokeWidth="1" />
          </svg>
        </div>

        {/* 3D Carved Wood / Stone Card Body */}
        <div
          onClick={clickable ? onClick : undefined}
          className="adventure-3d-card clickable-card"
          style={{
            width: '100%',
            marginTop: '-6px',
            cursor: clickable ? 'pointer' : 'default',
            position: 'relative'
          }}
        >
          {/* Top Fastening Eyelets */}
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
    </div>
  );
};

export default HangingAdventureCard;
