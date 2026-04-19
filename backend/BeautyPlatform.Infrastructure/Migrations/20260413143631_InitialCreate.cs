using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CRMService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Salons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Street = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "UAH"),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Salons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalonId = table.Column<Guid>(type: "uuid", nullable: true),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalonSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalonId = table.Column<Guid>(type: "uuid", nullable: false),
                    OpeningTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    ClosingTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    DefaultSlotDurationMinutes = table.Column<int>(type: "integer", nullable: false, defaultValue: 60),
                    Timezone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Europe/Kyiv")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalonSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalonSettings_Salons_SalonId",
                        column: x => x.SalonId,
                        principalTable: "Salons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalonId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    SystemDurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    ClientDurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    Price = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Services_Salons_SalonId",
                        column: x => x.SalonId,
                        principalTable: "Salons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SpecializationCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IconUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsGlobal = table.Column<bool>(type: "boolean", nullable: false),
                    SalonId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpecializationCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SpecializationCategories_Salons_SalonId",
                        column: x => x.SalonId,
                        principalTable: "Salons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalonBreakTimes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Start = table.Column<TimeSpan>(type: "interval", nullable: false),
                    End = table.Column<TimeSpan>(type: "interval", nullable: false),
                    SalonSettingsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalonBreakTimes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalonBreakTimes_SalonSettings_SalonSettingsId",
                        column: x => x.SalonSettingsId,
                        principalTable: "SalonSettings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalonRegularDaysOff",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DayOfWeek = table.Column<int>(type: "integer", nullable: false),
                    SalonSettingsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalonRegularDaysOff", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalonRegularDaysOff_SalonSettings_SalonSettingsId",
                        column: x => x.SalonSettingsId,
                        principalTable: "SalonSettings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalonSpecialDaysOff",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Reason = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SalonSettingsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalonSpecialDaysOff", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalonSpecialDaysOff_SalonSettings_SalonSettingsId",
                        column: x => x.SalonSettingsId,
                        principalTable: "SalonSettings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceImages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    IsCover = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceImages_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CategoryDefaultServices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SystemDurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    ClientDurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    SuggestedPrice = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoryDefaultServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CategoryDefaultServices_SpecializationCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "SpecializationCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalonId = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    FullName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    AvatarUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    HireDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Employees_Salons_SalonId",
                        column: x => x.SalonId,
                        principalTable: "Salons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Employees_SpecializationCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "SpecializationCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeServices",
                columns: table => new
                {
                    EmployeeId = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    PriceOverride = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeServices", x => new { x.EmployeeId, x.ServiceId });
                    table.ForeignKey(
                        name: "FK_EmployeeServices_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EmployeeServices_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MasterSchedules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uuid", nullable: false),
                    DayOfWeek = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    IsWorking = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MasterSchedules_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "SalonOwner" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "Master" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CategoryDefaultServices_CategoryId",
                table: "CategoryDefaultServices",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_CategoryId",
                table: "Employees",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_SalonId_Email",
                table: "Employees",
                columns: new[] { "SalonId", "Email" },
                unique: true,
                filter: "\"Email\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeServices_ServiceId",
                table: "EmployeeServices",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_MasterSchedules_EmployeeId_DayOfWeek",
                table: "MasterSchedules",
                columns: new[] { "EmployeeId", "DayOfWeek" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalonBreakTimes_SalonSettingsId",
                table: "SalonBreakTimes",
                column: "SalonSettingsId");

            migrationBuilder.CreateIndex(
                name: "IX_SalonRegularDaysOff_SalonSettingsId",
                table: "SalonRegularDaysOff",
                column: "SalonSettingsId");

            migrationBuilder.CreateIndex(
                name: "IX_Salons_OwnerId",
                table: "Salons",
                column: "OwnerId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalonSettings_SalonId",
                table: "SalonSettings",
                column: "SalonId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalonSpecialDaysOff_SalonSettingsId",
                table: "SalonSpecialDaysOff",
                column: "SalonSettingsId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceImages_ServiceId",
                table: "ServiceImages",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_SalonId",
                table: "Services",
                column: "SalonId");

            migrationBuilder.CreateIndex(
                name: "IX_SpecializationCategories_SalonId_Name",
                table: "SpecializationCategories",
                columns: new[] { "SalonId", "Name" },
                unique: true,
                filter: "\"SalonId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CategoryDefaultServices");

            migrationBuilder.DropTable(
                name: "EmployeeServices");

            migrationBuilder.DropTable(
                name: "MasterSchedules");

            migrationBuilder.DropTable(
                name: "SalonBreakTimes");

            migrationBuilder.DropTable(
                name: "SalonRegularDaysOff");

            migrationBuilder.DropTable(
                name: "SalonSpecialDaysOff");

            migrationBuilder.DropTable(
                name: "ServiceImages");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "SalonSettings");

            migrationBuilder.DropTable(
                name: "Services");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "SpecializationCategories");

            migrationBuilder.DropTable(
                name: "Salons");
        }
    }
}
