import { Module } from '@nestjs/common';
import { ImageManagerController } from './image-manager.controller';
import { ImageManagerService } from './image-manager.service';
import { RedisModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/image-manager/.env',
    }),
    RedisModule,
  ],
  controllers: [ImageManagerController],
  providers: [ImageManagerService],
})
export class ImageManagerModule {}
