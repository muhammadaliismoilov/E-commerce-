import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';


@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    ProductsModule,
    UsersModule,
    UserModule,
  ],
})
export class AppModule {}