import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class User {

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: false, type: Object })
  metadata: Record<string, any>;

}

export const UserSchema = SchemaFactory.createForClass(User);
