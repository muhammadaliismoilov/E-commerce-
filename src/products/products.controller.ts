import { Controller, Get, Post, Put, Delete, Query, Body, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductItem as ProductItemInterface } from '../user/interfaces/product.interface'
//   @Prop({ type: [{ type: Object }] })
//   variants: ProductVariant[];ce';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  async create(@Body() productData: ProductItemInterface) {
    return this.productsService.create(productData);
  }

  @Get()
  async findAll(@Query() filters: any) {
    return this.productsService.findAll(filters);
  }

  @Get('brand/:brand')
  async findByBrand(@Param('brand') brand: string) {
    return this.productsService.findByBrand(brand);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() productData: Partial<ProductItemInterface>) {
    return this.productsService.update(id, productData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}