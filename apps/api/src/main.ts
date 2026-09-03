import fastifyCookie from '@fastify/cookie';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { resolve } from 'node:path';

import { AppModule } from './app.module.js';
import { parseEnvironment } from './config/environment.js';

async function bootstrap(): Promise<void> {
  const environment = parseEnvironment(process.env);
  const adapter = new FastifyAdapter();

  if (environment.NODE_ENV === 'production') {
    await adapter.useStaticAssets({
      root: resolve(import.meta.dirname, '../../web/dist'),
    });
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  await app.register(fastifyCookie);
  app.setGlobalPrefix('api');

  await app.listen(environment.PORT, '0.0.0.0');
}

void bootstrap();
