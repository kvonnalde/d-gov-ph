namespace DgovPh.Api.Entities;

public sealed class SourceVerification
{
    public Guid Id { get; set; }
    public Guid SourceId { get; set; }
    public required PublicSource Source { get; set; }
    public DateTimeOffset VerifiedAt { get; set; }
    public required string Status { get; set; }
    public string? Summary { get; set; }
}
