import { ConsoleLogger, LoggerService, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { Config } from 'src/config';
import { UserService } from '../user/user.service';
import { UserSchema } from '../user/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: Config.getOrThrow(Config.JWT_SECRET),
      signOptions: { expiresIn: '3600s' },
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    ConsoleLogger,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {
  constructor(private readonly userService: UserService, private readonly log: ConsoleLogger) {
    const defaultUserEmail = Config.getOrThrow(Config.DEFAULT_ADMIN_EMAIL)
    this.userService.exists(defaultUserEmail).then((exists) => {
      if (!exists) {
        log.log('Creating default admin user');
        this.userService.create(defaultUserEmail, Config.getOrThrow(Config.DEFAULT_ADMIN_PASSWORD));
      }
    });
  }
}
