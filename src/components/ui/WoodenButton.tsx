import React from 'react';

export interface WoodenButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: string;
  delay?: number; // Entrance delay in seconds
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

/**
 * WoodenButton - Temple Run-inspired 3D wooden barricade control.
 * Features physical drop-down entrance with controlled bounce impact,
 * thick timber grain geometry, metallic corner rivets, and tactile click response.
 */
export const WoodenButton: React.FC<WoodenButtonProps> = ({
  children,
  onClick,
  icon,
  delay = 0,
  className = '',
  style = {},
  title
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`wooden-plank-button ${className}`}
      style={{
        animationDelay: `${delay}s`,
        ...style
      }}
    >
      {icon && <span style={{ fontSize: '1.1em', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default WoodenButton;
