import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UserService } from "../user/user.service";
import { TelegramConfig } from "../config/telegram.config";
import * as TelegramBot from "node-telegram-bot-api";
import { Message } from "node-telegram-bot-api";
import { v4 as uuidv4 } from "uuid";
import { Types } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import { use } from "passport";
// import { generateRandomCode } from "src/utils/generate-code";
@Injectable()
export class AuthService {
  private bot: TelegramBot;
  private userStates: Map<number, any> = new Map();
  
  constructor(
    private readonly usersService: UserService,
    private readonly telegramConfig: TelegramConfig,
    private readonly jwtService: JwtService,
  ) {
    this.bot = new TelegramBot(this.telegramConfig.botToken, { polling: true });
    this.setupBotHandlers();
  }

  async setupBotHandlers() {
    this.bot.setMyCommands([
      { command: "/start", description: "Ro`yxatdan o`tish" },
    ]);

    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.userStates.set(chatId, { step: "language" });

      this.bot.sendMessage(
        chatId,
        "Iltimos, tilni tanlang / Пожалуйста, выберите язык:",
        {
          reply_markup: {
            keyboard: [[{ text: "uz" }, { text: "ru" }]],
            one_time_keyboard: true,
            resize_keyboard: true,
          },
        }
      );
    });

    this.bot.on("message", async (msg: Message) => {
      const chatId = msg.chat.id;
      const text = msg.text || "";
      const state = this.userStates.get(chatId) || { step: "" };

      if (text === "/start") return;

      try {
        // === 1. Til tanlash ===
        if (state.step === "language") {
          if (text === "uz" || text === "ru") {
            state.language = text;
            state.step = "name";
            this.userStates.set(chatId, state);

            const message =
              text === "uz"
                ? "Ism va familiyangizni kiriting (masalan: Sardor Odilov)"
                : "Введите имя и фамилию (например: Sardor Odilov)";

            await this.bot.sendMessage(chatId, message, {
              reply_markup: { remove_keyboard: true },
            });
          } else {
            await this.bot.sendMessage(
              chatId,
              'Iltimos, faqat "uz" yoki "ru" tanlang / Пожалуйста, выберите только "uz" или "ru".'
            );
          }
        }

        // === 2. Ism-familiya ===
        else if (state.step === "name") {
          const parts = text.split(" ").map((p) => p.trim());
          if (parts.length !== 2) {
            const msgTxt =
              state.language === "uz"
                ? "Iltimos, ism va familiyani to‘g‘ri kiriting (masalan: Ali Ismoilov)"
                : "Пожалуйста, введите имя и фамилию правильно (например: Ali Ismoilov)";
            await this.bot.sendMessage(chatId, msgTxt);
            return;
          }

          state.firstName = parts[0];
          state.lastName = parts[1];
          state.step = "phone";
          this.userStates.set(chatId, state);

          const phoneMessage =
            state.language === "uz"
              ? "Quyidagi tugmani bosib telefon raqamingizni yuboring yoki raqamni qo‘lda kiriting (masalan: +998941234567):"
              : "Нажмите кнопку ниже, чтобы отправить номер телефона, или введите его вручную (например: +998941234567):";

          await this.bot.sendMessage(chatId, phoneMessage, {
            reply_markup: {
              keyboard: [
                [
                  {
                    text:
                      state.language === "uz"
                        ? "📱 Telefon raqamimni yuborish"
                        : "📱 Отправить мой номер",
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
        else if (state.step === "phone") {
          let phone = "";

          if (msg.contact) {
            phone = msg.contact.phone_number;
          } else if (text) {
            phone = text;
          }

          if (!phone || !phone.match(/^\+?[1-9]\d{7,14}$/)) {
            const invalid =
              state.language === "uz"
                ? "Iltimos, to‘g‘ri telefon raqamini kiriting (masalan: +998941234567)"
                : "Пожалуйста, введите правильный номер телефона (например: +998941234567)";
            await this.bot.sendMessage(chatId, invalid);
            return;
          }

          try {
            // ✅ Telefon raqam bo‘yicha tekshirish
            const existingUser = await this.usersService.findByPhone(phone);
            if (existingUser) {
              const alreadyExists =
                state.language === "uz"
                  ? "Siz allaqachon ro‘yxatdan o‘tgansiz. Iltimos, login qiling."
                  : "Вы уже зарегистрированы. Пожалуйста, войдите в систему.";
              await this.bot.sendMessage(chatId, alreadyExists, {
                reply_markup: { remove_keyboard: true },
              });

              this.userStates.delete(chatId);
              return;
            }

            const telegramId = msg.from?.id;
            if (!telegramId) {
              await this.bot.sendMessage(chatId, "Telegram ID aniqlanmadi.");
              return;
            }

            await this.usersService.create({
              telegramId: telegramId.toString(),
              language: state.language,
              firstName: state.firstName,
              lastName: state.lastName,
              phone,
              role: "user",
            });

            const success =
              state.language === "uz"
                ? "Ro‘yxatdan o‘tish muvaffaqiyatli yakunlandi!"
                : "Регистрация успешно завершена!";
            await this.bot.sendMessage(chatId, success, {
              reply_markup: { remove_keyboard: true },
            });

            this.userStates.delete(chatId);
          } catch (err) {
            console.error("❌ Foydalanuvchi yaratishda xatolik:", err);
            const fail =
              state.language === "uz"
                ? "Xatolik yuz berdi. Qayta urinib ko‘ring."
                : "Произошла ошибка. Попробуйте снова.";
            await this.bot.sendMessage(chatId, fail);
          }
        }

        // === Notog‘ri step ===
        else {
          const msgTxt =
            state.language === "ru"
              ? "Пожалуйста, начните с команды /start."
              : "Iltimos, /start buyrug‘i bilan boshlang.";
          await this.bot.sendMessage(chatId, msgTxt);
        }
      } catch (err) {
        console.error("❌ Bot ishida xatolik:", err);
        await this.bot.sendMessage(
          chatId,
          "❌ Ichki xatolik yuz berdi. Qayta urinib ko‘ring."
        );
      }
    });
  }

  async login(phone: string): Promise<{ deepLink: string }> {
    try {
      const user = await this.usersService.findByPhone(phone);
      if (!user) throw new NotFoundException("Bunday foydalanuvchi topilmadi");

      const startCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4 xonali ko

      await this.usersService.updateStartCode(
        (user._id as Types.ObjectId).toString(),
        startCode
      );

      const deepLink = `https://t.me/YOUR_BOT_USERNAME?start=${startCode}`;
      return { deepLink };
    } catch (err) {
      console.error("❌ Login xatolik:", err);
      throw new InternalServerErrorException(
        "Login jarayonida xatolik yuz berdi."
      );
    }
  }

  async verifyCode(
    telegramId: string,
    code: string
  ): Promise<{ access_token: string }> {
    try {
      const user = await this.usersService.findByTelegramId(telegramId);
      if (!user) throw new NotFoundException("Foydalanuvchi topilmadi");

      console.log(user);
      console.log("aaaaaaaa",user.startCode);
      
      if (user.startCode !== code) {
        throw new UnauthorizedException("Tasdiqlash kodi noto‘g‘ri");
      }

      await this.usersService.clearStartCode(
        (user._id as Types.ObjectId).toString()
      );

      const payload = {
        sub: (user._id as Types.ObjectId).toString(),
        telegramId: user.telegramId,
        role: user.role,
      };

      const token = await this.jwtService.signAsync(payload);
      return { access_token: token };
    } catch (err) {
      console.error("❌ verifyCode xatolik:", err);
      throw new InternalServerErrorException("Tasdiqlashda xatolik yuz berdi.");
    }
  }
}
