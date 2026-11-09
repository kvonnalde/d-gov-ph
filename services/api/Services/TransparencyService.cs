using DgovPh.Api.Contracts;
using DgovPh.Api.Data;
using DgovPh.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DgovPh.Api.Services;

public sealed class TransparencyService(AppDbContext database) : ITransparencyService
{
    public async Task<DashboardResponse> GetDashboardAsync(CancellationToken cancellationToken)
    {
        var verifiedSourceCount = await database.PublicSources
            .CountAsync(source => source.VerificationStatus == VerificationStatuses.Verified, cancellationToken);
        var latestRecords = await GetLatestVerifiedRecordsAsync(5, cancellationToken);
        var lastSourceVerification = await database.SourceVerifications
            .Where(verification => verification.Status == VerificationStatuses.Verified)
            .MaxAsync(verification => (DateTimeOffset?)verification.VerifiedAt, cancellationToken);
        var lastRecordVerification = latestRecords
            .Where(record => record.VerifiedAt.HasValue)
            .Select(record => record.VerifiedAt)
            .Max();

        var lastVerifiedAt = lastSourceVerification is null
            ? lastRecordVerification
            : lastRecordVerification is null || lastSourceVerification > lastRecordVerification
                ? lastSourceVerification
                : lastRecordVerification;

        return new DashboardResponse(verifiedSourceCount, latestRecords, lastVerifiedAt);
    }

    public async Task<BudgetRecordListResponse> SearchBudgetRecordsAsync(
        BudgetRecordQuery query,
        CancellationToken cancellationToken)
    {
        var records = database.BudgetRecords
            .AsNoTracking()
            .Where(record => record.IsVerified);

        if (query.FiscalYear.HasValue)
        {
            records = records.Where(record => record.FiscalYear == query.FiscalYear.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Agency))
        {
            records = records.Where(record => record.Agency == query.Agency);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{query.Search.Trim()}%";
            records = records.Where(record =>
                EF.Functions.Like(record.Title, pattern)
                || EF.Functions.Like(record.Agency, pattern));
        }

        var total = await records.CountAsync(cancellationToken);
        var items = await records
            .OrderByDescending(record => record.FiscalYear)
            .ThenBy(record => record.Title)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(record => new BudgetRecordSummary(
                record.Id,
                record.Title,
                record.FiscalYear,
                record.Agency,
                record.Source.Organization,
                record.VerifiedAt))
            .ToListAsync(cancellationToken);

        return new BudgetRecordListResponse(items, total, query.Page, query.PageSize);
    }

    public async Task<BudgetRecordDetailResponse?> GetBudgetRecordAsync(Guid id, CancellationToken cancellationToken)
    {
        var record = await database.BudgetRecords
            .AsNoTracking()
            .Where(item => item.Id == id && item.IsVerified)
            .Include(item => item.Source)
            .ThenInclude(source => source.VerificationHistory
                .Where(verification => verification.Status == VerificationStatuses.Verified))
            .SingleOrDefaultAsync(cancellationToken);

        return record is null ? null : ToDetails(record);
    }

    public async Task<IReadOnlyList<string>> GetAgenciesAsync(CancellationToken cancellationToken) =>
        await database.BudgetRecords
            .AsNoTracking()
            .Where(record => record.IsVerified)
            .Select(record => record.Agency)
            .Distinct()
            .OrderBy(agency => agency)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<SourceResponse>> GetSourcesAsync(CancellationToken cancellationToken) =>
        await database.PublicSources
            .AsNoTracking()
            .OrderBy(source => source.Organization)
            .ThenBy(source => source.RecordType)
            .Select(source => new SourceResponse(
                source.Id,
                source.Organization,
                source.RecordType,
                source.VerificationStatus,
                source.LastVerifiedAt))
            .ToListAsync(cancellationToken);

    private async Task<IReadOnlyList<BudgetRecordSummary>> GetLatestVerifiedRecordsAsync(
        int take,
        CancellationToken cancellationToken) =>
        await database.BudgetRecords
            .AsNoTracking()
            .Where(record => record.IsVerified)
            .OrderByDescending(record => record.VerifiedAt)
            .ThenBy(record => record.Title)
            .Take(take)
            .Select(record => new BudgetRecordSummary(
                record.Id,
                record.Title,
                record.FiscalYear,
                record.Agency,
                record.Source.Organization,
                record.VerifiedAt))
            .ToListAsync(cancellationToken);

    private static BudgetRecordDetailResponse ToDetails(BudgetRecord record) => new(
        record.Id,
        record.Title,
        record.FiscalYear,
        record.Agency,
        new SourceReference(record.Source.Id, record.Source.Organization, record.Source.RecordType),
        record.VerifiedAt,
        record.Source.VerificationHistory
            .OrderByDescending(verification => verification.VerifiedAt)
            .Select(verification => new VerificationHistoryItem(
                verification.VerifiedAt,
                verification.Status,
                verification.Summary))
            .ToList());
}
