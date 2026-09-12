import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageApprovalRequestEntity } from '../../database/entities/package-approval-request.entity';
import { PackageEntity } from '../../database/entities/package.entity';
import { VisitorEntity } from '../../database/entities/visitor.entity';
import { VendorEntity } from '../../database/entities/vendor.entity';
import { PackageApprovalService } from './package-approval.service';
import { PackageApprovalResolver } from './package-approval.resolver';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PackageApprovalRequestEntity,
      PackageEntity,
      VisitorEntity,
      VendorEntity,
    ]),
    MailModule,
  ],
  providers: [PackageApprovalService, PackageApprovalResolver],
  exports: [PackageApprovalService],
})
export class PackageApprovalModule {}
