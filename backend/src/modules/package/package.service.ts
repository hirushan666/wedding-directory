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

  async createPackage(input: Partial<PackageEntity>, serviceId: string): Promise<PackageEntity> {
    if (input.requiresReservation && input.requiresApproval) {
      throw new Error('A package cannot have both Date Reservation and Vendor Approval enabled simultaneously.');
    }
    return this.packageRepository.createPackage(input, serviceId);
  }

  async updatePackage(input: Partial<PackageEntity>): Promise<PackageEntity> {
    if (input.requiresReservation && input.requiresApproval) {
      throw new Error('A package cannot have both Date Reservation and Vendor Approval enabled simultaneously.');
    }
    return this.packageRepository.updatePackage(input);
  }

  async deletePackage(id: string): Promise<boolean> {
    try {
      const ServicePackage = await this.packageRepository.findOne({ where: { id } });
      if (!ServicePackage) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }
      
      await this.packageRepository.remove(ServicePackage);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete package: ${error.message}`);
    }
  }

  async findPackageByService(serviceId: string): Promise<PackageEntity[]> {
    return this.packageRepository.findPackageByService(serviceId);
  }

  async trackPackageView(
    packageId: string,
    input: Partial<PackageViewEntity> & { vendorId?: string },
  ) {
    return this.packageViewRepository().createView(input, packageId);
  }

  async getPackageAnalytics(packageId: string) {
    const unique = await this.packageViewRepository().countUniqueViewsByPackage(packageId);
    const monthly = await this.packageViewRepository().findMonthlyViews(packageId, 6);

    return {
      totalUniqueViews: unique,
      monthlyViews: monthly,
    };
  }

  async getVendorAnalytics(vendorId: string) {
    // 1. Load all packages for this vendor in one query
    const packages = await this.dataSource
      .getRepository(PackageEntity)
      .createQueryBuilder('package')
      .innerJoin('package.service', 'service')
      .innerJoin('service.vendor', 'vendor')
      .where('vendor.id = :vendorId', { vendorId })
      .select(['package.id', 'package.name'])
      .getMany();

    const packageIds = packages.map(pkg => pkg.id);

    // 2. All unique views across vendor (single query)
    const totalUniqueViews = await this.packageViewRepository().countUniqueViewsByPackages(packageIds);

    // 3. Per-package unique counts (single batch query — was N queries before)
    const perPackageMap = await this.packageViewRepository().countUniqueViewsPerPackage(packageIds);

    const packagesAnalytics = packages.map(pkg => ({
      packageId: pkg.id,
      packageName: pkg.name,
      uniqueViews: perPackageMap.get(pkg.id) ?? 0,
    }));

    // 4. Monthly views across all packages (single batch query — was N queries before)
    const monthlyViews = await this.packageViewRepository().findMonthlyViewsBatch(packageIds, 6);

    return {
      totalUniqueViews,
      packagesAnalytics,
      monthlyViews,
    };
  }
}