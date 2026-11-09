using DgovPh.Api.Contracts;
using DgovPh.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace DgovPh.Api.Services;

public interface IDatabaseHealthService
{
    Task<bool> IsReadyAsync(CancellationToken cancellationToken);
}

public sealed class DatabaseHealthService(AppDbContext database) : IDatabaseHealthService
{
    public async Task<bool> IsReadyAsync(CancellationToken cancellationToken)
    {
        try
        {
            return await database.Database.CanConnectAsync(cancellationToken);
        }
        catch
        {
            return false;
        }
    }
}
