namespace DgovPh.Api.Entities;

public sealed class PublicSource
{
    public Guid Id { get; set; }
    public required string Organization { get; set; }
    public required string RecordType { get; set; }
    public required string VerificationStatus { get; set; }
    public DateTimeOffset? LastVerifiedAt { get; set; }
    public ICollection<BudgetRecord> BudgetRecords { get; set; } = new List<BudgetRecord>();
    public ICollection<SourceVerification> VerificationHistory { get; set; } = new List<SourceVerification>();
}
