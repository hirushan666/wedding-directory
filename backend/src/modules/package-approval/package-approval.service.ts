import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApprovalRequestStatus,
  PackageApprovalRequestEntity,
} from '../../database/entities/package-approval-request.entity';
import { PackageEntity } from '../../database/entities/package.entity';
import { VisitorEntity } from '../../database/entities/visitor.entity';
import { VendorEntity } from '../../database/entities/vendor.entity';
import { CreateApprovalRequestInput } from '../../graphql/inputs/create-approval-request.input';
import {
  ApprovalAction,
  RespondApprovalRequestInput,
} from '../../graphql/inputs/respond-approval-request.input';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PackageApprovalService {
  private readonly logger = new Logger(PackageApprovalService.name);

  constructor(
    @InjectRepository(PackageApprovalRequestEntity)
    private approvalRequestRepo: Repository<PackageApprovalRequestEntity>,
    @InjectRepository(PackageEntity)
    private packageRepo: Repository<PackageEntity>,
    @InjectRepository(VisitorEntity)
    private visitorRepo: Repository<VisitorEntity>,
    @InjectRepository(VendorEntity)
    private vendorRepo: Repository<VendorEntity>,
    private mailService: MailService,
  ) {}

  private computeHelperFields(req: PackageApprovalRequestEntity) {
    const now = new Date();
    let isExpired = false;
    let secondsRemaining = 0;

    if (req.status === ApprovalRequestStatus.EXPIRED) {
      isExpired = true;
    } else if (req.status === ApprovalRequestStatus.APPROVED && req.expiresAt) {
      const remainingMs = new Date(req.expiresAt).getTime() - now.getTime();
      if (remainingMs <= 0) {
        isExpired = true;
        req.status = ApprovalRequestStatus.EXPIRED;
        // Lazy update to expired in background
        void this.approvalRequestRepo.update(req.id, {
          status: ApprovalRequestStatus.EXPIRED,
        });
      } else {
        secondsRemaining = Math.floor(remainingMs / 1000);
      }
    }

    return {
      ...req,
      isExpired,
      secondsRemaining,
    };
  }

  private async sendPushToVendor(
    pushToken: string,
    packageName: string,
    visitorName: string,
    bookingDate: Date,
    requestId: string,
  ): Promise<void> {
    try {
      if (!pushToken?.trim()) return;

      const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: pushToken.trim(),
          sound: 'default',
          title: `New Package Approval Request`,
          body: `${visitorName || 'A couple'} requested approval for "${packageName}" on ${formattedDate}. Tap to review.`,
          data: {
            type: 'package_approval_request',
            requestId,
          },
        }),
      });

      if (!response.ok) {
        this.logger.warn(`Expo push send returned status: ${response.status}`);
      }
    } catch (error) {
      this.logger.error('Failed to send vendor push notification:', error);
    }
  }

  async createRequest(input: CreateApprovalRequestInput) {
    const { packageId, visitorId, bookingDate, userNote } = input;

    const pkg = await this.packageRepo.findOne({
      where: { id: packageId },
      relations: {
        offering: {
          vendor: true,
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    if (!pkg.requiresApproval) {
      throw new BadRequestException(
        'This package does not require prior vendor approval to purchase.',
      );
    }

    const visitor = await this.visitorRepo.findOne({
      where: { id: visitorId },
    });
    if (!visitor) {
      throw new NotFoundException('Visitor profile not found');
    }

    const vendor = pkg.offering?.vendor;
    if (!vendor) {
      throw new BadRequestException('Package vendor not found');
    }

    // Check if visitor already has an active pending or unexpired approved request for this package & date
    const existingActive = await this.approvalRequestRepo.findOne({
      where: {
        visitor: { id: visitorId },
        package: { id: packageId },
        bookingDate: new Date(bookingDate),
      },
      order: { createdAt: 'DESC' },
    });

    if (existingActive) {
      if (existingActive.status === ApprovalRequestStatus.PENDING) {
        throw new BadRequestException(
          'You already have a pending approval request for this package on this date.',
        );
      }
      if (
        existingActive.status === ApprovalRequestStatus.APPROVED &&
        existingActive.expiresAt &&
        new Date(existingActive.expiresAt) > new Date()
      ) {
        throw new BadRequestException(
          'You already have an approved request for this package. Please proceed to payment.',
        );
      }
    }

    const request = this.approvalRequestRepo.create({
      visitor,
      vendor,
      package: pkg,
      bookingDate: new Date(bookingDate),
      userNote: userNote?.trim() || undefined,
      status: ApprovalRequestStatus.PENDING,
    });

    const saved = await this.approvalRequestRepo.save(request);

    // Send push notification to vendor mobile app
    const visitorName = [visitor.visitor_fname, visitor.partner_fname]
      .filter(Boolean)
      .join(' & ') || 'Couple';

    if (vendor.expoPushToken) {
      void this.sendPushToVendor(
        vendor.expoPushToken,
        pkg.name,
        visitorName,
        saved.bookingDate,
        saved.id,
      );
    }

    return this.computeHelperFields(saved);
  }

  async respondRequest(input: RespondApprovalRequestInput) {
    const { requestId, vendorId, action, vendorMessage } = input;

    const request = await this.approvalRequestRepo.findOne({
      where: { id: requestId },
      relations: {
        package: {
          offering: true,
        },
        visitor: true,
        vendor: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Approval request not found');
    }

    if (request.vendor?.id !== vendorId) {
      throw new UnauthorizedException('You do not have permission to respond to this request.');
    }

    if (request.status !== ApprovalRequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot ${action} this request because it is already ${request.status}.`,
      );
    }

    const now = new Date();
    if (action === ApprovalAction.APPROVE) {
      request.status = ApprovalRequestStatus.APPROVED;
      request.approvedAt = now;
      // 24-hour countdown window
      request.expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      request.vendorMessage = vendorMessage?.trim() || undefined;
    } else {
      request.status = ApprovalRequestStatus.REJECTED;
      request.vendorMessage = vendorMessage?.trim() || undefined;
    }

    const saved = await this.approvalRequestRepo.save(request);

    // Send email notification to the couple
    if (request.visitor?.email) {
      const visitorName = [request.visitor.visitor_fname, request.visitor.partner_fname]
        .filter(Boolean)
        .join(' & ') || 'Couple';
      const vendorName = request.vendor.busname || 'Your Vendor';

      void this.mailService.sendApprovalDecisionEmail({
        to: request.visitor.email,
        visitorName,
        packageName: request.package?.name || 'Wedding Package',
        vendorName,
        bookingDate: request.bookingDate,
        action: action === ApprovalAction.APPROVE ? 'approved' : 'rejected',
        vendorMessage: request.vendorMessage,
        expiresAt: request.expiresAt,
      });
    }

    return this.computeHelperFields(saved);
  }

  async getVendorApprovalRequests(vendorId: string) {
    const requests = await this.approvalRequestRepo.find({
      where: { vendor: { id: vendorId } },
      relations: {
        visitor: true,
        package: {
          offering: true,
        },
        vendor: true,
      },
      order: { createdAt: 'DESC' },
    });

    return requests.map((r) => this.computeHelperFields(r));
  }

  async getVisitorApprovalRequests(visitorId: string) {
    const requests = await this.approvalRequestRepo.find({
      where: { visitor: { id: visitorId } },
      relations: {
        package: {
          offering: {
            vendor: true,
          },
        },
        vendor: true,
        visitor: true,
      },
      order: { createdAt: 'DESC' },
    });

    return requests.map((r) => this.computeHelperFields(r));
  }

  async getPackageApprovalRequestStatus(visitorId: string, packageId: string) {
    const request = await this.approvalRequestRepo.findOne({
      where: {
        visitor: { id: visitorId },
        package: { id: packageId },
      },
      relations: {
        package: true,
        vendor: true,
        visitor: true,
      },
      order: { createdAt: 'DESC' },
    });

    if (!request) return null;
    return this.computeHelperFields(request);
  }

  async markRequestAsPurchased(packageId: string, visitorId: string) {
    const request = await this.approvalRequestRepo.findOne({
      where: {
        package: { id: packageId },
        visitor: { id: visitorId },
        status: ApprovalRequestStatus.APPROVED,
      },
      order: { createdAt: 'DESC' },
    });

    if (request && (!request.expiresAt || new Date(request.expiresAt) > new Date())) {
      request.status = ApprovalRequestStatus.PURCHASED;
      await this.approvalRequestRepo.save(request);
      return request;
    }
    return null;
  }
}
