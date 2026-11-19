import React from 'react';

interface SkyRiftLogoProps {
  compact?: boolean;
  className?: string;
  showTagline?: boolean;
}

/**
 * Vector SVG emblem faithfully reproducing the SKY RIFT brand identity:
 * Monumental faceted serif SKY above RI [QR] FT split by a glowing
 * mountain ridge (Sky Cyan #00F0FF left, Rift Amber #FF5E00 right)
 * with embedded stylized QR matrix and FUTURISTIC HOMES subline.
 */
export const SkyRiftLogo: React.FC<SkyRiftLogoProps> = ({
  compact = false,
  className = '',
  showTagline = true,
}) => {
  const idPrefix = compact ? 'sr-nav' : 'sr-full';

  return (
    <svg
      viewBox={showTagline ? '0 0 340 164' : '0 0 340 132'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="SKY RIFT Futuristic Homes"
    >
      <defs>
        <linearGradient id={`${idPrefix}-metal`} x1="0" y1="0" x2="340" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="45%" stopColor="#D1D5DB" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        <linearGradient id={`${idPrefix}-ridge`} x1="90" y1="74" x2="250" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="46%" stopColor="#A5F3FC" />
          <stop offset="56%" stopColor="#FFB07C" />
          <stop offset="100%" stopColor="#FF5E00" />
        </linearGradient>

        <linearGradient id={`${idPrefix}-stroke-glow`} x1="20" y1="20" x2="320" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#D1D5DB" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FF5E00" stopOpacity="0.65" />
        </linearGradient>

        <filter id={`${idPrefix}-glow-cyan`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Top Word: SKY */}
      <g>
        <text
          x="170"
          y="58"
          textAnchor="middle"
          fill={`url(#${idPrefix}-metal)`}
          stroke={`url(#${idPrefix}-stroke-glow)`}
          strokeWidth="0.9"
          fontFamily="Cinzel, Georgia, serif"
          fontWeight="800"
          fontSize="66"
          letterSpacing="12"
        >
          SKY
        </text>
      </g>

      {/* Mountain Silhouette Cleaving SKY & RIFT */}
      <g filter={`url(#${idPrefix}-glow-cyan)`}>
        {/* Left Cyan Mountain Peak */}
        <path
          d="M94 82 L118 62 L127 68 L156 43 L169 57 L160 66 L151 56 L133 74 L123 68 L108 81 Z"
          fill="#00F0FF"
          fillOpacity="0.22"
          stroke="#00F0FF"
          strokeWidth="1.4"
          strokeLinejoin="miter"
        />
        {/* Central Sharp Peak Highlight */}
        <path
          d="M156 43 L172 64 L161 73 L156 59 L144 74"
          fill="none"
          stroke="#E0F7FA"
          strokeWidth="1.3"
        />
        {/* Right Amber Mountain Ridge */}
        <path
          d="M170 62 L187 51 L202 65 L211 58 L244 82 L226 78 L212 68 L199 74 L186 60 L175 71 Z"
          fill="#FF5E00"
          fillOpacity="0.26"
          stroke="#FF5E00"
          strokeWidth="1.4"
          strokeLinejoin="miter"
        />
        {/* Rift Horizon Line */}
        <path
          d="M84 82 L114 75 L156 43 L187 51 L246 82"
          fill="none"
          stroke={`url(#${idPrefix}-ridge)`}
          strokeWidth="1.8"
          strokeLinecap="square"
        />
      </g>

      {/* Bottom Row: R I  [QR]  F T */}
      <g>
        <text
          x="64"
          y="121"
          textAnchor="middle"
          fill={`url(#${idPrefix}-metal)`}
          stroke="rgba(0,240,255,0.42)"
          strokeWidth="0.7"
          fontFamily="Cinzel, Georgia, serif"
          fontWeight="800"
          fontSize="58"
        >
          R
        </text>
        <text
          x="114"
          y="119"
          textAnchor="middle"
          fill={`url(#${idPrefix}-metal)`}
          stroke="rgba(0,240,255,0.42)"
          strokeWidth="0.7"
          fontFamily="Cinzel, Georgia, serif"
          fontWeight="700"
          fontSize="44"
        >
          I
        </text>

        {/* Stylized Embedded QR Code Matrix */}
        <g transform="translate(145, 78)">
          <rect
            x="-2"
            y="-2"
            width="48"
            height="48"
            rx="2"
            fill="#0B0E14"
            fillOpacity="0.88"
            stroke="rgba(209,213,219,0.35)"
            strokeWidth="0.9"
          />
          {/* Top-left finder */}
          <rect x="2" y="2" width="12" height="12" stroke="#F8FAFC" strokeWidth="2.1" fill="none" />
          <rect x="5.5" y="5.5" width="5" height="5" fill="#00F0FF" />
          {/* Top-right finder */}
          <rect x="30" y="2" width="12" height="12" stroke="#F8FAFC" strokeWidth="2.1" fill="none" />
          <rect x="33.5" y="5.5" width="5" height="5" fill="#FF5E00" />
          {/* Bottom-left finder */}
          <rect x="2" y="30" width="12" height="12" stroke="#F8FAFC" strokeWidth="2.1" fill="none" />
          <rect x="5.5" y="33.5" width="5" height="5" fill="#F8FAFC" />
          {/* Precision data modules */}
          <rect x="18" y="3" width="3" height="3" fill="#D1D5DB" />
          <rect x="23" y="3" width="3" height="6" fill="#F8FAFC" />
          <rect x="18" y="9" width="3" height="6" fill="#00F0FF" />
          <rect x="23" y="12" width="4" height="3" fill="#D1D5DB" />
          <rect x="3" y="18" width="6" height="3" fill="#D1D5DB" />
          <rect x="12" y="18" width="6" height="3" fill="#F8FAFC" />
          <rect x="21" y="18" width="5" height="5" fill="#FF5E00" />
          <rect x="29" y="18" width="4" height="3" fill="#F8FAFC" />
          <rect x="36" y="18" width="6" height="3" fill="#D1D5DB" />
          <rect x="4" y="23" width="3" height="4" fill="#F8FAFC" />
          <rect x="10" y="23" width="5" height="4" fill="#00F0FF" />
          <rect x="18" y="25" width="3" height="6" fill="#D1D5DB" />
          <rect x="25" y="25" width="6" height="3" fill="#F8FAFC" />
          <rect x="34" y="24" width="3" height="6" fill="#D1D5DB" />
          <rect x="39" y="24" width="3" height="3" fill="#FF5E00" />
          <rect x="18" y="34" width="4" height="4" fill="#F8FAFC" />
          <rect x="24" y="31" width="3" height="6" fill="#D1D5DB" />
          <rect x="29" y="33" width="5" height="5" fill="#00F0FF" />
          <rect x="37" y="32" width="5" height="3" fill="#F8FAFC" />
          <rect x="22" y="39" width="6" height="3" fill="#F8FAFC" />
          <rect x="31" y="39" width="4" height="3" fill="#D1D5DB" />
          <rect x="38" y="38" width="4" height="4" fill="#FF5E00" />
        </g>

        <text
          x="222"
          y="119"
          textAnchor="middle"
          fill={`url(#${idPrefix}-metal)`}
          stroke="rgba(255,94,0,0.42)"
          strokeWidth="0.7"
          fontFamily="Cinzel, Georgia, serif"
          fontWeight="700"
          fontSize="40"
        >
          F
        </text>
        <text
          x="276"
          y="121"
          textAnchor="middle"
          fill={`url(#${idPrefix}-metal)`}
          stroke="rgba(255,94,0,0.48)"
          strokeWidth="0.7"
          fontFamily="Cinzel, Georgia, serif"
          fontWeight="800"
          fontSize="58"
        >
          T
        </text>
      </g>

      {showTagline && (
        <text
          x="170"
          y="153"
          textAnchor="middle"
          fill="#D1D5DB"
          fontFamily="Manrope, sans-serif"
          fontWeight="600"
          fontSize="16.5"
          letterSpacing="6.5"
        >
          FUTURISTIC HOMES
        </text>
      )}
    </svg>
  );
};
