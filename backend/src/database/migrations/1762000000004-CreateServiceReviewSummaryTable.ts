import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServiceReviewSummaryTable1762000000004 implements MigrationInterface {
  name = 'CreateServiceReviewSummaryTable1762000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "service_review_summary" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "service_id" uuid NOT NULL,
        "summary_text" text NOT NULL,
        "review_count" integer NOT NULL DEFAULT 0,
        "last_review_at" timestamp,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_service_review_summary_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_service_review_summary_service_id" UNIQUE ("service_id"),
        CONSTRAINT "FK_service_review_summary_service" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "service_review_summary"`);
  }
}