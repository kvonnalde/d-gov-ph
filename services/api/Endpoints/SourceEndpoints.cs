using DgovPh.Api.Contracts;
using DgovPh.Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace DgovPh.Api.Endpoints;

public static class SourceEndpoints
{
    public static IEndpointRouteBuilder MapSourceEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/sources", async Task<Ok<SourceListResponse>> (
            ITransparencyService transparency,
            CancellationToken cancellationToken) =>
            TypedResults.Ok(new SourceListResponse(await transparency.GetSourcesAsync(cancellationToken))))
            .WithName("GetSources")
            .WithSummary("List registered public sources and verification status")
            .Produces<SourceListResponse>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status503ServiceUnavailable);

        return endpoints;
    }
}
