import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramConfig {
  constructor(private configService: ConfigService) {}

  get botToken(): string {
    return this.configService.get<string>('TELEGRAM_BOT_TOKEN');
  }
}