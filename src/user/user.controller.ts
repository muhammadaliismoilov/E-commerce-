import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id/profile')
  async getProfile(@Param('id') id: string) {
    return this.userService.getUserProfile(id);
  }
}