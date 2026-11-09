namespace DgovPh.Api.Entities;

public sealed class BudgetRecord
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public int FiscalYear { get; set; }
    public required string Agency { get; set; }
    public Guid SourceId { get; set; }
    public required PublicSource Source { get; set; }
    public bool IsVerified { get; set; }
    public DateTimeOffset? VerifiedAt { get; set; }
}
