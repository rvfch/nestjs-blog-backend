import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/users/.env',
    }),
    RedisModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
