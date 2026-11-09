using DgovPh.Api.Contracts;
using DgovPh.Api.Services;
using DgovPh.Api.Validation;
using Microsoft.AspNetCore.Http.HttpResults;

namespace DgovPh.Api.Endpoints;

public static class BudgetRecordEndpoints
{
    public static IEndpointRouteBuilder MapBudgetRecordEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/budget-records", async Task<Results<Ok<BudgetRecordListResponse>, BadRequest<ApiErrorResponse>>>(
            HttpRequest request,
            ITransparencyService transparency,
            CancellationToken cancellationToken) =>
        {
            var parsed = BudgetRecordQueryParser.Parse(request.Query);
            if (parsed.Error is not null)
            {
                return TypedResults.BadRequest(parsed.Error);
            }

            return TypedResults.Ok(await transparency.SearchBudgetRecordsAsync(parsed.Query!, cancellationToken));
        })
            .WithName("SearchBudgetRecords")
            .WithSummary("Search verified budget records")
            .Produces<BudgetRecordListResponse>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces<ApiErrorResponse>(StatusCodes.Status503ServiceUnavailable);

        endpoints.MapGet("/api/budget-records/{id}", async Task<Results<Ok<BudgetRecordDetailResponse>, BadRequest<ApiErrorResponse>, NotFound<ApiErrorResponse>>>(
            string id,
            ITransparencyService transparency,
            CancellationToken cancellationToken) =>
        {
            if (!Guid.TryParse(id, out var recordId))
            {
                return TypedResults.BadRequest(new ApiErrorResponse(new ApiError(
                    ApiErrorCode.VALIDATION_ERROR,
                    "The record ID must be a valid UUID.")));
            }

            var record = await transparency.GetBudgetRecordAsync(recordId, cancellationToken);
            return record is null
                ? TypedResults.NotFound(new ApiErrorResponse(new ApiError(
                    ApiErrorCode.NOT_FOUND,
                    "Verified budget record was not found.")))
                : TypedResults.Ok(record);
        })
            .WithName("GetBudgetRecord")
            .WithSummary("Get a verified budget record with source provenance and verification history")
            .Produces<BudgetRecordDetailResponse>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status503ServiceUnavailable);

        return endpoints;
    }
}
