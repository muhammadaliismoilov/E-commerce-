import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductItem, ProductItemDocument } from './schemas/product-item.schema';
import { ProductItem as ProductItemInterface } from './interfaces/product.interface';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(ProductItem.name) private productModel: Model<ProductItemDocument>) {}

  async create(productData: ProductItemInterface): Promise<ProductItem> {
    const product = new this.productModel(productData);
    return product.save();
  }

  async findAll(filters: any): Promise<ProductItem[]> {
    const query: any = {};
    
    if (filters.brand) query.brand = filters.brand;
    if (filters.category) query.category = filters.category;
    if (filters.minPrice || filters.maxPrice) {
      query['variants.price.usd'] = {};
      if (filters.minPrice) query['variants.price.usd'].$gte = filters.minPrice;
      if (filters.maxPrice) query['variants.price.usd'].$lte = filters.maxPrice;
    }
    if (filters.material) query['variants.materials'] = filters.material;
    if (filters.color) query['variants.color'] = filters.color;
    if (filters.season) query['variants.season'] = filters.season;
    if (filters.gender) query['variants.gender'] = filters.gender;

    return this.productModel.find(query).sort({ 'variants.createdAt': -1 }).exec();
  }

  async findByBrand(brand: string): Promise<ProductItem[]> {
    return this.productModel.find({ brand }).exec();
  }

  async update(id: string, productData: Partial<ProductItemInterface>): Promise<ProductItem> {
    return this.productModel.findByIdAndUpdate(id, productData, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.productModel.findByIdAndDelete(id).exec();
  }
}