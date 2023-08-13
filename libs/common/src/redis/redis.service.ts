import { REDIS_HOST, REDIS_PORT } from '@app/common/constants/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RedisService {
  constructor(private readonly configService: ConfigService) {}

  getOptions(): RedisOptions {
    return {
      transport: Transport.REDIS,
      options: {
        host: this.configService.get<string>(REDIS_HOST),
        port: this.configService.get<number>(REDIS_PORT),
      },
    };
  }
}
