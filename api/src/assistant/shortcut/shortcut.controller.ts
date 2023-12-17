import { Controller, Post } from '@nestjs/common';

import { ShortcutService } from './shortcut.service';
import { Auth } from '../../user.decorator';
import { User } from '../../user/user.schema';

@Controller('shortcut')
export class ShortcutController {
  constructor(private readonly shortcutService: ShortcutService) { }

  @Post('start')
  async start(@Auth() user: User): Promise<string> {
    return await this.shortcutService.startAssist(user);
  }

  @Post('continue')
  async start(@Auth() user: User): Promise<string> {
    return await this.shortcutService.startAssist(user);
  }
}
