import { Body, Controller, Get, Post } from '@nestjs/common';

import { ShortcutService } from './shortcut.service';
import { Auth } from '../../user.decorator';
import { User } from '../../user/user.schema';
import { ShortcutResponseDto } from './shortcut-response.dto';

@Controller('shortcut')
export class ShortcutController {
  constructor(private readonly shortcutService: ShortcutService) { }

  @Post('start')
  async start(@Auth() user: User, @Body() body: { query: string }): Promise<ShortcutResponseDto> {
    return await this.shortcutService.startAssist(user, body.query);
  }

  @Get()
  async continue(@Auth() user: User, @Body() body: { query: string }): Promise<ShortcutResponseDto> {
    return await this.shortcutService.continue(user, body.query);
  }
}
