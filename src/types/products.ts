export interface Product {
  item_id: string;
  item_name: string;
  price: number;
  currency: string;
  item_category: string;
  image: string;
  description: string;
  quantity?: number;
}

export const PRODUCTS: Product[] = []; // Deprecated, use products.json

