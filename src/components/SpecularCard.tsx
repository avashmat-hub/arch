import React, { useRef } from 'react';

interface SpecularCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

/**
 * Architectural Mountain Slate (#2F3942) surface card with dynamic
 * mouse-tracked Specular Border Glow along hairline borders.
 */
export const SpecularCard: React.FC<SpecularCardProps> = ({
  children,
  className = '',
  onClick,
  active = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spec-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--spec-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`specular-card rounded-xl ${
        active ? 'border-[#00F0FF]/60 bg-[#2F3942]/65' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
