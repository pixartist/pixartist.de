import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bearer authentication middleware
  app.use((req, res, next) => {
    const token = process.env.BEARER_TOKEN;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7) === token) {
      next();
    } else {
      res.status(401).send('Unauthorized').end();
    }
  });

  await app.listen(3000);
}

bootstrap();
