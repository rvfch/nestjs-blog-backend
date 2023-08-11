import { Module } from '@nestjs/common';
import { FileManagerController } from './file-manager.controller';
import { ConfigModule } from '@nestjs/config';
import { config } from './config/app.config';
import { configValidation } from './config/app.config.schema';
import { DatabaseModule } from '@app/common/database/database.module';
import { UploadModule } from './upload/upload.module';
import { JwtService } from '@app/common/core/services/jwt.service';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@app/common/core/guards/auth.guard';

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
