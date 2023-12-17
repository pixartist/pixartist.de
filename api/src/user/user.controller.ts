import { Controller, Post, Body, Get } from '@nestjs/common';

import { Auth } from '../user.decorator';
import { UserService } from './user.service';
import { User } from './user.schema';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }

  @Post('metadata')
  async setMetadata(@Auth() user: User, @Body() body: Record<string, any>): Promise<Record<string, any>> {
    return (await this.userService.setMetadata(user.email, body)).metadata;
  }

  @Get('metadata')
  async getMetadata(@Auth() user: User): Promise<Record<string, any>> {
    return await this.userService.getMetadata(user.email);
  }
}
