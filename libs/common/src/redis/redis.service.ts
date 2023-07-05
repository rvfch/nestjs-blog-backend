import { ConfigService } from '@nestjs/config';
import { RedisOptions, Transport } from '@nestjs/microservices';
import * as Constants from '@app/common/constants/constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisService {
  constructor(private readonly configService: ConfigService) {}

  getOptions(): RedisOptions {
    return {
      transport: Transport.REDIS,
      options: {
        host: this.configService.get<string>(Constants.REDIS_HOST),
        port: this.configService.get<number>(Constants.REDIS_PORT),
      },
    };
  }
}
