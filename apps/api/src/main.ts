import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { resolve } from 'node:path';

import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const adapter = new FastifyAdapter();

  if (process.env.NODE_ENV === 'production') {
    await adapter.useStaticAssets({
      root: resolve(import.meta.dirname, '../../web/dist'),
    });
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

void bootstrap();
