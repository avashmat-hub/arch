import React, { useState } from 'react';
import { Eye, Route, Building2, CalendarCheck, MoveRight, Compass } from 'lucide-react';
import { SpecularCard } from './SpecularCard';

interface ClusterCapsule {
  id: string;
  code: string;
  x: number;
  y: number;
  elevation: number;
  azimuthDeg: number; // Direction of 270° panoramic bow toward canyon
  category: string;
}

const CLUSTER_CAPSULES: ClusterCapsule[] = [
  { id: 'c1', code: 'SR-01', x: 122, y: 112, elevation: 1894, azimuthDeg: 35, category: 'Вилла-премиум' },
  { id: 'c2', code: 'SR-02', x: 182, y: 174, elevation: 1872, azimuthDeg: 52, category: 'Сьют-панорама' },
  { id: 'c3', code: 'SR-03', x: 248, y: 124, elevation: 1880, azimuthDeg: 28, category: 'Сьют-панорама' },
  { id: 'c4', code: 'SR-04', x: 318, y: 205, elevation: 1854, azimuthDeg: 45, category: 'Мастер-капсула' },
  { id: 'c5', code: 'SR-05', x: 392, y: 146, elevation: 1865, azimuthDeg: 18, category: 'Сьют-панорама' },
  { id: 'c6', code: 'SR-06', x: 465, y: 238, elevation: 1838, azimuthDeg: 58, category: 'Вилла с купелью' },
  { id: 'c7', code: 'SR-07', x: 540, y: 172, elevation: 1848, azimuthDeg: 34, category: 'Сьют-панорама' },
  { id: 'c8', code: 'SR-08', x: 618, y: 266, elevation: 1819, azimuthDeg: 64, category: 'Флагман-обрыв' },
  { id: 'c9', code: 'SR-09', x: 682, y: 196, elevation: 1828, azimuthDeg: 40, category: 'Спа-модуль' },
];

const B2B_METRICS = [
  {
    index: '01',
    title: 'Быстрый запуск номерного фонда',
    stat: '45 дней',
    statSub: 'на кластер из 10 капсул',
    description:
      'Заводское производство параллельно с точечным бурением свай сокращает срок выхода отеля на первые бронирования в 4 раза по сравнению с капитальным строительством. Окупаемость — 22–28 месяцев.',
    icon: <Building2 className="w-5 h-5 text-[#00F0FF]" />,
  },
  {
    index: '02',
    title: 'Круглогодичная эксплуатация',
    stat: '365 дней',
    statSub: 'средняя загрузка 78%+',
    description:
      'Тепловой контур до -45°C, электрообогрев панорамных стеклопакетов и автономная инженерия позволяют принимать гостей в горнолыжный пик, межсезонье и летний трекинг с высоким ADR.',
    icon: <CalendarCheck className="w-5 h-5 text-[#00F0FF]" />,
  },
  {
    index: '03',
    title: 'Перенос и масштабирование кластера',
    stat: '100% актив',
    statSub: 'демонтаж за 48 часов',
    description:
      'Модули относятся к некапитальным сооружениям на свайном основании: вы можете наращивать номерной фонд по мере роста спроса или релоцировать кластер на новую локацию без потери стоимости.',
    icon: <MoveRight className="w-5 h-5 text-[#FF5E00]" />,
  },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function createSightlineConePath(cx: number, cy: number, radius: number, centerDeg: number, spread = 68) {
  const start = polarToCartesian(cx, cy, radius, centerDeg - spread / 2);
  const end = polarToCartesian(cx, cy, radius, centerDeg + spread / 2);
  return `M ${cx} ${cy} L ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${radius} ${radius} 0 0 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)} Z`;
}

export const MasterPlanB2BSection: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('c4');
  const [showInfrastructure, setShowInfrastructure] = useState<boolean>(true);
  const [showAllSightlines, setShowAllSightlines] = useState<boolean>(false);

  const selectedCapsule =
    CLUSTER_CAPSULES.find((c) => c.id === selectedId) ?? CLUSTER_CAPSULES[0];

  return (
    <section
      id="b2b-resorts"
      className="relative py-24 lg:py-32 border-t border-[#D1D5DB]/15 bg-[#0B0E14] scroll-mt-20"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 reveal-section">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-xs font-mono text-[#00F0FF] mb-3 tabular-nums">
              <span>04. Мастер-план и B2B-решения</span>
              <span className="text-[#D1D5DB]/35" aria-hidden="true">·</span>
              <span className="text-[#D1D5DB]/75">Для девелоперов, инвесторов и отельеров</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-4"
              style={{ textWrap: 'balance' }}
            >
              Кластерное размещение с приватными видовыми коридорами
            </h2>
            <p className="text-base sm:text-lg text-[#D1D5DB]/80 leading-relaxed">
              Проектируем горные эко-отели на 6–12 и более капсул по цифровому двойнику рельефа:
              каждая резиденция ориентирована на собственный сектор ущелья, полностью исключая
              пересечение взглядов между соседями.
            </p>
          </div>
        </div>

        {/* Interactive Master-Plan Container */}
        <SpecularCard className="p-5 sm:p-7 bg-[#0E131B]/95 mb-8">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#D1D5DB]/15">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Мастер-план горного кластера «Хребет-09» (9 резиденций)
              </h3>
              <p className="text-xs text-[#D1D5DB]/65 mt-0.5">
                Кликните по любому модулю на схеме, чтобы проверить его высотную отметку и видовой коридор
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Toggle: All Sightlines */}
              <button
                type="button"
                onClick={() => setShowAllSightlines((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                  showAllSightlines
                    ? 'bg-[#FF5E00]/18 border-[#FF5E00] text-white'
                    : 'bg-[#0B0E14]/70 border-[#D1D5DB]/20 text-[#D1D5DB]/80 hover:border-[#D1D5DB]/45'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-[#FF5E00]" />
                <span>Все видовые коридоры</span>
              </button>

              {/* Toggle Switch #00F0FF: Бережная инфраструктура */}
              <button
                type="button"
                role="switch"
                aria-checked={showInfrastructure}
                onClick={() => setShowInfrastructure((prev) => !prev)}
                className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                  showInfrastructure
                    ? 'bg-[#00F0FF]/12 border-[#00F0FF] text-white'
                    : 'bg-[#0B0E14]/70 border-[#D1D5DB]/20 text-[#D1D5DB]/75 hover:border-[#D1D5DB]/45'
                }`}
              >
                <Route className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>Бережная инфраструктура</span>
                <span
                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                    showInfrastructure ? 'bg-[#00F0FF]' : 'bg-[#2F3942]'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-[#0B0E14] transition-transform ${
                      showInfrastructure ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>

          {/* Master-Plan Topographic SVG + Selected Unit Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-stretch">
            <div className="lg:col-span-9 rounded-lg bg-[#080B10] border border-[#D1D5DB]/15 overflow-hidden relative">
              <svg
                viewBox="0 0 800 390"
                className="w-full h-auto block"
                role="img"
                aria-label="Интерактивный мастер-план размещения 9 капсул SKY RIFT на горном гребне"
              >
                <defs>
                  <linearGradient id="sightlineGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF5E00" stopOpacity="0.44" />
                    <stop offset="100%" stopColor="#FF5E00" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="canyonDepth" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#16212C" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#070A0F" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Canyon Background Gradient */}
                <rect width="800" height="390" fill="url(#canyonDepth)" />

                {/* Topographic Elevation Contour Lines */}
                <g fill="none" stroke="rgba(209,213,219,0.12)" strokeWidth="1">
                  <path d="M -20 90 Q 190 60 390 120 T 820 155" />
                  <path d="M -20 145 Q 210 115 415 175 T 820 215" />
                  <path d="M -20 205 Q 225 180 435 235 T 820 278" stroke="rgba(209,213,219,0.18)" />
                  <path d="M -20 265 Q 245 245 455 295 T 820 342" />
                  <path d="M -20 325 Q 260 315 480 355 T 820 395" />
                  {/* Deep gorge river contour */}
                  <path
                    d="M 140 390 Q 380 355 590 382 T 800 355"
                    stroke="rgba(0,240,255,0.22)"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                  />
                </g>

                {/* Topographic Elevation Markers */}
                <g fill="rgba(209,213,219,0.4)" fontFamily="JetBrains Mono, monospace" fontSize="9.5">
                  <text x="16" y="84">+1 900 м (Гребень)</text>
                  <text x="16" y="200">+1 850 м (Склон 48°)</text>
                  <text x="16" y="320">+1 780 м (Обрыв ущелья)</text>
                  <text x="645" y="372" fill="rgba(0,240,255,0.65)">РУСЛО УЩЕЛЬЯ · -160 м</text>
                </g>

                {/* Preserved Forest Canopies (Zero deforestation markers) */}
                <g fill="#1F352C" fillOpacity="0.48" stroke="#365A4B" strokeOpacity="0.45" strokeWidth="1">
                  <circle cx="88" cy="182" r="22" />
                  <circle cx="230" cy="242" r="24" />
                  <circle cx="348" cy="96" r="19" />
                  <circle cx="440" cy="182" r="18" />
                  <circle cx="515" cy="108" r="22" />
                  <circle cx="585" cy="130" r="16" />
                  <circle cx="672" cy="118" r="20" />
                  <circle cx="744" cy="245" r="22" />
                </g>

                {/* Interactive Layer: «Бережная инфраструктура» (Hanging stairs, floating bridges, concealed utilities) */}
                {showInfrastructure && (
                  <g>
                    {/* Concealed Sub-Deck Engineering Trunks (Power / Fiber / Water) */}
                    <path
                      d="M 62 128 L 122 112 L 182 174 L 248 124 L 318 205 L 392 146 L 465 238 L 540 172 L 618 266 L 682 196"
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="1.6"
                      strokeDasharray="4 4"
                      strokeOpacity="0.7"
                    />
                    {/* Elevated Timber-Steel Hanging Stairways & Suspension Bridges */}
                    <path
                      d="M 62 128 Q 92 118 122 112 Q 152 152 182 174 Q 218 148 248 124 Q 286 170 318 205 Q 355 178 392 146 Q 430 198 465 238 Q 505 206 540 172 Q 582 225 618 266 Q 652 232 682 196"
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="3.5"
                      strokeOpacity="0.32"
                    />
                    {/* Bridge Pier Nodes */}
                    {[
                      [152, 148],
                      [284, 168],
                      [429, 195],
                      [579, 222],
                    ].map(([bx, by], i) => (
                      <g key={i} transform={`translate(${bx}, ${by})`}>
                        <rect
                          x="-4"
                          y="-4"
                          width="8"
                          height="8"
                          fill="#0B0E14"
                          stroke="#00F0FF"
                          strokeWidth="1.4"
                          transform="rotate(45)"
                        />
                      </g>
                    ))}
                    {/* Central Arrival Hub */}
                    <g transform="translate(52, 128)">
                      <rect x="-18" y="-14" width="36" height="28" rx="4" fill="#0B0E14" stroke="#00F0FF" strokeWidth="1.5" />
                      <text x="0" y="3" textAnchor="middle" fill="#00F0FF" fontFamily="JetBrains Mono, monospace" fontSize="8">
                        HUB
                      </text>
                    </g>
                  </g>
                )}

                {/* Sightline Cones (270° Unobstructed Canyon Views) */}
                {CLUSTER_CAPSULES.map((cap) => {
                  const isVisible = showAllSightlines || cap.id === selectedId;
                  if (!isVisible) return null;
                  return (
                    <path
                      key={`cone-${cap.id}`}
                      d={createSightlineConePath(cap.x, cap.y, 138, cap.azimuthDeg, 62)}
                      fill="url(#sightlineGrad)"
                      stroke="#FF5E00"
                      strokeOpacity={cap.id === selectedId ? 0.65 : 0.25}
                      strokeWidth={cap.id === selectedId ? 1.2 : 0.7}
                      strokeDasharray="4 3"
                    />
                  );
                })}

                {/* Capsule Modules Positioned along the Ridge */}
                {CLUSTER_CAPSULES.map((cap) => {
                  const isSelected = cap.id === selectedId;
                  return (
                    <g
                      key={cap.id}
                      transform={`translate(${cap.x}, ${cap.y})`}
                      onClick={() => setSelectedId(cap.id)}
                      className="cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-label={`Модуль ${cap.code}, высота ${cap.elevation} метров`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedId(cap.id);
                        }
                      }}
                    >
                      <g transform={`rotate(${cap.azimuthDeg - 20})`}>
                        <rect
                          x="-18"
                          y="-9"
                          width="36"
                          height="18"
                          rx="6"
                          fill={isSelected ? '#FF5E00' : '#2F3942'}
                          stroke={isSelected ? '#FFFFFF' : '#00F0FF'}
                          strokeWidth={isSelected ? 2 : 1.2}
                        />
                        {/* Panoramic glass bow indicator */}
                        <rect
                          x="8"
                          y="-6"
                          width="7"
                          height="12"
                          rx="2"
                          fill={isSelected ? '#FFF4EC' : '#FF5E00'}
                        />
                      </g>
                      <text
                        x="0"
                        y="-15"
                        textAnchor="middle"
                        fill={isSelected ? '#FFFFFF' : '#D1D5DB'}
                        fontFamily="JetBrains Mono, monospace"
                        fontSize="9.5"
                        fontWeight={isSelected ? '700' : '500'}
                      >
                        {cap.code}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Right: Selected Cluster Unit Telemetry Card */}
            <div className="lg:col-span-3 flex flex-col justify-between p-5 rounded-lg bg-[#141B24] border border-[#D1D5DB]/15">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-[#00F0FF] pb-3 border-b border-[#D1D5DB]/15 tabular-nums">
                  <span>Юнит {selectedCapsule.code}</span>
                  <span>+{selectedCapsule.elevation} м</span>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-[#D1D5DB]/60">Категория номера</div>
                  <div className="text-lg font-semibold text-white mt-0.5">
                    {selectedCapsule.category}
                  </div>
                </div>

                <div className="mt-4 space-y-3 pt-4 border-t border-[#D1D5DB]/15 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#D1D5DB]/70">Азимут панорамы</span>
                    <span className="font-mono text-white tabular-nums">
                      {selectedCapsule.azimuthDeg + 110}° ЮВ
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#D1D5DB]/70">Перекрытие вида</span>
                    <span className="font-mono text-[#00F0FF] tabular-nums">0% (чистый сектор)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#D1D5DB]/70">Вырубка деревьев</span>
                    <span className="font-mono text-white tabular-nums">0 стволов</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#D1D5DB]/70">Связь с хабом</span>
                    <span className="font-mono text-[#FF5E00]">
                      {showInfrastructure ? 'Навесной мостик' : 'Автономно'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#D1D5DB]/15">
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#D1D5DB]/65">
                  <Compass className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                  <span>Трассы инженерии скрыты под настилами переходов</span>
                </div>
              </div>
            </div>
          </div>
        </SpecularCard>

        {/* B2B Key Performance Indicator Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {B2B_METRICS.map((card) => (
            <SpecularCard
              key={card.index}
              className="p-6 sm:p-7 bg-[#2F3942]/45 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-[#0B0E14]/80 border border-[#D1D5DB]/20 flex items-center justify-center">
                    {card.icon}
                  </div>
                  <span className="font-mono text-xs text-[#D1D5DB]/60 tabular-nums">
                    B2B · {card.index}
                  </span>
                </div>
                <div className="font-mono text-3xl font-semibold text-white tabular-nums">
                  {card.stat}
                </div>
                <div className="text-xs font-mono text-[#00F0FF] mt-1 mb-4">{card.statSub}</div>
                <h3 className="text-lg font-semibold text-white mb-2.5">{card.title}</h3>
                <p className="text-sm text-[#D1D5DB]/80 leading-relaxed">{card.description}</p>
              </div>
            </SpecularCard>
          ))}
        </div>
      </div>
    </section>
  );
};
