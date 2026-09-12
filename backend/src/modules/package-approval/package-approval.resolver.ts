import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PackageApprovalService } from './package-approval.service';
import { PackageApprovalRequestModel } from '../../graphql/models/package-approval-request.model';
import { CreateApprovalRequestInput } from '../../graphql/inputs/create-approval-request.input';
import { RespondApprovalRequestInput } from '../../graphql/inputs/respond-approval-request.input';

@Resolver(() => PackageApprovalRequestModel)
export class PackageApprovalResolver {
  constructor(private readonly packageApprovalService: PackageApprovalService) {}

  @Mutation(() => PackageApprovalRequestModel)
  async createPackageApprovalRequest(
    @Args('input') input: CreateApprovalRequestInput,
  ) {
    return this.packageApprovalService.createRequest(input);
  }

  @Mutation(() => PackageApprovalRequestModel)
  async respondPackageApprovalRequest(
    @Args('input') input: RespondApprovalRequestInput,
  ) {
    return this.packageApprovalService.respondRequest(input);
  }

  @Query(() => [PackageApprovalRequestModel])
  async getVendorApprovalRequests(
    @Args('vendorId') vendorId: string,
  ) {
    return this.packageApprovalService.getVendorApprovalRequests(vendorId);
  }

  @Query(() => [PackageApprovalRequestModel])
  async getVisitorApprovalRequests(
    @Args('visitorId') visitorId: string,
  ) {
    return this.packageApprovalService.getVisitorApprovalRequests(visitorId);
  }

  @Query(() => PackageApprovalRequestModel, { nullable: true })
  async getPackageApprovalRequestStatus(
    @Args('visitorId') visitorId: string,
    @Args('packageId') packageId: string,
  ) {
    return this.packageApprovalService.getPackageApprovalRequestStatus(
      visitorId,
      packageId,
    );
  }
}
