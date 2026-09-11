import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from '../payment/payment.module';
import { PayHereController } from './payhere.controller';
import { PayHereService } from './payhere.service';

@Module({
  imports: [ConfigModule, PaymentModule],
  controllers: [PayHereController],
  providers: [PayHereService],
  exports: [PayHereService],
})
export class PayHereModule {}
