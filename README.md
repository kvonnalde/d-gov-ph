# d-gov-ph

D-Gov PH is a public transparency and analytics platform scaffold. Budget records are returned only after verification; amounts are intentionally excluded until source mapping is verified.

## Local Development

1. Start local SQL Server Express (`SQLEXPRESS`). The Development API and EF migration factory default to `d-gov-ph` with Windows authentication.
2. Apply the schema with `dotnet ef database update --project services/api/DgovPh.Api.csproj`.
3. Run the API with `dotnet run --project services/api/DgovPh.Api.csproj`.
4. In another terminal, run the frontend with `npm --prefix services/web run dev`.

To use the Compose SQL Server instead, set `ConnectionStrings:AppDb` in .NET User Secrets to the SQL Server connection string from `.env.example` before applying migrations or running the API.

The API listens on `http://localhost:5000`; its development OpenAPI document is at `/api/openapi/v1.json`. EF Core migrations create the schema only; no seed data is included.

The read-only Open Data Philippines catalog proxy is `GET /api/catalog/datasets?page=1&pageSize=50`; `q` is optional, so omitting it browses the full public catalog. It uses the public client header shipped by the portal by default; an authorized `DataGovPh:ApiKey` value in .NET User Secrets can override it. The web client loads all catalog pages for search and filtering. Catalog metadata is displayed separately and is never imported into the verified budget tables.

For deployment, configure `ConnectionStrings__AppDb` with the Azure SQL server and database and `Authentication=Active Directory Managed Identity`, without a password. Grant the App Service managed identity access to the database.