namespace DgovPh.Api.Contracts;

/// <summary>Search results from the Open Data Philippines public catalog.</summary>
public sealed record DataGovPhDatasetSearchResponse(
    int Total,
    int Page,
    int PageSize,
    IReadOnlyList<DataGovPhDatasetResponse> Items);

/// <summary>Public metadata for a catalog dataset; this is not a verified budget record.</summary>
public sealed record DataGovPhDatasetResponse(
    string Id,
    string Name,
    string? Publisher,
    string? Description,
    string? License,
    string? ModifiedDate,
    string? Url,
    IReadOnlyList<string> Topics,
    IReadOnlyList<DataGovPhResourceResponse> Resources);

/// <summary>Public metadata for one downloadable catalog resource.</summary>
public sealed record DataGovPhResourceResponse(
    string Id,
    string Name,
    string? Format,
    IReadOnlyList<DataGovPhResourceFileResponse> Files);

/// <summary>Public file metadata for a catalog resource.</summary>
public sealed record DataGovPhResourceFileResponse(string? Id, string Name, long? Size);