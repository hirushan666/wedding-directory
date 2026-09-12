import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentResolver } from '../../graphql/resolvers/payment.resolver';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { VisitorEntity } from '../../database/entities/visitor.entity';
import { VendorEntity } from '../../database/entities/vendor.entity';
import { PackageEntity } from '../../database/entities/package.entity';
import { MyVendorsEntity } from '../../database/entities/myVendors.entity';
import { OfferingEntity } from '../../database/entities/offering.entity';
import { PackageApprovalRequestEntity } from '../../database/entities/package-approval-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentEntity,
      VisitorEntity,
      VendorEntity,
      PackageEntity,
      MyVendorsEntity,
      OfferingEntity,
      PackageApprovalRequestEntity,
    ])
  ],
  providers: [PaymentService, PaymentResolver],
  exports: [PaymentService],
})
export class PaymentModule {}