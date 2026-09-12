import { Injectable, NotFoundException } from "@nestjs/common";
import { PackageEntity } from "../../database/entities/package.entity";
import { PackageRepository } from "../../database/repositories/package.repository";
import { PackageRepositoryType } from "../../database/types/packageTypes";
import { DataSource } from "typeorm";
import { PackageViewRepository } from "../../database/repositories/package-view.repository";
import { PackageViewEntity } from "../../database/entities/package-view.entity";

@Injectable()
export class PackageService {
  private packageRepository: PackageRepositoryType
  constructor(
    private readonly dataSource: DataSource
  ) {
    this.packageRepository = PackageRepository(this.dataSource);
  }

  // -- View tracking helpers --
  private packageViewRepository() {
    return PackageViewRepository(this.dataSource);
  }

  async createPackage(input: Partial<PackageEntity>, offeringId: string): Promise<PackageEntity> {
    if (input.requiresReservation && input.requiresApproval) {
      throw new Error('A package cannot have both Date Reservation and Vendor Approval enabled simultaneously.');
    }
    return this.packageRepository.createPackage(input, offeringId);
  }

  async updatePackage(input: Partial<PackageEntity>): Promise<PackageEntity> {
    if (input.requiresReservation && input.requiresApproval) {
      throw new Error('A package cannot have both Date Reservation and Vendor Approval enabled simultaneously.');
    }
    return this.packageRepository.updatePackage(input);
  }

  async deletePackage(id: string): Promise<boolean> {
    try {
      const OfferingPackage = await this.packageRepository.findOne({ where: { id } });
      if (!OfferingPackage) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }
      
      await this.packageRepository.remove(OfferingPackage);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete package: ${error.message}`);
    }
  }

  async findPackageByOffering(offeringId: string): Promise<PackageEntity[]> {
    return this.packageRepository.findPackageByOffering(offeringId);
  }

  async trackPackageView(packageId: string, input: Partial<PackageViewEntity>) {
    // Create a new view record (duplicates prevention handled at query time)
    return this.packageViewRepository().createView(input, packageId);
  }

  async getPackageAnalytics(packageId: string) {
    // total unique visitors
    const unique = await this.packageViewRepository().countUniqueViewsByPackage(packageId);
    const monthly = await this.packageViewRepository().findMonthlyViews(packageId, 6);

    return {
      totalUniqueViews: unique,
      monthlyViews: monthly,
    };
  }

  async getVendorAnalytics(vendorId: string) {
    // Find all packages for this vendor's offerings
    const packages = await this.dataSource
      .getRepository(PackageEntity)
      .createQueryBuilder('package')
      .innerJoin('package.offering', 'offering')
      .innerJoin('offering.vendor', 'vendor')
      .where('vendor.id = :vendorId', { vendorId })
      .select(['package.id', 'package.name'])
      .getMany();

    const packageIds = packages.map(pkg => pkg.id);
    
    // Count unique visitors across ALL packages (same person viewing multiple packages = 1 unique visitor)
    const totalUniqueViews = await this.packageViewRepository().countUniqueViewsByPackages(packageIds);
    
    const packagesAnalytics = [];

    // Get per-package stats
    for (const pkg of packages) {
      const uniqueViews = await this.packageViewRepository().countUniqueViewsByPackage(pkg.id);
      packagesAnalytics.push({
        packageId: pkg.id,
        packageName: pkg.name,
        uniqueViews,
      });
    }

    // Aggregate monthly views across all packages
    const monthlyViewsMap = new Map<string, number>();
    for (const pkg of packages) {
      const monthly = await this.packageViewRepository().findMonthlyViews(pkg.id, 6);
      for (const m of monthly) {
        monthlyViewsMap.set(m.month, (monthlyViewsMap.get(m.month) || 0) + m.views);
      }
    }

    const monthlyViews = Array.from(monthlyViewsMap.entries()).map(([month, views]) => ({
      month,
      views,
    }));

    return {
      totalUniqueViews,
      packagesAnalytics,
      monthlyViews,
    };
  }
}