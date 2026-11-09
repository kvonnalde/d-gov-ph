# Integration Handoff

## Backend
- Folder: `services/api/`
- Run: `dotnet run --project services/api/DgovPh.Api.csproj`
- Port: `5000` (`ASPNETCORE_URLS`)
- Build: `dotnet build services/api/DgovPh.Api.csproj`
- Health: `GET /api/health`
- OpenAPI (Development): `GET /api/openapi/v1.json`
- API login: No

## Frontend
- Folder: `services/web/`
- Dev: `npm --prefix services/web run dev`
- Build: `npm --prefix services/web run build`
- The live client is already wired at `services/web/src/api/index.ts` to `liveClient` in `services/web/src/api/client.ts`; preserve the existing DTO-to-UI mappings.
- No mock client, mock data, or preview-state files are present in `services/web/src/`.
- API contracts are in `services/api/Contracts/ApiContracts.cs`; the frontend `ApiClient` interface is in `services/web/src/api/types.ts`. There is no shared TypeScript package or cross-language import alias.

## API Routes
- `GET /api/health` — `{ status, services }`; 200 or 503
- `GET /api/dashboard` — `{ verifiedSourceCount, latestRecords, lastVerifiedAt }`; 200 or 503
- `GET /api/budget-records?q=&fiscalYear=&agency=&page=&pageSize=` — `{ items, total, page, pageSize }`; 200, 400, or 503
- `GET /api/budget-records/{id}` — verified record, source provenance, and verification history; 200, 400, 404, or 503
- `GET /api/agencies` — `{ items }`; 200 or 503
- `GET /api/sources` — `{ items }`; 200 or 503
- `GET /api/catalog/datasets?q=&page=&pageSize=` — read-only Open Data Philippines catalog search; 200, 400, or 503. Requires `DataGovPh__ApiKey`.

## Database
- Azure SQL Database in production; SQL Server 2022 for local development; EF Core with `Microsoft.EntityFrameworkCore.SqlServer`.
- Entity/table mapping: `PublicSource` → `public_sources`, `BudgetRecord` → `budget_records`, `SourceVerification` → `source_verifications`.
- EF Core migration directory: `services/api/Data/Migrations/`. The `20261109093040_InitialSchema` migration creates the three mapped tables and was applied to local SQL Express before endpoint smoke tests.
- Connection setting: `ConnectionStrings__AppDb` (local SQL authentication via the provided Compose configuration; Windows-authenticated SQL Express was used for local validation; Microsoft Entra managed identity outside Development).
- **Create NO seed data.** Empty result collections are expected until verified records are supplied through a separately approved ingestion workflow.

## Services
- Essential: Azure Static Web Apps (frontend), Azure App Service (API), Azure SQL Database (persistence).
- Enhancement: official-source connectors. The data.gov.ph catalog proxy is read-only and does not ingest or verify records; failed requests preserve the prior verified snapshot and verification timestamp.

## Integration Results
- Schema: applied `20261109093040_InitialSchema` to local SQL Express. Created `public_sources`, `budget_records`, and `source_verifications` with model-defined keys, relationships, constraints, and indexes. No seed data was added.
- Backend: build succeeded. `/api/health`, `/api/dashboard`, `/api/budget-records`, `/api/agencies`, and `/api/sources` returned 200 against the empty schema; a well-formed absent record returned 404; the Development OpenAPI document returned 200.
- Frontend: `src/api/index.ts` already selected `liveClient`; the Vite `/api` proxy already targeted port 5000. No mock or preview-state references remain under `services/web/src/`; no client changes were needed.
- Verification: frontend production build succeeded. A browser-originated `GET /api/dashboard` through Vite returned 200 with `{ "verifiedSourceCount": 0, "latestRecords": [], "lastVerifiedAt": null }`; the source registry rendered its live empty state.
- Both local servers were stopped after verification.