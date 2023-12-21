import { Body, Controller, Delete, Get, Post } from '@nestjs/common';

import { ShortcutService } from './shortcut.service';
import { Auth } from '../../user.decorator';
import { User } from '../../user/user.schema';
import { ShortcutResponseDto } from './shortcut-response.dto';

@Controller('shortcut')
export class ShortcutController {
  constructor(private readonly shortcutService: ShortcutService) { }

  @Post()
  async start(@Auth() user: User, @Body() body: any): Promise<ShortcutResponseDto> {
    return await this.shortcutService.startAssist(user, body);
  }

  @Post('continue')
  async continue(@Auth() user: User, @Body() body: any): Promise<ShortcutResponseDto> {
    return await this.shortcutService.continue(user, body);
  }

  @Get()
  getLog(@Auth() user: User): string {
    return user.metadata?.openai?.shortcut?.log;
  }

  @Delete()
  async cancelRun(@Auth() user: User): Promise<void> {
    await this.shortcutService.cancel(user);
  }
}
