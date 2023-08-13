import { REDIS_HOST, REDIS_PORT } from '@app/common/constants/constants';
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private ms: MicroserviceHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  public async check(): Promise<HealthCheckResult | object> {
    // TODO: add db check
    const healthCheckResult = await this.health.check([
      async () =>
        this.http.pingCheck(
          'gateway',
          this.configService.get('gatewayUrl') + '/api/ping',
        ),
      async () =>
        this.http.pingCheck(
          'auth',
          this.configService.get('authUrl') + '/api/auth/ping',
        ),
      async () =>
        this.http.pingCheck(
          'blog',
          this.configService.get('blogUrl') + '/api/blog/ping',
        ),
      async () =>
        this.http.pingCheck(
          'fileManager',
          this.configService.get('fileManagerUrl') + '/api/files/ping',
        ),
      async () =>
        this.ms.pingCheck('tenant', {
          transport: Transport.REDIS,
          options: {
            host: this.configService.get(REDIS_HOST),
            port: this.configService.get(REDIS_PORT),
          },
        }),
      async () =>
        this.ms.pingCheck('users', {
          transport: Transport.REDIS,
          options: {
            host: this.configService.get(REDIS_HOST),
            port: this.configService.get(REDIS_PORT),
          },
        }),
    ]);
    return { ...healthCheckResult, time: new Date().toISOString() };
  }
}
