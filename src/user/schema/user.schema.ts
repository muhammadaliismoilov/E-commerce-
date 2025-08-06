import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Order } from '../interfaces/user.interface';

@Schema()
export class User {
  
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
  
  @Prop({ type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' })
  role: string;
  
  @Prop({ default: Date.now })
  created_at: string;

  @Prop({ default: Date.now })
  updaterd_at: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);