import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userModel.findOne({ phone }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByStartCode(startCode: string): Promise<User | null> {
    return this.userModel.findOne({ startCode }).exec();
  }

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return this.userModel.findOne({ telegramId }).exec();
  }

  async updateStartCode(id: string, startCode: string): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { startCode }).exec();
  }

  async updateVerificationCode(id: string, verificationCode: string, telegramId: string): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { verificationCode, telegramId }).exec();
  }

  async clearVerificationCode(id: string): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { verificationCode: null }).exec();
  }

  async getUserProfile(id: string): Promise<User | null> {
    return this.userModel.findById(id).populate('orders').exec();
  }
}