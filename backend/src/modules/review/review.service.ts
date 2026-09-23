import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ReviewEntity } from '../../database/entities/review.entity';
import { DataSource,Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewRepository } from '../../database/repositories/review.repository';
import { ReviewRepositoryType } from '../../database/types/reviewTypes';
import { CreateReviewInput } from '../../graphql/inputs/createReview.input';
import { ServiceEntity } from '../../database/entities/service.entity';
import { VisitorEntity } from '../../database/entities/visitor.entity';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { OpenAI } from 'openai';
import { ServiceReviewSummaryEntity } from '../../database/entities/service-review-summary.entity';
import { ServiceReviewSummaryModel } from '../../graphql/models/service-review-summary.model';

interface PaginatedReviewResult {
  reviews: ReviewEntity[];
  averageRating: number;
  totalReviews: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface ReviewEligibilityResult {
  canReview: boolean;
  reason: string;
  message: string;
  bookingDate?: Date;
}

@Injectable()
export class ReviewService {
  private reviewRepository: ReviewRepositoryType;
  private summaryRepository: Repository<ServiceReviewSummaryEntity>;
  private openai: OpenAI | null;
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
    @InjectRepository(VisitorEntity)
    private readonly visitorRepository: Repository<VisitorEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
  ) {
    this.reviewRepository = ReviewRepository(this.dataSource);
    this.summaryRepository = this.dataSource.getRepository(ServiceReviewSummaryEntity);

    const apiKey = process.env.GROQ_API_KEY?.trim();
    this.openai = apiKey
      ? new OpenAI({
          apiKey,
          baseURL: process.env.GROQ_REVIEW_SUMMARY_ENDPOINT?.trim() || 'https://api.groq.com/openai/v1',
        })
      : null;
  }

  async checkReviewEligibility(
    serviceId: string,
    visitorId?: string,
  ): Promise<ReviewEligibilityResult> {
    if (!visitorId) {
      return {
        canReview: false,
        reason: 'NOT_LOGGED_IN',
        message: 'Please log in as a couple to review this service.',
      };
    }

    const existingReview = await this.reviewRepository.findOne({
      where: {
        service: { id: serviceId },
        visitor: { id: visitorId },
      },
    });

    if (existingReview) {
      return {
        canReview: false,
        reason: 'ALREADY_REVIEWED',
        message: 'You have already reviewed this service. Thank you for your feedback!',
      };
    }

    const completedPayments = await this.paymentRepository.find({
      where: {
        status: 'completed',
        visitor: { id: visitorId },
        package: {
          service: { id: serviceId },
        },
      },
      relations: {
        package: {
          service: true,
        },
      },
    });

    if (!completedPayments || completedPayments.length === 0) {
      return {
        canReview: false,
        reason: 'NOT_BOOKED',
        message: 'Only couples who have booked a package for this service can leave a review.',
      };
    }

    const now = new Date();
    const hasPassedBookingDate = completedPayments.some((payment) => {
      if (payment.bookingDate) {
        return new Date(payment.bookingDate) <= now;
      }
      return payment.createdAt ? new Date(payment.createdAt) <= now : true;
    });

    if (!hasPassedBookingDate) {
      const upcomingBookings = completedPayments
        .filter((p) => p.bookingDate)
        .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());

      const nextBookingDate = upcomingBookings[0]?.bookingDate;

      return {
        canReview: false,
        reason: 'EVENT_PENDING',
        message: 'You can leave a review once your booked event date has passed.',
        bookingDate: nextBookingDate,
      };
    }

    return {
      canReview: true,
      reason: 'ELIGIBLE',
      message: 'You are eligible to review this service.',
    };
  }

  async createReview(
    createReviewInput: CreateReviewInput,
  ): Promise<ReviewEntity> {
    if (!Number.isInteger(createReviewInput.rating) || createReviewInput.rating < 1 || createReviewInput.rating > 5) {
      throw new BadRequestException('Rating must be an integer between 1 and 5');
    }

    if (createReviewInput.image_urls && createReviewInput.image_urls.length > 3) {
      throw new BadRequestException('You can upload a maximum of 3 review images');
    }

    const service = await this.serviceRepository.findOne({
      where: { id: createReviewInput.service_id },
    });

    const visitor = await this.visitorRepository.findOne({
      where: { id: createReviewInput.visitor_id },
    });

    if (!service) {
      throw new NotFoundException('Offering not found');
    }
    if (!visitor) {
      throw new NotFoundException('Visitor not found');
    }

    // Check if visitor has already submitted a review for this service
    const existingReview = await this.reviewRepository.findOne({
      where: {
        service: { id: service.id },
        visitor: { id: visitor.id },
      },
    });
    if (existingReview) {
      throw new BadRequestException('You have already submitted a review for this service');
    }

    // Check if visitor has completed payment for this service
    const completedPayments = await this.paymentRepository.find({
      where: {
        status: 'completed',
        visitor: { id: visitor.id },
        package: {
          service: { id: service.id },
        },
      },
      relations: {
        package: {
          service: true,
        },
      },
    });

    if (!completedPayments || completedPayments.length === 0) {
      throw new BadRequestException('You must have booked and purchased a package for this service to leave a review');
    }

    // Check if the booked event date has passed
    const now = new Date();
    const hasPassedBookingDate = completedPayments.some((payment) => {
      if (payment.bookingDate) {
        return new Date(payment.bookingDate) <= now;
      }
      return payment.createdAt ? new Date(payment.createdAt) <= now : true;
    });

    if (!hasPassedBookingDate) {
      throw new BadRequestException('You can only leave a review after your booked event date has passed');
    }

    const mentionedService = createReviewInput.mentioned_service_id
      ? await this.serviceRepository.findOne({
          where: { id: createReviewInput.mentioned_service_id },
          relations: ['vendor'],
        })
      : undefined;

    const review = await this.reviewRepository.createReview(
      {
        ...createReviewInput,
        mentionedService,
      },
      service,
      visitor,
    );

    await this.refreshServiceReviewSummary(service.id).catch((error) => {
      console.error('Failed to refresh service review summary after create:', error);
    });

    return review;
  }

  async deleteReview(id: string): Promise<boolean> {
    return this.reviewRepository.deleteReview(id);
  }

  async findReviewById(id: string): Promise<ReviewEntity> {
    return this.reviewRepository.findReviewById(id);
  }

  async findReviewsByService(serviceId: string): Promise<ReviewEntity[]> {
    return this.reviewRepository.findReviewsByService(serviceId);
  }

  async findReviewsByServicePaginated(
    serviceId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedReviewResult> {
    const safePage = Math.max(1, page || 1);
    const safeLimit = Math.min(50, Math.max(1, limit || 5));

    const [reviews, totalReviews] = await this.reviewRepository.findReviewsByServicePaginated(
      serviceId,
      safePage,
      safeLimit,
    );

    const { averageRating } = await this.reviewRepository.getServiceReviewStats(serviceId);

    return {
      reviews,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
      currentPage: safePage,
      pageSize: safeLimit,
      totalPages: Math.max(1, Math.ceil(totalReviews / safeLimit)),
    };
  }

  async findAllReviews(): Promise<ReviewEntity[]> {
    return this.reviewRepository.findAllReviews();
  }

  async findServiceReviewSummary(
    serviceId: string,
  ): Promise<ServiceReviewSummaryModel | null> {
    const summary = await this.summaryRepository.findOne({
      where: { service: { id: serviceId } },
      relations: ['service'],
    });

    if (summary) {
      return {
        id: summary.id,
        serviceId: summary.service?.id ?? serviceId,
        summaryText: summary.summaryText,
        reviewCount: summary.reviewCount,
        lastReviewAt: summary.lastReviewAt,
        createdAt: summary.createdAt,
        updatedAt: summary.updatedAt,
      };
    }

    return null;
  }

  private async generateSummary(
    service: ServiceEntity,
    reviews: ReviewEntity[],
  ): Promise<string> {
    if (!this.openai) {
      return 'AI summary is unavailable right now.';
    }

    const model =
      process.env.GROQ_REVIEW_SUMMARY_MODEL?.trim() ||
      process.env.GROQ_RECOMMENDER_MODEL?.trim() ||
      'openai/gpt-oss-20b';
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    const reviewLines = reviews
      .slice(0, 30)
      .map((review) => {
        const author = review.visitor?.visitor_fname || 'Anonymous couple';
        const comment = review.comment?.trim() || 'No written comment provided.';
        return `- ${review.rating}/5 by ${author}: ${comment}`;
      })
      .join('\n');

    const response = await this.openai.chat.completions.create({
      model,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            'You summarize wedding vendor reviews for couples. Write 2 to 4 concise sentences. Keep the tone neutral, factual, and helpful. Mention recurring strengths, recurring concerns if any, and the overall sentiment. Do not use bullets, headings, or emojis.',
        },
        {
          role: 'user',
          content: [
            `Service: ${service.name}`,
            `Vendor: ${service.vendor?.busname || 'Unknown vendor'}`,
            `Average rating: ${averageRating.toFixed(1)}/5 across ${reviews.length} reviews`,
            'Recent reviews:',
            reviewLines,
            'Return only the summary text.',
          ].join('\n'),
        },
      ],
    });

    return response.choices[0]?.message?.content?.trim() || 'AI summary is unavailable right now.';
  }

  private async refreshServiceReviewSummary(serviceId: string): Promise<void> {
    if (!this.openai) {
      return;
    }

    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
      relations: ['vendor'],
    });

    if (!service) {
      return;
    }

    const currentReviews = await this.reviewRepository.findReviewsByService(serviceId);

    if (currentReviews.length === 0) {
      return;
    }

    const summaryText = await this.generateSummary(service, currentReviews);
    const latestReview = currentReviews[0];
    const existing = await this.summaryRepository.findOne({
      where: { service: { id: serviceId } },
    });

    const summaryEntity = this.summaryRepository.create({
      id: existing?.id,
      service,
      summaryText,
      reviewCount: currentReviews.length,
      lastReviewAt: latestReview?.createdAt ?? new Date(),
    });

    await this.summaryRepository.save(summaryEntity);
  }
}
