import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user with phone number', description: 'Initiates the login process by sending a verification code to the provided phone number.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example: '+998941234567', description: 'User phone number in international format' },
      },
      required: ['phone'],
    },
  })
  @ApiResponse({ status: 200, description: 'Verification code sent successfully.', schema: { example: { userId: '12345', message: 'Verification code sent' } } })
  @ApiResponse({ status: 400, description: 'Invalid phone number format.' })
   @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async login(@Body('phone') phone: string) {
    return this.authService.login(phone);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user with code', description: 'Verifies the user by checking the provided verification code.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '12345', description: 'Unique identifier of the user' },
        code: { type: 'string', example: '1234', description: 'Verification code sent to the user' },
      },
      required: ['userId', 'code'],
    },
  })
  @ApiResponse({ status: 200, description: 'Verification successful.', schema: { example: { token: 'jwt_token', message: 'Verification successful' } } })
  @ApiResponse({ status: 400, description: 'Invalid verification code or user ID.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async verify(@Body() body: { userId: string; code: string }) {
    return this.authService.verifyCode(body.userId, body.code);
  }
}