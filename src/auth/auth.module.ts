import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TelegramStrategy } from './telegram-auth.strategy';
import { UsersModule } from '../user/user.module';
import { TelegramConfig } from '../config/telegram.config';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, TelegramStrategy, TelegramConfig],
})
export class AuthModule {}