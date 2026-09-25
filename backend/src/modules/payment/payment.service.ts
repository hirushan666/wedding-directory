import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { VisitorEntity } from '../../database/entities/visitor.entity';
import { VendorEntity } from '../../database/entities/vendor.entity';
import { PackageEntity } from '../../database/entities/package.entity';
import { MyVendorsEntity } from '../../database/entities/myVendors.entity';
import { ServiceEntity } from '../../database/entities/service.entity';
import {
  ApprovalRequestStatus,
  PackageApprovalRequestEntity,
} from '../../database/entities/package-approval-request.entity';
import { MailService } from '../mail/mail.service';
import { formatCoupleName } from '../../utils/format-couple-name.util';

@Injectable()
export class PaymentService {
  private static readonly PENDING_PAYMENT_TIMEOUT_MS = 30 * 60 * 1000;

  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(VisitorEntity)
    private visitorRepository: Repository<VisitorEntity>,
    @InjectRepository(VendorEntity)
    private vendorRepository: Repository<VendorEntity>,
    @InjectRepository(PackageEntity)
    private packageRepository: Repository<PackageEntity>,
    @InjectRepository(MyVendorsEntity)
    private myVendorsRepository: Repository<MyVendorsEntity>,
    @InjectRepository(ServiceEntity)
    private offeringRepository: Repository<ServiceEntity>,
    @InjectRepository(PackageApprovalRequestEntity)
    private approvalRequestRepository: Repository<PackageApprovalRequestEntity>,
    private readonly mailService: MailService,
  ) {}

  async createPayment(
    visitorId: string,
    vendorId: string,
    packageId: string,
    serviceId: string,
    amount: number,
    paymentReference: string,
    bookingDate?: Date,
    gateway = 'payhere',
    gatewayPaymentId?: string,
  ) {
    const visitor = await this.visitorRepository.findOneBy({ id: visitorId });
    const vendor = await this.vendorRepository.findOneBy({ id: vendorId });
    const package_ = await this.packageRepository.findOneBy({ id: packageId });
    const service = await this.offeringRepository.findOneBy({ id: serviceId });

    if (package_?.requiresApproval) {
      const activeApproval = await this.approvalRequestRepository.findOne({
        where: {
          visitor: { id: visitorId },
          package: { id: packageId },
          status: ApprovalRequestStatus.APPROVED,
        },
        order: { createdAt: 'DESC' },
      });

      if (!activeApproval) {
        throw new Error(
          'This package requires vendor approval. Please submit an approval request first.',
        );
      }

      if (
        activeApproval.expiresAt &&
        new Date(activeApproval.expiresAt) < new Date()
      ) {
        activeApproval.status = ApprovalRequestStatus.EXPIRED;
        await this.approvalRequestRepository.save(activeApproval);
        throw new Error(
          'Your 24-hour payment window for this approval request has expired. Please request approval again.',
        );
      }

      if (!bookingDate && activeApproval.bookingDate) {
        bookingDate = activeApproval.bookingDate;
      }
      // Note: For requiresApproval packages, the vendor has full responsibility
      // and can accept any amount of bookings for a day. Date blocking is intentionally bypassed.
    } else if (package_?.requiresReservation) {
      // Check for date conflicts only for packages requiring strict exclusive reservation
      if (bookingDate) {
        const hasConflict = await this.checkDateConflict(vendorId, bookingDate);
        if (hasConflict) {
          throw new Error(
            'This vendor is already reserved for the selected date. Please choose a different date.',
          );
        }
      }
    }

    // Mark any previous uncompleted pending payment for this visitor & package as failed
    await this.paymentRepository.update(
      {
        visitor: { id: visitorId },
        package: { id: packageId },
        status: 'pending',
      },
      { status: 'failed' },
    );

    const payment = this.paymentRepository.create({
      visitor,
      vendor,
      package: package_,
      amount: Number(amount.toFixed(2)),
      paymentReference,
      gateway,
      gatewayPaymentId,
      status: 'pending',
      bookingDate,
    });

    // Add to myVendors if not already added
    const existingMyVendor = await this.myVendorsRepository.findOne({
      where: {
        visitor: { id: visitorId },
        service: { id: serviceId },
      },
    });

    if (!existingMyVendor && service) {
      const myVendor = this.myVendorsRepository.create({
        visitor,
        service,
      });
      await this.myVendorsRepository.save(myVendor);
    }

    return this.paymentRepository.save(payment);
  }

  async findBookedDatesByPackage(packageId: string): Promise<Date[]> {
    const payments = await this.paymentRepository.find({
      where: {
        package: { id: packageId },
        status: 'completed',
      },
      select: ['bookingDate'],
    });

    // Only completed payments lock booked dates
    return payments.filter((p) => p.bookingDate).map((p) => p.bookingDate);
  }

  async updatePaymentStatus(
    paymentReference: string,
    status: 'completed' | 'failed',
  ) {
    return this.updatePaymentStatusByReference(paymentReference, status);
  }

  async updatePaymentStatusByReference(
    paymentReference: string,
    status: 'completed' | 'failed',
    gatewayPaymentId?: string,
  ) {
    if (status === 'completed') {
      const payment = await this.paymentRepository.findOne({
        where: { paymentReference },
        relations: {
          visitor: true,
          package: {
            service: true,
          },
        },
      });

      if (payment && payment.package?.service) {
        const existingMyVendor = await this.myVendorsRepository.findOne({
          where: {
            visitor: { id: payment.visitor.id },
            service: { id: payment.package.service.id },
          },
        });

        if (!existingMyVendor) {
          const myVendor = this.myVendorsRepository.create({
            visitor: payment.visitor,
            service: payment.package.service,
          });
          await this.myVendorsRepository.save(myVendor);
        }

        if (payment.package?.requiresApproval && payment.visitor) {
          const approval = await this.approvalRequestRepository.findOne({
            where: {
              visitor: { id: payment.visitor.id },
              package: { id: payment.package.id },
              status: ApprovalRequestStatus.APPROVED,
            },
            order: { createdAt: 'DESC' },
          });
          if (approval) {
            approval.status = ApprovalRequestStatus.PURCHASED;
            await this.approvalRequestRepository.save(approval);
          }
        }
      }

      if (payment) {
        void this.handlePurchaseNotifications(payment.id);
      }
    }

    return this.paymentRepository.update(
      { paymentReference },
      {
        status,
        ...(gatewayPaymentId ? { gatewayPaymentId } : {}),
      },
    );
  }

  async findByPaymentReference(paymentReference: string) {
    await this.expireStalePendingPayments();
    return this.paymentRepository.findOne({
      where: { paymentReference },
      relations: {
        visitor: true,
        vendor: true,
        package: {
          service: true,
        },
      },
    });
  }

  private async expireStalePendingPayments() {
    const cutoff = new Date(
      Date.now() - PaymentService.PENDING_PAYMENT_TIMEOUT_MS,
    );

    await this.paymentRepository
      .createQueryBuilder()
      .update(PaymentEntity)
      .set({ status: 'failed' })
      .where('status = :status', { status: 'pending' })
      .andWhere('created_at < :cutoff', { cutoff })
      .execute();
  }

  // Update payment status by payment ID (for manual testing)
  async updatePaymentStatusById(
    paymentId: string,
    status: 'completed' | 'failed' | 'pending',
  ) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: {
        visitor: true,
        package: {
          service: true,
        },
      },
    });

    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    // Update the status
    payment.status = status;
    await this.paymentRepository.save(payment);

    // If status is completed, ensure vendor is added to myVendors
    if (status === 'completed') {
      if (payment.package?.service) {
        // Check if already in myVendors
        const existingMyVendor = await this.myVendorsRepository.findOne({
          where: {
            visitor: { id: payment.visitor.id },
            service: { id: payment.package.service.id },
          },
        });

        // Add to myVendors if not already added
        if (!existingMyVendor) {
          const myVendor = this.myVendorsRepository.create({
            visitor: payment.visitor,
            service: payment.package.service,
          });
          await this.myVendorsRepository.save(myVendor);
        }
      }

      void this.handlePurchaseNotifications(payment.id);
    }

    return payment;
  }

  async findByVisitorId(visitorId: string) {
    await this.expireStalePendingPayments();
    return this.paymentRepository.find({
      where: { visitor: { id: visitorId } },
      relations: {
        vendor: true,
        package: {
          service: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByVendorId(vendorId: string) {
    return this.paymentRepository.find({
      where: { vendor: { id: vendorId } },
      relations: {
        visitor: true,
        package: {
          service: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByPackageId(packageId: string) {
    return this.paymentRepository.find({
      where: { package: { id: packageId } },
      relations: {
        visitor: true,
        vendor: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Utility method to sync completed payments to myVendors
  async syncCompletedPaymentsToMyVendors() {
    try {
      const completedPayments = await this.paymentRepository.find({
        where: { status: 'completed' },
        relations: {
          visitor: true,
          package: {
            service: true,
          },
        },
      });

      let syncedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const payment of completedPayments) {
        if (!payment.visitor) {
          errorCount++;
          continue;
        }

        if (!payment.package?.service) {
          errorCount++;
          continue;
        }

        try {
          const existingMyVendor = await this.myVendorsRepository.findOne({
            where: {
              visitor: { id: payment.visitor.id },
              service: { id: payment.package.service.id },
            },
          });

          if (existingMyVendor) {
            skippedCount++;
          } else {
            const myVendor = this.myVendorsRepository.create({
              visitor: payment.visitor,
              service: payment.package.service,
            });
            await this.myVendorsRepository.save(myVendor);
            syncedCount++;
          }
        } catch (err) {
          console.error(`Error syncing payment ${payment.id}:`, err.message);
          errorCount++;
        }
      }

      return {
        message: `Synced ${syncedCount} new vendors to myVendors. ${skippedCount} already existed. ${errorCount} errors.`,
        syncedCount,
        skippedCount,
        errorCount,
        total: completedPayments.length,
      };
    } catch (error) {
      console.error('Fatal error in syncCompletedPaymentsToMyVendors:', error);
      throw error;
    }
  }

  // Cancel a payment (only for pending status)
  async cancelPayment(
    paymentId: string,
    cancelledBy: 'vendor' | 'visitor',
  ): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['visitor', 'vendor', 'package'],
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'pending') {
      throw new Error('Only pending payments can be cancelled');
    }

    // Delete the payment from the database
    await this.paymentRepository.delete({ id: paymentId });
  }

  // Check if a vendor has a booking on a specific date for strict reservation packages
  async checkDateConflict(
    vendorId: string,
    bookingDate: Date,
  ): Promise<boolean> {
    // Normalize the date to compare only date part (ignore time)
    const dateOnly = new Date(bookingDate);
    dateOnly.setHours(0, 0, 0, 0);

    const nextDay = new Date(dateOnly);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find completed payments for this vendor on this date that strictly locked the date.
    // Packages with requiresApproval do NOT block dates, so they are excluded.
    const completedBookings = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.package', 'package')
      .where('payment.vendor_id = :vendorId', { vendorId })
      .andWhere('payment.booking_date >= :startDate', { startDate: dateOnly })
      .andWhere('payment.booking_date < :endDate', { endDate: nextDay })
      .andWhere('payment.status = :status', { status: 'completed' })
      .andWhere(
        '(package.requiresReservation = true OR (package.id IS NULL))',
      )
      .getCount();

    return completedBookings > 0;
  }

  // Debug helper to check payment relations
  async debugPaymentRelations(paymentId: string): Promise<string> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: {
        visitor: true,
        vendor: true,
        package: {
          service: true,
        },
      },
    });

    if (!payment) {
      return `Payment ${paymentId} not found`;
    }

    const result = {
      paymentId: payment.id,
      status: payment.status,
      hasVisitor: !!payment.visitor,
      visitorId: payment.visitor?.id,
      hasVendor: !!payment.vendor,
      vendorId: payment.vendor?.id,
      hasPackage: !!payment.package,
      packageId: payment.package?.id,
      hasOffering: !!payment.package?.service,
      serviceId: payment.package?.service?.id,
    };

    return JSON.stringify(result, null, 2);
  }

  // Get visitor bookings for calendar
  async getVisitorBookings(visitorId: string): Promise<any[]> {
    const payments = await this.paymentRepository.find({
      where: {
        visitor: { id: visitorId },
      },
      relations: {
        vendor: true,
        package: {
          service: true,
        },
      },
      order: {
        bookingDate: 'ASC',
      },
    });

    // Transform payments to booking format
    return payments
      .filter((payment) => payment.bookingDate) // Only include payments with dates
      .map((payment) => ({
        id: payment.id,
        title:
          payment.package?.service?.name ||
          payment.package?.name ||
          'Wedding Service Booking',
        date: payment.bookingDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
        time: payment.bookingDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        status: this.mapPaymentStatusToBookingStatus(payment.status),
        location:
          payment.vendor?.location || payment.vendor?.city || 'Not specified',
        serviceProvider: {
          id: payment.vendor?.id,
          name:
            payment.vendor?.busname ||
            `${payment.vendor?.fname || ''} ${payment.vendor?.lname || ''}`.trim(),
          email: payment.vendor?.email,
          phone: payment.vendor?.phone,
        },
        packageName: payment.package?.name,
        serviceName: payment.package?.service?.name,
        amount: payment.amount,
        createdAt: payment.createdAt,
      }));
  }

  private mapPaymentStatusToBookingStatus(
    status: string,
  ): 'Confirmed' | 'Pending' | 'Cancelled' {
    switch (status) {
      case 'completed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  }

  private async handlePurchaseNotifications(paymentId: string): Promise<void> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId },
        relations: {
          vendor: true,
          visitor: true,
          package: {
            service: true,
          },
        },
      });

      if (!payment) return;

      const visitorName = formatCoupleName(payment.visitor, 'A couple');

      const vendorName =
        payment.vendor?.busname ||
        `${payment.vendor?.fname || ''} ${payment.vendor?.lname || ''}`.trim() ||
        'Wedding Vendor';
      const packageName =
        payment.package?.name ||
        payment.package?.service?.name ||
        'Wedding Package';
      const serviceName = payment.package?.service?.name;
      const amount = Number(payment.amount || 0);
      const paymentReference = payment.paymentReference || payment.id;

      // 1. Send push notification to vendor mobile app (if push token is present)
      const pushToken = payment.vendor?.expoPushToken?.trim();
      if (pushToken) {
        const formattedAmount = amount.toLocaleString();
        const bookingDateStr = payment.bookingDate
          ? new Date(payment.bookingDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : null;

        const title = `🎉 New Booking: ${packageName}!`;
        const body = bookingDateStr
          ? `${visitorName} booked "${packageName}" (LKR ${formattedAmount}) for ${bookingDateStr}.`
          : `${visitorName} booked "${packageName}" (LKR ${formattedAmount}).`;

        try {
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
              to: pushToken,
              sound: 'default',
              channelId: 'default',
              priority: 'high',
              title,
              body,
              data: {
                type: 'package_purchase',
                paymentId: payment.id,
                packageName,
                amount: payment.amount,
                bookingDate: payment.bookingDate
                  ? new Date(payment.bookingDate).toISOString()
                  : null,
                visitorName,
              },
            }),
          });
          console.log(
            `[PushNotification] Successfully sent purchase push notification for payment ${payment.id} to vendor ${payment.vendor?.id}`,
          );
        } catch (pushError) {
          console.error(
            'Failed to send vendor purchase push notification:',
            pushError,
          );
        }
      } else {
        console.log(
          `[PushNotification] No expoPushToken found for vendor ${payment.vendor?.id}`,
        );
      }

      // 2. Send purchase confirmation email to user (visitor/couple)
      if (payment.visitor?.email) {
        try {
          await this.mailService.sendPackagePurchaseUserEmail({
            to: payment.visitor.email,
            visitorName,
            packageName,
            serviceName,
            vendorName,
            vendorEmail: payment.vendor?.email,
            vendorPhone: payment.vendor?.phone,
            amount,
            bookingDate: payment.bookingDate
              ? new Date(payment.bookingDate)
              : undefined,
            paymentReference,
          });
        } catch (emailError) {
          console.error(
            `Failed to send package purchase email to user ${payment.visitor.email}:`,
            emailError,
          );
        }
      }

      // 3. Send package purchase notification email to vendor
      if (payment.vendor?.email) {
        try {
          await this.mailService.sendPackagePurchaseVendorEmail({
            to: payment.vendor.email,
            vendorName,
            visitorName,
            visitorEmail: payment.visitor?.email || '',
            visitorPhone: payment.visitor?.phone,
            packageName,
            serviceName,
            amount,
            bookingDate: payment.bookingDate
              ? new Date(payment.bookingDate)
              : undefined,
            paymentReference,
          });
        } catch (emailError) {
          console.error(
            `Failed to send package purchase email to vendor ${payment.vendor.email}:`,
            emailError,
          );
        }
      }
    } catch (error) {
      console.error('Failed to handle purchase notifications:', error);
    }
  }
}
