export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  services: { database: 'ready' | 'unavailable' };
}

export interface DashboardRecord {
  id: string;
  source: string;
  record: string;
  displayState: 'Verified';
}

export interface DashboardResponse {
  verifiedSourceCount: number;
  latestRecords: DashboardRecord[];
  lastVerifiedAt: string | null;
}

export interface BudgetRecord {
  id: string;
  title: string;
  publisher: string;
  fiscalPeriod: string;
  fiscalYear: number;
  displayState: 'Verified';
}

export interface VerificationHistoryItem {
  verifiedAt: string;
  status: string;
  summary: string | null;
}

export interface BudgetRecordDetail extends BudgetRecord {
  agency: string;
  source: string;
  sourceRecordType: string;
  verifiedAt: string | null;
  verificationHistory: VerificationHistoryItem[];
}

export interface BudgetRecordQuery {
  search?: string;
  fiscalYear?: string;
  agency?: string;
}

export interface BudgetRecordsResponse {
  items: BudgetRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AgenciesResponse {
  items: string[];
}

export interface PublicSource {
  id: string;
  organization: string;
  publicRecordType: string;
  verificationState: string;
  lastVerifiedAt: string | null;
}

export interface SourcesResponse {
  items: PublicSource[];
}

export interface DataGovPhCatalogResource {
  id: string;
  name: string;
  format: string | null;
}

export interface DataGovPhCatalogDataset {
  id: string;
  name: string;
  publisher: string | null;
  description: string | null;
  license: string | null;
  modifiedDate: string | null;
  url: string | null;
  topics: string[];
  resources: DataGovPhCatalogResource[];
}

export interface DataGovPhCatalogSearchResponse {
  total: number;
  page: number;
  pageSize: number;
  items: DataGovPhCatalogDataset[];
}

export interface ApiClient {
  getHealth(): Promise<HealthResponse>;
  getDashboard(): Promise<DashboardResponse>;
  listBudgetRecords(query?: BudgetRecordQuery): Promise<BudgetRecordsResponse>;
  getBudgetRecord(id: string): Promise<BudgetRecordDetail | null>;
  listAgencies(): Promise<AgenciesResponse>;
  listSources(): Promise<SourcesResponse>;
  searchDataGovPhCatalog(query: string, page?: number, pageSize?: number): Promise<DataGovPhCatalogSearchResponse>;
  searchAllDataGovPhCatalog(query: string, pageSize?: number): Promise<DataGovPhCatalogSearchResponse>;
}