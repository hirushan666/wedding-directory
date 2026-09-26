import { DataSource } from "typeorm";
import { PackageViewEntity } from "../entities/package-view.entity";

export const PackageViewRepository = (dataSource: DataSource) =>
  dataSource.getRepository(PackageViewEntity).extend({

    /**
     * Insert a view only if the same identifier hasn't been seen for this package
     * in the last 24 hours (deduplication on write, not just at query time).
     * Also skips if vendorId is provided and matches the package owner.
     */
    async createView(
      input: Partial<PackageViewEntity> & { vendorId?: string },
      packageId: string,
    ): Promise<boolean> {
      const { vendorId, ...viewData } = input;

      // Skip self-views: if the viewer is the vendor who owns this package
      if (vendorId) {
        const ownerSql = `
          SELECT 1 FROM offering o
          INNER JOIN vendor v ON v.id = o.vendor_id
          WHERE o.id = $1 AND v.id = $2
          LIMIT 1
        `;
        const owned: any[] = await (this.manager.query as any)(ownerSql, [packageId, vendorId]);
        if (owned.length > 0) return false;
      }

      // Skip if the same identifier already recorded a view in the last 24 hours
      const identifier = viewData.visitorId ?? viewData.sessionId ?? viewData.ipAddress;
      if (identifier) {
        const dedupSql = `
          SELECT 1 FROM package_view
          WHERE package_id = $1
            AND COALESCE(visitor_id, session_id, ip_address) = $2
            AND created_at > NOW() - INTERVAL '24 hours'
          LIMIT 1
        `;
        const existing: any[] = await (this.manager.query as any)(dedupSql, [packageId, identifier]);
        if (existing.length > 0) return false;
      }

      const repo = this as any;
      const view = repo.create({ ...viewData, package: { id: packageId } });
      await repo.save(view);
      return true;
    },

    /** Count unique viewers for a single package */
    async countUniqueViewsByPackage(packageId: string): Promise<number> {
      const sql = `
        SELECT COUNT(DISTINCT COALESCE(visitor_id, session_id, ip_address)) AS count
        FROM package_view
        WHERE package_id = $1
      `;
      const result: any = await (this.manager.query as any)(sql, [packageId]);
      return parseInt(result[0]?.count || 0, 10);
    },

    /** Count unique viewers across many packages (one person viewing N packages = 1 unique) */
    async countUniqueViewsByPackages(packageIds: string[]): Promise<number> {
      if (packageIds.length === 0) return 0;
      const sql = `
        SELECT COUNT(DISTINCT COALESCE(visitor_id, session_id, ip_address)) AS count
        FROM package_view
        WHERE package_id = ANY($1)
      `;
      const result: any = await (this.manager.query as any)(sql, [packageIds]);
      return parseInt(result[0]?.count || 0, 10);
    },

    /**
     * Batch unique view counts for multiple packages in a SINGLE query (fixes N+1).
     * Returns a map of packageId → uniqueViews.
     */
    async countUniqueViewsPerPackage(packageIds: string[]): Promise<Map<string, number>> {
      if (packageIds.length === 0) return new Map();
      const sql = `
        SELECT package_id,
               COUNT(DISTINCT COALESCE(visitor_id, session_id, ip_address)) AS count
        FROM package_view
        WHERE package_id = ANY($1)
        GROUP BY package_id
      `;
      const rows: any[] = await (this.manager.query as any)(sql, [packageIds]);
      return new Map(rows.map(r => [r.package_id, parseInt(r.count, 10)]));
    },

    /**
     * Batch monthly views across multiple packages in a SINGLE query (fixes N+1).
     * Fixes multi-year bug by grouping on date_trunc, returning ISO year-month key.
     */
    async findMonthlyViewsBatch(packageIds: string[], monthsBack = 6): Promise<{ month: string; views: number }[]> {
      if (packageIds.length === 0) return [];
      const since = new Date();
      since.setMonth(since.getMonth() - monthsBack + 1);
      since.setDate(1);
      since.setHours(0, 0, 0, 0);

      const sql = `
        SELECT
          date_trunc('month', created_at)        AS month_date,
          to_char(date_trunc('month', created_at), 'Mon ''YY') AS month,
          COUNT(*)                               AS views
        FROM package_view
        WHERE package_id = ANY($1)
          AND created_at >= $2
        GROUP BY month_date
        ORDER BY month_date
      `;
      const rows: any[] = await (this.manager.query as any)(sql, [packageIds, since.toISOString()]);
      return rows.map(r => ({ month: r.month, views: parseInt(r.views, 10) }));
    },

    /** Single-package monthly views (kept for getPackageAnalytics) */
    async findMonthlyViews(packageId: string, monthsBack = 6): Promise<{ month: string; views: number }[]> {
      const since = new Date();
      since.setMonth(since.getMonth() - monthsBack + 1);
      since.setDate(1);
      since.setHours(0, 0, 0, 0);

      const sql = `
        SELECT
          date_trunc('month', created_at)        AS month_date,
          to_char(date_trunc('month', created_at), 'Mon ''YY') AS month,
          COUNT(*)                               AS views
        FROM package_view
        WHERE package_id = $1
          AND created_at >= $2
        GROUP BY month_date
        ORDER BY month_date
      `;
      const rows: any[] = await (this.manager.query as any)(sql, [packageId, since.toISOString()]);
      return rows.map(r => ({ month: r.month, views: parseInt(r.views, 10) }));
    },

  });

