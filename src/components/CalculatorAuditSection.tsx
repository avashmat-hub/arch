import React, { useEffect, useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  MapPin,
  CheckCircle2,
  Send,
  Phone,
  Mail,
} from 'lucide-react';
import { SpecularCard } from './SpecularCard';
import { SkyRiftLogo } from './SkyRiftLogo';
import { GoogleSheetsSyncPanel } from './GoogleSheetsSyncPanel';
import type { ConfiguratorTransferData } from './CapsuleConfigurator3D';
import type { SkyRiftLeadPayload } from '../lib/googleSheets';

type AutonomyLevel = 'base' | 'extended' | 'full';
type LogisticsType = 'standard' | 'cliff' | 'helicopter';

interface CalculatorAuditSectionProps {
  transferredConfig: ConfiguratorTransferData | null;
}

const AUTONOMY_OPTIONS: {
  id: AutonomyLevel;
  label: string;
  days: string;
  addPriceMln: number;
}[] = [
  { id: 'base', label: 'Базовая (сети + резерв)', days: '3 дня', addPriceMln: 0 },
  { id: 'extended', label: 'Расширенная (Солнце + LiFePO4)', days: '18 дней', addPriceMln: 2.3 },
  { id: 'full', label: 'Полная автономия (Off-grid 365)', days: '30+ дней', addPriceMln: 3.55 },
];

const LOGISTICS_OPTIONS: {
  id: LogisticsType;
  label: string;
  sub: string;
  multiplier: number;
  extraWeeks: number;
}[] = [
  {
    id: 'standard',
    label: 'Стандартный подъезд',
    sub: 'Автокран и уклон до 25°',
    multiplier: 1.0,
    extraWeeks: 0,
  },
  {
    id: 'cliff',
    label: 'Крутой скальный склон (45°–60°)',
    sub: 'Усиленная X-ферма до 6 м и скальные анкеры',
    multiplier: 1.14,
    extraWeeks: 2,
  },
  {
    id: 'helicopter',
    label: 'Вертолетный монтаж',
    sub: 'Сверхлегкая секционная доставка Ми-8 / Ка-32',
    multiplier: 1.28,
    extraWeeks: 3,
  },
];

export const CalculatorAuditSection: React.FC<CalculatorAuditSectionProps> = ({
  transferredConfig,
}) => {
  // Calculator state
  const [moduleCount, setModuleCount] = useState<number>(1);
  const [autonomy, setAutonomy] = useState<AutonomyLevel>('extended');
  const [logistics, setLogistics] = useState<LogisticsType>('cliff');

  // Sync if user transferred configuration from 3D Configurator
  useEffect(() => {
    if (!transferredConfig) return;
    if (transferredConfig.solar && transferredConfig.battery && transferredConfig.recuperation) {
      setAutonomy('full');
    } else if (transferredConfig.solar || transferredConfig.battery) {
      setAutonomy('extended');
    } else {
      setAutonomy('base');
    }
    if (transferredConfig.stiltHeight >= 4.2) {
      setLogistics('cliff');
    } else if (transferredConfig.stiltHeight <= 2.2) {
      setLogistics('standard');
    }
  }, [transferredConfig]);

  // Budget & Lead time math
  const baseUnitMln = transferredConfig ? Math.max(11.8, transferredConfig.unitPriceMln - 2.3) : 11.8;
  const autonomyOpt = AUTONOMY_OPTIONS.find((a) => a.id === autonomy) ?? AUTONOMY_OPTIONS[1];
  const logisticsOpt = LOGISTICS_OPTIONS.find((l) => l.id === logistics) ?? LOGISTICS_OPTIONS[1];

  // B2B volume discount for multi-module resort clusters
  const volumeDiscount =
    moduleCount >= 15 ? 0.88 : moduleCount >= 8 ? 0.92 : moduleCount >= 4 ? 0.96 : 1.0;

  const singleUnitTotal = (baseUnitMln + autonomyOpt.addPriceMln) * logisticsOpt.multiplier * volumeDiscount;
  const totalBudgetMln = singleUnitTotal * moduleCount;

  const productionWeeks = Math.round(6 + Math.min(moduleCount - 1, 14) * 0.75 + logisticsOpt.extraWeeks);
  const mountDays = moduleCount === 1 ? 3 : Math.min(3 + Math.ceil((moduleCount - 1) * 1.6), 28);

  // Audit Form state
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [gps, setGps] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pendingSheetsExport, setPendingSheetsExport] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentLeadPayload: SkyRiftLeadPayload = {
    date: new Date().toLocaleString('ru-RU'),
    clientName: name.trim() || 'Расчет без имени',
    contact: contact.trim() || 'Не указан',
    moduleCount,
    autonomyLabel: `${autonomyOpt.label} (${autonomyOpt.days})`,
    logisticsLabel: logisticsOpt.label,
    budgetMln: totalBudgetMln.toFixed(1),
    productionWeeks,
    gps: gps.trim() || 'Не указаны',
    fileName: uploadedFile ? uploadedFile.name : 'Нет файла',
    configSummary: transferredConfig
      ? `Обшивка: ${transferredConfig.shell}, ферма: ${transferredConfig.stiltHeight.toFixed(1)} м, автономия: ${transferredConfig.autonomyDays} дн.`
      : 'Стандартная конфигурация M-41',
  };

  const validateAndSetFile = (file: File | null) => {
    if (!file) return;
    const allowed = ['.pdf', '.dwg', '.kml', '.kmz'];
    const lower = file.name.toLowerCase();
    const isValid = allowed.some((ext) => lower.endsWith(ext));
    if (!isValid) {
      setFormError('Поддерживаются файлы топосъемки и кадастра в форматах .pdf, .dwg, .kml');
      return;
    }
    setFormError(null);
    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    validateAndSetFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setFormError('Укажите ваше имя для связи с главным архитектором проекта.');
      return;
    }
    if (!contact.trim() || contact.trim().length < 5) {
      setFormError('Введите телефон, Telegram или email для отправки 3D-посадки.');
      return;
    }
    setFormError(null);
    setSubmitted(true);
  };

  return (
    <>
      <section
        id="calculator"
        className="relative py-24 lg:py-32 border-t border-[#D1D5DB]/15 bg-[#0B0E14] scroll-mt-20"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Header */}
          <div className="max-w-3xl mb-14 reveal-section">
            <div className="flex items-center gap-3 text-xs font-mono text-[#00F0FF] mb-3 tabular-nums">
              <span>06. Калькулятор проекта и 3D-аудит</span>
              <span className="text-[#D1D5DB]/35" aria-hidden="true">·</span>
              <span className="text-[#D1D5DB]/75">Индивидуальный расчет под рельеф</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-4"
              style={{ textWrap: 'balance' }}
            >
              Рассчитайте бюджет и закажите 3D-посадку на ваш склон
            </h2>
            <p className="text-base sm:text-lg text-[#D1D5DB]/80 leading-relaxed">
              Оцените инвестиции для частной резиденции или горного курорта, а затем отправьте
              GPS-координаты или топосъемку — наши инженеры подготовят схему свайного поля и
              видовых коридоров за 48 часов.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: Interactive Terrain Project Calculator */}
            <div className="lg:col-span-6 flex flex-col">
              <SpecularCard className="flex-1 p-6 sm:p-8 bg-[#121821]/95 flex flex-col justify-between gap-7">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#D1D5DB]/15">
                    <h3 className="text-xl font-semibold text-white">
                      Калькулятор проекта под рельеф
                    </h3>
                    {volumeDiscount < 1 && (
                      <span className="font-mono text-xs text-[#00F0FF] tabular-nums">
                        B2B-скидка {Math.round((1 - volumeDiscount) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* 1. Number of Modules */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="module-count-slider" className="text-xs font-mono text-[#D1D5DB]/80">
                        Количество модулей SKY RIFT
                      </label>
                      <span className="font-mono text-lg font-semibold text-white tabular-nums">
                        {moduleCount}{' '}
                        <span className="text-xs text-[#D1D5DB]/65 font-normal">
                          {moduleCount === 1
                            ? 'частная резиденция'
                            : moduleCount >= 15
                            ? 'крупный курорт'
                            : 'кластер эко-отеля'}
                        </span>
                      </span>
                    </div>

                    <input
                      id="module-count-slider"
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={moduleCount}
                      onChange={(e) => setModuleCount(Number(e.target.value))}
                      className="w-full skyrift-range my-2"
                    />

                    {/* Quick Module Presets */}
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {[
                        { count: 1, label: '1 резиденция' },
                        { count: 4, label: '4 модуля' },
                        { count: 8, label: '8 модулей' },
                        { count: 15, label: '15+ курорт' },
                      ].map((preset) => (
                        <button
                          key={preset.count}
                          type="button"
                          onClick={() => setModuleCount(preset.count)}
                          className={`py-2 px-2 rounded-lg text-xs font-mono border transition-all cursor-pointer tabular-nums ${
                            moduleCount === preset.count
                              ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white'
                              : 'bg-[#0B0E14]/70 border-[#D1D5DB]/15 text-[#D1D5DB]/75 hover:border-[#D1D5DB]/40'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Autonomy Tier */}
                  <div className="pt-4 border-t border-[#D1D5DB]/15">
                    <div className="text-xs font-mono text-[#D1D5DB]/80 mb-2.5">
                      Уровень инженерной автономности
                    </div>
                    <div className="space-y-2">
                      {AUTONOMY_OPTIONS.map((opt) => {
                        const active = opt.id === autonomy;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setAutonomy(opt.id)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-left transition-all cursor-pointer ${
                              active
                                ? 'bg-[#2F3942]/75 border-[#00F0FF] text-white'
                                : 'bg-[#0B0E14]/65 border-[#D1D5DB]/15 text-[#D1D5DB]/80 hover:border-[#D1D5DB]/40'
                            }`}
                          >
                            <span className="text-sm font-medium">{opt.label}</span>
                            <span className="font-mono text-xs text-[#00F0FF] whitespace-nowrap tabular-nums">
                              {opt.days}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Logistics & Slope Mounting Complexity */}
                  <div className="pt-4 border-t border-[#D1D5DB]/15">
                    <div className="text-xs font-mono text-[#D1D5DB]/80 mb-2.5">
                      Сложность логистики и монтажа на склоне
                    </div>
                    <div className="space-y-2">
                      {LOGISTICS_OPTIONS.map((opt) => {
                        const active = opt.id === logistics;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setLogistics(opt.id)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-left transition-all cursor-pointer ${
                              active
                                ? 'bg-[#2F3942]/75 border-[#FF5E00] text-white'
                                : 'bg-[#0B0E14]/65 border-[#D1D5DB]/15 text-[#D1D5DB]/80 hover:border-[#D1D5DB]/40'
                            }`}
                          >
                            <div>
                              <div className="text-sm font-medium">{opt.label}</div>
                              <div className="text-xs text-[#D1D5DB]/60 mt-0.5">{opt.sub}</div>
                            </div>
                            <span className="font-mono text-xs text-[#D1D5DB]/80 shrink-0 tabular-nums">
                              ×{opt.multiplier.toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Live Calculation Results Box */}
                <div className="p-5 rounded-xl bg-[#0B0E14] border border-[#00F0FF]/35 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[11px] font-mono text-[#D1D5DB]/65">
                      Предварительный бюджет
                    </div>
                    <div className="font-mono text-2xl font-bold text-[#FF5E00] mt-1 tabular-nums">
                      {totalBudgetMln.toFixed(1)} млн ₽
                    </div>
                    <div className="text-[11px] font-mono text-[#D1D5DB]/55 mt-0.5 tabular-nums">
                      ~{singleUnitTotal.toFixed(1)} млн / модуль
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-[#D1D5DB]/65">
                      Производство
                    </div>
                    <div className="font-mono text-2xl font-bold text-white mt-1 tabular-nums">
                      {productionWeeks} нед.
                    </div>
                    <div className="text-[11px] font-mono text-[#D1D5DB]/55 mt-0.5">
                      Заводская сборка
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-[#D1D5DB]/65">
                      Монтаж на склоне
                    </div>
                    <div className="font-mono text-2xl font-bold text-[#00F0FF] mt-1 tabular-nums">
                      {mountDays} дн.
                    </div>
                    <div className="text-[11px] font-mono text-[#D1D5DB]/55 mt-0.5">
                      На готовые сваи
                    </div>
                  </div>
                </div>
              </SpecularCard>
            </div>

            {/* Right: 3D Site Audit Application Form */}
            <div className="lg:col-span-6 flex flex-col">
              <SpecularCard className="flex-1 p-6 sm:p-8 bg-[#2F3942]/45 flex flex-col justify-between">
                {submitted ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4">
                    <div className="w-16 h-16 rounded-full bg-[#00F0FF]/12 border border-[#00F0FF] flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-8 h-8 text-[#00F0FF]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Заявка на 3D-аудит участка принята
                    </h3>
                    <p className="text-sm sm:text-base text-[#D1D5DB]/85 max-w-md leading-relaxed mb-6">
                      Спасибо, {name}. Инженер-геодезист SKY RIFT свяжется с вами по контакту{' '}
                      <span className="text-white font-medium">{contact}</span> и подготовит
                      предварительную 3D-посадку для {moduleCount}{' '}
                      {moduleCount === 1 ? 'модуля' : 'модулей'} с расчетом свайного поля.
                    </p>
                    <div className="w-full max-w-md p-4 rounded-lg bg-[#0B0E14]/80 border border-[#D1D5DB]/15 text-left font-mono text-xs space-y-1.5 mb-6 tabular-nums">
                      <div className="flex justify-between">
                        <span className="text-[#D1D5DB]/60">Оценка бюджета:</span>
                        <span className="text-[#FF5E00]">{totalBudgetMln.toFixed(1)} млн ₽</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#D1D5DB]/60">GPS-координаты:</span>
                        <span className="text-white">{gps || 'Уточним при созвоне'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#D1D5DB]/60">Топосъемка:</span>
                        <span className="text-[#00F0FF]">
                          {uploadedFile ? uploadedFile.name : 'Не прикреплена'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPendingSheetsExport(true)}
                        className="px-5 py-2.5 rounded-lg text-xs font-semibold text-[#0B0E14] bg-[#00F0FF] hover:bg-[#33f3ff] transition-colors cursor-pointer"
                      >
                        Сохранить в Google Sheets
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setName('');
                          setContact('');
                          setGps('');
                          setUploadedFile(null);
                        }}
                        className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#2F3942] border border-[#D1D5DB]/25 hover:border-[#00F0FF] transition-colors cursor-pointer"
                      >
                        Отправить еще один участок
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between gap-6" noValidate>
                    <div className="space-y-5">
                      <div className="pb-4 border-b border-[#D1D5DB]/15">
                        <h3 className="text-xl font-semibold text-white">
                          Заявка на 3D-аудит участка
                        </h3>
                        <p className="text-xs sm:text-sm text-[#D1D5DB]/70 mt-1">
                          Приложите координаты или файл топосъемки для расчета посадки на рельеф
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="audit-name"
                            className="block text-xs font-mono text-[#D1D5DB]/80 mb-1.5"
                          >
                            Ваше имя *
                          </label>
                          <input
                            id="audit-name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Александр Волков"
                            className="w-full px-4 py-3 rounded-lg bg-[#0B0E14]/90 border border-[#D1D5DB]/20 text-sm text-white placeholder:text-[#D1D5DB]/40 focus:outline-none focus:border-[#00F0FF] transition-colors"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="audit-contact"
                            className="block text-xs font-mono text-[#D1D5DB]/80 mb-1.5"
                          >
                            Телефон / Telegram / Email *
                          </label>
                          <input
                            id="audit-contact"
                            type="text"
                            required
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="+7 (999) 000-41-41"
                            className="w-full px-4 py-3 rounded-lg bg-[#0B0E14]/90 border border-[#D1D5DB]/20 text-sm text-white placeholder:text-[#D1D5DB]/40 focus:outline-none focus:border-[#00F0FF] transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="audit-gps"
                            className="block text-xs font-mono text-[#D1D5DB]/80"
                          >
                            GPS-координаты участка или кадастровый номер
                          </label>
                          <button
                            type="button"
                            onClick={() => setGps('43.6714° N, 40.2618° E (Красная Поляна)')}
                            className="text-[11px] font-mono text-[#00F0FF] hover:underline cursor-pointer"
                          >
                            Пример координат
                          </button>
                        </div>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-[#00F0FF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="audit-gps"
                            type="text"
                            value={gps}
                            onChange={(e) => setGps(e.target.value)}
                            placeholder="Например: 43.6714° N, 40.2618° E"
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0B0E14]/90 border border-[#D1D5DB]/20 text-sm font-mono text-white placeholder:text-[#D1D5DB]/40 focus:outline-none focus:border-[#00F0FF] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Drag-and-Drop Topographic Survey Upload Zone */}
                      <div>
                        <span className="block text-xs font-mono text-[#D1D5DB]/80 mb-1.5">
                          Топосъемка или кадастровый план (.pdf, .dwg, .kml)
                        </span>
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              fileInputRef.current?.click();
                            }
                          }}
                          className={`rounded-xl border border-dashed p-5 text-center transition-all cursor-pointer ${
                            isDragging
                              ? 'border-[#00F0FF] bg-[#00F0FF]/10'
                              : 'border-[#D1D5DB]/30 bg-[#0B0E14]/70 hover:border-[#00F0FF]/65'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.dwg,.kml,.kmz"
                            className="hidden"
                            onChange={(e) => validateAndSetFile(e.target.files?.[0] ?? null)}
                          />
                          {uploadedFile ? (
                            <div className="flex items-center justify-between gap-3 text-left">
                              <div className="flex items-center gap-3 min-w-0">
                                <FileText className="w-5 h-5 text-[#00F0FF] shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-white truncate">
                                    {uploadedFile.name}
                                  </div>
                                  <div className="font-mono text-[11px] text-[#D1D5DB]/60 tabular-nums">
                                    {(uploadedFile.size / 1024).toFixed(1)} КБ · Готово к загрузке
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedFile(null);
                                }}
                                className="p-1.5 rounded-md text-[#D1D5DB]/70 hover:text-white hover:bg-[#2F3942]"
                                aria-label="Удалить файл"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2 py-1">
                              <UploadCloud className="w-6 h-6 text-[#00F0FF]" />
                              <div className="text-sm text-[#D1D5DB]">
                                Перетащите файл сюда или{' '}
                                <span className="text-[#00F0FF] underline underline-offset-2">
                                  выберите на диске
                                </span>
                              </div>
                              <div className="font-mono text-[11px] text-[#D1D5DB]/55">
                                Форматы: PDF, DWG, KML · до 50 МБ
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {formError && (
                        <div
                          role="alert"
                          className="p-3 rounded-lg bg-[#FF5E00]/15 border border-[#FF5E00]/60 text-xs text-[#FFD4BA]"
                        >
                          {formError}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-lg text-sm sm:text-base font-semibold text-white bg-[#FF5E00] hover:bg-[#e55500] shadow-[0_0_28px_rgba(255,94,0,0.4)] hover:shadow-[0_0_36px_rgba(255,94,0,0.6)] transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Заказать 3D-посадку на рельеф</span>
                      </button>
                      <p className="text-[11px] text-[#D1D5DB]/55 text-center">
                        Параметры из калькулятора ({moduleCount}{' '}
                        {moduleCount === 1 ? 'модуль' : 'модулей'} · ~{totalBudgetMln.toFixed(1)} млн ₽)
                        прикрепляются к заявке автоматически.
                      </p>
                    </div>
                  </form>
                )}
              </SpecularCard>
            </div>
          </div>

          {/* Google Sheets CRM & Calculations Sync Panel */}
          <GoogleSheetsSyncPanel
            currentLeadPayload={currentLeadPayload}
            pendingSubmitExport={pendingSheetsExport}
            onConsumePendingExport={() => setPendingSheetsExport(false)}
          />
        </div>
      </section>

      {/* Minimalist Architectural Footer on Deep Obsidian #0B0E14 */}
      <footer className="border-t border-[#D1D5DB]/20 bg-[#0B0E14] py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#D1D5DB]/15">
            <div className="md:col-span-4 space-y-4">
              <SkyRiftLogo compact className="h-14 w-auto" showTagline />
              <p className="text-xs sm:text-sm text-[#D1D5DB]/65 max-w-xs leading-relaxed">
                Архитектурно-строительное бюро автономных модульных резиденций и горных
                эко-отелей на экстремальном рельефе.
              </p>
            </div>

            <div className="md:col-span-4">
              <div className="text-xs font-mono text-[#00F0FF] mb-4">Навигация</div>
              <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm text-[#D1D5DB]/80">
                <li>
                  <a href="#engineering" className="hover:text-white transition-colors">
                    Инженерия
                  </a>
                </li>
                <li>
                  <a href="#floorplans" className="hover:text-white transition-colors">
                    Планировки
                  </a>
                </li>
                <li>
                  <a href="#configurator" className="hover:text-white transition-colors">
                    3D-конфигуратор
                  </a>
                </li>
                <li>
                  <a href="#b2b-resorts" className="hover:text-white transition-colors">
                    B2B-курорты
                  </a>
                </li>
                <li>
                  <a href="#technologies" className="hover:text-white transition-colors">
                    Технологии
                  </a>
                </li>
                <li>
                  <a href="#calculator" className="hover:text-white transition-colors">
                    Расчет проекта
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <div className="text-xs font-mono text-[#00F0FF] mb-4">Архитектурное бюро</div>
              <div className="space-y-2.5 text-sm text-[#D1D5DB]/85">
                <div className="flex items-center gap-2.5 font-mono">
                  <Phone className="w-4 h-4 text-[#FF5E00]" />
                  <span>+7 (800) 550-41-09</span>
                </div>
                <div className="flex items-center gap-2.5 font-mono">
                  <Mail className="w-4 h-4 text-[#00F0FF]" />
                  <span>bureau@skyrift.arch</span>
                </div>
                <div className="text-xs text-[#D1D5DB]/60 pt-1">
                  Сочи · Красная Поляна · Москва · Инженерное производство
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#D1D5DB]/55">
            <div>© 2026 SKY RIFT Futuristic Homes. Все права защищены.</div>
            <div className="flex flex-wrap items-center gap-4">
              <span>Проектная документация и сертификаты ISO 9001</span>
              <span aria-hidden="true">·</span>
              <span>Политика конфиденциальности</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
