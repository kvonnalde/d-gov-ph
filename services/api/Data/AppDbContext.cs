using DgovPh.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DgovPh.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<PublicSource> PublicSources => Set<PublicSource>();
    public DbSet<BudgetRecord> BudgetRecords => Set<BudgetRecord>();
    public DbSet<SourceVerification> SourceVerifications => Set<SourceVerification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PublicSource>(entity =>
        {
            entity.ToTable("public_sources");
            entity.HasKey(source => source.Id);
            entity.Property(source => source.Id).HasColumnName("id");
            entity.Property(source => source.Organization).HasColumnName("organization").HasMaxLength(200).IsRequired();
            entity.Property(source => source.RecordType).HasColumnName("record_type").HasMaxLength(200).IsRequired();
            entity.Property(source => source.VerificationStatus).HasColumnName("verification_status").HasMaxLength(64).IsRequired();
            entity.Property(source => source.LastVerifiedAt).HasColumnName("last_verified_at");
            entity.HasIndex(source => new { source.Organization, source.RecordType }).IsUnique();
        });

        modelBuilder.Entity<BudgetRecord>(entity =>
        {
            entity.ToTable("budget_records", table => table.HasCheckConstraint(
                "ck_budget_records_verified_at",
                "is_verified = 0 OR verified_at IS NOT NULL"));
            entity.HasKey(record => record.Id);
            entity.Property(record => record.Id).HasColumnName("id");
            entity.Property(record => record.Title).HasColumnName("title").HasMaxLength(300).IsRequired();
            entity.Property(record => record.FiscalYear).HasColumnName("fiscal_year");
            entity.Property(record => record.Agency).HasColumnName("agency").HasMaxLength(200).IsRequired();
            entity.Property(record => record.SourceId).HasColumnName("source_id");
            entity.Property(record => record.IsVerified).HasColumnName("is_verified");
            entity.Property(record => record.VerifiedAt).HasColumnName("verified_at");
            entity.HasOne(record => record.Source)
                .WithMany(source => source.BudgetRecords)
                .HasForeignKey(record => record.SourceId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(record => new { record.IsVerified, record.FiscalYear });
            entity.HasIndex(record => record.Agency);
        });

        modelBuilder.Entity<SourceVerification>(entity =>
        {
            entity.ToTable("source_verifications");
            entity.HasKey(verification => verification.Id);
            entity.Property(verification => verification.Id).HasColumnName("id");
            entity.Property(verification => verification.SourceId).HasColumnName("source_id");
            entity.Property(verification => verification.VerifiedAt).HasColumnName("verified_at");
            entity.Property(verification => verification.Status).HasColumnName("status").HasMaxLength(64).IsRequired();
            entity.Property(verification => verification.Summary).HasColumnName("summary").HasMaxLength(1000);
            entity.HasOne(verification => verification.Source)
                .WithMany(source => source.VerificationHistory)
                .HasForeignKey(verification => verification.SourceId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(verification => new { verification.SourceId, verification.VerifiedAt });
        });
    }
}
