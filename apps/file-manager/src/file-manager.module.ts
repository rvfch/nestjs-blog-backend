import { JwtService } from '@app/common/core/services/jwt.service';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { DatabaseModule } from '@app/common/database/database.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config } from './config/app.config';
import { configValidation } from './config/app.config.schema';
import { FileManagerController } from './file-manager.controller';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidation,
      load: [config],
    }),
    DatabaseModule,
    UploadModule,
  ],
  providers: [JwtService, TenantStateService],
  controllers: [FileManagerController],
})
export class FileManagerModule {}
