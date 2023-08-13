import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { REDIS_HOST, REDIS_PORT } from '../constants/constants';
import { RedisService } from './redis.service';

interface RedisModuleOptions {
  name: string;
}

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {
  static register({ name }: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService) => ({
              transport: Transport.REDIS,
              options: {
                host: configService.get<string>(REDIS_HOST),
                port: configService.get<number>(REDIS_PORT),
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
