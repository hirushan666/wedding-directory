import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { VisitorEntity } from '../../database/entities/visitor.entity';
import { VendorEntity } from '../../database/entities/vendor.entity';
import { PackageEntity } from '../../database/entities/package.entity';
import { MyVendorsEntity } from '../../database/entities/myVendors.entity';
import { OfferingEntity } from '../../database/entities/offering.entity';

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
        package: { id: packageId }
        // We want to exclude failed payments.
        // And maybe include pending?
        // Let's filter in query if possible or in code.
        // Repository 'find' with IsNull or Not('failed')
      },
      select: ['bookingDate', 'status']
    });
    
    // Filter out failed payments and null dates
    return payments
      .filter(p => p.bookingDate && p.status !== 'failed')
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
        console.log(`\n✅ Payment ${payment.id} completed - Adding to myVendors`);
        
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
          console.log(`✅ Added offering ${payment.package.offering.id} to myVendors for visitor ${payment.visitor.id}`);
        } else {
          console.log(`⏭️  Offering ${payment.package.offering.id} already in myVendors for visitor ${payment.visitor.id}`);
        }
      } else {
        console.log(`⚠️  Payment ${stripeSessionId} missing package or offering relation`);
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
        console.log(`\n✅ Payment ${payment.id} marked as completed - Adding to myVendors`);
        
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
          console.log(`✅ Added offering ${payment.package.offering.id} to myVendors for visitor ${payment.visitor.id}`);
        } else {
          console.log(`⏭️  Offering ${payment.package.offering.id} already in myVendors for visitor ${payment.visitor.id}`);
        }
      } else {
        console.log(`⚠️  Payment ${paymentId} missing package or offering relation`);
      }
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
    });
  }

  async findByPackageId(packageId: string) {
    return this.paymentRepository.find({
      where: { package: { id: packageId } },
      relations: {
        visitor: true,
        vendor: true,
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
            offering: true
          }
        }
      });

      console.log(`\n=== SYNC PROCESS STARTED ===`);
      console.log(`Found ${completedPayments.length} completed payments`);

      let syncedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const payment of completedPayments) {
        console.log(`\nProcessing payment ${payment.id}:`);
        console.log(`  - Visitor: ${payment.visitor?.id || 'MISSING'}`);
        console.log(`  - Package: ${payment.package?.id || 'MISSING'}`);
        console.log(`  - Offering: ${payment.package?.offering?.id || 'MISSING'}`);

        if (!payment.visitor) {
          console.log(`  ❌ Missing visitor relation`);
          errorCount++;
          continue;
        }

        if (!payment.package?.offering) {
          console.log(`  ❌ Missing package or offering relation`);
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
            console.log(`  ⏭️  Already in myVendors (id: ${existingMyVendor.id})`);
            skippedCount++;
          } else {
            const myVendor = this.myVendorsRepository.create({
              visitor: payment.visitor,
              offering: payment.package.offering
            });
            const saved = await this.myVendorsRepository.save(myVendor);
            syncedCount++;
            console.log(`  ✅ Added to myVendors (id: ${saved.id})`);
          }
        } catch (err) {
          console.error(`  ❌ Error processing payment ${payment.id}:`, err.message);
          errorCount++;
        }
      }

      console.log(`\n=== SYNC PROCESS COMPLETED ===`);
      console.log(`Total payments: ${completedPayments.length}`);
      console.log(`✅ Newly synced: ${syncedCount}`);
      console.log(`⏭️  Already existed: ${skippedCount}`);
      console.log(`❌ Errors: ${errorCount}`);
      
      return { 
        message: `Synced ${syncedCount} new vendors to myVendors. ${skippedCount} already existed. ${errorCount} errors.`, 
        syncedCount,
        skippedCount,
        errorCount,
        total: completedPayments.length
      };
    } catch (error) {
      console.error('❌ FATAL ERROR in syncCompletedPaymentsToMyVendors:', error);
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

    console.log(`Payment ${paymentId} deleted by ${cancelledBy}`);
  }

  // Check if a vendor has a booking on a specific date
  async checkDateConflict(vendorId: string, bookingDate: Date): Promise<boolean> {
    // Normalize the date to compare only date part (ignore time)
    const dateOnly = new Date(bookingDate);
    dateOnly.setHours(0, 0, 0, 0);

    const nextDay = new Date(dateOnly);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find any completed or pending payments for this vendor on this date
    const existingBookings = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.vendorId = :vendorId', { vendorId })
      .andWhere('payment.bookingDate >= :startDate', { startDate: dateOnly })
      .andWhere('payment.bookingDate < :endDate', { endDate: nextDay })
      .andWhere('payment.status IN (:...statuses)', { statuses: ['pending', 'completed'] })
      .getCount();

    return existingBookings > 0;
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

    console.log('Debug Payment Relations:', result);
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
}
