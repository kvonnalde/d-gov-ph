using DgovPh.Api.Contracts;
using DgovPh.Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace DgovPh.Api.Endpoints;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/health", async Task<IResult> (
            IDatabaseHealthService databaseHealth,
            CancellationToken cancellationToken) =>
        {
            var ready = await databaseHealth.IsReadyAsync(cancellationToken);
            var response = new HealthResponse(
                ready ? "healthy" : "unhealthy",
                new Dictionary<string, string> { ["database"] = ready ? "ready" : "unavailable" });

            return ready
                ? TypedResults.Ok(response)
                : TypedResults.Json(response, statusCode: StatusCodes.Status503ServiceUnavailable);
        })
            .WithName("GetHealth")
            .WithSummary("Check API and database readiness")
            .Produces<HealthResponse>(StatusCodes.Status200OK)
            .Produces<HealthResponse>(StatusCodes.Status503ServiceUnavailable);

        return endpoints;
    }
}
