import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

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
