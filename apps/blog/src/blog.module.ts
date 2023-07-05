import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/blog/.env',
    }),
    RedisModule,
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
