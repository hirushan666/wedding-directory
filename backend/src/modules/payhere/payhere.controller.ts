import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { PayHereService } from './payhere.service';

@Controller('api/payhere')
export class PayHereController {
  constructor(private readonly payHereService: PayHereService) {}

  @Post('create-payment')
  async createPayment(@Headers('origin') origin: string, @Body() body: any) {
    return this.payHereService.createPayment(origin, body);
  }

  @Post('notify')
  async notify(@Body() body: any) {
    return this.payHereService.handleNotification(body);
  }

  @Get('payment')
  async getPayment(@Query('order_id') orderId: string) {
    return this.payHereService.getPaymentStatus(orderId);
  }
}
