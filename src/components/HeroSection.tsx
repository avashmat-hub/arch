import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, Sun, Moon, Crosshair } from 'lucide-react';
import type { LightingMode } from './Navbar';

interface HeroSectionProps {
  lightingMode: LightingMode;
  onToggleLighting: (mode: LightingMode) => void;
}

/**
 * Section 1 — Hero: «АРХИТЕКТУРА НА КРАЮ СТИХИИ»
 * Features:
 * - Fullscreen photograph of SKY RIFT mountain capsule cluster
 * - Spring-interpolated requestAnimationFrame Spotlight Reveal mask (420px radius)
 * - Cyan (#00F0FF) CAD coordinate grid + reticle around the spotlight beam
 * - Interactive Day / Twilight atmosphere transformation with warm Rift Amber (#FF5E00) interior glows
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  lightingMode,
  onToggleLighting,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const cyanGridRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState({ lat: '43°40′18″N', lon: '40°15′42″E', alt: 1840 });
  const [imageError, setImageError] = useState(false);

  // Spring physics spotlight state stored in refs for zero React re-renders at 60 FPS
  const targetRef = useRef({ x: 0.62, y: 0.48 });
  const currentRef = useRef({ x: 0.62, y: 0.48 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const isPointerActiveRef = useRef(false);
  const lastCoordsUpdateRef = useRef(0);

  useEffect(() => {
    let rafId = 0;
    let time = 0;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stiffness = 0.095;
    const damping = 0.72;

    const tick = () => {
      time += 0.014;
      const el = sectionRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const w = Math.max(rect.width, 1);
        const h = Math.max(rect.height, 1);

        // Gentle autonomous architectural sweep before first pointer interaction or on touch devices
        if (!isPointerActiveRef.current && !prefersReduced) {
          targetRef.current.x = 0.58 + Math.sin(time * 0.7) * 0.16;
          targetRef.current.y = 0.48 + Math.cos(time * 0.55) * 0.1;
        }

        // Spring integration
        const dx = targetRef.current.x - currentRef.current.x;
        const dy = targetRef.current.y - currentRef.current.y;
        velocityRef.current.x = (velocityRef.current.x + dx * stiffness) * damping;
        velocityRef.current.y = (velocityRef.current.y + dy * stiffness) * damping;
        currentRef.current.x += velocityRef.current.x;
        currentRef.current.y += velocityRef.current.y;

        const px = currentRef.current.x * w;
        const py = currentRef.current.y * h;
        const radius = w < 640 ? 250 : 420;

        if (curtainRef.current) {
          const maskValue = `radial-gradient(circle ${radius}px at ${px.toFixed(1)}px ${py.toFixed(
            1
          )}px, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.16) 42%, rgba(0,0,0,0.88) 76%, rgba(0,0,0,0.96) 100%)`;
          curtainRef.current.style.maskImage = maskValue;
          curtainRef.current.style.webkitMaskImage = maskValue;
        }

        if (cyanGridRef.current) {
          const gridMask = `radial-gradient(circle ${Math.round(radius * 0.92)}px at ${px.toFixed(
            1
          )}px ${py.toFixed(1)}px, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)`;
          cyanGridRef.current.style.maskImage = gridMask;
          cyanGridRef.current.style.webkitMaskImage = gridMask;
        }

        if (reticleRef.current) {
          reticleRef.current.style.transform = `translate3d(${(px - 24).toFixed(1)}px, ${(
            py - 24
          ).toFixed(1)}px, 0)`;
        }

        const now = performance.now();
        if (now - lastCoordsUpdateRef.current > 180) {
          lastCoordsUpdateRef.current = now;
          const latSec = Math.round(10 + currentRef.current.y * 44);
          const lonSec = Math.round(18 + currentRef.current.x * 40);
          const alt = Math.round(1720 + (1 - currentRef.current.y) * 290);
          setCoords({
            lat: `43°40′${String(latSec).padStart(2, '0')}″N`,
            lon: `40°15′${String(lonSec).padStart(2, '0')}″E`,
            alt,
          });
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const handleScrollMobile = () => {
      if (window.innerWidth < 1024 && !isPointerActiveRef.current) {
        const progress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
        targetRef.current.x = 0.45 + Math.sin(progress * Math.PI) * 0.22;
        targetRef.current.y = 0.38 + progress * 0.25;
      }
    };

    window.addEventListener('scroll', handleScrollMobile, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScrollMobile);
    };
  }, []);

  const updatePointer = (clientX: number, clientY: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    isPointerActiveRef.current = true;
    targetRef.current.x = Math.min(Math.max((clientX - rect.left) / rect.width, 0.04), 0.96);
    targetRef.current.y = Math.min(Math.max((clientY - rect.top) / rect.height, 0.06), 0.94);
  };

  const handleScrollTo3D = () => {
    const el = document.querySelector('#configurator');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isTwilight = lightingMode === 'twilight';

  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={(e) => updatePointer(e.clientX, e.clientY)}
      onTouchMove={(e) => {
        if (e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchStart={(e) => {
        if (e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }}
      className="relative min-h-screen w-full overflow-hidden flex items-end lg:items-center pt-24 pb-16 lg:pb-20 bg-[#0B0E14] select-none"
    >
      {/* Layer 1: Full-Color High-Resolution Mountain Cluster Photograph */}
      <div className="absolute inset-0 z-0">
        {!imageError ? (
          <img
            src="/assets/aistudio/hero_section_background_01865031.JPG"
            alt="Кластер футуристичных модульных резиденций SKY RIFT на стальных ферменных опорах над горным ущельем"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover object-center transition-all duration-700 will-change-transform ${
              isTwilight
                ? 'brightness-[0.42] contrast-[1.22] saturate-[0.75] hue-rotate-[12deg]'
                : 'brightness-[0.98] contrast-[1.06] saturate-[1.08]'
            }`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#16202B] via-[#0B0E14] to-[#1D2832]" />
        )}

        {/* Twilight Atmospheric Haze & Glowing Capsule Interiors + Cyan Cliff Telemetry */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
            isTwilight ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Deep obsidian alpine twilight wash */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0B0E14]/90 via-[#0B1626]/55 to-[#0B0E14]/75" />

          {/* Calibrated Rift Amber (#FF5E00) warm bedroom glows matching the capsule windows */}
          <div
            className="absolute inset-0 mix-blend-screen"
            style={{
              background: `
                radial-gradient(ellipse 14% 11% at 59% 47%, rgba(255, 94, 0, 0.85) 0%, rgba(255, 138, 43, 0.38) 45%, transparent 78%),
                radial-gradient(ellipse 9% 8% at 75.5% 38.5%, rgba(255, 94, 0, 0.78) 0%, rgba(255, 125, 30, 0.3) 48%, transparent 78%),
                radial-gradient(ellipse 10% 8% at 27% 31%, rgba(255, 94, 0, 0.72) 0%, rgba(255, 130, 35, 0.26) 48%, transparent 78%),
                radial-gradient(ellipse 6% 5% at 71.5% 29.5%, rgba(255, 94, 0, 0.6) 0%, transparent 75%),
                radial-gradient(ellipse 5% 4.5% at 60% 30%, rgba(255, 94, 0, 0.5) 0%, transparent 75%)
              `,
            }}
          />

          {/* Cyan Engineering Telemetry Contours along Cliff & Truss Piers */}
          <svg
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full opacity-75"
            aria-hidden="true"
          >
            {/* Foreground capsule X-braced steel pier telemetry */}
            <g stroke="#00F0FF" strokeWidth="1.4" fill="none" strokeOpacity="0.72">
              <line x1="1152" y1="628" x2="1152" y2="875" />
              <line x1="1220" y1="628" x2="1220" y2="858" />
              <line x1="1152" y1="650" x2="1220" y2="835" strokeDasharray="6 4" />
              <line x1="1220" y1="650" x2="1152" y2="835" strokeDasharray="6 4" />
              {/* Anchor points */}
              <circle cx="1152" cy="875" r="7" fill="#00F0FF" fillOpacity="0.25" />
              <circle cx="1220" cy="858" r="7" fill="#00F0FF" fillOpacity="0.25" />
              {/* Right capsule truss pier */}
              <line x1="1475" y1="490" x2="1475" y2="635" />
              <line x1="1526" y1="485" x2="1526" y2="625" />
              <line x1="1475" y1="500" x2="1526" y2="615" strokeDasharray="4 4" />
              <line x1="1526" y1="500" x2="1475" y2="615" strokeDasharray="4 4" />
              {/* Cliff edge elevation contour */}
              <path
                d="M1260 885 Q1380 790 1480 655 T1650 560"
                strokeOpacity="0.45"
                strokeDasharray="10 6"
              />
              <path
                d="M780 620 L1145 628 L1340 598"
                stroke="#FF5E00"
                strokeOpacity="0.65"
                strokeWidth="1.2"
              />
            </g>
            {/* Architectural elevation markers */}
            <g fill="#00F0FF" fontFamily="JetBrains Mono, monospace" fontSize="13">
              <text x="1236" y="758">+1 842 м · Уклон 54°</text>
              <text x="1542" y="562">X-Ферма С345 · 4.8 м</text>
              <text x="1080" y="388" fill="#FF5E00">270° Панорама · +22.5°C</text>
            </g>
          </svg>
        </div>
      </div>

      {/* Layer 2: Deep Obsidian #0B0E14 Spotlight Reveal Curtain (~88% darkening + CAD blueprint lines) */}
      <div
        ref={curtainRef}
        className="absolute inset-0 z-10 pointer-events-none bg-[#0B0E14]/[0.88] cad-grid-bg"
        aria-hidden="true"
      >
        {/* Subtle Architectural CAD Section Lines etched on the dark veil */}
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full opacity-25"
        >
          <g stroke="#D1D5DB" strokeWidth="0.6" fill="none">
            <line x1="0" y1="180" x2="1440" y2="180" strokeDasharray="4 10" />
            <line x1="0" y1="720" x2="1440" y2="720" strokeDasharray="4 10" />
            <line x1="160" y1="0" x2="160" y2="900" strokeOpacity="0.4" />
            <line x1="1280" y1="0" x2="1280" y2="900" strokeOpacity="0.4" />
            <path d="M980 260 L1320 260 L1320 560" strokeOpacity="0.5" />
            <circle cx="960" cy="440" r="240" strokeDasharray="2 8" strokeOpacity="0.35" />
          </g>
        </svg>
      </div>

      {/* Layer 3: Cursor-Illuminated Sky Cyan (#00F0FF) Coordinate Grid */}
      <div
        ref={cyanGridRef}
        className="absolute inset-0 z-10 pointer-events-none cad-cursor-grid opacity-85"
        aria-hidden="true"
      />

      {/* Layer 4: Precision Architectural Reticle Following Spotlight Beam */}
      <div
        ref={reticleRef}
        className="hidden md:flex absolute top-0 left-0 z-20 pointer-events-none items-center justify-center w-12 h-12 will-change-transform"
        aria-hidden="true"
      >
        <div className="relative w-12 h-12">
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-[#00F0FF]/80" />
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-[#00F0FF]/80" />
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-3 bg-[#00F0FF]/80" />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 h-[1px] w-3 bg-[#00F0FF]/80" />
          <div className="absolute inset-2.5 rounded-full border border-[#00F0FF]/45" />
          <div className="absolute left-14 top-1/2 -translate-y-1/2 font-mono text-[10px] leading-tight text-[#00F0FF]/90 whitespace-nowrap bg-[#0B0E14]/70 px-2 py-1 rounded border border-[#00F0FF]/25 tabular-nums">
            <div>{coords.lat} · {coords.lon}</div>
            <div className="text-[#D1D5DB]/75">Высота: {coords.alt} м</div>
          </div>
        </div>
      </div>

      {/* Measured Readability Scrim on Left for Hero Offer Contrast */}
      <div
        className="absolute inset-y-0 left-0 w-full lg:w-[64%] z-20 pointer-events-none bg-gradient-to-r from-[#0B0E14]/92 via-[#0B0E14]/65 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-36 z-20 pointer-events-none bg-gradient-to-t from-[#0B0E14] to-transparent"
        aria-hidden="true"
      />

      {/* Layer 5: Foreground Editorial Content */}
      <div className="relative z-30 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-8 lg:pt-12">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 text-xs sm:text-sm font-mono text-[#00F0FF] mb-5 tabular-nums">
            <span>Модульная горная архитектура</span>
            <span className="text-[#D1D5DB]/40" aria-hidden="true">·</span>
            <span className="text-[#D1D5DB]/80">Уклоны 45°–60°</span>
            <span className="text-[#D1D5DB]/40" aria-hidden="true">·</span>
            <span className="text-[#D1D5DB]/80">Монтаж 72 ч</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-[62px] font-bold tracking-tight text-white leading-[1.06] mb-6"
            style={{ textWrap: 'balance' }}
          >
            АРХИТЕКТУРА НА КРАЮ СТИХИИ
          </h1>

          <p className="text-base sm:text-lg text-[#D1D5DB]/90 leading-relaxed max-w-xl mb-8">
            Проектируем и возводим автономные футуристичные резиденции и горные эко-отели
            на отвесных скалистых склонах и в труднодоступных локациях — без масштабного
            бетонирования и нарушения природного ландшафта.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-10">
            <button
              type="button"
              onClick={handleScrollTo3D}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-lg text-sm sm:text-base font-semibold text-white bg-[#FF5E00] hover:bg-[#e55500] shadow-[0_0_28px_rgba(255,94,0,0.42)] hover:shadow-[0_0_36px_rgba(255,94,0,0.6)] transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <span>Перейти к 3D-обзору</span>
              <ArrowDownRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onToggleLighting(isTwilight ? 'day' : 'twilight')}
              className="inline-flex items-center gap-2.5 px-5 py-4 rounded-lg text-sm font-medium text-[#D1D5DB] bg-[#2F3942]/65 border border-[#D1D5DB]/25 hover:border-[#00F0FF]/60 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              {isTwilight ? (
                <>
                  <Sun className="w-4 h-4 text-[#00F0FF]" />
                  <span>Включить дневной свет</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#FF5E00]" />
                  <span>Режим «Сумерки»</span>
                </>
              )}
            </button>
          </div>

          {/* Quiet Engineering Proof Strip */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 border-t border-[#D1D5DB]/20 max-w-xl">
            <div>
              <div className="font-mono text-xl sm:text-2xl font-semibold text-white tabular-nums">
                270°
              </div>
              <div className="text-xs sm:text-sm text-[#D1D5DB]/75 mt-1">
                Панорамное остекление
              </div>
            </div>
            <div>
              <div className="font-mono text-xl sm:text-2xl font-semibold text-[#00F0FF] tabular-nums">
                до 6.0 м
              </div>
              <div className="text-xs sm:text-sm text-[#D1D5DB]/75 mt-1">
                Компенсация уклона
              </div>
            </div>
            <div>
              <div className="font-mono text-xl sm:text-2xl font-semibold text-[#FF5E00] tabular-nums">
                -45° / +50°C
              </div>
              <div className="text-xs sm:text-sm text-[#D1D5DB]/75 mt-1">
                Всесезонный контур
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Interactive Spotlight Hint in Bottom Right */}
        <div className="hidden lg:flex items-center gap-2.5 absolute right-10 bottom-0 text-xs font-mono text-[#D1D5DB]/70 bg-[#0B0E14]/75 border border-[#D1D5DB]/20 px-3.5 py-2 rounded-lg">
          <Crosshair className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>Наведите курсор на каньон — прожектор проявит кластер</span>
        </div>
      </div>
    </section>
  );
};
