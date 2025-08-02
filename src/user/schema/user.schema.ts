import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Order } from '../interfaces/user.interface';

@Schema()
export class User {
  @Prop({ default: Date.now })
  id: string;

  @Prop()
  telegramId?: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true })
  language: string;

  @Prop()
  startCode?: string;

  @Prop()
  verificationCode?: string;

  @Prop({ type: [{ type: Object }] })
  orders: Order[];
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);