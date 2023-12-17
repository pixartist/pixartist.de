import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  async findOne(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async validateCredentials(email: string, plainTextPassword: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).select('+password');
    if (user && await bcrypt.compare(plainTextPassword, user.password)) {
      return user;
    }
    return null;
  }

  async exists(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email });
    return !!user;
  }

  async create(email: string, password: string): Promise<User> {
    if (await this.exists(email)) {
      throw new ConflictException(`User with email ${email} already exists`);
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = new this.userModel({ email, password: hashed });
    return await user.save();
  }

  async setMetadata(email: string, metadata: Record<string, any>): Promise<User> {
    const user = await this.findOne(email);
    user.metadata = { ...user.metadata, ...metadata };
    await this.userModel.updateOne({ email }, user);
    return user;
  }

  async getMetadata(email: string): Promise<Record<string, any>> {
    const user = await this.findOne(email);
    return user.metadata;
  }

  async delete(email: string): Promise<void> {
    await this.userModel.deleteOne({ email });
  }

  async save(user: User): Promise<User> {
    await this.userModel.updateOne({ email: user.email }, user);
    return user;
  }
}