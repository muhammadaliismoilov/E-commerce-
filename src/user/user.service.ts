import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

async create(userData: Partial<User>): Promise<User> {
  try {
    if (!userData.phone || !userData.telegramId) {
      throw new BadRequestException('phone yoki telegramId majburiy');
    }
    const user = new this.userModel(userData);
    return await user.save();
  } catch (error) {
    throw new BadRequestException('Foydalanuvchi yaratishda xatolik');
  }
}

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByTelegramId(telegramId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ telegramId }).exec();
  }

  async findByStartCode(startCode: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ startCode }).exec();
  }

  async updateTelegramId(userId: string, telegramId: string): Promise<void> {
    const result = await this.userModel.findByIdAndUpdate(userId, { telegramId });
    if (!result) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
  }

  async updateVerificationCode(userId: string, code: string): Promise<void> {
    const result = await this.userModel.findByIdAndUpdate(userId, {
      verificationCode: code,
    });
    if (!result) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
  }

  async verifyCode(phone: string, code: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ phone, verificationCode: code });
    if (!user) {
      throw new BadRequestException('Kod noto‘g‘ri yoki foydalanuvchi topilmadi');
    }

    await this.userModel.findByIdAndUpdate(user._id, {
      verificationCode: null,
    });

    return user;
  }

  async updateStartCode(userId: string, startCode: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { startCode });
  }

  async clearStartCode(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { startCode: null });
  }

  async clearVerificationCode(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { verificationCode: null });
  }

  async getUserProfile(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).populate('orders').exec();
  }
}
