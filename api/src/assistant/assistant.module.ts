import { Module } from '@nestjs/common';

import { ShortcutController } from './shortcut/shortcut.controller';
import { ShortcutService } from './shortcut/shortcut.service';
@Module({
  imports: [],
  controllers: [ShortcutController],
  providers: [ShortcutService],
})
export class AssistantModule { }
