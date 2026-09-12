import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class AddRequiresApprovalAndPackageApprovalRequest1762000000002 implements MigrationInterface {
  name = "AddRequiresApprovalAndPackageApprovalRequest1762000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add requires_approval column to package table if it doesn't exist
    const packageTable = await queryRunner.getTable("package");
    if (packageTable && !packageTable.findColumnByName("requires_approval")) {
      await queryRunner.addColumn(
        "package",
        new TableColumn({
          name: "requires_approval",
          type: "boolean",
          default: false,
        }),
      );
    }

    // 2. Create package_approval_request table if not exists
    const hasApprovalTable = await queryRunner.hasTable("package_approval_request");
    if (!hasApprovalTable) {
      await queryRunner.createTable(
        new Table({
          name: "package_approval_request",
          columns: [
            {
              name: "id",
              type: "uuid",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "uuid",
              default: "uuid_generate_v4()",
            },
            {
              name: "visitor_id",
              type: "uuid",
            },
            {
              name: "vendor_id",
              type: "uuid",
            },
            {
              name: "package_id",
              type: "uuid",
            },
            {
              name: "booking_date",
              type: "timestamp",
            },
            {
              name: "user_note",
              type: "text",
              isNullable: true,
            },
            {
              name: "status",
              type: "varchar",
              length: "50",
              default: "'pending'",
            },
            {
              name: "vendor_message",
              type: "text",
              isNullable: true,
            },
            {
              name: "approved_at",
              type: "timestamp",
              isNullable: true,
            },
            {
              name: "expires_at",
              type: "timestamp",
              isNullable: true,
            },
            {
              name: "created_at",
              type: "timestamp",
              default: "now()",
            },
            {
              name: "updated_at",
              type: "timestamp",
              default: "now()",
            },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ["visitor_id"],
              referencedTableName: "visitor",
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            }),
            new TableForeignKey({
              columnNames: ["vendor_id"],
              referencedTableName: "vendor",
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            }),
            new TableForeignKey({
              columnNames: ["package_id"],
              referencedTableName: "package",
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            }),
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasApprovalTable = await queryRunner.hasTable("package_approval_request");
    if (hasApprovalTable) {
      await queryRunner.dropTable("package_approval_request");
    }

    const packageTable = await queryRunner.getTable("package");
    if (packageTable && packageTable.findColumnByName("requires_approval")) {
      await queryRunner.dropColumn("package", "requires_approval");
    }
  }
}
