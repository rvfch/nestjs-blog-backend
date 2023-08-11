import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { TenantMiddleware } from '@app/common/core/middleware/tenant.middleware';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: '/public/images',
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public', 'images').replace(
        '/dist/apps',
        '',
      ),
      serveRoot: '/images',
    }),
  ],
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
