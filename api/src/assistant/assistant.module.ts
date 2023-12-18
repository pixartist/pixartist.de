import { ConsoleLogger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ShortcutController } from './shortcut/shortcut.controller';
import { ShortcutService } from './shortcut/shortcut.service';
import { UserModule } from '../user/user.module';
@Module({
  imports: [HttpModule, UserModule],
  controllers: [ShortcutController],
  providers: [ShortcutService, ConsoleLogger],
})
export class AssistantModule { }
