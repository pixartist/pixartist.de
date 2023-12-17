import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssistantModule } from './assistant/assistant.module';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [RouterModule.register([
    {
      path: 'assistant',
      module: AssistantModule,
    }
  ]), AssistantModule, AuthModule, MongooseModule.forRoot('mongodb://admin:admin@localhost:27017')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }