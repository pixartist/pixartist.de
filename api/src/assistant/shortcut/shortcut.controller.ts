import { Controller, Get, Headers, Req } from '@nestjs/common';
import { ShortcutService } from './shortcut.service';


@Controller('shortcut')
export class ShortcutController {
  constructor(private readonly shortcutService: ShortcutService) { }

  @Get()
  assist(@Headers('openai-token') token: string, @Headers('openai-assistant') assistant: string): string {
    return this.shortcutService.assist();
  }
}
