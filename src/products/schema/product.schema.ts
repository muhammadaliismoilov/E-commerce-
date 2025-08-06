import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProductVariant } from '../../user/interfaces/product.interface';

@Schema()
export class Product {
  @Prop({ default: Date.now })
  id: string;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: number;

  @Prop()
  videoUrl: string;

  @Prop({ type: [{ type: Object }] })
  variants: ProductVariant[];

  @Prop({ type: [String] })
  relatedBrands: string[];
}

export type ProductDocument = Product & Document;
export const ProductSchema = SchemaFactory.createForClass(Product);