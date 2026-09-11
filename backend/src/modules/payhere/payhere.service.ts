import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PaymentService } from '../payment/payment.service';

interface CreatePayHerePaymentInput {
  amount: number;
  packageId: string;
  visitorId: string;
  vendorId: string;
  offeringId: string;
  bookingDate?: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
  };
}

interface PayHereNotifyInput {
  merchant_id: string;
  order_id: string;
  payment_id?: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
}

@Injectable()
export class PayHereService {
  constructor(
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
  ) {}

  async createPayment(origin: string, input: CreatePayHerePaymentInput) {
    const merchantId = this.getRequiredConfig('PAYHERE_MERCHANT_ID');
    const merchantSecret = this.getRequiredConfig('PAYHERE_MERCHANT_SECRET');
    const backendUrl = this.configService.get<string>('BACKEND_URL') || origin;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || origin;
    const currency = this.configService.get<string>('PAYHERE_CURRENCY') || 'LKR';
    const orderId = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const amount = Number(input.amount).toFixed(2);

    await this.paymentService.createPayment(
      input.visitorId,
      input.vendorId,
      input.packageId,
      input.offeringId,
      Number(amount),
      orderId,
      input.bookingDate ? new Date(input.bookingDate) : undefined,
      'payhere',
    );

    return {
      actionUrl: this.getCheckoutUrl(),
      payment: {
        sandbox: this.configService.get<string>('PAYHERE_SANDBOX') !== 'false',
        merchant_id: merchantId,
        return_url: `${frontendUrl}/success?order_id=${orderId}`,
        cancel_url: `${frontendUrl}/services/${input.offeringId}?payment_canceled=true`,
        notify_url: this.configService.get<string>('PAYHERE_NOTIFY_URL') || `${backendUrl}/api/payhere/notify`,
        order_id: orderId,
        items: 'Advance Payment',
        currency,
        amount,
        first_name: input.customer?.firstName || 'Wedding',
        last_name: input.customer?.lastName || 'Customer',
        email: input.customer?.email || 'customer@sayido.lk',
        phone: input.customer?.phone || '0770000000',
        address: input.customer?.address || 'N/A',
        city: input.customer?.city || 'Colombo',
        country: 'Sri Lanka',
        custom_1: input.visitorId,
        custom_2: input.packageId,
        hash: this.createCheckoutHash(merchantId, orderId, amount, currency, merchantSecret),
      },
    };
  }

  async handleNotification(input: PayHereNotifyInput) {
    const merchantId = this.getRequiredConfig('PAYHERE_MERCHANT_ID');
    const merchantSecret = this.getRequiredConfig('PAYHERE_MERCHANT_SECRET');

    if (input.merchant_id !== merchantId) {
      throw new BadRequestException('Invalid merchant id');
    }

    const expectedSignature = this.createNotifyHash(
      input.merchant_id,
      input.order_id,
      input.payhere_amount,
      input.payhere_currency,
      input.status_code,
      merchantSecret,
    );

    if (expectedSignature !== input.md5sig) {
      throw new BadRequestException('Invalid PayHere signature');
    }

    await this.paymentService.updatePaymentStatusByReference(
      input.order_id,
      input.status_code === '2' ? 'completed' : 'failed',
      input.payment_id,
    );

    return { received: true };
  }

  async getPaymentStatus(orderId: string) {
    const payment = await this.paymentService.findByPaymentReference(orderId);

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    return {
      orderId,
      status: payment.status,
      amount: payment.amount,
      gatewayPaymentId: payment.gatewayPaymentId,
      customerEmail: payment.visitor?.email,
    };
  }

  private getCheckoutUrl() {
    return this.configService.get<string>('PAYHERE_SANDBOX') === 'false'
      ? 'https://www.payhere.lk/pay/checkout'
      : 'https://sandbox.payhere.lk/pay/checkout';
  }

  private createCheckoutHash(
    merchantId: string,
    orderId: string,
    amount: string,
    currency: string,
    merchantSecret: string,
  ) {
    return this.md5(`${merchantId}${orderId}${amount}${currency}${this.md5(merchantSecret)}`);
  }

  private createNotifyHash(
    merchantId: string,
    orderId: string,
    amount: string,
    currency: string,
    statusCode: string,
    merchantSecret: string,
  ) {
    return this.md5(`${merchantId}${orderId}${amount}${currency}${statusCode}${this.md5(merchantSecret)}`);
  }

  private md5(value: string) {
    return createHash('md5').update(value).digest('hex').toUpperCase();
  }

  private getRequiredConfig(key: string) {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new BadRequestException(`${key} is not configured`);
    }

    return value;
  }
}
