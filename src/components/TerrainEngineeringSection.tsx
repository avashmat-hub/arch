import React, { useState } from 'react';
import { Mountain, Trees, Clock, ShieldCheck, Anchor, Layers, Activity } from 'lucide-react';
import { SpecularCard } from './SpecularCard';

interface HotspotData {
  id: string;
  index: string;
  title: string;
  shortLabel: string;
  metric: string;
  detail: string;
  specs: { label: string; value: string }[];
  cx: number;
  cy: number;
  icon: React.ReactNode;
}

const HOTSPOTS: HotspotData[] = [
  {
    id: 'anchoring',
    index: '01',
    title: 'Точечное анкерование в скальную породу',
    shortLabel: 'Скальные микросваи',
    metric: '180 кН на узел',
    detail:
      'Буроинъекционные титано-стальные анкеры заглубляются непосредственно в материнскую скалу на глубину до 4.5 м с точечной заливкой высокомарочным гидрофобным бетоном B45.',
    specs: [
      { label: 'Глубина анкера', value: '3.2 – 4.5 м' },
      { label: 'Диаметр сваи', value: '219 мм' },
    ],
    cx: 355,
    cy: 392,
    icon: <Anchor className="w-4 h-4 text-[#00F0FF]" />,
  },
  {
    id: 'coating',
    index: '02',
    title: 'Антикоррозийное покрытие аэрокосмического класса',
    shortLabel: 'Защита C5-M',
    metric: 'Ресурс 50+ лет',
    detail:
      'Многоступенчатая система защиты стальной фермы: горячее цинкование 140 мкм и двухкомпонентный фторполиуретановый слой морского класса C5-M, устойчивый к обледенению и соляному туману.',
    specs: [
      { label: 'Класс среды', value: 'ISO 12944 C5-M' },
      { label: 'Толщина слоя', value: '320 мкм' },
    ],
    cx: 332,
    cy: 274,
    icon: <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />,
  },
  {
    id: 'compensation',
    index: '03',
    title: 'Компенсация перепада высот до 6 метров',
    shortLabel: 'X-ферма до 6.0 м',
    metric: 'Уклон 45°–60°',
    detail:
      'Пространственная X-образная ферма из конструкционной низколегированной стали С345 проектируется по 3D-скану рельефа, обеспечивая идеально горизонтальную посадку капсулы над обрывом.',
    specs: [
      { label: 'Марка стали', value: 'С345-4 / S355J2' },
      { label: 'Перепад высот', value: '1.5 – 6.0 м' },
    ],
    cx: 238,
    cy: 248,
    icon: <Layers className="w-4 h-4 text-[#00F0FF]" />,
  },
  {
    id: 'seismic',
    index: '04',
    title: 'Вибро- и сейсморазвязка опорного контура',
    shortLabel: 'Сейсмодемпферы',
    metric: 'До 9 баллов MSK',
    detail:
      'Узлы сопряжения капсулы с силовой рамой оснащены армированными эластомерными виброизоляторами, гасящими ветровые резонансы на открытых хребтах и сейсмические сдвиги.',
    specs: [
      { label: 'Сейсмостойкость', value: '9 баллов MSK-64' },
      { label: 'Гашение колебаний', value: 'до 84%' },
    ],
    cx: 292,
    cy: 170,
    icon: <Activity className="w-4 h-4 text-[#00F0FF]" />,
  },
];

const CLIENT_BENEFITS = [
  {
    num: '01',
    title: 'Ноль земляных работ',
    metric: '0 м³ выемки грунта',
    description:
      'Полный отказ от дорогостоящих подпорных стен, котлованов и масштабного бетонирования. Конструкция опирается всего на 4–6 точечных анкерных пятен в скальном массиве.',
    icon: <Mountain className="w-5 h-5 text-[#00F0FF]" />,
  },
  {
    num: '02',
    title: 'Сохранение экосистемы',
    metric: '98% живого рельефа',
    description:
      'Корневая система многолетних деревьев, горный травяной покров и естественный поверхностный водосток остаются нетронутыми — резиденция буквально парит над склоном.',
    icon: <Trees className="w-5 h-5 text-[#00F0FF]" />,
  },
  {
    num: '03',
    title: 'Монтаж за 72 часа',
    metric: '3 дня на участке',
    description:
      'Капсула доставляется в 100% заводской готовности и монтируется на подготовленные свайные опоры без тяжелой строительной техники, шума и строительного мусора.',
    icon: <Clock className="w-5 h-5 text-[#FF5E00]" />,
  },
];

export const TerrainEngineeringSection: React.FC = () => {
  const [activeId, setActiveId] = useState<string>(HOTSPOTS[2].id);
  const activeHotspot = HOTSPOTS.find((h) => h.id === activeId) ?? HOTSPOTS[0];

  return (
    <section
      id="engineering"
      className="relative py-24 lg:py-32 border-t border-[#D1D5DB]/15 bg-[#0B0E14] scroll-mt-20"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 reveal-section">
          <div className="flex items-center gap-3 text-xs font-mono text-[#00F0FF] mb-3 tabular-nums">
            <span>01. Инженерия сложного рельефа</span>
            <span className="text-[#D1D5DB]/35" aria-hidden="true">·</span>
            <span className="text-[#D1D5DB]/75">Фундамент и X-образные фермы</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-4"
            style={{ textWrap: 'balance' }}
          >
            Там, где классическая стройка невозможна
          </h2>
          <p className="text-base sm:text-lg text-[#D1D5DB]/80 leading-relaxed">
            Инженерная система точечных скальных анкеров и пространственных стальных ферм
            превращает обрывы с уклоном 45°–60° в безопасные видовые площадки с безупречной
            геометрией.
          </p>
        </div>

        {/* Two-Column Technical Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Interactive CAD Elevation Cross-Section */}
          <div className="lg:col-span-7 flex flex-col">
            <SpecularCard className="flex-1 p-5 sm:p-7 flex flex-col justify-between bg-[#0E131B]/90">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#D1D5DB]/15">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Инженерный разрез узла крепления к скальному склону
                  </h3>
                  <p className="text-xs text-[#D1D5DB]/65 mt-0.5">
                    Нажмите на контрольную точку на схеме для просмотра расчетных параметров
                  </p>
                </div>
                <div className="font-mono text-xs text-[#00F0FF] tabular-nums">
                  Масштаб 1:50 · Уклон 52°
                </div>
              </div>

              {/* Interactive SVG Blueprint Diagram */}
              <div className="relative my-5 w-full overflow-hidden rounded-lg bg-[#090C11] border border-[#D1D5DB]/15">
                <svg
                  viewBox="0 0 600 440"
                  className="w-full h-auto block"
                  role="img"
                  aria-label="Схема крепления капсулы SKY RIFT на скальном склоне с углом 45-60 градусов"
                >
                  <defs>
                    <pattern id="cadSmallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="rgba(209,213,219,0.06)"
                        strokeWidth="0.6"
                      />
                    </pattern>
                    <pattern id="rockHatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                      <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(209,213,219,0.12)" strokeWidth="1" />
                    </pattern>
                    <linearGradient id="cabinInteriorGlow" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FF5E00" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#FF5E00" stopOpacity="0.08" />
                    </linearGradient>
                    <linearGradient id="slopeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2F3942" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#0B0E14" stopOpacity="0.95" />
                    </linearGradient>
                  </defs>

                  {/* Blueprint grid background */}
                  <rect width="600" height="440" fill="url(#cadSmallGrid)" />

                  {/* Elevation Guide Lines */}
                  <g stroke="rgba(0,240,255,0.22)" strokeWidth="0.8" strokeDasharray="4 4">
                    <line x1="30" y1="168" x2="570" y2="168" />
                    <line x1="30" y1="392" x2="570" y2="392" />
                  </g>

                  {/* Height Compensation Dimension Line (up to 6.0m) */}
                  <g stroke="#00F0FF" strokeWidth="1" fill="#00F0FF" fontFamily="JetBrains Mono, monospace" fontSize="10">
                    <line x1="518" y1="168" x2="518" y2="392" />
                    <line x1="511" y1="168" x2="525" y2="168" />
                    <line x1="511" y1="392" x2="525" y2="392" />
                    <text x="528" y="284" fill="#00F0FF">H ≤ 6.0 м</text>
                  </g>

                  {/* Bedrock & Mountain Slope Strata (45°–60°) */}
                  <path
                    d="M 0 185 L 125 198 L 195 242 L 285 322 L 385 402 L 455 440 L 0 440 Z"
                    fill="url(#slopeFill)"
                  />
                  <path
                    d="M 0 185 L 125 198 L 195 242 L 285 322 L 385 402 L 455 440 L 0 440 Z"
                    fill="url(#rockHatch)"
                  />
                  {/* Main Cliff Edge Line */}
                  <path
                    d="M 0 185 L 125 198 L 195 242 L 285 322 L 385 402 L 455 440"
                    fill="none"
                    stroke="#D1D5DB"
                    strokeWidth="2"
                    strokeOpacity="0.65"
                  />
                  {/* Angle arc indicator 52° */}
                  <path
                    d="M 195 242 L 295 242"
                    stroke="rgba(209,213,219,0.35)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <path
                    d="M 248 242 A 53 53 0 0 1 232 276"
                    fill="none"
                    stroke="#FF5E00"
                    strokeWidth="1.5"
                  />
                  <text x="256" y="264" fill="#FF5E00" fontFamily="JetBrains Mono, monospace" fontSize="11">
                    45°–60°
                  </text>

                  {/* Concrete Micropiles & Rock Anchors embedded into bedrock */}
                  <g>
                    {/* Left short pier footing */}
                    <rect x="172" y="218" width="22" height="32" rx="2" fill="#2F3942" stroke="#D1D5DB" strokeWidth="1.4" />
                    <line x1="183" y1="250" x2="183" y2="310" stroke="#00F0FF" strokeWidth="2.2" strokeDasharray="5 3" />
                    {/* Deep cliff right pier footings */}
                    <rect x="275" y="314" width="24" height="34" rx="2" fill="#2F3942" stroke="#D1D5DB" strokeWidth="1.4" />
                    <line x1="287" y1="348" x2="287" y2="416" stroke="#00F0FF" strokeWidth="2.2" strokeDasharray="5 3" />
                    <rect x="343" y="378" width="24" height="36" rx="2" fill="#2F3942" stroke="#D1D5DB" strokeWidth="1.4" />
                    <line x1="355" y1="414" x2="355" y2="438" stroke="#00F0FF" strokeWidth="2.4" strokeDasharray="5 3" />
                  </g>

                  {/* Steel X-Braced Truss Piers */}
                  <g stroke="#D1D5DB" strokeLinecap="square">
                    {/* Horizontal main sub-frame I-beam */}
                    <rect x="148" y="162" width="275" height="12" rx="1" fill="#1E2630" stroke="#D1D5DB" strokeWidth="1.5" />
                    {/* Vertical Steel Columns */}
                    <line x1="183" y1="174" x2="183" y2="220" strokeWidth="6" />
                    <line x1="287" y1="174" x2="287" y2="318" strokeWidth="7" />
                    <line x1="355" y1="174" x2="355" y2="380" strokeWidth="7" />
                    {/* Diagonal X-Bracing */}
                    <line x1="183" y1="178" x2="287" y2="275" stroke="#94A3B8" strokeWidth="3.2" />
                    <line x1="287" y1="178" x2="183" y2="218" stroke="#94A3B8" strokeWidth="3.2" />
                    <line x1="287" y1="180" x2="355" y2="305" stroke="#94A3B8" strokeWidth="3.5" />
                    <line x1="355" y1="180" x2="287" y2="305" stroke="#94A3B8" strokeWidth="3.5" />
                    <line x1="287" y1="305" x2="355" y2="376" stroke="#94A3B8" strokeWidth="3.2" />
                    {/* Cantilever Diagonal Strut */}
                    <line x1="355" y1="226" x2="418" y2="174" stroke="#D1D5DB" strokeWidth="4" />
                  </g>

                  {/* Seismic Elastomer Dampers between Frame and Capsule */}
                  <g fill="#FF5E00" stroke="#0B0E14" strokeWidth="1">
                    <rect x="176" y="156" width="14" height="7" rx="1" />
                    <rect x="280" y="156" width="14" height="7" rx="1" />
                    <rect x="348" y="156" width="14" height="7" rx="1" />
                  </g>

                  {/* Futuristic Rounded SKY RIFT Capsule Profile */}
                  <g>
                    {/* Cantilever Open Terrace Deck on left */}
                    <line x1="92" y1="162" x2="152" y2="162" stroke="#D1D5DB" strokeWidth="3" />
                    <line x1="96" y1="126" x2="150" y2="126" stroke="#D1D5DB" strokeWidth="1.4" />
                    <line x1="96" y1="126" x2="96" y2="162" stroke="#D1D5DB" strokeWidth="1.4" />
                    <line x1="122" y1="126" x2="122" y2="162" stroke="#D1D5DB" strokeWidth="1.1" />

                    {/* Outer Aerodynamic Hull */}
                    <rect
                      x="148"
                      y="56"
                      width="284"
                      height="102"
                      rx="22"
                      fill="#1B232D"
                      stroke="#F3F4F6"
                      strokeWidth="2.6"
                    />
                    {/* Composite insulation inner contour */}
                    <rect
                      x="156"
                      y="64"
                      width="268"
                      height="86"
                      rx="16"
                      fill="none"
                      stroke="rgba(209,213,219,0.28)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    {/* 270° Panoramic Glass Front Wing with Warm Rift Amber Interior */}
                    <path
                      d="M 278 68 L 408 68 Q 422 68 422 82 L 422 132 Q 422 146 408 146 L 278 146 Z"
                      fill="url(#cabinInteriorGlow)"
                      stroke="#00F0FF"
                      strokeWidth="1.4"
                    />
                    {/* Window mullions */}
                    <line x1="348" y1="68" x2="348" y2="146" stroke="#D1D5DB" strokeWidth="1.5" strokeOpacity="0.6" />
                    <line x1="395" y1="68" x2="395" y2="146" stroke="#D1D5DB" strokeWidth="1.5" strokeOpacity="0.6" />
                    {/* Technical door & seam lines on left module half */}
                    <rect x="182" y="78" width="38" height="68" rx="4" fill="#131921" stroke="rgba(209,213,219,0.35)" strokeWidth="1.2" />
                    <line x1="252" y1="56" x2="252" y2="158" stroke="rgba(209,213,219,0.35)" strokeWidth="1" />
                    {/* Label inside CAD */}
                    <text x="292" y="112" fill="#FFBE94" fontFamily="JetBrains Mono, monospace" fontSize="10.5">
                      270° ПАНОРАМА
                    </text>
                    <text x="58" y="408" fill="rgba(209,213,219,0.55)" fontFamily="JetBrains Mono, monospace" fontSize="10">
                      СКАЛЬНЫЙ МАССИВ · БЕЗ ВЫЕМКИ ГРУНТА
                    </text>
                  </g>

                  {/* 4 Interactive Sky Cyan (#00F0FF) Hotspots */}
                  {HOTSPOTS.map((spot) => {
                    const isSelected = spot.id === activeId;
                    return (
                      <g
                        key={spot.id}
                        transform={`translate(${spot.cx}, ${spot.cy})`}
                        onClick={() => setActiveId(spot.id)}
                        onMouseEnter={() => setActiveId(spot.id)}
                        className="cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-label={spot.title}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setActiveId(spot.id);
                          }
                        }}
                      >
                        <circle
                          r={isSelected ? 22 : 16}
                          fill="#00F0FF"
                          fillOpacity={isSelected ? 0.22 : 0.08}
                          stroke="#00F0FF"
                          strokeWidth={isSelected ? 1.8 : 1.1}
                          strokeOpacity={isSelected ? 0.95 : 0.65}
                        />
                        <circle
                          r="7"
                          fill={isSelected ? '#00F0FF' : '#0B0E14'}
                          stroke="#00F0FF"
                          strokeWidth="2"
                        />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fontFamily="JetBrains Mono, monospace"
                          fontSize="8"
                          fontWeight="700"
                          fill={isSelected ? '#0B0E14' : '#00F0FF'}
                        >
                          {spot.index}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Quick Selector Strip + Active Hotspot Technical Card */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {HOTSPOTS.map((spot) => {
                    const selected = spot.id === activeId;
                    return (
                      <button
                        key={spot.id}
                        type="button"
                        onClick={() => setActiveId(spot.id)}
                        className={`px-3 py-2 rounded-lg text-left border transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#00F0FF]/12 border-[#00F0FF] text-white'
                            : 'bg-[#2F3942]/35 border-[#D1D5DB]/15 text-[#D1D5DB]/75 hover:border-[#D1D5DB]/40 hover:text-white'
                        }`}
                      >
                        <div className="font-mono text-[11px] text-[#00F0FF] tabular-nums">
                          Узел {spot.index}
                        </div>
                        <div className="text-xs font-medium truncate mt-0.5">{spot.shortLabel}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Expanded Active Parameter Readout */}
                <div className="p-4 sm:p-5 rounded-lg bg-[#141A23] border border-[#00F0FF]/35">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      {activeHotspot.icon}
                      <h4 className="text-base font-semibold text-white">
                        {activeHotspot.index}. {activeHotspot.title}
                      </h4>
                    </div>
                    <span className="font-mono text-xs text-[#00F0FF] tabular-nums">
                      {activeHotspot.metric}
                    </span>
                  </div>
                  <p className="text-sm text-[#D1D5DB]/85 leading-relaxed mb-4">
                    {activeHotspot.detail}
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#D1D5DB]/15">
                    {activeHotspot.specs.map((sp) => (
                      <div key={sp.label}>
                        <div className="text-xs text-[#D1D5DB]/60">{sp.label}</div>
                        <div className="font-mono text-sm text-white font-medium mt-0.5 tabular-nums">
                          {sp.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SpecularCard>
          </div>

          {/* Right Column: 3 Luxury Advantage Cards on Mountain Slate (#2F3942) */}
          <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
            {CLIENT_BENEFITS.map((item) => (
              <SpecularCard
                key={item.num}
                className="flex-1 p-6 sm:p-7 flex flex-col justify-between bg-[#2F3942]/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="w-11 h-11 rounded-lg bg-[#0B0E14]/75 border border-[#D1D5DB]/20 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="font-mono text-xs text-[#00F0FF] tabular-nums">
                      {item.metric}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2.5">
                    {item.num}. {item.title}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-[#D1D5DB]/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#D1D5DB]/15 flex items-center justify-between text-xs font-mono text-[#D1D5DB]/65">
                  <span>Стандарт SKY RIFT</span>
                  <span className="text-[#D1D5DB]">Проверено в горах</span>
                </div>
              </SpecularCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
