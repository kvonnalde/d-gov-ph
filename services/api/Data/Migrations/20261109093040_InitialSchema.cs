using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DgovPh.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "public_sources",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    organization = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    record_type = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    verification_status = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    last_verified_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_public_sources", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "budget_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    fiscal_year = table.Column<int>(type: "int", nullable: false),
                    agency = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    source_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    is_verified = table.Column<bool>(type: "bit", nullable: false),
                    verified_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_budget_records", x => x.id);
                    table.CheckConstraint("ck_budget_records_verified_at", "is_verified = 0 OR verified_at IS NOT NULL");
                    table.ForeignKey(
                        name: "FK_budget_records_public_sources_source_id",
                        column: x => x.source_id,
                        principalTable: "public_sources",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "source_verifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    source_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    verified_at = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    status = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    summary = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_source_verifications", x => x.id);
                    table.ForeignKey(
                        name: "FK_source_verifications_public_sources_source_id",
                        column: x => x.source_id,
                        principalTable: "public_sources",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_budget_records_agency",
                table: "budget_records",
                column: "agency");

            migrationBuilder.CreateIndex(
                name: "IX_budget_records_is_verified_fiscal_year",
                table: "budget_records",
                columns: new[] { "is_verified", "fiscal_year" });

            migrationBuilder.CreateIndex(
                name: "IX_budget_records_source_id",
                table: "budget_records",
                column: "source_id");

            migrationBuilder.CreateIndex(
                name: "IX_public_sources_organization_record_type",
                table: "public_sources",
                columns: new[] { "organization", "record_type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_source_verifications_source_id_verified_at",
                table: "source_verifications",
                columns: new[] { "source_id", "verified_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "budget_records");

            migrationBuilder.DropTable(
                name: "source_verifications");

            migrationBuilder.DropTable(
                name: "public_sources");
        }
    }
}
