import React, { useState } from 'react';
import {
  ThermometerSnowflake,
  Wind,
  Shield,
  FileCode2,
  Smartphone,
  Sliders,
  Download,
  Lock,
  Unlock,
  Sun,
  CheckCircle2,
} from 'lucide-react';
import { SpecularCard } from './SpecularCard';
import { SkyRiftLogo } from './SkyRiftLogo';

type PassportTab = 'bim' | 'ar' | 'os';
type LightSceneId = 'dawn' | 'amber' | 'horizon';

const TECH_SPECS = [
  {
    index: '01',
    title: 'Многослойное композитное утепление корпуса',
    range: '-45°C … +50°C',
    detail:
      'Бесшовный термоконтур с замкнутоячеистым PIR-ядром 180 мм, отражающей мембраной и композитной оболочкой из авиационного алюминия полностью исключает мостики холода в высокогорье.',
    metrics: [
      { label: 'Сопротивление теплопередаче', value: 'R = 6.8 м²·°C/Вт' },
      { label: 'Звукоизоляция оболочки', value: '52 дБ' },
    ],
    icon: <ThermometerSnowflake className="w-5 h-5 text-[#00F0FF]" />,
  },
  {
    index: '02',
    title: 'Ветровая и сейсмическая устойчивость на хребтах',
    range: '45 м/с · 9 баллов',
    detail:
      'Аэродинамический профиль капсулы снижает ветровую нагрузку на 34%, а пространственный стальной каркас и X-фермы рассчитаны на ураганные порывы открытых перевалов и сейсмику до 9 баллов.',
    metrics: [
      { label: 'Снеговая нагрузка крыши', value: '480 кг/м²' },
      { label: 'Коэффициент запаса рамы', value: '2.4×' },
    ],
    icon: <Wind className="w-5 h-5 text-[#00F0FF]" />,
  },
  {
    index: '03',
    title: 'Энергоэффективные стеклопакеты с электрообогревом',
    range: 'УФ-защита 99.4%',
    detail:
      'Двухкамерный архитектурный триплекс 32 мм с аргоновым заполнением, мультифункциональным напылением серебра и встроенным невидимым подогревом предотвращает конденсат и обледенение.',
    metrics: [
      { label: 'Коэффициент сопротивления', value: 'Ug = 0.58 Вт/м²·К' },
      { label: 'Прочность триплекса', value: 'Класс P4A' },
    ],
    icon: <Shield className="w-5 h-5 text-[#00F0FF]" />,
  },
];

const LIGHT_SCENES: {
  id: LightSceneId;
  name: string;
  kelvin: string;
  color: string;
  glowOpacity: number;
  desc: string;
}[] = [
  {
    id: 'dawn',
    name: 'Рассвет в каньоне',
    kelvin: '3800K · 65%',
    color: '#FFE3B8',
    glowOpacity: 0.35,
    desc: 'Мягкий нейтральный свет, синхронизированный с горным утром',
  },
  {
    id: 'amber',
    name: 'Янтарный вечер',
    kelvin: '2400K · 100%',
    color: '#FF5E00',
    glowOpacity: 0.72,
    desc: 'Фирменная теплая подсветка Rift Amber, не создающая бликов на стекле',
  },
  {
    id: 'horizon',
    name: 'Ночной горизонт',
    kelvin: '1900K · 22%',
    color: '#D94B00',
    glowOpacity: 0.28,
    desc: 'Приглушенная нижняя контурная подсветка для наблюдения за звездами',
  },
];

export const TechAndDigitalPassportSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PassportTab>('os');
  const [bimDownloaded, setBimDownloaded] = useState(false);

  // AR Simulation State
  const [arScale, setArScale] = useState<number>(100);
  const [arRotation, setArRotation] = useState<number>(-12);
  const [arAnchored, setArAnchored] = useState<boolean>(false);

  // SKY RIFT OS Mini-Console State
  const [temperature, setTemperature] = useState<number>(22);
  const [glassTint, setGlassTint] = useState<number>(20);
  const [lightScene, setLightScene] = useState<LightSceneId>('amber');

  const currentLight = LIGHT_SCENES.find((s) => s.id === lightScene) ?? LIGHT_SCENES[1];

  const handleDownloadBIMSpec = () => {
    const content = [
      'SKY RIFT FUTURISTIC HOMES — ТЕХНИЧЕСКИЙ ПАСПОРТ И BIM-МАНИФЕСТ',
      '==============================================================',
      'Модель: SKY RIFT M-41 Alpine Autonomous Residence',
      'Габариты: 11 500 x 3 800 x 3 300 мм | Общая площадь: 41.0 м²',
      'Угол установки на рельеф: до 60° (перепад опорной фермы 1.5 - 6.0 м)',
      'Температурный режим: от -45°C до +50°C | Тепловой контур R = 6.8',
      'Ветровая нагрузка: до 45 м/с | Сейсмостойкость: 9 баллов MSK-64',
      'Остекление: 270° архитектурный триплекс 32 мм с электрообогревом',
      'Форматы BIM-библиотеки: Revit (.rvt 2024+), ArchiCAD (.pln), IFC 4.0, DWG 3D',
      'Контакт инженерного отдела: engineering@skyrift.arch',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SKY_RIFT_M41_BIM_Specification.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBimDownloaded(true);
    setTimeout(() => setBimDownloaded(false), 3000);
  };

  return (
    <section
      id="technologies"
      className="relative py-24 lg:py-32 border-t border-[#D1D5DB]/15 bg-[#0B0E14] scroll-mt-20"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Heading */}
        <div className="max-w-3xl mb-14 reveal-section">
          <div className="flex items-center gap-3 text-xs font-mono text-[#00F0FF] mb-3 tabular-nums">
            <span>05. Технологии и материалы</span>
            <span className="text-[#D1D5DB]/35" aria-hidden="true">·</span>
            <span className="text-[#D1D5DB]/75">Аэрокосмические стандарты и SKY RIFT OS</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-4"
            style={{ textWrap: 'balance' }}
          >
            Инженерия для экстремального климата
          </h2>
          <p className="text-base sm:text-lg text-[#D1D5DB]/80 leading-relaxed">
            Каждая капсула собирается на прецизионном производстве и проходит заводскую
            диагностику герметичности, тепловизионный контроль и цифровое паспортирование.
          </p>
        </div>

        {/* Engineering Specifications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-14">
          {TECH_SPECS.map((spec) => (
            <SpecularCard
              key={spec.index}
              className="p-6 sm:p-7 bg-[#2F3942]/45 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-11 h-11 rounded-lg bg-[#0B0E14]/80 border border-[#D1D5DB]/20 flex items-center justify-center">
                    {spec.icon}
                  </div>
                  <span className="font-mono text-xs text-[#00F0FF] tabular-nums">
                    {spec.range}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 leading-snug">
                  {spec.title}
                </h3>
                <p className="text-sm text-[#D1D5DB]/80 leading-relaxed mb-6">{spec.detail}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#D1D5DB]/15">
                {spec.metrics.map((m) => (
                  <div key={m.label}>
                    <div className="text-[11px] text-[#D1D5DB]/60">{m.label}</div>
                    <div className="font-mono text-xs sm:text-sm font-semibold text-white mt-0.5 tabular-nums">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </SpecularCard>
          ))}
        </div>

        {/* Featured Block: «ЦИФРОВОЙ ПАСПОРТ SKY RIFT (QR-ИНТЕГРАЦИЯ)» */}
        <SpecularCard className="p-6 sm:p-8 lg:p-10 bg-[#111720]/95 border-[#00F0FF]/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Identity & QR Brand Integration Column */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
              <div>
                <div className="text-xs font-mono text-[#00F0FF] mb-2">
                  Цифровой паспорт SKY RIFT · QR-интеграция
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">
                  QR-код в сердце логотипа — ключ к зданию
                </h3>
                <p className="text-sm text-[#D1D5DB]/80 leading-relaxed">
                  Встроенная QR-матрица на фасаде каждой капсулы и в фирменном знаке SKY RIFT
                  связывает физический объект с его BIM-двойником, AR-проекцией и облачной
                  телеметрией умного дома SKY RIFT OS.
                </p>
              </div>

              {/* Brand Emblem with Highlighted QR Frame */}
              <div className="p-5 rounded-xl bg-[#0B0E14] border border-[#D1D5DB]/20 flex flex-col items-center text-center">
                <SkyRiftLogo className="w-56 h-auto" showTagline />
                <div className="mt-4 pt-3 border-t border-[#D1D5DB]/15 w-full flex items-center justify-between font-mono text-[11px] text-[#D1D5DB]/70 tabular-nums">
                  <span>ID: SR-M41-2026</span>
                  <span className="text-[#00F0FF]">BIM · AR · OS</span>
                </div>
              </div>
            </div>

            {/* Right Interactive 3-Tab Digital Passport Panel */}
            <div className="lg:col-span-8 flex flex-col">
              {/* 3 Interactive Tabs */}
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-xl bg-[#0B0E14] border border-[#D1D5DB]/20 mb-6"
                role="tablist"
                aria-label="Вкладки цифрового паспорта SKY RIFT"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'bim'}
                  onClick={() => setActiveTab('bim')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'bim'
                      ? 'bg-[#2F3942] text-white border border-[#00F0FF]/60'
                      : 'text-[#D1D5DB]/75 hover:text-white border border-transparent'
                  }`}
                >
                  <FileCode2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
                  <span className="truncate">BIM-модель</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'ar'}
                  onClick={() => setActiveTab('ar')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'ar'
                      ? 'bg-[#2F3942] text-white border border-[#00F0FF]/60'
                      : 'text-[#D1D5DB]/75 hover:text-white border border-transparent'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#00F0FF] shrink-0" />
                  <span className="truncate">AR-примерка на участке</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'os'}
                  onClick={() => setActiveTab('os')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'os'
                      ? 'bg-[#2F3942] text-white border border-[#FF5E00]/75'
                      : 'text-[#D1D5DB]/75 hover:text-white border border-transparent'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-[#FF5E00] shrink-0" />
                  <span className="truncate">Умный дом SKY RIFT OS</span>
                </button>
              </div>

              {/* TAB 1: BIM-модель для архитекторов */}
              {activeTab === 'bim' && (
                <div className="p-5 sm:p-6 rounded-xl bg-[#0B0E14]/90 border border-[#D1D5DB]/15 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        BIM-модель для архитекторов и девелоперов
                      </h4>
                      <p className="text-xs sm:text-sm text-[#D1D5DB]/75 mt-1">
                        Полная цифровая геометрия LOD 400 с узлами анкерования, инженерными вводами
                        и спецификацией нагрузок на свайное поле.
                      </p>
                    </div>
                    <span className="font-mono text-xs text-[#00F0FF] tabular-nums">
                      LOD 400 · IFC 4.0
                    </span>
                  </div>

                  {/* BIM Wireframe Architectural Preview */}
                  <div className="rounded-lg bg-[#080B10] border border-[#D1D5DB]/15 p-4">
                    <svg viewBox="0 0 640 170" className="w-full h-auto block" aria-hidden="true">
                      <g stroke="rgba(0,240,255,0.45)" strokeWidth="1" fill="none">
                        {/* Wireframe orthographic elevation */}
                        <rect x="44" y="28" width="230" height="84" rx="16" />
                        <rect x="148" y="38" width="116" height="64" rx="8" stroke="#FF5E00" />
                        <line x1="76" y1="112" x2="76" y2="150" />
                        <line x1="230" y1="112" x2="230" y2="156" />
                        <line x1="76" y1="112" x2="230" y2="152" strokeDasharray="3 3" />
                        <line x1="230" y1="112" x2="76" y2="148" strokeDasharray="3 3" />
                        {/* Front Section */}
                        <rect x="330" y="28" width="110" height="84" rx="16" />
                        <rect x="342" y="38" width="86" height="64" rx="8" stroke="#FF5E00" />
                        <line x1="350" y1="112" x2="350" y2="154" />
                        <line x1="420" y1="112" x2="420" y2="154" />
                        <line x1="350" y1="114" x2="420" y2="152" strokeDasharray="3 3" />
                        <line x1="420" y1="114" x2="350" y2="152" strokeDasharray="3 3" />
                      </g>
                      <g fill="#D1D5DB" fontFamily="JetBrains Mono, monospace" fontSize="10">
                        <text x="480" y="42" fill="#00F0FF">ФАЙЛЫ ПАКЕТА:</text>
                        <text x="480" y="64">• SR_M41_Main.rvt (48 МБ)</text>
                        <text x="480" y="84">• SR_M41_OpenBIM.ifc (32 МБ)</text>
                        <text x="480" y="104">• SR_M41_Truss.dwg (14 МБ)</text>
                        <text x="480" y="124">• Пояснительная записка PDF</text>
                        <text x="480" y="148" fill="#FF5E00">Вес модуля: 12.8 тонн</text>
                      </g>
                    </svg>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="text-xs font-mono text-[#D1D5DB]/70 tabular-nums">
                      Revit 2024+ · ArchiCAD 27 · AutoCAD Civil 3D
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadBIMSpec}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white bg-[#FF5E00] hover:bg-[#e55500] transition-colors cursor-pointer"
                    >
                      {bimDownloaded ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Спецификация скачана</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Скачать техдокументацию и BIM-паспорт</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: AR-примерка на участке */}
              {activeTab === 'ar' && (
                <div className="p-5 sm:p-6 rounded-xl bg-[#0B0E14]/90 border border-[#D1D5DB]/15">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Interactive Smartphone AR Viewfinder */}
                    <div className="md:col-span-7 relative rounded-2xl overflow-hidden border-2 border-[#D1D5DB]/30 bg-[#070A0E] aspect-[16/11]">
                      <img
                        src={`${import.meta.env.BASE_URL}assets/aistudio/hero_section_background_01865031.JPG`}
                        alt="Симуляция AR-примерки капсулы SKY RIFT на горном склоне"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-left-bottom brightness-[0.68] contrast-[1.08]"
                      />
                      {/* AR Camera HUD Grid & Projected Capsule Wireframe */}
                      <svg
                        viewBox="0 0 420 280"
                        className="absolute inset-0 w-full h-full"
                        aria-label="AR-проекция капсулы на ландшафт"
                      >
                        {/* Viewfinder corners */}
                        <g stroke="#00F0FF" strokeWidth="1.8" fill="none" strokeOpacity="0.85">
                          <polyline points="16,38 16,16 38,16" />
                          <polyline points="382,16 404,16 404,38" />
                          <polyline points="16,242 16,264 38,264" />
                          <polyline points="382,264 404,264 404,242" />
                        </g>

                        {/* Projected Ground Anchor Grid Plane */}
                        <polygon
                          points="85,222 215,182 340,214 210,256"
                          fill="rgba(0,240,255,0.12)"
                          stroke="#00F0FF"
                          strokeWidth="1"
                          strokeDasharray="4 3"
                        />

                        {/* Projected Scalable & Rotatable Capsule AR Hologram */}
                        <g
                          transform={`translate(212, 150) scale(${arScale / 100}) rotate(${arRotation})`}
                        >
                          {/* Steel truss preview lines */}
                          <g stroke="#00F0FF" strokeWidth="1.5" strokeOpacity="0.85">
                            <line x1="-42" y1="24" x2="-42" y2="62" />
                            <line x1="42" y1="24" x2="42" y2="74" />
                            <line x1="-42" y1="26" x2="42" y2="72" strokeDasharray="3 3" />
                            <line x1="42" y1="26" x2="-42" y2="60" strokeDasharray="3 3" />
                          </g>
                          {/* Capsule Hologram Hull */}
                          <rect
                            x="-74"
                            y="-34"
                            width="148"
                            height="58"
                            rx="14"
                            fill="rgba(0, 240, 255, 0.16)"
                            stroke={arAnchored ? '#FF5E00' : '#00F0FF'}
                            strokeWidth="2.2"
                          />
                          <rect
                            x="4"
                            y="-26"
                            width="60"
                            height="42"
                            rx="6"
                            fill="rgba(255, 94, 0, 0.35)"
                            stroke="#FF5E00"
                            strokeWidth="1.4"
                          />
                        </g>

                        <text
                          x="26"
                          y="32"
                          fill="#00F0FF"
                          fontFamily="JetBrains Mono, monospace"
                          fontSize="10"
                        >
                          AR-ЛИДАР · МАСШТАБ {arScale}% · {arAnchored ? 'ЗАФИКСИРОВАНО' : 'ПОИСК СКЛОНА'}
                        </text>
                      </svg>
                    </div>

                    {/* AR Controls */}
                    <div className="md:col-span-5 space-y-5">
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          AR-примерка на вашем склоне
                        </h4>
                        <p className="text-xs text-[#D1D5DB]/75 mt-1 leading-relaxed">
                          Наведите камеру смартфона на участок, чтобы оценить габариты капсулы в
                          масштабе 1:1 и проверить обзор из панорамной спальни до начала бурения.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-mono mb-1.5 tabular-nums">
                            <span className="text-[#D1D5DB]/75">Масштаб проекции</span>
                            <span className="text-[#00F0FF]">{arScale}%</span>
                          </div>
                          <input
                            type="range"
                            min={75}
                            max={125}
                            value={arScale}
                            onChange={(e) => setArScale(Number(e.target.value))}
                            className="w-full skyrift-range"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-mono mb-1.5 tabular-nums">
                            <span className="text-[#D1D5DB]/75">Ориентация по склону</span>
                            <span className="text-[#00F0FF]">{arRotation}°</span>
                          </div>
                          <input
                            type="range"
                            min={-28}
                            max={28}
                            value={arRotation}
                            onChange={(e) => setArRotation(Number(e.target.value))}
                            className="w-full skyrift-range"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => setArAnchored((prev) => !prev)}
                          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            arAnchored
                              ? 'bg-[#FF5E00] text-white'
                              : 'bg-[#2F3942] text-white border border-[#00F0FF]/50 hover:border-[#00F0FF]'
                          }`}
                        >
                          {arAnchored ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Точка посадки закреплена</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5 text-[#00F0FF]" />
                              <span>Закрепить на рельефе</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Умный дом SKY RIFT OS (Interactive Mini-Console) */}
              {activeTab === 'os' && (
                <div className="p-5 sm:p-6 rounded-xl bg-[#0B0E14]/90 border border-[#D1D5DB]/15">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    {/* Live Room Response Simulation */}
                    <div className="md:col-span-6 relative rounded-xl overflow-hidden border border-[#D1D5DB]/20 min-h-[250px] flex flex-col justify-between p-4">
                      <img
                        src={`${import.meta.env.BASE_URL}assets/aistudio/hero_section_background_01865031.JPG`}
                        alt="Интерьер капсулы под управлением SKY RIFT OS"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-300"
                        style={{
                          filter: `brightness(${Math.max(0.18, 0.9 - (glassTint / 100) * 0.72)})`,
                        }}
                      />
                      {/* Electrochromic Smart Glass Tinting Overlay */}
                      <div
                        className="absolute inset-0 transition-all duration-300 pointer-events-none"
                        style={{
                          backgroundColor: `rgba(11, 14, 20, ${(glassTint / 100) * 0.78})`,
                          backdropFilter: glassTint > 40 ? `blur(${(glassTint - 40) * 0.1}px)` : 'none',
                        }}
                      />
                      {/* Warm Rift Amber Interior Lighting Scenario Overlay */}
                      <div
                        className="absolute inset-0 transition-all duration-500 pointer-events-none mix-blend-screen"
                        style={{
                          background: `radial-gradient(ellipse 85% 75% at 50% 25%, ${currentLight.color}, transparent 75%)`,
                          opacity: currentLight.glowOpacity,
                        }}
                      />

                      <div className="relative z-10 flex items-center justify-between font-mono text-[11px] bg-[#0B0E14]/80 border border-[#D1D5DB]/20 px-3 py-1.5 rounded-lg tabular-nums">
                        <span className="text-[#00F0FF]">SKY RIFT OS</span>
                        <span className="text-white">
                          {temperature}°C · Стекло {glassTint}%
                        </span>
                      </div>

                      <div className="relative z-10 bg-[#0B0E14]/82 border border-[#D1D5DB]/20 p-3 rounded-lg">
                        <div className="flex items-center justify-between text-xs font-medium text-white">
                          <span>Сценарий: {currentLight.name}</span>
                          <span className="font-mono text-[#FF5E00]">{currentLight.kelvin}</span>
                        </div>
                        <p className="text-[11px] text-[#D1D5DB]/75 mt-1">{currentLight.desc}</p>
                      </div>
                    </div>

                    {/* Interactive Mini-Console Controls */}
                    <div className="md:col-span-6 flex flex-col justify-between space-y-5">
                      {/* Climate Control */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-mono text-[#D1D5DB]/80">
                            Климат-контроль и теплый пол
                          </span>
                          <span className="font-mono text-base font-semibold text-[#00F0FF] tabular-nums">
                            +{temperature}.0°C
                          </span>
                        </div>
                        <input
                          type="range"
                          min={16}
                          max={26}
                          step={1}
                          value={temperature}
                          onChange={(e) => setTemperature(Number(e.target.value))}
                          className="w-full skyrift-range"
                        />
                        <div className="flex justify-between font-mono text-[10px] text-[#D1D5DB]/55 mt-1 tabular-nums">
                          <span>16°C (Эко-сон)</span>
                          <span>22°C (Комфорт)</span>
                          <span>26°C (После лыж)</span>
                        </div>
                      </div>

                      {/* Electrochromic Auto-Tinting Glass Control */}
                      <div className="pt-3 border-t border-[#D1D5DB]/15">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-mono text-[#D1D5DB]/80">
                            Автозатемнение панорамных стекол
                          </span>
                          <span className="font-mono text-sm font-semibold text-white tabular-nums">
                            {glassTint}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={glassTint}
                          onChange={(e) => setGlassTint(Number(e.target.value))}
                          className="w-full skyrift-range skyrift-range-amber"
                        />
                        <div className="flex justify-between font-mono text-[10px] text-[#D1D5DB]/55 mt-1 tabular-nums">
                          <span>0% (Кристальная прозрачность)</span>
                          <span>100% (Приватность)</span>
                        </div>
                      </div>

                      {/* Rift Amber Lighting Scenarios */}
                      <div className="pt-3 border-t border-[#D1D5DB]/15">
                        <div className="text-xs font-mono text-[#D1D5DB]/80 mb-2.5 flex items-center gap-1.5">
                          <Sun className="w-3.5 h-3.5 text-[#FF5E00]" />
                          <span>Сценарии янтарной подсветки</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {LIGHT_SCENES.map((sc) => {
                            const active = sc.id === lightScene;
                            return (
                              <button
                                key={sc.id}
                                type="button"
                                onClick={() => setLightScene(sc.id)}
                                className={`px-2.5 py-2.5 rounded-lg text-xs font-medium border transition-all cursor-pointer text-center ${
                                  active
                                    ? 'bg-[#FF5E00] border-[#FF5E00] text-white shadow-[0_0_14px_rgba(255,94,0,0.4)]'
                                    : 'bg-[#2F3942]/45 border-[#D1D5DB]/20 text-[#D1D5DB]/80 hover:border-[#D1D5DB]/45'
                                }`}
                              >
                                {sc.name.split(' ')[0]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SpecularCard>
      </div>
    </section>
  );
};
