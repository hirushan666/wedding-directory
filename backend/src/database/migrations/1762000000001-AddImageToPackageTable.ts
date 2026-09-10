import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddImageToPackageTable1762000000001 implements MigrationInterface {
  name = "AddImageToPackageTable1762000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "package",
      new TableColumn({
        name: "image",
        type: "varchar",
        length: "500",
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("package", "image");
  }
}
