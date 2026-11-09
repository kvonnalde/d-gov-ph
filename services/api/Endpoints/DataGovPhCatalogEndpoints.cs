using DgovPh.Api.Contracts;
using DgovPh.Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace DgovPh.Api.Endpoints;

public static class DataGovPhCatalogEndpoints
{
    public static IEndpointRouteBuilder MapDataGovPhCatalogEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/catalog/datasets", async Task<Results<Ok<DataGovPhDatasetSearchResponse>, BadRequest<ApiErrorResponse>>>(
            string? q,
            int? page,
            int? pageSize,
            DataGovPhCatalogClient catalog,
            CancellationToken cancellationToken) =>
        {
            var query = q?.Trim() ?? string.Empty;
            var currentPage = page ?? 1;
            var currentPageSize = pageSize ?? 10;
            if (query.Length > 200
                || currentPage < 1 || currentPageSize is < 1 or > 50)
            {
                return TypedResults.BadRequest(new ApiErrorResponse(new ApiError(
                    ApiErrorCode.VALIDATION_ERROR,
                    "Search terms must be 200 characters or fewer, page must be >= 1, and pageSize must be from 1 to 50.")));
            }

            return TypedResults.Ok(await catalog.SearchAsync(query, currentPage, currentPageSize, cancellationToken));
        })
            .WithName("SearchDataGovPhCatalog")
            .WithSummary("Search the public Open Data Philippines dataset catalog")
            .Produces<DataGovPhDatasetSearchResponse>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces<ApiErrorResponse>(StatusCodes.Status503ServiceUnavailable);

        return endpoints;
    }
}