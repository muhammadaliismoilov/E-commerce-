import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body('phone') phone: string) {
    return this.authService.login(phone);
  }

  @Post('verify')
  async verify(@Body() body: { userId: string; code: string }) {
    return this.authService.verifyCode(body.userId, body.code);
  }
}