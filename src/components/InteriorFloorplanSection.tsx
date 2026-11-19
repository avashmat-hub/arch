import React, { useState } from 'react';
import { Layers, Box, Maximize2, Check } from 'lucide-react';
import { SpecularCard } from './SpecularCard';
import type { LightingMode } from './Navbar';

type PlanMode = '2d' | '3d';
type FinishKey = 'obsidian' | 'amber' | 'titanium';
type ZoneId = 'bedroom' | 'bathroom' | 'tech' | 'terrace';

interface InteriorZone {
  id: ZoneId;
  index: string;
  name: string;
  area: string;
  dimensions: string;
  description: string;
  features: string[];
}

interface FinishPackage {
  id: FinishKey;
  name: string;
  subtitle: string;
  wallBg: string;
  floorTone: string;
  accentTone: string;
  furnitureTone: string;
  textAccent: string;
  swatches: { name: string; hex: string }[];
  atmosphereNote: string;
}

const ZONES: InteriorZone[] = [
  {
    id: 'bedroom',
    index: '01',
    name: 'Панорамная спальня 270°',
    area: '21.4 м²',
    dimensions: '5.8 × 3.7 м',
    description:
      'Угловое безрамное остекление с обзором 270° стирает границу между кроватью King-Size и горным ущельем. Встроенный акустический потолок и скрытая янтарная подсветка.',
    features: ['Стеклопакет с подогревом', 'Автошторы Blackout', 'Сценарный свет 2700K'],
  },
  {
    id: 'bathroom',
    index: '02',
    name: 'Видовой санузел',
    area: '6.8 м²',
    dimensions: '2.6 × 2.6 м',
    description:
      'Тропический душ и монолитная раковина из натурального камня с панорамным окном, оснащенным смарт-стеклом переменной прозрачности (переключение в матовый режим за 0.4 сек).',
    features: ['Смарт-стекло PDLC', 'Теплый пол 38°C', 'Премиальная сантехника'],
  },
  {
    id: 'tech',
    index: '03',
    name: 'Автономный технический отсек',
    area: '3.6 м²',
    dimensions: '2.0 × 1.8 м',
    description:
      'Звукоизолированный инженерный шлюз с сервисным доступом снаружи. Вмещает приточно-вытяжную рекуперацию, инверторы, накопители LiFePO4 и систему подготовки воды.',
    features: ['Шумоизоляция 46 дБ', 'Внешний сервисный люк', 'Контроллер SKY RIFT OS'],
  },
  {
    id: 'terrace',
    index: '04',
    name: 'Открытая консольная терраса',
    area: '9.2 м²',
    dimensions: '3.7 × 2.5 м',
    description:
      'Парящая над склоном открытая площадка с термодревесиной и минималистичным ограждением из анодированной стали. Выдерживает установку уличной купели или лаунж-зоны.',
    features: ['Термоясень класса A', 'Нагрузка 400 кг/м²', 'Антиобледенение настила'],
  },
];

const FINISH_PACKAGES: FinishPackage[] = [
  {
    id: 'obsidian',
    name: 'Obsidian & Smoked Oak',
    subtitle: 'Темный дуб и горный сланец',
    wallBg: '#192028',
    floorTone: '#3B2F28',
    accentTone: '#FF5E00',
    furnitureTone: '#252E37',
    textAccent: '#D1D5DB',
    swatches: [
      { name: 'Копченый дуб', hex: '#43342B' },
      { name: 'Сланец антрацит', hex: '#232B33' },
      { name: 'Черненая сталь', hex: '#14181F' },
    ],
    atmosphereNote: 'Камерная глубина для контрастного акцента на горную панораму',
  },
  {
    id: 'amber',
    name: 'Warm Amber & Travertine',
    subtitle: 'Теплый камень и матовая латунь',
    wallBg: '#2C2621',
    floorTone: '#7B6753',
    accentTone: '#FF7A26',
    furnitureTone: '#493D32',
    textAccent: '#F3E5D4',
    swatches: [
      { name: 'Римский травертин', hex: '#B9A48B' },
      { name: 'Матовая латунь', hex: '#B4884E' },
      { name: 'Теплый орех', hex: '#5D4735' },
    ],
    atmosphereNote: 'Тактильная теплота натурального камня и мягкого вечернего света',
  },
  {
    id: 'titanium',
    name: 'Titanium Minimal',
    subtitle: 'Светлый металл и микроцемент',
    wallBg: '#2A323B',
    floorTone: '#6C7580',
    accentTone: '#00F0FF',
    furnitureTone: '#3F4A56',
    textAccent: '#F1F5F9',
    swatches: [
      { name: 'Светлый микроцемент', hex: '#9AA4B0' },
      { name: 'Шлифованный титан', hex: '#CBD5E1' },
      { name: 'Арктический текстиль', hex: '#E2E8F0' },
    ],
    atmosphereNote: 'Аэрокосмическая чистота линий и максимум отраженного дневного света',
  },
];

interface InteriorFloorplanSectionProps {
  lightingMode: LightingMode;
}

export const InteriorFloorplanSection: React.FC<InteriorFloorplanSectionProps> = ({
  lightingMode,
}) => {
  const [planMode, setPlanMode] = useState<PlanMode>('2d');
  const [selectedZoneId, setSelectedZoneId] = useState<ZoneId>('bedroom');
  const [finishKey, setFinishKey] = useState<FinishKey>('obsidian');

  const selectedZone = ZONES.find((z) => z.id === selectedZoneId) ?? ZONES[0];
  const currentFinish = FINISH_PACKAGES.find((f) => f.id === finishKey) ?? FINISH_PACKAGES[0];
  const isTwilight = lightingMode === 'twilight';

  return (
    <section
      id="floorplans"
      className="relative py-24 lg:py-32 border-t border-[#D1D5DB]/15 bg-[#0B0E14] scroll-mt-20"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 reveal-section">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-xs font-mono text-[#00F0FF] mb-3 tabular-nums">
              <span>02. Пространство и интерьеры</span>
              <span className="text-[#D1D5DB]/35" aria-hidden="true">·</span>
              <span className="text-[#D1D5DB]/75">Общая площадь 41.0 м²</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-4"
              style={{ textWrap: 'balance' }}
            >
              Панорамное остекление 270° и выверенная эргономика
            </h2>
            <p className="text-base sm:text-lg text-[#D1D5DB]/80 leading-relaxed">
              Каждая плоскость внутри капсулы работает на главный сценарий — непрерывный визуальный
              контакт с горным рельефом при уровне комфорта пятизвездочного сьюта.
            </p>
          </div>

          <div className="font-mono text-xs text-[#D1D5DB]/75 bg-[#2F3942]/45 border border-[#D1D5DB]/20 px-4 py-3 rounded-lg shrink-0 tabular-nums">
            Габариты модуля: 11.5 × 3.8 × 3.3 м · Потолки 2.75 м
          </div>
        </div>

        {/* Top Accent: 270° Corner Panoramic Glazing Architectural Showcase */}
        <SpecularCard className="mb-10 overflow-hidden bg-[#101620]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Live Reactive 270° Panoramic Bedroom Visualization */}
            <div className="lg:col-span-8 relative min-h-[290px] sm:min-h-[340px] overflow-hidden border-b lg:border-b-0 lg:border-r border-[#D1D5DB]/15">
              {/* Background Canyon Backdrop visible through 270° glass */}
              <img
                src={`${import.meta.env.BASE_URL}assets/aistudio/hero_section_background_01865031.JPG`}
                alt="Вид из панорамного окна 270 градусов на горное ущелье"
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover object-right transition-all duration-500 ${
                  isTwilight ? 'brightness-[0.38] contrast-[1.2] saturate-75' : 'brightness-[0.82]'
                }`}
              />

              {/* Architectural Interior Frame Overlay reacting to Finish Package */}
              <svg
                viewBox="0 0 800 380"
                preserveAspectRatio="xMidYMid slice"
                className="relative z-10 w-full h-full block"
                aria-label="Превью панорамного остекления 270 градусов в выбранной отделке"
              >
                <defs>
                  <linearGradient id="amberCeilingLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentFinish.accentTone} stopOpacity={isTwilight ? 0.52 : 0.25} />
                    <stop offset="100%" stopColor={currentFinish.accentTone} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="interiorFloorGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={currentFinish.floorTone} />
                    <stop offset="100%" stopColor={currentFinish.wallBg} />
                  </linearGradient>
                </defs>

                {/* Rounded futuristic interior shell frame */}
                <path
                  d="M 0 0 L 800 0 L 800 380 L 0 380 Z M 190 42 Q 190 26 206 26 L 748 26 Q 768 26 768 46 L 768 278 Q 768 296 748 296 L 206 296 Q 190 296 190 280 Z"
                  fill={currentFinish.wallBg}
                  fillRule="evenodd"
                  fillOpacity="0.96"
                />

                {/* Warm linear LED ceiling cove */}
                <rect x="200" y="26" width="555" height="6" fill={currentFinish.accentTone} opacity="0.9" />
                <rect x="195" y="32" width="565" height="90" fill="url(#amberCeilingLight)" />

                {/* Corner Structural Panoramic Mullions (270° wrap) */}
                <line x1="475" y1="26" x2="475" y2="296" stroke="#11161D" strokeWidth="6" />
                <line x1="650" y1="26" x2="650" y2="296" stroke="#11161D" strokeWidth="5" />
                <line x1="190" y1="220" x2="768" y2="220" stroke="#11161D" strokeWidth="2.5" strokeOpacity="0.55" />

                {/* Architectural Floor Plane */}
                <polygon points="0,380 190,296 768,296 800,380" fill="url(#interiorFloorGrad)" />

                {/* Minimalist Bed Platform Silhouette */}
                <g transform="translate(215, 224)">
                  <rect x="0" y="36" width="215" height="40" rx="4" fill={currentFinish.furnitureTone} stroke="rgba(255,255,255,0.12)" />
                  <rect x="8" y="20" width="198" height="22" rx="6" fill="#E5E7EB" fillOpacity="0.92" />
                  <rect x="14" y="10" width="58" height="14" rx="4" fill="#F8FAFC" />
                  <rect x="80" y="10" width="58" height="14" rx="4" fill="#F8FAFC" />
                  {/* Under-bed warm floating glow */}
                  <line x1="10" y1="78" x2="205" y2="78" stroke={currentFinish.accentTone} strokeWidth="3" opacity="0.85" />
                </g>

                {/* Wall paneling lines on left interior wall */}
                <g stroke="rgba(255,255,255,0.12)" strokeWidth="1">
                  <line x1="48" y1="0" x2="48" y2="358" />
                  <line x1="96" y1="0" x2="96" y2="338" />
                  <line x1="144" y1="0" x2="144" y2="316" />
                </g>

                {/* 270° Field-of-View Architectural Arc Readout */}
                <g transform="translate(555, 62)">
                  <rect x="0" y="0" width="188" height="36" rx="4" fill="#0B0E14" fillOpacity="0.82" stroke="rgba(0,240,255,0.45)" />
                  <text x="12" y="15" fill="#00F0FF" fontFamily="JetBrains Mono, monospace" fontSize="9.5">
                    ОБЗОР 270° · ТРИПЛЕКС 32 ММ
                  </text>
                  <text x="12" y="29" fill="#D1D5DB" fontFamily="JetBrains Mono, monospace" fontSize="9">
                    ОТДЕЛКА: {currentFinish.name.toUpperCase()}
                  </text>
                </g>
              </svg>
            </div>

            {/* Right Finish Selector Panel */}
            <div className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between bg-[#151C26]/95">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF] mb-2">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Пакеты интерьерной отделки</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Настройте атмосферу капсулы
                </h3>
                <p className="text-xs text-[#D1D5DB]/70 mb-5">
                  Выбор пакета мгновенно меняет палитру и текстуры интерьерного превью
                </p>

                <div className="space-y-2.5">
                  {FINISH_PACKAGES.map((pkg) => {
                    const active = pkg.id === finishKey;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setFinishKey(pkg.id)}
                        className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#2F3942]/80 border-[#00F0FF] text-white'
                            : 'bg-[#0B0E14]/60 border-[#D1D5DB]/15 text-[#D1D5DB]/80 hover:border-[#D1D5DB]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">{pkg.name}</span>
                          {active && <Check className="w-4 h-4 text-[#00F0FF] shrink-0" />}
                        </div>
                        <div className="text-xs text-[#D1D5DB]/65 mt-0.5">{pkg.subtitle}</div>
                        <div className="flex items-center gap-2 mt-2.5">
                          {pkg.swatches.map((sw) => (
                            <div key={sw.name} className="flex items-center gap-1.5">
                              <span
                                className="w-3.5 h-3.5 rounded-sm border border-white/25 inline-block shrink-0"
                                style={{ backgroundColor: sw.hex }}
                                title={sw.name}
                              />
                              <span className="text-[11px] text-[#D1D5DB]/65 hidden sm:inline">
                                {sw.name.split(' ')[0]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#D1D5DB]/15 text-xs text-[#D1D5DB]/75 leading-relaxed">
                {currentFinish.atmosphereNote}
              </div>
            </div>
          </div>
        </SpecularCard>

        {/* Interactive Floorplan Module: 2D Blueprint vs 3D Cutaway */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Interactive Architectural Plan Canvas */}
          <div className="lg:col-span-8 flex flex-col">
            <SpecularCard className="flex-1 p-5 sm:p-7 bg-[#0E131B]/95 flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#D1D5DB]/15">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    Интерактивная схема планировки SKY RIFT M-41
                  </h3>
                  <p className="text-xs text-[#D1D5DB]/65 mt-0.5">
                    Выберите функциональную зону на чертеже для просмотра спецификации
                  </p>
                </div>

                {/* 2D / 3D Cutaway Switcher */}
                <div
                  className="inline-flex p-1 rounded-lg bg-[#0B0E14] border border-[#D1D5DB]/20"
                  role="tablist"
                  aria-label="Режим отображения планировки"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={planMode === '2d'}
                    onClick={() => setPlanMode('2d')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      planMode === '2d'
                        ? 'bg-[#00F0FF] text-[#0B0E14] font-semibold'
                        : 'text-[#D1D5DB]/80 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>2D-чертеж</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={planMode === '3d'}
                    onClick={() => setPlanMode('3d')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      planMode === '3d'
                        ? 'bg-[#00F0FF] text-[#0B0E14] font-semibold'
                        : 'text-[#D1D5DB]/80 hover:text-white'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>3D-разрез капсулы</span>
                  </button>
                </div>
              </div>

              {/* Plan SVG Viewport */}
              <div className="my-5 rounded-lg bg-[#080B10] border border-[#D1D5DB]/15 overflow-hidden">
                {planMode === '2d' ? (
                  <svg
                    viewBox="0 0 760 340"
                    className="w-full h-auto block"
                    role="img"
                    aria-label="2D-чертеж планировки модульной капсулы SKY RIFT"
                  >
                    <defs>
                      <pattern id="planGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(209,213,219,0.06)" strokeWidth="0.6" />
                      </pattern>
                    </defs>
                    <rect width="760" height="340" fill="url(#planGrid)" />

                    {/* Overall Dimension Lines */}
                    <g stroke="rgba(209,213,219,0.4)" strokeWidth="0.9" fill="#D1D5DB" fontFamily="JetBrains Mono, monospace" fontSize="10.5">
                      <line x1="48" y1="36" x2="712" y2="36" />
                      <line x1="48" y1="30" x2="48" y2="42" />
                      <line x1="712" y1="30" x2="712" y2="42" />
                      <text x="380" y="29" textAnchor="middle">11 500 мм</text>

                      <line x1="26" y1="68" x2="26" y2="278" />
                      <line x1="20" y1="68" x2="32" y2="68" />
                      <line x1="20" y1="278" x2="32" y2="278" />
                      <text x="18" y="176" textAnchor="middle" transform="rotate(-90 18 176)">3 800 мм</text>
                    </g>

                    {/* Zone 4: Cantilever Terrace */}
                    <g
                      onClick={() => setSelectedZoneId('terrace')}
                      className="cursor-pointer transition-opacity"
                    >
                      <rect
                        x="48"
                        y="74"
                        width="126"
                        height="198"
                        rx="6"
                        fill={selectedZoneId === 'terrace' ? 'rgba(0,240,255,0.16)' : currentFinish.floorTone}
                        fillOpacity={selectedZoneId === 'terrace' ? 1 : 0.35}
                        stroke={selectedZoneId === 'terrace' ? '#00F0FF' : 'rgba(209,213,219,0.4)'}
                        strokeWidth={selectedZoneId === 'terrace' ? 2.2 : 1.2}
                        strokeDasharray="6 3"
                      />
                      {/* Deck slats */}
                      {[92, 114, 136, 158].map((x) => (
                        <line key={x} x1={x} y1="78" x2={x} y2="268" stroke="rgba(209,213,219,0.15)" strokeWidth="1" />
                      ))}
                      {/* Outdoor table & chairs */}
                      <circle cx="110" cy="173" r="16" fill="none" stroke="#D1D5DB" strokeOpacity="0.6" strokeWidth="1.2" />
                      <text x="111" y="102" textAnchor="middle" fill="#D1D5DB" fontFamily="JetBrains Mono, monospace" fontSize="10">
                        04 · ТЕРРАСА
                      </text>
                      <text x="111" y="254" textAnchor="middle" fill="#00F0FF" fontFamily="JetBrains Mono, monospace" fontSize="10">
                        9.2 м²
                      </text>
                    </g>

                    {/* Outer Capsule Structural Wall */}
                    <rect
                      x="174"
                      y="68"
                      width="538"
                      height="210"
                      rx="28"
                      fill={currentFinish.wallBg}
                      fillOpacity="0.7"
                      stroke="#D1D5DB"
                      strokeWidth="2.4"
                    />

                    {/* Zone 3: Autonomous Technical Bay */}
                    <g onClick={() => setSelectedZoneId('tech')} className="cursor-pointer">
                      <path
                        d="M 180 94 Q 180 74 200 74 L 272 74 L 272 170 L 180 170 Z"
                        fill={selectedZoneId === 'tech' ? 'rgba(0,240,255,0.2)' : 'rgba(47,57,66,0.5)'}
                        stroke={selectedZoneId === 'tech' ? '#00F0FF' : 'rgba(209,213,219,0.35)'}
                        strokeWidth={selectedZoneId === 'tech' ? 2 : 1}
                      />
                      {/* Battery & HVAC symbols */}
                      <rect x="194" y="88" width="24" height="34" fill="none" stroke="#00F0FF" strokeOpacity="0.7" strokeWidth="1" />
                      <rect x="226" y="88" width="32" height="34" fill="none" stroke="#FF5E00" strokeOpacity="0.7" strokeWidth="1" />
                      <text x="226" y="144" textAnchor="middle" fill="#D1D5DB" fontFamily="JetBrains Mono, monospace" fontSize="9.5">
                        03 · ТЕХ.ОТСЕК
                      </text>
                      <text x="226" y="159" textAnchor="middle" fill="#00F0FF" fontFamily="JetBrains Mono, monospace" fontSize="9.5">
                        3.6 м²
                      </text>
                    </g>

                    {/* Zone 2: Panoramic Bathroom */}
                    <g onClick={() => setSelectedZoneId('bathroom')} className="cursor-pointer">
                      <path
                        d="M 180 172 L 348 172 L 348 272 L 200 272 Q 180 272 180 252 Z"
                        fill={selectedZoneId === 'bathroom' ? 'rgba(0,240,255,0.2)' : 'rgba(47,57,66,0.38)'}
                        stroke={selectedZoneId === 'bathroom' ? '#00F0FF' : 'rgba(209,213,219,0.35)'}
                        strokeWidth={selectedZoneId === 'bathroom' ? 2 : 1}
                      />
                      {/* Shower & vanity CAD fixtures */}
                      <rect x="194" y="186" width="54" height="72" rx="4" fill="none" stroke="#D1D5DB" strokeOpacity="0.55" />
                      <circle cx="221" cy="222" r="6" fill="none" stroke="#00F0FF" />
                      <rect x="270" y="238" width="60" height="22" rx="4" fill="none" stroke="#D1D5DB" strokeOpacity="0.55" />
                      <text x="298" y="204" textAnchor="middle" fill="#D1D5DB" fontFamily="JetBrains Mono, monospace" fontSize="9.5">
                        02 · САНУЗЕЛ
                      </text>
                      <text x="298" y="220" textAnchor="middle" fill="#00F0FF" fontFamily="JetBrains Mono, monospace" fontSize="9.5">
                        6.8 м²
                      </text>
                    </g>

                    {/* Entry Corridor connecting Terrace to Bedroom */}
                    <rect
                      x="272"
                      y="74"
                      width="76"
                      height="98"
                      fill="rgba(255,255,255,0.02)"
                      stroke="rgba(209,213,219,0.2)"
                      strokeWidth="0.8"
                    />
                    <text x="310" y="126" textAnchor="middle" fill="rgba(209,213,219,0.45)" fontFamily="JetBrains Mono, monospace" fontSize="8.5">
                      ВХОД
                    </text>

                    {/* Zone 1: 270° Panoramic Bedroom */}
                    <g onClick={() => setSelectedZoneId('bedroom')} className="cursor-pointer">
                      <path
                        d="M 348 74 L 682 74 Q 706 74 706 98 L 706 248 Q 706 272 682 272 L 348 272 Z"
                        fill={
                          selectedZoneId === 'bedroom'
                            ? 'rgba(255,94,0,0.2)'
                            : 'rgba(255,94,0,0.07)'
                        }
                        stroke={selectedZoneId === 'bedroom' ? '#FF5E00' : 'rgba(255,94,0,0.45)'}
                        strokeWidth={selectedZoneId === 'bedroom' ? 2.4 : 1.3}
                      />
                      {/* King-size bed architectural CAD block */}
                      <rect x="424" y="114" width="132" height="118" rx="6" fill={currentFinish.furnitureTone} stroke="#D1D5DB" strokeWidth="1.3" />
                      <rect x="432" y="124" width="28" height="44" rx="4" fill="none" stroke="#D1D5DB" strokeOpacity="0.65" />
                      <rect x="432" y="178" width="28" height="44" rx="4" fill="none" stroke="#D1D5DB" strokeOpacity="0.65" />
                      {/* Lounge armchair at panoramic bow */}
                      <circle cx="640" cy="173" r="24" fill="none" stroke="#D1D5DB" strokeOpacity="0.6" strokeWidth="1.3" />
                      {/* 270° Glazing Perimeter Highlight */}
                      <path
                        d="M 420 68 L 684 68 Q 712 68 712 96 L 712 250 Q 712 278 684 278 L 420 278"
                        fill="none"
                        stroke="#00F0FF"
                        strokeWidth="3.5"
                      />
                      <text x="530" y="96" textAnchor="middle" fill="#FFFFFF" fontFamily="JetBrains Mono, monospace" fontSize="10.5">
                        01 · ПАНОРАМНАЯ СПАЛЬНЯ 270°
                      </text>
                      <text x="530" y="256" textAnchor="middle" fill="#FF5E00" fontFamily="JetBrains Mono, monospace" fontSize="10.5">
                        21.4 м² · ВИД НА УЩЕЛЬЕ
                      </text>
                    </g>

                    {/* 270° Sightline Rays */}
                    <g stroke="#00F0FF" strokeOpacity="0.35" strokeDasharray="3 4" strokeWidth="1">
                      <line x1="712" y1="173" x2="752" y2="173" />
                      <line x1="696" y1="84" x2="742" y2="54" />
                      <line x1="696" y1="262" x2="742" y2="296" />
                    </g>
                  </svg>
                ) : (
                  /* Isometric 3D Architectural Cutaway SVG */
                  <svg
                    viewBox="0 0 760 340"
                    className="w-full h-auto block"
                    role="img"
                    aria-label="Изометрический 3D-разрез капсулы SKY RIFT"
                  >
                    <defs>
                      <linearGradient id="isoGlass" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.24" />
                        <stop offset="100%" stopColor="#FF5E00" stopOpacity="0.22" />
                      </linearGradient>
                    </defs>

                    {/* Isometric floor grid */}
                    <g stroke="rgba(0,240,255,0.1)" strokeWidth="0.8">
                      <line x1="60" y1="220" x2="400" y2="65" />
                      <line x1="160" y1="265" x2="500" y2="110" />
                      <line x1="260" y1="310" x2="600" y2="155" />
                      <line x1="360" y1="325" x2="700" y2="170" />
                    </g>

                    {/* Isometric Terrace (Zone 4) */}
                    <g onClick={() => setSelectedZoneId('terrace')} className="cursor-pointer">
                      <polygon
                        points="90,222 195,172 285,214 180,264"
                        fill={selectedZoneId === 'terrace' ? 'rgba(0,240,255,0.28)' : currentFinish.floorTone}
                        stroke={selectedZoneId === 'terrace' ? '#00F0FF' : '#D1D5DB'}
                        strokeWidth={selectedZoneId === 'terrace' ? 2.2 : 1.2}
                      />
                      {/* Steel railing */}
                      <polyline
                        points="90,222 90,188 180,230 180,264"
                        fill="none"
                        stroke="#D1D5DB"
                        strokeWidth="1.5"
                      />
                      <line x1="135" y1="209" x2="135" y2="243" stroke="#D1D5DB" strokeWidth="1.2" />
                      <text x="148" y="290" fill="#00F0FF" fontFamily="JetBrains Mono, monospace" fontSize="10">
                        04 · ТЕРРАСА 9.2 м²
                      </text>
                    </g>

                    {/* Capsule Base Floor Slab */}
                    <polygon
                      points="195,172 520,26 655,88 330,234"
                      fill={currentFinish.wallBg}
                      stroke="#D1D5DB"
                      strokeWidth="1.6"
                    />

                    {/* Zone 3: Tech Bay Isometric Volume */}
                    <g onClick={() => setSelectedZoneId('tech')} className="cursor-pointer">
                      <polygon
                        points="195,172 295,126 355,154 255,200"
                        fill={selectedZoneId === 'tech' ? 'rgba(0,240,255,0.3)' : '#232C36'}
                        stroke={selectedZoneId === 'tech' ? '#00F0FF' : '#94A3B8'}
                        strokeWidth={selectedZoneId === 'tech' ? 2.2 : 1.1}
                      />
                      {/* Back cutaway wall */}
                      <polygon
                        points="195,172 295,126 295,58 195,104"
                        fill={currentFinish.wallBg}
                        fillOpacity="0.92"
                        stroke="#D1D5DB"
                        strokeWidth="1.2"
                      />
                      {/* Equipment rack inside */}
                      <polygon points="222,155 262,137 262,92 222,110" fill="#131922" stroke="#00F0FF" strokeWidth="1" />
                      <text x="172" y="88" fill="#D1D5DB" fontFamily="JetBrains Mono, monospace" fontSize="9.5">
                        03 · ТЕХ.ОТСЕК
                      </text>
                    </g>

                    {/* Zone 2: Bathroom Isometric Volume */}
                    <g onClick={() => setSelectedZoneId('bathroom')} className="cursor-pointer">
                      <polygon
                        points="255,200 380,143 442,172 317,229"
                        fill={selectedZoneId === 'bathroom' ? 'rgba(0,240,255,0.28)' : '#2D3741'}
                        stroke={selectedZoneId === 'bathroom' ? '#00F0FF' : '#94A3B8'}
                        strokeWidth={selectedZoneId === 'bathroom' ? 2.2 : 1.1}
                      />
                      {/* Glass shower partition */}
                      <polygon
                        points="295,126 380,88 380,143 295,182"
                        fill="rgba(0,240,255,0.08)"
                        stroke="#00F0FF"
                        strokeOpacity="0.5"
                      />
                      <text x="342" y="256" fill="#D1D5DB" fontFamily="JetBrains Mono, monospace" fontSize="9.5">
                        02 · САНУЗЕЛ 6.8 м²
                      </text>
                    </g>

                    {/* Zone 1: 270° Panoramic Bedroom Isometric Cutaway */}
                    <g onClick={() => setSelectedZoneId('bedroom')} className="cursor-pointer">
                      <polygon
                        points="380,143 520,80 650,140 510,203"
                        fill={selectedZoneId === 'bedroom' ? 'rgba(255,94,0,0.28)' : currentFinish.floorTone}
                        fillOpacity="0.82"
                        stroke={selectedZoneId === 'bedroom' ? '#FF5E00' : '#D1D5DB'}
                        strokeWidth={selectedZoneId === 'bedroom' ? 2.4 : 1.2}
                      />
                      {/* Isometric Bed */}
                      <polygon points="435,148 515,112 565,135 485,171" fill="#E5E7EB" stroke="#1E293B" strokeWidth="1" />
                      <polygon points="435,148 485,171 485,185 435,162" fill={currentFinish.furnitureTone} />
                      <polygon points="485,171 565,135 565,149 485,185" fill="#1F2937" />
                      {/* 270° Wrap-around Glass Walls */}
                      <polygon
                        points="520,80 650,140 650,62 520,2"
                        fill="url(#isoGlass)"
                        stroke="#00F0FF"
                        strokeWidth="1.6"
                      />
                      <polygon
                        points="510,203 650,140 650,62 510,125"
                        fill="url(#isoGlass)"
                        stroke="#00F0FF"
                        strokeWidth="1.6"
                      />
                      {/* Warm Ceiling Perimeter Accent */}
                      <polyline
                        points="520,12 645,68 515,127"
                        fill="none"
                        stroke="#FF5E00"
                        strokeWidth="2.5"
                      />
                      <text x="530" y="232" fill="#FF5E00" fontFamily="JetBrains Mono, monospace" fontSize="10.5">
                        01 · СПАЛЬНЯ 270° · 21.4 м²
                      </text>
                    </g>

                    {/* Cutaway Roof Shell Contour */}
                    <polyline
                      points="195,104 380,20 520,2 650,62"
                      fill="none"
                      stroke="#F8FAFC"
                      strokeWidth="2.2"
                      strokeDasharray="6 4"
                      strokeOpacity="0.7"
                    />
                  </svg>
                )}
              </div>

              {/* Zone Quick Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ZONES.map((zone) => {
                  const active = zone.id === selectedZoneId;
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#2F3942]/80 border-[#00F0FF] text-white'
                          : 'bg-[#0B0E14]/60 border-[#D1D5DB]/15 text-[#D1D5DB]/75 hover:border-[#D1D5DB]/40 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] tabular-nums">
                        <span className="text-[#00F0FF]">{zone.index}</span>
                        <span className="text-[#D1D5DB]/80">{zone.area}</span>
                      </div>
                      <div className="text-xs font-medium mt-1 truncate">{zone.name}</div>
                    </button>
                  );
                })}
              </div>
            </SpecularCard>
          </div>

          {/* Selected Zone Architectural Dossier */}
          <div className="lg:col-span-4 flex flex-col">
            <SpecularCard className="flex-1 p-6 sm:p-7 bg-[#2F3942]/45 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-[#00F0FF] pb-4 border-b border-[#D1D5DB]/15 tabular-nums">
                  <span>Зона {selectedZone.index}</span>
                  <span>{selectedZone.dimensions}</span>
                </div>

                <div className="mt-6">
                  <div className="font-mono text-4xl font-semibold text-white tabular-nums">
                    {selectedZone.area}
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-2 mb-3">
                    {selectedZone.name}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-[#D1D5DB]/85 leading-relaxed mb-6">
                    {selectedZone.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-[#D1D5DB]/15">
                  <div className="text-xs font-mono text-[#D1D5DB]/60 mb-2">
                    Инженерная комплектация зоны
                  </div>
                  {selectedZone.features.map((feat) => (
                    <div
                      key={feat}
                      className="flex items-center justify-between py-2 border-b border-[#D1D5DB]/10 last:border-b-0 text-sm text-[#D1D5DB]"
                    >
                      <span>{feat}</span>
                      <span className="font-mono text-xs text-[#00F0FF]">Включено</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#D1D5DB]/15 flex items-center justify-between text-xs font-mono text-[#D1D5DB]/70 tabular-nums">
                <span>Отделка: {currentFinish.name}</span>
                <span className="text-[#FF5E00]">41.0 м²</span>
              </div>
            </SpecularCard>
          </div>
        </div>
      </div>
    </section>
  );
};
