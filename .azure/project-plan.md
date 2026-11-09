# Project Plan

**Status**: Integrated
**Created**: 2026-11-09
**Mode**: NEW

---

## 1. Project Overview

**Goal**: Build D-Gov PH, a public transparency and analytics platform for Philippine government budget information. Publish only verified records with source provenance; never display unverified amounts or fabricate data. Design each module for independent testing.

**App Type**: SPA + API

**API Login**: No

**Mode**: NEW

**Deployment Plan**: No deployment plan found

---

## 2. Backend — ASP.NET Core Web API

| Component | Technology |
|-----------|-----------|
| **Language** | C# (.NET) |
| **Framework** | ASP.NET Core Web API + Entity Framework Core |
| **Runtime** | .NET 10 |
| **Package Manager** | dotnet (NuGet) |
| **Test Runner** | xUnit |
| **Mocking Library** | NSubstitute |
| **Test Command** | dotnet test |
| **Orchestration** | docker compose |

Azure SQL is essential for persisted records, source metadata, and verification history. Official-source availability and data access must be verified before integration. A failed source refresh must preserve the last verified snapshot; no seed data or AI features are in the initial scope.

---

## 3. Frontend - Web App

| Component | Technology |
|-----------|-----------|
| **Language** | TypeScript |
| **Framework** | React + Vite |
| **Libraries** | Axios, Recharts, Tailwind CSS |
| **Package Manager** | npm |
| **Test Runner** | vitest |
| **Mocking Library** | vi.mock |
| **Test Command** | npm test |

---

## 4. Services Required

| Azure Service | Role in App | Environment Variable | Default Value (Local) | Classification |
|---------------|------------|---------------------|----------------------|----------------|
| Azure Static Web Apps | Serve the public React single-page application | VITE_API_BASE_URL | http://localhost:5000 | Essential |
| Azure App Service | Host the ASP.NET Core public API | ASPNETCORE_URLS | http://localhost:5000 | Essential |
| Azure SQL Database | Persist source metadata, verification history, and verified public records | ConnectionStrings__AppDb | Server=localhost\SQLEXPRESS;Database=d-gov-ph;Trusted_Connection=True;TrustServerCertificate=True | Essential |

---

## 5. Prerequisites

Check all tools marked unknown before proceeding; the local environment may hide installed tools from this scan.

### Run

| Tool | Service(s) | Installed | Version |
|------|------------|-----------|---------|
| Node.js | frontend | ✅ | 24.14.0 |
| npm | frontend | ✅ | 11.11.0 |
| .NET SDK | backend | ✅ | 10.0.203 |

### Debug

| Tool | Service(s) | Installed | Version |
|------|------------|-----------|---------|
| Chrome | frontend | ✅ | 156.0.8078.80 |

---

## 6. Design System & UI

**Component Library**: Fluent UI v9
**Style Direction**: Civic editorial with a precise, data-dense layout: restrained teal navigation, warm coral highlights for verification states, compact tables, and clear provenance labels. Use 4px corners and modest elevation so source records remain the focus.
**Typography**: Segoe UI Variable, Segoe UI, system-ui

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#087E8B` | D-Gov PH navigation, verified links, and primary actions |
| `accent` | `#C15B3E` | Source-check attention and secondary highlights |
| `surface` | `#F5F7F6` | Public dashboard canvas |
| `text` | `#1D2D2C` | Budget titles, agency names, and readable data labels |
| `muted` | `#637472` | Provenance, freshness, and supporting context |
| `border` | `#D8E1DF` | Table divisions and filter boundaries |

### Pages

| Page | Route | Purpose | Layout |
|------|-------|---------|--------|
| Overview | `/` | Show verified-source coverage and recent public records without implying unverified totals. | `header + nav + hero + main + table + footer` |
| Budget Explorer | `/budget` | Search and filter budget documents and allocations, with source and verification state visible beside each result. | `header + nav + main + form + table + footer` |
| Source Registry | `/sources` | Review official source records and the verification status of their public data access. | `header + nav + main + table + empty + footer` |

### Sample Content

Overview - Public source records (all marked for verification before ingestion):
| Source | Record | Display state |
|--------|--------|---------------|
| Department of Budget and Management (DBM) | General Appropriations Act (FY 2025) | Source verification required |
| Commission on Audit (COA) | Annual Audit Reports | Source verification required |
| Philippine Government Electronic Procurement System (PhilGEPS) | Bid notices | Access check required |

Budget Explorer - Budget documents (no amounts are shown until source mapping is verified):
| Document | Publisher | Fiscal period | Display state |
|----------|-----------|---------------|---------------|
| General Appropriations Act | DBM | FY 2025 | Source verification required |
| National Expenditure Program | DBM | FY 2025 | Source verification required |
| General Appropriations Act | DBM | FY 2024 | Source verification required |

Source Registry - Public data sources (availability and API/download access are not yet confirmed):
| Organization | Public record type | Verification state |
|--------------|--------------------|---------------------|
| DBM | Budget documents | Not yet verified |
| COA | Annual audit reports | Not yet verified |
| PhilGEPS | Bid notices | Not yet verified |

---

## 7. Project Structure

```text
d-gov-ph/
├── .azure/
│   └── project-plan.md
├── .env.example
├── docker-compose.yml
├── services/
│   ├── api/
│   │   ├── DgovPh.Api.csproj
│   │   ├── Program.cs
│   │   ├── Endpoints/
│   │   ├── Data/
│   │   ├── Entities/
│   │   ├── Integrations/
│   │   └── Services/
│   └── web/
│       ├── package.json
│       ├── vite.config.ts
│       └── src/
│           ├── api/client.ts
│           ├── components/
│           ├── pages/
│           └── charts/
└── tests/
    └── api/
```

---

## 8. Route Definitions

| # | Method | Path | Description | Request Body | Response Body | Status Codes |
|---|--------|------|-------------|-------------|--------------|-------------|
| 1 | GET | `/api/health` | Health check including database readiness | - | `{ status, services }` | 200, 503 |
| 2 | GET | `/api/dashboard` | Return persisted coverage and latest verified-record summaries | - | `{ verifiedSourceCount, latestRecords, lastVerifiedAt }` | 200, 503 |
| 3 | GET | `/api/budget-records` | Search budget records by fiscal year, agency, and text | - | `{ items, total, page, pageSize }` | 200, 400, 503 |
| 4 | GET | `/api/budget-records/{id}` | Return one budget record with source provenance and verification history | - | `{ id, title, fiscalYear, agency, source, verifiedAt }` | 200, 400, 404, 503 |
| 5 | GET | `/api/agencies` | List agencies represented in verified records | - | `{ items }` | 200, 503 |
| 6 | GET | `/api/sources` | List registered public sources and their verification status | - | `{ items }` | 200, 503 |
| 7 | GET | `/api/catalog/datasets?q=&page=&pageSize=` | Search the public Open Data Philippines catalog without importing or verifying its records | - | `{ total, page, pageSize, items }` | 200, 400, 503 |

---

## 9. Next Steps

1. Run **azure-project-scaffold** to execute this plan
2. Run **azure-project-integrate** to wire the frontend to live data, smoke-test the backend, and create the migrations
3. Run **azure-debug-plan** → **azure-debug-generate** for Docker emulators and VS Code debugging
4. Run the **azure-deploy** agent when ready; it uses **azure-app-onboard** for architecture, cost estimation, IaC generation, provisioning, and health verification
