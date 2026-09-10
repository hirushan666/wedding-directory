import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { PaymentModel } from '../../graphql/models/payment.model';
import { BookingModel } from '../../graphql/models/booking.model';
import { PaymentService } from '../../modules/payment/payment.service';

@Resolver(() => PaymentModel)
export class PaymentResolver {
  constructor(private paymentService: PaymentService) {}

  @Query(() => [PaymentModel])
  async visitorPayments(@Args('visitorId') visitorId: string) {
    return this.paymentService.findByVisitorId(visitorId);
  }

  @Query(() => [PaymentModel])
  async vendorPayments(@Args('vendorId') vendorId: string) {
    return this.paymentService.findByVendorId(vendorId);
  }

  @Query(() => [PaymentModel])
  async packagePayments(@Args('packageId') packageId: string) {
    return this.paymentService.findByPackageId(packageId);
  }

  @Query(() => [String])
  async getVendorBookedDates(@Args('vendorId') vendorId: string) {
    const payments = await this.paymentService.findByVendorId(vendorId);
    
    // Only completed payments lock booked dates on the calendar
    const bookedDates = payments
      .filter(p => p.status === 'completed' && p.bookingDate)
      .map(p => p.bookingDate.toISOString());
    
    return bookedDates;
  }

  @Mutation(() => String)
  async syncCompletedPaymentsToMyVendors() {
    const result = await this.paymentService.syncCompletedPaymentsToMyVendors();
    return result.message;
  }

  @Query(() => String)
  async debugPaymentRelations(@Args('paymentId') paymentId: string) {
    return this.paymentService.debugPaymentRelations(paymentId);
  }

  @Mutation(() => PaymentModel)
  async updatePaymentStatusById(
    @Args('paymentId') paymentId: string,
    @Args('status') status: 'completed' | 'failed' | 'pending'
  ) {
    return this.paymentService.updatePaymentStatusById(paymentId, status);
  }

  @Mutation(() => Boolean)
  async cancelPayment(
    @Args('paymentId') paymentId: string,
    @Args('cancelledBy') cancelledBy: 'vendor' | 'visitor'
  ) {
    await this.paymentService.cancelPayment(paymentId, cancelledBy);
    return true;
  }

  @Query(() => [BookingModel])
  async getVisitorBookings(@Args('visitorId') visitorId: string) {
    return this.paymentService.getVisitorBookings(visitorId);
  }
}