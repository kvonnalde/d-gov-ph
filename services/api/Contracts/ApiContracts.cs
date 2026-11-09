namespace DgovPh.Api.Contracts;

/// <summary>Machine-readable API error codes.</summary>
public enum ApiErrorCode
{
    VALIDATION_ERROR,
    BAD_REQUEST,
    NOT_FOUND,
    CONFLICT,
    SERVICE_UNAVAILABLE,
    INTERNAL_ERROR
}

/// <summary>Standard error response returned by every API route.</summary>
public sealed record ApiErrorResponse(ApiError Error);

/// <summary>Details for a failed API request.</summary>
public sealed record ApiError(
    ApiErrorCode Code,
    string Message,
    IReadOnlyDictionary<string, string[]>? Details = null);

/// <summary>Readiness state of the API and its essential database dependency.</summary>
public sealed record HealthResponse(string Status, IReadOnlyDictionary<string, string> Services);

/// <summary>Summary of a verified budget record for list and dashboard views.</summary>
public sealed record BudgetRecordSummary(
    Guid Id,
    string Title,
    int FiscalYear,
    string Agency,
    string Source,
    DateTimeOffset? VerifiedAt);

/// <summary>Paginated search results for verified budget records.</summary>
public sealed record BudgetRecordListResponse(
    IReadOnlyList<BudgetRecordSummary> Items,
    int Total,
    int Page,
    int PageSize);

/// <summary>Source provenance attached to a verified budget record.</summary>
public sealed record SourceReference(Guid Id, string Organization, string RecordType);

/// <summary>A completed verification event for a public source.</summary>
public sealed record VerificationHistoryItem(DateTimeOffset VerifiedAt, string Status, string? Summary);

/// <summary>Full verified record details, including provenance and verification history.</summary>
public sealed record BudgetRecordDetailResponse(
    Guid Id,
    string Title,
    int FiscalYear,
    string Agency,
    SourceReference Source,
    DateTimeOffset? VerifiedAt,
    IReadOnlyList<VerificationHistoryItem> VerificationHistory);

/// <summary>Dashboard coverage and the latest verified public records.</summary>
public sealed record DashboardResponse(
    int VerifiedSourceCount,
    IReadOnlyList<BudgetRecordSummary> LatestRecords,
    DateTimeOffset? LastVerifiedAt);

/// <summary>A registered public source and its verification state.</summary>
public sealed record SourceResponse(
    Guid Id,
    string Organization,
    string RecordType,
    string VerificationStatus,
    DateTimeOffset? LastVerifiedAt);

/// <summary>List of registered public sources and their verification state.</summary>
public sealed record SourceListResponse(IReadOnlyList<SourceResponse> Items);

/// <summary>List of agencies represented in verified budget records.</summary>
public sealed record AgencyListResponse(IReadOnlyList<string> Items);

/// <summary>Validated pagination and filter values for a budget-record search.</summary>
public sealed record BudgetRecordQuery(string? Search, int? FiscalYear, string? Agency, int Page, int PageSize);
