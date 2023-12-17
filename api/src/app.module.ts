import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssistantModule } from './assistant/assistant.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';


@Module({
  imports: [
    RouterModule.register([
      {
        path: 'assistant',
        module: AssistantModule,
      },
    ]),
    AssistantModule,
    AuthModule,
    UserModule,
    MongooseModule.forRoot('mongodb://admin:admin@localhost:27017')
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
