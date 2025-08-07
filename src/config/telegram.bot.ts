// // src/telegram/telegram.service.ts

// // import { generateRandomCode } from "src/utils/generate-code";

// this.bot.onText(/\/start (.+)/, async (msg, match) => {
//     const startCode = match[1];
//     const chatId = msg.chat.id;
//     const telegramId = msg.from.id.toString();
    
//     const user = await this.usersService.findByStartCode(startCode);
//     if (!user) {
//         return this.bot.sendMessage(chatId, 'Foydalanuvchi topilmadi!');
//     }
    
//   if (user.telegramId && user.telegramId !== telegramId) {
//     return this.bot.sendMessage(chatId, '⚠️ Siz boshqa Telegram akkauntidasiz!');
// }

// // Telegram ID ni saqlash (birinchi kirish bo‘lsa)
//   if (!user.telegramId) {
//     await this.usersService.updateTelegramId(user._id, telegramId);
// }
// // function generateRandomCode(): string {
// //   return Math.floor(1000 + Math.random() * 9000).toString();
// // }
// // 4 xonali verification code
// const code = generateRandomCode(); // Masalan: '4823'
// await this.usersService.updateVerificationCode(user._id, code);

// await this.bot.sendMessage(chatId, `✅ Tasdiqlash kodingiz: ${code}`);
// });
