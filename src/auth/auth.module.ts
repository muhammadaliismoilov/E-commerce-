import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TelegramStrategy } from "./telegram-auth.strategy";
import { UsersModule } from "../user/user.module";
import { TelegramConfig } from "../config/telegram.config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/user/schema/user.schema";

@Module({
  imports: [UsersModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "jwt-secret-key",
      signOptions: { expiresIn: "7d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TelegramStrategy, TelegramConfig],
})
export class AuthModule {}
