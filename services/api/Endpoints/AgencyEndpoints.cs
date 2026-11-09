using DgovPh.Api.Contracts;
using DgovPh.Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace DgovPh.Api.Endpoints;

public static class AgencyEndpoints
{
    public static IEndpointRouteBuilder MapAgencyEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/agencies", async Task<Ok<AgencyListResponse>> (
            ITransparencyService transparency,
            CancellationToken cancellationToken) =>
            TypedResults.Ok(new AgencyListResponse(await transparency.GetAgenciesAsync(cancellationToken))))
            .WithName("GetAgencies")
            .WithSummary("List agencies represented in verified budget records")
            .Produces<AgencyListResponse>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status503ServiceUnavailable);

        return endpoints;
    }
}
