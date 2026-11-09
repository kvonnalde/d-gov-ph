using DgovPh.Api.Contracts;
using DgovPh.Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace DgovPh.Api.Endpoints;

public static class DashboardEndpoints
{
    public static IEndpointRouteBuilder MapDashboardEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/dashboard", async Task<Ok<DashboardResponse>> (
            ITransparencyService transparency,
            CancellationToken cancellationToken) =>
            TypedResults.Ok(await transparency.GetDashboardAsync(cancellationToken)))
            .WithName("GetDashboard")
            .WithSummary("Get verified-source coverage and recent verified records")
            .Produces<DashboardResponse>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status503ServiceUnavailable);

        return endpoints;
    }
}
