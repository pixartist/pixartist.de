import { ConsoleLogger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { UserModule } from '../user/user.module';
@Module({
  imports: [HttpModule, UserModule],
  controllers: [],
  providers: [ConsoleLogger],
})
export class AssistantModule { }
