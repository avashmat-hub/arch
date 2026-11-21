export interface DriveSpreadsheetItem {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface SpreadsheetTabInfo {
  sheetId: number;
  title: string;
}

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  sheets: SpreadsheetTabInfo[];
}

export interface SkyRiftLeadPayload {
  date: string;
  clientName: string;
  contact: string;
  moduleCount: number;
  autonomyLabel: string;
  logisticsLabel: string;
  budgetMln: string;
  productionWeeks: number;
  gps: string;
  fileName: string;
  configSummary: string;
}

export const SKY_RIFT_SHEET_HEADERS = [
  'Дата',
  'Клиент',
  'Контакт',
  'Модулей',
  'Автономность',
  'Логистика и склон',
  'Бюджет (млн ₽)',
  'Срок (нед.)',
  'GPS-координаты',
  'Топосъемка',
  '3D-конфигурация',
];

async function handleApiResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Ошибка Google API (${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) {
        message = errJson.error.message;
      }
    } catch {
      // ignore JSON parse failure
    }
    const error = new Error(message) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  return res.json() as Promise<T>;
}

/**
 * List the user's Google Sheets spreadsheets via Google Drive API v3.
 */
export async function listUserSpreadsheets(
  accessToken: string,
  pageSize = 20
): Promise<DriveSpreadsheetItem[]> {
  const params = new URLSearchParams({
    q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
    fields: 'files(id,name,modifiedTime,webViewLink)',
    orderBy: 'modifiedTime desc',
    pageSize: String(pageSize),
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await handleApiResponse<{ files?: DriveSpreadsheetItem[] }>(res);
  return data.files ?? [];
}

/**
 * Fetch spreadsheet title and actual tab names (never hardcoding "Sheet1").
 */
export async function getSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetMetadata> {
  const params = new URLSearchParams({
    fields: 'spreadsheetId,spreadsheetUrl,properties.title,sheets.properties(sheetId,title)',
  });

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await handleApiResponse<{
    spreadsheetId: string;
    spreadsheetUrl: string;
    properties?: { title?: string };
    sheets?: { properties?: { sheetId?: number; title?: string } }[];
  }>(res);

  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title ?? 'Без названия',
    spreadsheetUrl:
      data.spreadsheetUrl ??
      `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/edit`,
    sheets: (data.sheets ?? [])
      .filter((s) => s.properties?.title)
      .map((s) => ({
        sheetId: s.properties?.sheetId ?? 0,
        title: s.properties?.title ?? 'Лист',
      })),
  };
}

/**
 * Quote a sheet title safely for A1 notation (handles spaces and quotes).
 */
function formatSheetA1Range(sheetTitle: string, cellRange: string): string {
  const escaped = sheetTitle.replace(/'/g, "''");
  return `'${escaped}'!${cellRange}`;
}

/**
 * Read values from a specific sheet tab.
 */
export async function readSheetValues(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  cellRange = 'A1:K50'
): Promise<string[][]> {
  const encodedRange = encodeURIComponent(formatSheetA1Range(sheetTitle, cellRange));
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodedRange}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await handleApiResponse<{ values?: string[][] }>(res);
  return data.values ?? [];
}

/**
 * Create a new SKY RIFT spreadsheet and write Russian column headers to its first tab.
 */
export async function createSkyRiftSpreadsheet(
  accessToken: string,
  title = 'SKY RIFT — Заявки и расчеты 3D-аудита'
): Promise<SpreadsheetMetadata> {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [{ properties: { title: 'Заявки SKY RIFT' } }],
    }),
  });

  const created = await handleApiResponse<{
    spreadsheetId: string;
    spreadsheetUrl: string;
    properties?: { title?: string };
    sheets?: { properties?: { sheetId?: number; title?: string } }[];
  }>(createRes);

  const firstTabTitle = created.sheets?.[0]?.properties?.title ?? 'Заявки SKY RIFT';

  // Populate initial header row on the newly created spreadsheet
  const headerRange = encodeURIComponent(formatSheetA1Range(firstTabTitle, 'A1:K1'));
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      created.spreadsheetId
    )}/values/${headerRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [SKY_RIFT_SHEET_HEADERS],
      }),
    }
  ).then(handleApiResponse);

  return {
    spreadsheetId: created.spreadsheetId,
    title: created.properties?.title ?? title,
    spreadsheetUrl:
      created.spreadsheetUrl ??
      `https://docs.google.com/spreadsheets/d/${encodeURIComponent(created.spreadsheetId)}/edit`,
    sheets: (created.sheets ?? []).map((s) => ({
      sheetId: s.properties?.sheetId ?? 0,
      title: s.properties?.title ?? firstTabTitle,
    })),
  };
}

/**
 * Append a SKY RIFT calculation / audit lead row to the selected sheet tab.
 */
export async function appendLeadRow(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  lead: SkyRiftLeadPayload
): Promise<void> {
  const rowValues = [
    lead.date,
    lead.clientName,
    lead.contact,
    String(lead.moduleCount),
    lead.autonomyLabel,
    lead.logisticsLabel,
    lead.budgetMln,
    String(lead.productionWeeks),
    lead.gps,
    lead.fileName,
    lead.configSummary,
  ];

  const encodedRange = encodeURIComponent(formatSheetA1Range(sheetTitle, 'A:K'));
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    }
  );

  await handleApiResponse(res);
}

/**
 * Clear a specific row by 1-based row number in the selected sheet tab.
 */
export async function clearSheetRow(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  rowNumber: number
): Promise<void> {
  const encodedRange = encodeURIComponent(
    formatSheetA1Range(sheetTitle, `A${rowNumber}:K${rowNumber}`)
  );
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodedRange}:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  await handleApiResponse(res);
}
