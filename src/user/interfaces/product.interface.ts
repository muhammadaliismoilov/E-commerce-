export interface ProductVariant {
  id: string;
  nameUrl: string;
  color: number;
  gender: string;
  materials: number;
  year: number;
  description: { uz: string; ru: string };
  rating: number;
  season: number;
  poizonLink: string;
  images: string[];
  sizes: {
    size: number;
    inStock: boolean;
    sold: number;
    price: { usd: number; uzs: number };
    discount: { usd: number; uzs: number };
  }[];
  inStock: boolean;
  inAdvancePayment: boolean;
  createdAt: string;
}

export interface ProductItem {
  brand: string;
  name: string;
  category: number;
  videoUrl: string;
  variants: ProductVariant[];
  relatedBrands: string[];
}

export interface ProductsData {
  [brandName: string]: ProductItem[];
}