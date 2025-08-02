import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TelegramConfig } from '../config/telegram.config';
import * as TelegramBot from 'node-telegram-bot-api';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private bot: TelegramBot;

  constructor(
    private usersService: UsersService,
    private telegramConfig: TelegramConfig,
  ) {
    this.bot = new TelegramBot(this.telegramConfig.botToken, { polling: true });
    this.setupBotHandlers();
  }

  async setupBotHandlers() {
    this.bot.onText(/\/start (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const code = match[1];
      const user = await this.usersService.findByStartCode(code);

      if (!user) {
        this.bot.sendMessage(chatId, 'Noto‘g‘ri kod yoki foydalanuvchi topilmadi.');
        return;
      }

      if (user.telegramId && user.telegramId !== msg.from.id.toString()) {
        this.bot.sendMessage(chatId, 'Siz boshqa Telegram akkauntdasiz.');
        return;
      }

      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      await this.usersService.updateVerificationCode(user.id, verificationCode, msg.from.id.toString());
      this.bot.sendMessage(chatId, `Tasdiqlash kodi: ${verificationCode}`);
    });

    this.bot.onText(/\/start/, (msg) => {
      this.bot.sendMessage(msg.chat.id, 'Iltimos, tilni tanlang: uz | ru');
    });

    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      if (msg.text !== '/start' && !msg.text.startsWith('/start ')) {
        const user = await this.usersService.findByTelegramId(msg.from.id.toString());
        if (!user) {
          const [language, firstName, lastName, phone] = msg.text.split(',');
          await this.usersService.create({
            telegramId: msg.from.id.toString(),
            language: language?.trim(),
            firstName: firstName?.trim(),
            lastName: lastName?.trim(),
            phone: phone?.trim(),
          });
          this.bot.sendMessage(chatId, 'Ro‘yxatdan o‘tish muvaffaqiyatli yakunlandi!');
        }
      }
    });
  }

  async login(phone: string): Promise<{ startCode: string }> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new Error('Foydalanuvchi topilmadi');
    }
    const startCode = uuidv4();
    await this.usersService.updateStartCode(user.id, startCode);
    return { startCode };
  }

  async verifyCode(userId: string, code: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (user.verificationCode === code) {
      await this.usersService.clearVerificationCode(userId);
      return true;
    }
    return false;
  }
}