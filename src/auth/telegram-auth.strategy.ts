import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { AuthService } from './auth.service';

@Injectable()
export class TelegramStrategy extends PassportStrategy(Strategy, 'telegram') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: any): Promise<any> {
    const { userId, code } = req.body;
    const isValid = await this.authService.verifyCode(userId, code);
    if (!isValid) {
      throw new Error('Noto‘g‘ri tasdiqlash kodi');
    }
    return { userId };
  }
}