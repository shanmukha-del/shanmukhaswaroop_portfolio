import React from 'react';

export interface AdventureCardProps {
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
}

/**
 * AdventureCard - Temple Run-inspired 3D carved wood/stone information card.
 * Enters from above with physical gravity acceleration and staggered impact settling.
 * Features engraved beveled borders, dark extrusion, and tactile hover response.
 */
export const AdventureCard: React.FC<AdventureCardProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = '#ca8a04',
  children,
  icon,
  delay = 0.1,
  onClick,
  clickable = false,
  actionLabel,
  style = {},
  className = ''
}) => {
  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`adventure-3d-card ${className}`}
      style={{
        animationDelay: `${delay}s`,
        cursor: clickable ? 'pointer' : 'default',
        ...style
      }}
    >
      {/* Header Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
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
              textTransform: 'uppercase'
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div style={{ fontSize: '0.86rem', lineHeight: 1.6, color: '#e2e8f0', marginBottom: actionLabel ? '0.8rem' : '0' }}>
        {children}
      </div>

      {/* Interactive Action Footer */}
      {clickable && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.4rem',
            paddingTop: '0.6rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#ca8a04',
            letterSpacing: '0.06em'
          }}
        >
          <span>{actionLabel || 'EXPLORE DETAILS'}</span>
          <span>&#9654;</span>
        </div>
      )}
    </div>
  );
};

export default AdventureCard;
