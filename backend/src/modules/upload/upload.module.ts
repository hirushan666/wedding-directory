import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { VisitorModule } from '../visitor/visitor.module';
import { VendorModule } from '../vendor/vendor.module';
import { ServiceModule } from '../service/service.module';

@Module({
  imports: [
    VisitorModule,
    VendorModule,
    ServiceModule,
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.UPLOAD_RATE_TTL ?? '60000', 10),
        limit: parseInt(process.env.UPLOAD_RATE_LIMIT ?? '3', 10),
      },
    ]),
  ],
  controllers: [UploadController],
  providers: [
    UploadService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class UploadModule {}
