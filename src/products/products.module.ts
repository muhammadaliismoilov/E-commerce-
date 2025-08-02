import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductItem, ProductItemSchema } from './schemas/product-item.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ProductItem.name, schema: ProductItemSchema }])],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}