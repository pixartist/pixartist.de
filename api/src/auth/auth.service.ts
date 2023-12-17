import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { UserDto } from '../user/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.userService.validateCredentials(email, password);
    if (user) {
      return {
        access_token: this.jwtService.sign(new UserDto(user).json()),
      };
    }
    throw new UnauthorizedException()
  }
}
