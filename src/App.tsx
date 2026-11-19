import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar, type LightingMode } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TerrainEngineeringSection } from './components/TerrainEngineeringSection';
import { InteriorFloorplanSection } from './components/InteriorFloorplanSection';
import {
  CapsuleConfigurator3D,
  type ConfiguratorTransferData,
} from './components/CapsuleConfigurator3D';
import { MasterPlanB2BSection } from './components/MasterPlanB2BSection';
import { TechAndDigitalPassportSection } from './components/TechAndDigitalPassportSection';
import { CalculatorAuditSection } from './components/CalculatorAuditSection';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [lightingMode, setLightingMode] = useState<LightingMode>('day');
  const [transferredConfig, setTransferredConfig] =
    useState<ConfiguratorTransferData | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const cadCursorLayerRef = useRef<HTMLDivElement>(null);

  // Smooth cursor-revealed global architectural CAD grid across lower sections
  useEffect(() => {
    const layer = cadCursorLayerRef.current;
    if (!layer) return;

    const handleMove = (e: MouseEvent) => {
      const mask = `radial-gradient(circle 340px at ${e.clientX}px ${e.clientY}px, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)`;
      layer.style.maskImage = mask;
      layer.style.webkitMaskImage = mask;
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // GSAP ScrollTrigger subtle architectural reveal animations
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !rootRef.current) return;

    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray<HTMLElement>('.reveal-section');
      elements.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 24, opacity: 0.25 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
            },
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative min-h-screen bg-[#0B0E14] text-[#D1D5DB] cad-grid-bg"
    >
      {/* Subtle fixed cursor-revealed CAD blueprint grid across the page */}
      <div
        ref={cadCursorLayerRef}
        className="fixed inset-0 z-0 pointer-events-none cad-cursor-grid opacity-35"
        aria-hidden="true"
      />

      <Navbar lightingMode={lightingMode} onToggleLighting={setLightingMode} />

      <main className="relative z-10">
        {/* Section 1: Hero — Spotlight Reveal & Day/Twilight */}
        <HeroSection
          lightingMode={lightingMode}
          onToggleLighting={setLightingMode}
        />

        {/* Section 2: Terrain Engineering — Cliff Cross-Section & Hotspots */}
        <TerrainEngineeringSection />

        {/* Section 3: Panoramic 270° Glazing & Interactive 2D/3D Floorplans */}
        <InteriorFloorplanSection lightingMode={lightingMode} />

        {/* Section 4: Interactive Three.js 3D Capsule Configurator */}
        <CapsuleConfigurator3D onApplyToCalculator={setTransferredConfig} />

        {/* Section 5: Master Plan & B2B Resort Cluster Solutions */}
        <MasterPlanB2BSection />

        {/* Section 6: Extreme-Climate Tech & QR Digital Passport */}
        <TechAndDigitalPassportSection />

        {/* Section 7: Terrain Project Calculator, 3D Site Audit & Footer */}
        <CalculatorAuditSection transferredConfig={transferredConfig} />
      </main>
    </div>
  );
}
