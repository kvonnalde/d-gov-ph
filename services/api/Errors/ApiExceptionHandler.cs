using System.Data.Common;
using DgovPh.Api.Contracts;
using DgovPh.Api.Services;
using Microsoft.AspNetCore.Diagnostics;

namespace DgovPh.Api.Errors;

public sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, code, message) = exception switch
        {
            DbException or TimeoutException =>
                (StatusCodes.Status503ServiceUnavailable, ApiErrorCode.SERVICE_UNAVAILABLE,
                    "The data service is temporarily unavailable."),
            DataGovPhCatalogUnavailableException =>
                (StatusCodes.Status503ServiceUnavailable, ApiErrorCode.SERVICE_UNAVAILABLE,
                    "The Open Data Philippines catalog is not configured or is temporarily unavailable."),
            InvalidOperationException { InnerException: DbException } =>
                (StatusCodes.Status503ServiceUnavailable, ApiErrorCode.SERVICE_UNAVAILABLE,
                    "The data service is temporarily unavailable."),
            _ =>
                (StatusCodes.Status500InternalServerError, ApiErrorCode.INTERNAL_ERROR,
                    "An internal error occurred.")
        };

        logger.LogError(exception, "Request failed with {ErrorCode}.", code);
        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(
            new ApiErrorResponse(new ApiError(code, message)),
            cancellationToken);
        return true;
    }
}
