import * as dotenv from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { CreatePackageViewTable1707489026321 } from './migrations/1707489026321-CreatePackageViewTable';
import { AddReviewImagesAndMentions1762000000000 } from './migrations/1762000000000-AddReviewImagesAndMentions';
import { CreateServiceReviewSummaryTable1762000000004 } from './migrations/1762000000004-CreateServiceReviewSummaryTable';

dotenv.config({ path: join(__dirname, '..', '..', '.env') });

const normalizeDatabaseUrl = (value?: string): string | undefined => {
  if (!value) return undefined;
  return value.trim().replace(/^['"]|['"]$/g, '');
};

const parseDbSsl = (): boolean => {
  const raw = process.env.DB_SSL?.trim().toLowerCase();
  if (raw === 'true') return true;
  if (raw === 'false') return false;

  const dbUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
  if (dbUrl?.includes('sslmode=require')) return true;

  return false;
};

async function runMigration() {
  const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing. Set it in backend/.env');
  }

  const useSsl = parseDbSsl();

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    ssl: useSsl ? {
      rejectUnauthorized: false,
    } : false,
    entities: ['src/database/entities/**/*.ts'],
    migrations: ['src/database/migrations/**/*.ts'],
  });

  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');
    
    const queryRunner = dataSource.createQueryRunner();
    const packageViewExists = await queryRunner.hasTable('package_view');
    if (!packageViewExists) {
      const migration = new CreatePackageViewTable1707489026321();
      console.log(`Running migration: ${migration.name}`);
      await migration.up(queryRunner);
    } else {
      console.log('Skipping CreatePackageViewTable1707489026321 (already applied).');
    }

    const hasImageUrls = await queryRunner.hasColumn('review', 'image_urls');
    const hasMentionedService = await queryRunner.hasColumn('review', 'mentioned_service_id');

    if (!hasImageUrls || !hasMentionedService) {
      const migration = new AddReviewImagesAndMentions1762000000000();
      console.log(`Running migration: ${migration.name}`);
      await migration.up(queryRunner);
    } else {
      console.log('Skipping AddReviewImagesAndMentions1762000000000 (already applied).');
    }

    const hasServiceReviewSummaryTable = await queryRunner.hasTable('service_review_summary');
    if (!hasServiceReviewSummaryTable) {
      const migration = new CreateServiceReviewSummaryTable1762000000004();
      console.log(`Running migration: ${migration.name}`);
      await migration.up(queryRunner);
    } else {
      console.log('Skipping CreateServiceReviewSummaryTable1762000000004 (already applied).');
    }

    const hasIsOnboarded = await queryRunner.hasColumn('visitor', 'is_onboarded');
    if (!hasIsOnboarded) {
      await queryRunner.query(
        `ALTER TABLE "visitor" ADD COLUMN IF NOT EXISTS "is_onboarded" boolean DEFAULT false`,
      );
      console.log('Added is_onboarded column to visitor table');
    }

    await queryRunner.query(
      `UPDATE "visitor" SET "is_onboarded" = true WHERE "is_onboarded" IS NOT TRUE AND ("city" IS NOT NULL OR "phone" IS NOT NULL OR "wedding_date" IS NOT NULL OR "partner_first_name" IS NOT NULL)`,
    );

    console.log('Migration completed successfully!');
    
    await queryRunner.release();
    await dataSource.destroy();
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

runMigration();
