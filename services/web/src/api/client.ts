import type { ApiClient, DataGovPhCatalogSearchResponse } from './types';

interface ApiBudgetRecordSummary {
  id: string;
  title: string;
  fiscalYear: number;
  agency: string;
  source: string;
  verifiedAt: string | null;
}

interface ApiBudgetRecordDetail extends Omit<ApiBudgetRecordSummary, 'source'> {
  source: { id: string; organization: string; recordType: string };
  verificationHistory: { verifiedAt: string; status: string; summary: string | null }[];
}

interface ApiSource {
  id: string;
  organization: string;
  recordType: string;
  verificationStatus: string;
  lastVerifiedAt: string | null;
}

interface ApiErrorResponse {
  error?: { message?: string };
}

class ApiRequestError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { Accept: 'application/json' },
  });
  const responseText = await response.text();
  let body: unknown;

  try {
    body = responseText ? JSON.parse(responseText) as unknown : undefined;
  } catch {
    body = undefined;
  }

  if (!response.ok) {
    const error = body as ApiErrorResponse | undefined;
    throw new ApiRequestError(
      response.status,
      error?.error?.message ?? response.statusText ?? 'The API request failed.',
    );
  }

  return body as T;
}

async function searchCatalogPageWithRetry(query: string, page: number, pageSize: number): Promise<DataGovPhCatalogSearchResponse> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await liveClient.searchDataGovPhCatalog(query, page, pageSize);
    } catch (error) {
      if (!(error instanceof ApiRequestError) || error.status !== 503 || attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }

  throw new Error('The public catalog could not be reached.');
}

function mapBudgetRecord(record: Omit<ApiBudgetRecordSummary, 'source'>) {
  return {
    id: record.id,
    title: record.title,
    publisher: record.agency,
    fiscalPeriod: `FY ${record.fiscalYear}`,
    fiscalYear: record.fiscalYear,
    displayState: 'Verified' as const,
  };
}

function mapDashboardRecord(record: ApiBudgetRecordSummary) {
  return {
    id: record.id,
    source: record.source,
    record: record.title,
    displayState: 'Verified' as const,
  };
}

export const liveClient: ApiClient = {
  getHealth: () => requestJson('/health'),

  async getDashboard() {
    const response = await requestJson<{
      verifiedSourceCount: number;
      latestRecords: ApiBudgetRecordSummary[];
      lastVerifiedAt: string | null;
    }>('/dashboard');

    return { ...response, latestRecords: response.latestRecords.map(mapDashboardRecord) };
  },

  async listBudgetRecords(query = {}) {
    const parameters = new URLSearchParams({
      page: String(query.page ?? 1),
      pageSize: String(query.pageSize ?? 25),
    });
    if (query.search?.trim()) parameters.set('q', query.search.trim());
    if (query.fiscalYear) parameters.set('fiscalYear', query.fiscalYear);
    if (query.agency) parameters.set('agency', query.agency);

    const response = await requestJson<{
      items: ApiBudgetRecordSummary[];
      total: number;
      page: number;
      pageSize: number;
    }>(`/budget-records?${parameters.toString()}`);

    return { ...response, items: response.items.map(mapBudgetRecord) };
  },

  async getBudgetRecord(id) {
    try {
      const record = await requestJson<ApiBudgetRecordDetail>(`/budget-records/${encodeURIComponent(id)}`);
      return {
        ...mapBudgetRecord(record),
        agency: record.agency,
        source: record.source.organization,
        sourceRecordType: record.source.recordType,
        verifiedAt: record.verifiedAt,
        verificationHistory: record.verificationHistory,
      };
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 404) return null;
      throw error;
    }
  },

  async listAgencies() {
    return requestJson('/agencies');
  },

  async listSources() {
    const response = await requestJson<{ items: ApiSource[] }>('/sources');
    return {
      items: response.items.map((source) => ({
        id: source.id,
        organization: source.organization,
        publicRecordType: source.recordType,
        verificationState: source.verificationStatus,
        lastVerifiedAt: source.lastVerifiedAt,
      })),
    };
  },

  async searchDataGovPhCatalog(query, page = 1, pageSize = 10) {
    const parameters = new URLSearchParams({ q: query.trim(), page: String(page), pageSize: String(pageSize) });
    return requestJson<DataGovPhCatalogSearchResponse>(`/catalog/datasets?${parameters.toString()}`);
  },

  async searchAllDataGovPhCatalog(query, pageSize = 50) {
    const firstPage = await searchCatalogPageWithRetry(query, 1, pageSize);
    const pageCount = Math.ceil(firstPage.total / pageSize);
    const items = [...firstPage.items];

    for (let page = 2; page <= pageCount; page += 1) {
      const response = await searchCatalogPageWithRetry(query, page, pageSize);
      items.push(...response.items);
    }

    return {
      ...firstPage,
      items,
    };
  },

  getDataGovPhResourceFileDownloadUrl(fileId) {
    return `${apiBaseUrl.replace(/\/$/, '')}/catalog/files/${encodeURIComponent(fileId)}/download`;
  },

  async downloadDataGovPhResourceFile(fileId, fileName) {
    const response = await fetch(liveClient.getDataGovPhResourceFileDownloadUrl(fileId));
    if (!response.ok) {
      let message = 'This file could not be downloaded.';
      try {
        const error = await response.json() as ApiErrorResponse;
        message = error.error?.message ?? message;
      } catch {
        message = response.statusText || message;
      }
      throw new ApiRequestError(response.status, message);
    }

    const objectUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  },
};