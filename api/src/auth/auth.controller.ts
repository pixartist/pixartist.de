import { Controller, Post, Body } from '@nestjs/common';

import { AuthService } from './auth.service';
import { Public } from './public.annotation';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('login')
  async login(@Body() user: { email: string, password: string }): Promise<{ access_token: string }> {
    return await this.authService.login(user.email, user.password);
  }
}