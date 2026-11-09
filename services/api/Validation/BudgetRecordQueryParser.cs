using DgovPh.Api.Contracts;
using Microsoft.Extensions.Primitives;

namespace DgovPh.Api.Validation;

public static class BudgetRecordQueryParser
{
    public static (BudgetRecordQuery? Query, ApiErrorResponse? Error) Parse(
        IQueryCollection values)
    {
        var details = new Dictionary<string, string[]>();
        var page = ParseInteger(values, "page", 1, 1, 1_000_000, details);
        var pageSize = ParseInteger(values, "pageSize", 20, 1, 100, details);
        var fiscalYear = ParseOptionalInteger(values, "fiscalYear", 1900, 2100, details);
        var search = GetSingleValue(values, "q", details);
        var agency = GetSingleValue(values, "agency", details);

        if (search is { Length: > 120 })
        {
            details["q"] = new[] { "Search text must be 120 characters or fewer." };
        }

        if (agency is { Length: > 200 })
        {
            details["agency"] = new[] { "Agency must be 200 characters or fewer." };
        }

        if (details.Count > 0)
        {
            return (null, new ApiErrorResponse(new ApiError(
                ApiErrorCode.VALIDATION_ERROR,
                "One or more query parameters are invalid.",
                details)));
        }

        return (new BudgetRecordQuery(search, fiscalYear, agency, page, pageSize), null);
    }

    private static int ParseInteger(
        IQueryCollection values,
        string key,
        int defaultValue,
        int minimum,
        int maximum,
        IDictionary<string, string[]> errors)
    {
        var value = GetSingleValue(values, key, errors);
        if (value is null)
        {
            return defaultValue;
        }

        if (!int.TryParse(value, out var parsed) || parsed < minimum || parsed > maximum)
        {
            errors[key] = new[] { $"{key} must be an integer between {minimum} and {maximum}." };
            return defaultValue;
        }

        return parsed;
    }

    private static int? ParseOptionalInteger(
        IQueryCollection values,
        string key,
        int minimum,
        int maximum,
        IDictionary<string, string[]> errors)
    {
        var value = GetSingleValue(values, key, errors);
        if (value is null)
        {
            return null;
        }

        if (!int.TryParse(value, out var parsed) || parsed < minimum || parsed > maximum)
        {
            errors[key] = new[] { $"{key} must be an integer between {minimum} and {maximum}." };
            return null;
        }

        return parsed;
    }

    private static string? GetSingleValue(
        IQueryCollection values,
        string key,
        IDictionary<string, string[]> errors)
    {
        StringValues supplied = values[key];
        if (supplied.Count > 1)
        {
            errors[key] = new[] { $"{key} must be specified at most once." };
            return null;
        }

        var value = supplied.FirstOrDefault()?.Trim();
        return string.IsNullOrEmpty(value) ? null : value;
    }
}
