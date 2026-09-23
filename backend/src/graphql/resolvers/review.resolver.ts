import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ReviewService } from "../../modules/review/review.service";
import { ReviewModel } from "../models/review.model";
import { ReviewEntity } from "../../database/entities/review.entity";
import { CreateReviewInput } from "../inputs/createReview.input";
import { ReviewPageModel } from "../models/review-page.model";
import { ReviewEligibilityModel } from "../models/review-eligibility.model";
import { ServiceReviewSummaryModel } from "../models/service-review-summary.model";

@Resolver()
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @Query(() => ReviewEligibilityModel)
  async checkReviewEligibility(
    @Args('service_id') serviceId: string,
    @Args('visitor_id', { nullable: true }) visitorId?: string,
  ): Promise<ReviewEligibilityModel> {
    return this.reviewService.checkReviewEligibility(serviceId, visitorId);
  }

  @Mutation(() => ReviewModel)
  async createReview(
    @Args('input') input: CreateReviewInput,
  ): Promise<ReviewEntity> {
    return this.reviewService.createReview(input);
  }

  @Mutation(() => Boolean)
  async deleteReview(@Args('id') id: string): Promise<boolean> {
    return this.reviewService.deleteReview(id);
  }

  @Query(() => [ReviewModel])
  async findReviewsByService(
    @Args('service_id') serviceId: string,
  ): Promise<ReviewEntity[]> {
    return this.reviewService.findReviewsByService(serviceId);
  }

  @Query(() => ReviewPageModel)
  async findReviewsByServicePaginated(
    @Args('service_id') serviceId: string,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 5 }) limit: number,
  ): Promise<ReviewPageModel> {
    const result = await this.reviewService.findReviewsByServicePaginated(serviceId, page, limit);
    return {
      ...result,
      reviews: result.reviews as unknown as ReviewModel[],
    };
  }

  @Query(() => ServiceReviewSummaryModel, { nullable: true })
  async findServiceReviewSummary(
    @Args('service_id') serviceId: string,
  ): Promise<ServiceReviewSummaryModel | null> {
    return this.reviewService.findServiceReviewSummary(serviceId);
  }

  @Query(() => [ReviewModel])
  async findAllReviews(): Promise<ReviewEntity[]> {
    return this.reviewService.findAllReviews();
  }
}
