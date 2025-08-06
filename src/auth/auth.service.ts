import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { TelegramConfig } from "../config/telegram.config";
import * as TelegramBot from "node-telegram-bot-api";
import { Message } from "node-telegram-bot-api";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AuthService {
  private bot: TelegramBot;
  private userStates: Map<number, any> = new Map();

  constructor(
    private usersService: UserService,
    private telegramConfig: TelegramConfig
  ) {
    this.bot = new TelegramBot(this.telegramConfig.botToken, { polling: true });
    this.setupBotHandlers();
  }

  async setupBotHandlers() {
    // /start buyrug'i
   this.bot.setMyCommands([
      { command: '/start', description: 'Ro`yxatdan o`tish' }
    ]);

    // /start
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.userStates.set(chatId, { step: 'language' });

      this.bot.sendMessage(chatId, 'Iltimos, tilni tanlang / Пожалуйста, выберите язык:', {
        reply_markup: {
          keyboard: [[{ text: 'uz' }, { text: 'ru' }]],
          one_time_keyboard: true,
          resize_keyboard: true,
        },
      });
    });

    // Foydalanuvchi xabarlarini tutish
    this.bot.on('message', async (msg: Message) => {
      const chatId = msg.chat.id;
      const text = msg.text || '';
      const state = this.userStates.get(chatId) || { step: '' };

      if (text === '/start') return; // /start buyrug‘i alohida qayta ishlanadi

      // === 1. Til tanlash ===
      if (state.step === 'language') {
        if (text === 'uz' || text === 'ru') {
          state.language = text;
          state.step = 'name';
          this.userStates.set(chatId, state);

          const message = text === 'uz'
            ? 'Ism va familiyangizni kiriting (masalan: Ali Ismoilov)'
            : 'Введите имя и фамилию (например: Ali Ismoilov)';

          this.bot.sendMessage(chatId, message, {
            reply_markup: { remove_keyboard: true },
          });
        } else {
          this.bot.sendMessage(chatId,
            'Iltimos, faqat "uz" yoki "ru" tanlang / Пожалуйста, выберите только "uz" или "ru".');
        }
      }

      // === 2. Ism-familiya ===
      else if (state.step === 'name') {
        const parts = text.split(' ').map(p => p.trim());
        if (parts.length !== 2) {
          const msgTxt = state.language === 'uz'
            ? 'Iltimos, ism va familiyani to‘g‘ri kiriting (masalan: Ali Ismoilov)'
            : 'Пожалуйста, введите имя и фамилию правильно (например: Ali Ismoilov)';
          this.bot.sendMessage(chatId, msgTxt);
          return;
        }

        state.firstName = parts[0];
        state.lastName = parts[1];
        state.step = 'phone';
        this.userStates.set(chatId, state);

        const phoneMessage = state.language === 'uz'
          ? 'Quyidagi tugmani bosib telefon raqamingizni yuboring yoki raqamni qo‘lda kiriting (masalan: +998941234567):'
          : 'Нажмите кнопку ниже, чтобы отправить номер телефона, или введите его вручную (например: +998941234567):';

        this.bot.sendMessage(chatId, phoneMessage, {
          reply_markup: {
            keyboard: [
              [
                {
                  text: state.language === 'uz' ? '📱 Telefon raqamimni yuborish' : '📱 Отправить мой номер',
                  request_contact: true,
                },
              ],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      }

      // === 3. Telefon raqami ===
      else if (state.step === 'phone') {
        let phone = '';

        // 👉 Telegram tugmasi orqali yuborilgan raqam
        if (msg.contact) {
          phone = msg.contact.phone_number;
        }

        // 👉 Foydalanuvchi qo‘lda raqam kiritgan bo‘lsa
        else if (text) {
          phone = text;
        }

        // Raqam formatini tekshirish
        if (!phone || !phone.match(/^\+?[1-9]\d{7,14}$/)) {
          const invalid = state.language === 'uz'
            ? 'Iltimos, to‘g‘ri telefon raqamini kiriting (masalan: +998941234567)'
            : 'Пожалуйста, введите правильный номер телефона (например: +998941234567)';
          this.bot.sendMessage(chatId, invalid);
          return;
        }

        // ✅ Ma'lumotni bazaga saqlash
        try {
          await this.usersService.create({
            telegramId: msg.from?.id.toString(),
            language: state.language,
            firstName: state.firstName,
            lastName: state.lastName,
            phone,
            role: 'user',
          });

          const success = state.language === 'uz'
            ? 'Ro‘yxatdan o‘tish muvaffaqiyatli yakunlandi!'
            : 'Регистрация успешно завершена!';
          this.bot.sendMessage(chatId, success, {
            reply_markup: { remove_keyboard: true },
          });

          this.userStates.delete(chatId); // Tozalash
        } catch (err) {
          const fail = state.language === 'uz'
            ? 'Xatolik yuz berdi. Qayta urinib ko‘ring.'
            : 'Произошла ошибка. Попробуйте снова.';
          this.bot.sendMessage(chatId, fail);
        }
      }

      // === Noto‘g‘ri step ===
      else {
        const msgTxt = state.language === 'ru'
          ? 'Пожалуйста, начните с команды /start.'
          : 'Iltimos, /start buyrug‘i bilan boshlang.';
        this.bot.sendMessage(chatId, msgTxt);
      }
    });
  }

  async login(phone: string): Promise<{ startCode: string }> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new Error("Foydalanuvchi topilmadi");
    }
    const startCode = uuidv4();
    await this.usersService.updateStartCode(user.o, startCode);
    return { startCode };
  }

  async verifyCode(userId: string, code: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (user && user.verificationCode === code) {
      await this.usersService.clearVerificationCode(userId);
      return true;
    }
    return false;
  }
}
