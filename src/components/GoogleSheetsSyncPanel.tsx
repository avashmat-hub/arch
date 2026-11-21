import React, { useEffect, useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  Plus,
  RefreshCw,
  LogOut,
  ExternalLink,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { SpecularCard } from './SpecularCard';
import { initAuth, googleSignIn, getAccessToken, logout } from '../lib/googleAuth';
import {
  listUserSpreadsheets,
  getSpreadsheetMetadata,
  readSheetValues,
  createSkyRiftSpreadsheet,
  appendLeadRow,
  clearSheetRow,
  type DriveSpreadsheetItem,
  type SpreadsheetMetadata,
  type SkyRiftLeadPayload,
} from '../lib/googleSheets';

interface GoogleSheetsSyncPanelProps {
  currentLeadPayload: SkyRiftLeadPayload;
  pendingSubmitExport?: boolean;
  onConsumePendingExport?: () => void;
}

type PendingConfirmation =
  | { type: 'create'; title: string }
  | { type: 'append'; spreadsheetTitle: string; sheetTitle: string; lead: SkyRiftLeadPayload }
  | { type: 'clearRow'; spreadsheetTitle: string; sheetTitle: string; rowNumber: number; preview: string };

export const GoogleSheetsSyncPanel: React.FC<GoogleSheetsSyncPanelProps> = ({
  currentLeadPayload,
  pendingSubmitExport = false,
  onConsumePendingExport,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [spreadsheets, setSpreadsheets] = useState<DriveSpreadsheetItem[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>('');
  const [metadata, setMetadata] = useState<SpreadsheetMetadata | null>(null);
  const [selectedTabTitle, setSelectedTabTitle] = useState<string>('');
  const [rows, setRows] = useState<string[][]>([]);

  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [loadingRows, setLoadingRows] = useState<boolean>(false);
  const [mutating, setMutating] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [newSheetName, setNewSheetName] = useState<string>('SKY RIFT — Заявки и расчеты 3D-аудита');
  const [confirmation, setConfirmation] = useState<PendingConfirmation | null>(null);

  const handleAuthError = useCallback((err: unknown) => {
    const e = err as Error & { status?: number };
    if (e?.status === 401 || e?.status === 403) {
      setNeedsAuth(true);
      setErrorMsg('Срок действия сессии Google истек или недостаточно прав. Войдите снова.');
    } else {
      setErrorMsg(e?.message || 'Не удалось выполнить запрос к Google Sheets.');
    }
  }, []);

  const loadSpreadsheetList = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    setLoadingList(true);
    setErrorMsg(null);
    try {
      const files = await listUserSpreadsheets(token);
      setSpreadsheets(files);
      if (files.length > 0 && !selectedSpreadsheetId) {
        setSelectedSpreadsheetId(files[0].id);
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoadingList(false);
    }
  }, [handleAuthError, selectedSpreadsheetId]);

  const loadSelectedSpreadsheetData = useCallback(
    async (spreadsheetId: string, preferredTab?: string) => {
      if (!spreadsheetId) return;
      const token = await getAccessToken();
      if (!token) {
        setNeedsAuth(true);
        return;
      }
      setLoadingRows(true);
      setErrorMsg(null);
      try {
        const meta = await getSpreadsheetMetadata(token, spreadsheetId);
        setMetadata(meta);
        const tabToUse =
          preferredTab && meta.sheets.some((s) => s.title === preferredTab)
            ? preferredTab
            : meta.sheets[0]?.title ?? '';
        setSelectedTabTitle(tabToUse);

        if (tabToUse) {
          const values = await readSheetValues(token, spreadsheetId, tabToUse);
          setRows(values);
        } else {
          setRows([]);
        }
      } catch (err) {
        handleAuthError(err);
      } finally {
        setLoadingRows(false);
      }
    },
    [handleAuthError]
  );

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser) => {
        setUser(authedUser);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Load spreadsheet list when authenticated
  useEffect(() => {
    if (!needsAuth && user) {
      void loadSpreadsheetList();
    }
  }, [needsAuth, user, loadSpreadsheetList]);

  // Load metadata & rows when spreadsheet changes
  useEffect(() => {
    if (!needsAuth && selectedSpreadsheetId) {
      void loadSelectedSpreadsheetData(selectedSpreadsheetId);
    }
  }, [needsAuth, selectedSpreadsheetId, loadSelectedSpreadsheetData]);

  // If user submitted the audit form and requested immediate Sheets export, open confirmation dialog
  useEffect(() => {
    if (pendingSubmitExport && !needsAuth && metadata && selectedTabTitle) {
      setConfirmation({
        type: 'append',
        spreadsheetTitle: metadata.title,
        sheetTitle: selectedTabTitle,
        lead: currentLeadPayload,
      });
      onConsumePendingExport?.();
    }
  }, [
    pendingSubmitExport,
    needsAuth,
    metadata,
    selectedTabTitle,
    currentLeadPayload,
    onConsumePendingExport,
  ]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const result = await googleSignIn();
      setUser(result.user);
      setNeedsAuth(false);
    } catch (err) {
      const e = err as Error & { code?: string };
      if (
        e?.code === 'auth/popup-blocked' ||
        e?.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        setErrorMsg(
          'Всплывающее окно входа заблокировано внутри встроенного фрейма (например, в Google Сайтах). Откройте страницу SKY RIFT в отдельной вкладке браузера для авторизации Google Sheets.'
        );
      } else {
        setErrorMsg(e?.message || 'Авторизация Google отменена или не завершена.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setNeedsAuth(true);
    setSpreadsheets([]);
    setSelectedSpreadsheetId('');
    setMetadata(null);
    setSelectedTabTitle('');
    setRows([]);
    setStatusMsg(null);
    setErrorMsg(null);
  };

  const handleTabChange = async (newTab: string) => {
    setSelectedTabTitle(newTab);
    if (!selectedSpreadsheetId || !newTab) return;
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    setLoadingRows(true);
    setErrorMsg(null);
    try {
      const values = await readSheetValues(token, selectedSpreadsheetId, newTab);
      setRows(values);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoadingRows(false);
    }
  };

  // Execute confirmed mutating Google Sheets operation
  const executeConfirmedAction = async () => {
    if (!confirmation) return;
    const token = await getAccessToken();
    if (!token) {
      setConfirmation(null);
      setNeedsAuth(true);
      return;
    }

    setMutating(true);
    setErrorMsg(null);
    setStatusMsg(null);

    try {
      if (confirmation.type === 'create') {
        const created = await createSkyRiftSpreadsheet(token, confirmation.title);
        setMetadata(created);
        setSelectedSpreadsheetId(created.spreadsheetId);
        const firstTab = created.sheets[0]?.title ?? '';
        setSelectedTabTitle(firstTab);
        await loadSpreadsheetList();
        if (firstTab) {
          const vals = await readSheetValues(token, created.spreadsheetId, firstTab);
          setRows(vals);
        }
        setStatusMsg(`Создана новая таблица «${created.title}» с колонками SKY RIFT.`);
      } else if (confirmation.type === 'append') {
        await appendLeadRow(
          token,
          selectedSpreadsheetId,
          confirmation.sheetTitle,
          confirmation.lead
        );
        const vals = await readSheetValues(token, selectedSpreadsheetId, confirmation.sheetTitle);
        setRows(vals);
        setStatusMsg(
          `Расчет и заявка сохранены в таблицу «${confirmation.spreadsheetTitle}» (${confirmation.sheetTitle}).`
        );
      } else if (confirmation.type === 'clearRow') {
        await clearSheetRow(
          token,
          selectedSpreadsheetId,
          confirmation.sheetTitle,
          confirmation.rowNumber
        );
        const vals = await readSheetValues(token, selectedSpreadsheetId, confirmation.sheetTitle);
        setRows(vals);
        setStatusMsg(`Строка №${confirmation.rowNumber} очищена на листе «${confirmation.sheetTitle}».`);
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setMutating(false);
      setConfirmation(null);
    }
  };

  return (
    <div className="mt-10">
      <SpecularCard className="p-6 sm:p-8 bg-[#10161F]/95 border-[#00F0FF]/30">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D1D5DB]/15">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-[#0B0E14] border border-[#00F0FF]/40 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
              <div className="text-xs font-mono text-[#00F0FF]">
                Интеграция Google Sheets · База расчетов и заявок
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mt-0.5">
                Синхронизация проектов SKY RIFT с Google Таблицами
              </h3>
              <p className="text-xs sm:text-sm text-[#D1D5DB]/70 mt-1">
                Сохраняйте конфигурации модулей, бюджеты и GPS-координаты участков напрямую в ваш
                Google Диск и просматривайте актуальный реестр проектов.
              </p>
            </div>
          </div>

          {/* Auth Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {needsAuth ? (
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button inline-flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white text-[#1f1f1f] hover:bg-[#f2f4f7] border border-[#747775]/40 font-medium text-sm shadow-sm transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
              >
                <div className="w-5 h-5 shrink-0">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: 'block' }}
                    aria-hidden="true"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </div>
                <span>{isLoggingIn ? 'Подключение...' : 'Sign in with Google'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-white">
                    {user?.displayName || 'Google Аккаунт'}
                  </div>
                  <div className="font-mono text-[11px] text-[#00F0FF]">{user?.email}</div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-[#D1D5DB] bg-[#2F3942]/70 border border-[#D1D5DB]/20 hover:border-[#FF5E00] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Выйти</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status / Error Feedback */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-5 p-3.5 rounded-lg bg-[#FF5E00]/15 border border-[#FF5E00]/60 text-xs sm:text-sm text-[#FFD4BA] flex items-center justify-between gap-3"
          >
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-[#FFD4BA] hover:text-white cursor-pointer"
              aria-label="Закрыть сообщение об ошибке"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {statusMsg && (
          <div className="mt-5 p-3.5 rounded-lg bg-[#00F0FF]/12 border border-[#00F0FF]/50 text-xs sm:text-sm text-white flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
              <span>{statusMsg}</span>
            </span>
            <button
              type="button"
              onClick={() => setStatusMsg(null)}
              className="text-[#D1D5DB] hover:text-white cursor-pointer"
              aria-label="Закрыть уведомление"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Signed-in Workspace Controls */}
        {!needsAuth ? (
          <div className="mt-6 space-y-6">
            {/* Toolbar: Select existing spreadsheet, select tab, or create new */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              {/* Spreadsheet Selector */}
              <div className="lg:col-span-5">
                <label
                  htmlFor="gsheet-select"
                  className="block text-xs font-mono text-[#D1D5DB]/75 mb-1.5"
                >
                  Выберите Google Таблицу из вашего Диска
                </label>
                <div className="flex items-center gap-2">
                  <select
                    id="gsheet-select"
                    value={selectedSpreadsheetId}
                    onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
                    disabled={loadingList}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0E14] border border-[#D1D5DB]/25 text-sm text-white focus:outline-none focus:border-[#00F0FF]"
                  >
                    {spreadsheets.length === 0 ? (
                      <option value="">Нет доступных таблиц — создайте новую справа</option>
                    ) : (
                      spreadsheets.map((file) => (
                        <option key={file.id} value={file.id}>
                          {file.name}
                        </option>
                      ))
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={() => void loadSpreadsheetList()}
                    disabled={loadingList}
                    title="Обновить список таблиц"
                    className="p-2.5 rounded-lg bg-[#2F3942]/70 border border-[#D1D5DB]/20 text-[#D1D5DB] hover:border-[#00F0FF] hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingList ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Sheet Tab Selector (Dynamic from API metadata, never hardcoded) */}
              <div className="lg:col-span-3">
                <label
                  htmlFor="gtab-select"
                  className="block text-xs font-mono text-[#D1D5DB]/75 mb-1.5"
                >
                  Лист таблицы
                </label>
                <select
                  id="gtab-select"
                  value={selectedTabTitle}
                  onChange={(e) => void handleTabChange(e.target.value)}
                  disabled={!metadata || loadingRows}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0E14] border border-[#D1D5DB]/25 text-sm text-white focus:outline-none focus:border-[#00F0FF]"
                >
                  {metadata?.sheets.map((s) => (
                    <option key={s.sheetId} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Action: Save Current Calculation & Lead */}
              <div className="lg:col-span-4 flex items-center gap-2">
                <button
                  type="button"
                  disabled={!metadata || !selectedTabTitle || mutating}
                  onClick={() => {
                    if (!metadata || !selectedTabTitle) return;
                    setConfirmation({
                      type: 'append',
                      spreadsheetTitle: metadata.title,
                      sheetTitle: selectedTabTitle,
                      lead: currentLeadPayload,
                    });
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#FF5E00] hover:bg-[#e55500] transition-colors cursor-pointer disabled:opacity-45 whitespace-nowrap"
                >
                  <Upload className="w-4 h-4 shrink-0" />
                  <span>Записать расчет в таблицу</span>
                </button>

                {metadata?.spreadsheetUrl && (
                  <a
                    href={metadata.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Открыть в Google Sheets"
                    className="p-2.5 rounded-lg bg-[#2F3942]/70 border border-[#D1D5DB]/20 text-[#00F0FF] hover:border-[#00F0FF] transition-colors shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Create New SKY RIFT Spreadsheet Strip */}
            <div className="p-4 rounded-lg bg-[#0B0E14]/80 border border-[#D1D5DB]/15 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="text-xs font-mono text-[#D1D5DB]/70 shrink-0">
                Создать новую таблицу SKY RIFT:
              </div>
              <input
                type="text"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                placeholder="Название таблицы в Google Диске"
                className="flex-1 px-3 py-2 rounded-md bg-[#121821] border border-[#D1D5DB]/20 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00F0FF]"
              />
              <button
                type="button"
                disabled={mutating || !newSheetName.trim()}
                onClick={() =>
                  setConfirmation({
                    type: 'create',
                    title: newSheetName.trim(),
                  })
                }
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-[#0B0E14] bg-[#00F0FF] hover:bg-[#33f3ff] transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Создать таблицу</span>
              </button>
            </div>

            {/* Live Spreadsheet Data Preview Table */}
            <div className="rounded-lg bg-[#090C11] border border-[#D1D5DB]/15 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#D1D5DB]/15 bg-[#0E131B]">
                <div className="font-mono text-xs text-[#D1D5DB]/80 tabular-nums">
                  {metadata
                    ? `${metadata.title} · Лист: ${selectedTabTitle} (${rows.length} стр.)`
                    : 'Выберите таблицу для просмотра строк'}
                </div>
                {selectedSpreadsheetId && selectedTabTitle && (
                  <button
                    type="button"
                    onClick={() =>
                      void loadSelectedSpreadsheetData(selectedSpreadsheetId, selectedTabTitle)
                    }
                    disabled={loadingRows}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00F0FF] hover:underline cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingRows ? 'animate-spin' : ''}`} />
                    <span>Обновить данные</span>
                  </button>
                )}
              </div>

              {loadingRows ? (
                <div className="p-8 text-center font-mono text-xs text-[#D1D5DB]/60">
                  Загрузка строк из Google Sheets...
                </div>
              ) : rows.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#D1D5DB]/60">
                  На выбранном листе пока нет записей. Нажмите «Записать расчет в таблицу», чтобы
                  добавить текущую конфигурацию SKY RIFT.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#151C26] sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2.5 font-mono text-[#D1D5DB]/60 border-b border-[#D1D5DB]/15">
                          #
                        </th>
                        {rows[0].map((headerCell, idx) => (
                          <th
                            key={idx}
                            className="px-3 py-2.5 font-mono text-[#00F0FF] border-b border-[#D1D5DB]/15 whitespace-nowrap"
                          >
                            {headerCell || `Колонка ${idx + 1}`}
                          </th>
                        ))}
                        <th className="px-3 py-2.5 font-mono text-[#D1D5DB]/60 border-b border-[#D1D5DB]/15 text-right">
                          Действие
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D1D5DB]/10 font-mono tabular-nums">
                      {rows.slice(1).map((row, rowIdx) => {
                        const sheetRowNumber = rowIdx + 2;
                        const hasContent = row.some((cell) => cell && cell.trim().length > 0);
                        if (!hasContent) return null;
                        return (
                          <tr
                            key={sheetRowNumber}
                            className="hover:bg-[#2F3942]/30 transition-colors"
                          >
                            <td className="px-3 py-2.5 text-[#D1D5DB]/50">{sheetRowNumber}</td>
                            {rows[0].map((_, colIdx) => (
                              <td
                                key={colIdx}
                                className="px-3 py-2.5 text-[#D1D5DB] whitespace-nowrap max-w-[220px] truncate"
                                title={row[colIdx] || ''}
                              >
                                {row[colIdx] || '—'}
                              </td>
                            ))}
                            <td className="px-3 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!metadata) return;
                                  setConfirmation({
                                    type: 'clearRow',
                                    spreadsheetTitle: metadata.title,
                                    sheetTitle: selectedTabTitle,
                                    rowNumber: sheetRowNumber,
                                    preview: row.filter(Boolean).slice(0, 3).join(' · '),
                                  });
                                }}
                                title="Очистить строку"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#D1D5DB]/70 hover:text-[#FF5E00] hover:bg-[#FF5E00]/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#D1D5DB]/75">
            <div className="p-3.5 rounded-lg bg-[#0B0E14]/75 border border-[#D1D5DB]/15">
              <div className="font-mono text-[#00F0FF] mb-1">01. Чтение таблиц</div>
              Выбор любой таблицы с вашего Google Диска и динамический просмотр листов.
            </div>
            <div className="p-3.5 rounded-lg bg-[#0B0E14]/75 border border-[#D1D5DB]/15">
              <div className="font-mono text-[#00F0FF] mb-1">02. Экспорт расчетов</div>
              Запись бюджета, количества модулей, 3D-конфигурации и GPS-координат в одну строку.
            </div>
            <div className="p-3.5 rounded-lg bg-[#0B0E14]/75 border border-[#D1D5DB]/15">
              <div className="font-mono text-[#FF5E00] mb-1">03. Контроль изменений</div>
              Каждая запись, создание таблицы или очистка строки выполняется только после вашего
              подтверждения.
            </div>
          </div>
        )}
      </SpecularCard>

      {/* Mandatory Explicit User Confirmation Modal before ANY Mutating Google Sheets Action */}
      {confirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0E14]/82"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gsheets-confirm-title"
        >
          <div className="w-full max-w-lg rounded-xl bg-[#131922] border border-[#00F0FF]/50 p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF5E00]/15 border border-[#FF5E00]/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#FF5E00]" />
              </div>
              <div>
                <h4 id="gsheets-confirm-title" className="text-lg font-semibold text-white">
                  Подтвердите изменение данных в Google Sheets
                </h4>
                <p className="text-xs sm:text-sm text-[#D1D5DB]/80 mt-1 leading-relaxed">
                  {confirmation.type === 'create' && (
                    <>
                      В вашем Google Диске будет создана новая таблица{' '}
                      <span className="text-white font-semibold">«{confirmation.title}»</span> с
                      листом заголовков для заявок SKY RIFT.
                    </>
                  )}
                  {confirmation.type === 'append' && (
                    <>
                      Будет добавлена новая строка в таблицу{' '}
                      <span className="text-white font-semibold">
                        «{confirmation.spreadsheetTitle}»
                      </span>{' '}
                      (лист <span className="text-[#00F0FF]">{confirmation.sheetTitle}</span>).
                    </>
                  )}
                  {confirmation.type === 'clearRow' && (
                    <>
                      Строка №{confirmation.rowNumber} на листе{' '}
                      <span className="text-[#00F0FF]">{confirmation.sheetTitle}</span> таблицы{' '}
                      <span className="text-white font-semibold">
                        «{confirmation.spreadsheetTitle}»
                      </span>{' '}
                      будет полностью очищена. Это действие изменит ваши данные в Google Sheets.
                    </>
                  )}
                </p>
              </div>
            </div>

            {confirmation.type === 'append' && (
              <div className="p-4 rounded-lg bg-[#0B0E14] border border-[#D1D5DB]/15 font-mono text-xs space-y-1.5 tabular-nums">
                <div className="flex justify-between gap-2">
                  <span className="text-[#D1D5DB]/60">Клиент:</span>
                  <span className="text-white truncate">{confirmation.lead.clientName}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#D1D5DB]/60">Модулей / Бюджет:</span>
                  <span className="text-[#FF5E00]">
                    {confirmation.lead.moduleCount} шт. · {confirmation.lead.budgetMln} млн ₽
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#D1D5DB]/60">Автономность:</span>
                  <span className="text-[#00F0FF]">{confirmation.lead.autonomyLabel}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#D1D5DB]/60">GPS:</span>
                  <span className="text-white truncate">{confirmation.lead.gps}</span>
                </div>
              </div>
            )}

            {confirmation.type === 'clearRow' && confirmation.preview && (
              <div className="p-3.5 rounded-lg bg-[#0B0E14] border border-[#FF5E00]/30 font-mono text-xs text-[#D1D5DB]">
                Содержимое строки: {confirmation.preview}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={mutating}
                onClick={() => setConfirmation(null)}
                className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-[#D1D5DB] bg-[#2F3942]/70 border border-[#D1D5DB]/20 hover:text-white transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={mutating}
                onClick={() => void executeConfirmedAction()}
                className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#FF5E00] hover:bg-[#e55500] transition-colors cursor-pointer disabled:opacity-60"
              >
                {mutating
                  ? 'Выполнение...'
                  : confirmation.type === 'clearRow'
                  ? 'Подтвердить очистку'
                  : 'Подтвердить запись'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
