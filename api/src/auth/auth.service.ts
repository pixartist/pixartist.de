import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async login(email: string, password: string) {
    const user = await this.userService.findOne(email);
    if (user.password === password) {
      const { password, ...payload } = user;
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
  }
}