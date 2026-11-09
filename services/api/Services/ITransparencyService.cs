using DgovPh.Api.Contracts;

namespace DgovPh.Api.Services;

public interface ITransparencyService
{
    Task<DashboardResponse> GetDashboardAsync(CancellationToken cancellationToken);
    Task<BudgetRecordListResponse> SearchBudgetRecordsAsync(BudgetRecordQuery query, CancellationToken cancellationToken);
    Task<BudgetRecordDetailResponse?> GetBudgetRecordAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyList<string>> GetAgenciesAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<SourceResponse>> GetSourcesAsync(CancellationToken cancellationToken);
}
