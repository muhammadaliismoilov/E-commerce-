export interface User {
  id?: string;
  telegramId?: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  language: string;
  startCode?: string;
  verificationCode?: string;
  orders: Order[];
  role?:string;
}

import { ProductVariant } from '../interfaces/product.interface';

export interface Order {
  id?: string;
  products: ProductVariant[];
  createdAt: string;
}