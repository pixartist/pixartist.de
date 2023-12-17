import { User } from './user.schema';

export class UserDto {
  constructor(user: User) {
    this.email = user.email;
    this.metadata = user.metadata;
  }
  email: string;
  metadata: Record<string, any>;

  json(): Record<string, any> {
    const str = JSON.stringify(this);
    return JSON.parse(str);
  }
}