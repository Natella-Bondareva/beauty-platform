using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRMService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeMultiCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_SpecializationCategories_CategoryId",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_CategoryId",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Employees");

            migrationBuilder.AddColumn<Guid>(
                name: "SpecializationCategoryId",
                table: "Employees",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EmployeeCategories",
                columns: table => new
                {
                    EmployeeId = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeCategories", x => new { x.EmployeeId, x.CategoryId });
                    table.ForeignKey(
                        name: "FK_EmployeeCategories_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EmployeeCategories_SpecializationCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "SpecializationCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_SpecializationCategoryId",
                table: "Employees",
                column: "SpecializationCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeCategories_CategoryId",
                table: "EmployeeCategories",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_SpecializationCategories_SpecializationCategoryId",
                table: "Employees",
                column: "SpecializationCategoryId",
                principalTable: "SpecializationCategories",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_SpecializationCategories_SpecializationCategoryId",
                table: "Employees");

            migrationBuilder.DropTable(
                name: "EmployeeCategories");

            migrationBuilder.DropIndex(
                name: "IX_Employees_SpecializationCategoryId",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "SpecializationCategoryId",
                table: "Employees");

            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "Employees",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Employees_CategoryId",
                table: "Employees",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_SpecializationCategories_CategoryId",
                table: "Employees",
                column: "CategoryId",
                principalTable: "SpecializationCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
