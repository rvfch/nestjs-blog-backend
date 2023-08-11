import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

/**
 * This is API gateway app.
 * It's simple express app, which use proxy middleware to translate api endpoints from other apps
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(GatewayModule);
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);
  // Auth app
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: configService.get('authUrl'),
      changeOrigin: true,
    }),
  );
  // Tenant app
  app.use(
    '/api/tenant',
    createProxyMiddleware({
      target: configService.get('tenantUrl'),
      changeOrigin: true,
    }),
  );
  // Blog app
  app.use(
    '/api/blog',
    createProxyMiddleware({
      target: configService.get('blogUrl'),
      changeOrigin: true,
    }),
  );
  // File manager app
  app.use(
    '/api/files',
    createProxyMiddleware({
      target: configService.get('fileManagerUrl'),
      changeOrigin: true,
    }),
  );
  await app.listen(configService.get('port'));
}
bootstrap();
