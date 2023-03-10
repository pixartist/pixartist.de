import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: fs.readFileSync(__dirname + '/ssl/key.pem'),
      cert: fs.readFileSync(__dirname + '/ssl/cert.pem'),
      ca: fs.readFileSync(__dirname + '/ssl/chain.pem'),
    },
  });
  app.use(helmet());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('pixartist.de')
    .setDescription('_,,..--~~**````**~~--..,,__,,..--~~**````**~~--..,,__,,..--~~**````**~~--..,,__,,..--~~**````**~~--..,,_')
    .setVersion('1.0')
    .addTag('api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
