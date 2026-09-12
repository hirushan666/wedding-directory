import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { VisitorEntity } from '../../database/entities/visitor.entity';
import { VendorEntity } from '../../database/entities/vendor.entity';
import { PackageEntity } from '../../database/entities/package.entity';
import { MyVendorsEntity } from '../../database/entities/myVendors.entity';
import { OfferingEntity } from '../../database/entities/offering.entity';
import {
  ApprovalRequestStatus,
  PackageApprovalRequestEntity,
} from '../../database/entities/package-approval-request.entity';

@Injectable()
export class PaymentService {
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
    @InjectRepository(OfferingEntity)
    private offeringRepository: Repository<OfferingEntity>,
    @InjectRepository(PackageApprovalRequestEntity)
    private approvalRequestRepository: Repository<PackageApprovalRequestEntity>,
  ) {}

  async createPayment(
    visitorId: string,
    vendorId: string,
    packageId: string,
    offeringId: string,
    amount: number,
    paymentReference: string,
    bookingDate?: Date, 
    gateway = 'payhere',
    gatewayPaymentId?: string,
  ) {
    // Check for date conflicts if bookingDate is provided
    if (bookingDate) {
      const hasConflict = await this.checkDateConflict(vendorId, bookingDate);
      if (hasConflict) {
        throw new Error('This vendor is already booked for the selected date. Please choose a different date.');
      }
    }

    const visitor = await this.visitorRepository.findOneBy({ id: visitorId });
    const vendor = await this.vendorRepository.findOneBy({ id: vendorId });
    const package_ = await this.packageRepository.findOneBy({ id: packageId });
    const offering = await this.offeringRepository.findOneBy({ id: offeringId });

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

      if (activeApproval.expiresAt && new Date(activeApproval.expiresAt) < new Date()) {
        activeApproval.status = ApprovalRequestStatus.EXPIRED;
        await this.approvalRequestRepository.save(activeApproval);
        throw new Error(
          'Your 24-hour payment window for this approval request has expired. Please request approval again.',
        );
      }

      if (!bookingDate && activeApproval.bookingDate) {
        bookingDate = activeApproval.bookingDate;
      }
    }

    // Mark any previous uncompleted pending payment for this visitor & package as failed
    await this.paymentRepository.update(
      {
        visitor: { id: visitorId },
        package: { id: packageId },
        status: 'pending',
      },
      { status: 'failed' }
    );

    const payment = this.paymentRepository.create({
      visitor,
      vendor,
      package: package_,
      amount: Number(amount.toFixed(2)),
      stripeSessionId: gateway === 'stripe' ? paymentReference : undefined,
      paymentReference,
      gateway,
      gatewayPaymentId,
      status: 'pending',
      bookingDate
    });

    // Add to myVendors if not already added
    const existingMyVendor = await this.myVendorsRepository.findOne({
      where: {
        visitor: { id: visitorId },
        offering: { id: offeringId }
      }
    });

    if (!existingMyVendor && offering) {
      const myVendor = this.myVendorsRepository.create({
        visitor,
        offering
      });
      await this.myVendorsRepository.save(myVendor);
    }

    return this.paymentRepository.save(payment);
  }

  async findBookedDatesByPackage(packageId: string): Promise<Date[]> {
    const payments = await this.paymentRepository.find({
      where: { 
        package: { id: packageId },
        status: 'completed'
      },
      select: ['bookingDate']
    });
    
    // Only completed payments lock booked dates
    return payments
      .filter(p => p.bookingDate)
      .map(p => p.bookingDate);
  }

  async updatePaymentStatus(stripeSessionId: string, status: 'completed' | 'failed') {
    // If status is completed, ensure vendor is added to myVendors
    if (status === 'completed') {
      const payment = await this.paymentRepository.findOne({
        where: { stripeSessionId },
        relations: {
          visitor: true,
          package: {
            offering: true
          }
        }
      });

      if (payment && payment.package?.offering) {
        // Check if already in myVendors
        const existingMyVendor = await this.myVendorsRepository.findOne({
          where: {
            visitor: { id: payment.visitor.id },
            offering: { id: payment.package.offering.id }
          }
        });

        // Add to myVendors if not already added
        if (!existingMyVendor) {
          const myVendor = this.myVendorsRepository.create({
            visitor: payment.visitor,
            offering: payment.package.offering
          });
          await this.myVendorsRepository.save(myVendor);
        }
      }

      if (payment) {
        void this.sendPushNotificationForPurchase(payment.id);
      }
    }

    return this.paymentRepository.update(
      { stripeSessionId },
      { status }
    );
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
            offering: true
          }
        }
      });

      if (payment && payment.package?.offering) {
        const existingMyVendor = await this.myVendorsRepository.findOne({
          where: {
            visitor: { id: payment.visitor.id },
            offering: { id: payment.package.offering.id }
          }
        });

        if (!existingMyVendor) {
          const myVendor = this.myVendorsRepository.create({
            visitor: payment.visitor,
            offering: payment.package.offering
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
        void this.sendPushNotificationForPurchase(payment.id);
      }
    }

    return this.paymentRepository.update(
      { paymentReference },
      {
        status,
        ...(gatewayPaymentId ? { gatewayPaymentId } : {}),
      }
    );
  }

  async findByPaymentReference(paymentReference: string) {
    return this.paymentRepository.findOne({
      where: { paymentReference },
      relations: {
        visitor: true,
        vendor: true,
        package: {
          offering: true
        }
      }
    });
  }

  // Update payment status by payment ID (for manual testing)
  async updatePaymentStatusById(paymentId: string, status: 'completed' | 'failed' | 'pending') {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: {
        visitor: true,
        package: {
          offering: true
        }
      }
    });

    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    // Update the status
    payment.status = status;
    await this.paymentRepository.save(payment);

    // If status is completed, ensure vendor is added to myVendors
    if (status === 'completed') {
      if (payment.package?.offering) {
        // Check if already in myVendors
        const existingMyVendor = await this.myVendorsRepository.findOne({
          where: {
            visitor: { id: payment.visitor.id },
            offering: { id: payment.package.offering.id }
          }
        });

        // Add to myVendors if not already added
        if (!existingMyVendor) {
          const myVendor = this.myVendorsRepository.create({
            visitor: payment.visitor,
            offering: payment.package.offering
          });
          await this.myVendorsRepository.save(myVendor);
        }
      }

      void this.sendPushNotificationForPurchase(payment.id);
    }

    return payment;
  }

  async findByVisitorId(visitorId: string) {
    return this.paymentRepository.find({
      where: { visitor: { id: visitorId } },
      relations: {
        vendor: true,
        package: {
          offering: true
        }
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findByVendorId(vendorId: string) {
    return this.paymentRepository.find({
      where: { vendor: { id: vendorId } },
      relations: {
        visitor: true,
        package: {
          offering: true
        },
      },
      order: {
        createdAt: 'DESC'
      }
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
        createdAt: 'DESC'
      }
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
            offering: true
          }
        }
      });

      let syncedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const payment of completedPayments) {
        if (!payment.visitor) {
          errorCount++;
          continue;
        }

        if (!payment.package?.offering) {
          errorCount++;
          continue;
        }

        try {
          const existingMyVendor = await this.myVendorsRepository.findOne({
            where: {
              visitor: { id: payment.visitor.id },
              offering: { id: payment.package.offering.id }
            }
          });

          if (existingMyVendor) {
            skippedCount++;
          } else {
            const myVendor = this.myVendorsRepository.create({
              visitor: payment.visitor,
              offering: payment.package.offering
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
        total: completedPayments.length
      };
    } catch (error) {
      console.error('Fatal error in syncCompletedPaymentsToMyVendors:', error);
      throw error;
    }
  }

  // Cancel a payment (only for pending status)
  async cancelPayment(paymentId: string, cancelledBy: 'vendor' | 'visitor'): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['visitor', 'vendor', 'package']
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

  // Check if a vendor has a booking on a specific date
  async checkDateConflict(vendorId: string, bookingDate: Date): Promise<boolean> {
    // Normalize the date to compare only date part (ignore time)
    const dateOnly = new Date(bookingDate);
    dateOnly.setHours(0, 0, 0, 0);

    const nextDay = new Date(dateOnly);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find completed payments for this vendor on this date
    const completedBookings = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.vendorId = :vendorId', { vendorId })
      .andWhere('payment.bookingDate >= :startDate', { startDate: dateOnly })
      .andWhere('payment.bookingDate < :endDate', { endDate: nextDay })
      .andWhere('payment.status = :status', { status: 'completed' })
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
          offering: true
        }
      }
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
      hasOffering: !!payment.package?.offering,
      offeringId: payment.package?.offering?.id,
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
          offering: true
        }
      },
      order: {
        bookingDate: 'ASC'
      }
    });

    // Transform payments to booking format
    return payments
      .filter(payment => payment.bookingDate) // Only include payments with dates
      .map(payment => ({
        id: payment.id,
        title: payment.package?.offering?.name || payment.package?.name || 'Wedding Service Booking',
        date: payment.bookingDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
        time: payment.bookingDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        status: this.mapPaymentStatusToBookingStatus(payment.status),
        location: payment.vendor?.location || payment.vendor?.city || 'Not specified',
        serviceProvider: {
          id: payment.vendor?.id,
          name: payment.vendor?.busname || `${payment.vendor?.fname || ''} ${payment.vendor?.lname || ''}`.trim(),
          email: payment.vendor?.email,
          phone: payment.vendor?.phone,
        },
        packageName: payment.package?.name,
        offeringName: payment.package?.offering?.name,
        amount: payment.amount,
        createdAt: payment.createdAt,
      }));
  }

  private mapPaymentStatusToBookingStatus(status: string): 'Confirmed' | 'Pending' | 'Cancelled' {
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

  private async sendPushNotificationForPurchase(paymentId: string): Promise<void> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId },
        relations: {
          vendor: true,
          visitor: true,
          package: {
            offering: true,
          },
        },
      });

      if (!payment) return;

      const pushToken = payment.vendor?.expoPushToken?.trim();
      if (!pushToken) {
        console.log(`[PushNotification] No expoPushToken found for vendor ${payment.vendor?.id}`);
        return;
      }

      const visitorName = [payment.visitor?.visitor_fname, payment.visitor?.partner_fname]
        .filter(Boolean)
        .join(' & ')
        .trim() || 'A couple';

      const packageName = payment.package?.name || payment.package?.offering?.name || 'Wedding Package';
      const formattedAmount = Number(payment.amount || 0).toLocaleString();
      const bookingDateStr = payment.bookingDate
        ? new Date(payment.bookingDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : null;

      const title = `🎉 New Booking: ${packageName}!`;
      const body = bookingDateStr
        ? `${visitorName} booked "${packageName}" ($${formattedAmount}) for ${bookingDateStr}.`
        : `${visitorName} booked "${packageName}" ($${formattedAmount}).`;

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: pushToken,
          sound: 'default',
          title,
          body,
          data: {
            type: 'package_purchase',
            paymentId: payment.id,
            packageName,
            amount: payment.amount,
            bookingDate: payment.bookingDate ? new Date(payment.bookingDate).toISOString() : null,
            visitorName,
          },
        }),
      });
      console.log(`[PushNotification] Successfully sent purchase push notification for payment ${payment.id} to vendor ${payment.vendor?.id}`);
    } catch (error) {
      console.error('Failed to send vendor purchase push notification:', error);
    }
  }
}
