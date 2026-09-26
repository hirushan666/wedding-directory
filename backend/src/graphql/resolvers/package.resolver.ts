import { Args, Mutation, Resolver } from "@nestjs/graphql/dist";
import { PackageService } from "../../modules/package/package.service";
import { PackageModel } from "../models/package.model";
import { CreatePackageInput } from "../inputs/createPackage.input";
import { UpdatePackageInput } from "../inputs/updatePackage.input";import { PackageEntity } from "src/database/entities/package.entity";
import { Query, ResolveField, Parent } from "@nestjs/graphql";
import { PaymentService } from "../../modules/payment/payment.service";
import { TrackPackageViewInput } from "../inputs/track-package-view.input";
import { PackageAnalyticsModel } from "../models/package-analytics.model";
import { VendorAnalyticsModel } from "../models/vendor-analytics.model";

@Resolver(() => PackageModel)

export class PackageResolver {
  constructor(
    private readonly packageService: PackageService,
    private readonly paymentService: PaymentService,
  ) {}

  @Query(() => [PackageModel])
  async findPackagesByService(@Args('serviceId') serviceId: string): Promise<PackageEntity[]> {
    return this.packageService.findPackageByService(serviceId);
  }

  @Mutation(() => PackageModel)
  async createPackage(
    @Args('input') input: CreatePackageInput,
    @Args('serviceId') serviceId: string): Promise<PackageEntity> {
    return this.packageService.createPackage(input, serviceId);
  }

  @Mutation(() => PackageModel)
  async updatePackage(
    @Args('input') input: UpdatePackageInput
  ): Promise<PackageEntity> {
    return this.packageService.updatePackage(input);
  }

  @Mutation(() => Boolean)
  async deletePackage(@Args('id') id: string): Promise<boolean> {
    return this.packageService.deletePackage(id);
  }

  @ResolveField(() => [Date], { nullable: true })
  async bookedDates(@Parent() pkg: PackageEntity): Promise<Date[]> {
    if (!pkg.requiresReservation) return [];
    return this.paymentService.findBookedDatesByPackage(pkg.id);
  }

  @Mutation(() => Boolean)
  async trackPackageView(
    @Args('packageId') packageId: string,
    @Args('visitorId', { nullable: true }) visitorId?: string,
    @Args('sessionId', { nullable: true }) sessionId?: string,
    @Args('ipAddress', { nullable: true }) ipAddress?: string,
    @Args('vendorId', { nullable: true }) vendorId?: string,
  ): Promise<boolean> {
    const input = { visitorId, sessionId, ipAddress, vendorId };
    await this.packageService.trackPackageView(packageId, input);
    return true;
  }

  @Query(() => PackageAnalyticsModel)
  async getPackageAnalytics(
    @Args('packageId') packageId: string,
  ): Promise<PackageAnalyticsModel> {
    return this.packageService.getPackageAnalytics(packageId);
  }

  @Query(() => VendorAnalyticsModel)
  async getVendorAnalytics(
    @Args('vendorId') vendorId: string,
  ): Promise<VendorAnalyticsModel> {
    return this.packageService.getVendorAnalytics(vendorId);
  }
}