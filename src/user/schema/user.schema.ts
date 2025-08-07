import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Order } from '../interfaces/user.interface';

@Schema()
export class User {
  @Prop()
  id?:Types.ObjectId
  @Prop()
  telegramId?: string;

  @Prop({ required: true, unique: true })
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

  @Prop({ type: [SchemaTypes.Mixed], default: [] })
  orders: Order[];

  @Prop({ type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' })
  role: string;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date, default: Date.now })
  updated_at: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
