import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, Compass } from 'lucide-react';
import { SkyRiftLogo } from './SkyRiftLogo';

export type LightingMode = 'day' | 'twilight';

interface NavbarProps {
  lightingMode: LightingMode;
  onToggleLighting: (mode: LightingMode) => void;
}

const NAV_LINKS = [
  { href: '#engineering', label: 'Инженерия' },
  { href: '#floorplans', label: 'Планировки' },
  { href: '#configurator', label: '3D-конфигуратор' },
  { href: '#b2b-resorts', label: 'B2B-курорты' },
  { href: '#technologies', label: 'Технологии' },
  { href: '#calculator', label: 'Расчет' },
];

export const Navbar: React.FC<NavbarProps> = ({
  lightingMode,
  onToggleLighting,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0B0E14]/88 backdrop-blur-md border-b border-[#D1D5DB]/20 py-2.5'
          : 'bg-[#0B0E14]/55 backdrop-blur-sm border-b border-[#D1D5DB]/10 py-3.5'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
        {/* Left: Vector SVG Logo */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] rounded"
          aria-label="SKY RIFT — На главную"
        >
          <SkyRiftLogo compact className="h-11 sm:h-12 w-auto" showTagline />
        </a>

        {/* Center: Clean Minimalist Navigation */}
        <nav
          className="hidden xl:flex items-center gap-7 text-sm font-medium text-[#D1D5DB]/85"
          aria-label="Основная навигация"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="relative py-1 whitespace-nowrap shrink-0 hover:text-white transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-0 after:bg-[#00F0FF] hover:after:w-full after:transition-all after:duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Day/Twilight Switcher + Audit CTA */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div
            className="flex items-center p-1 rounded-lg bg-[#2F3942]/70 border border-[#D1D5DB]/20"
            role="group"
            aria-label="Режим освещения сцены"
          >
            <button
              type="button"
              onClick={() => onToggleLighting('day')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                lightingMode === 'day'
                  ? 'bg-[#D1D5DB] text-[#0B0E14] shadow-sm'
                  : 'text-[#D1D5DB]/75 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>День</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleLighting('twilight')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                lightingMode === 'twilight'
                  ? 'bg-[#FF5E00] text-white shadow-[0_0_12px_rgba(255,94,0,0.45)]'
                  : 'text-[#D1D5DB]/75 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Сумерки</span>
            </button>
          </div>

          <a
            href="#calculator"
            onClick={(e) => handleNavClick(e, '#calculator')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2F3942]/90 border border-[#00F0FF]/45 hover:bg-[#00F0FF]/15 hover:border-[#00F0FF] transition-all whitespace-nowrap shrink-0"
          >
            <Compass className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Аудит участка</span>
          </a>
        </div>

        {/* Mobile Controls */}
        <div className="flex xl:hidden items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onToggleLighting(lightingMode === 'day' ? 'twilight' : 'day')}
            className="md:hidden inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium bg-[#2F3942]/80 border border-[#D1D5DB]/20 text-white"
            aria-label="Переключить освещение День или Сумерки"
          >
            {lightingMode === 'day' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>День</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#FF5E00]" />
                <span>Сумерки</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#2F3942]/70 border border-[#D1D5DB]/20 text-[#D1D5DB] hover:text-white"
            aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Drawer */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-[#D1D5DB]/20 bg-[#0B0E14]/96 backdrop-blur-xl px-6 py-5">
          <nav className="flex flex-col gap-3" aria-label="Мобильная навигация">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="py-2 text-base font-medium text-[#D1D5DB] hover:text-[#00F0FF] border-b border-[#D1D5DB]/10 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#calculator"
              onClick={(e) => handleNavClick(e, '#calculator')}
              className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white bg-[#FF5E00] hover:bg-[#e55500] transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Заказать аудит участка</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
