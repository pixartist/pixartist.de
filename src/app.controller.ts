import { Body, Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './api/auth/auth.service';
import { JwtAuthGuard } from './api/auth/strategy/jwt-auth.guard';
import { RolesGuard } from './api/auth/strategy/roles.guard';
import { Roles } from './custom.decorator';
import { Role } from './api/users/enums/role.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health-check')
  healthCheck(): string {
    return this.appService.healthCheck();
  }

  @Get('/echo')
  getEcho(@Req() req, @Res() res, @Body() body) {
    res.status(200).json(body);
  }

  @Get('/premium-echo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.premium)
  getPremiumEcho(@Req() req, @Res() res, @Body() body) {
    res.status(200).json(body);
  }
}
