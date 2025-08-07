import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
    @IsNotEmpty({message: "telefon raqam kiritish majburiy"})
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phone: string;
}

export class VerifyDto {
  @IsString()
  userId: string;

  @IsString()
  code: string;
}