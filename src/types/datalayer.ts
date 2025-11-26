export interface DataLayerItem {
  item_id: string;
  item_name: string;
  price: number;
  item_category: string;
  quantity?: number;
}

export interface DataLayerEvent {
  event: string;
  ecommerce?: {
    currency?: string;
    value?: number;
    transaction_id?: string;
    tax?: number;
    shipping?: number;
    items?: DataLayerItem[];
  };
  // GA4 Standard Events properties
  level_name?: string;
  success?: boolean;
  content_type?: string;
  item_id?: string;
  item_name?: string;
  page_title?: string;
  page_path?: string;
  // User data properties
  user_id?: string;
  user_name?: string;
  user_guild?: string;
  // Custom parameters (kept for backward compatibility or extra detail)
  damage_dealt?: number;
  power_level?: string;
  outcome?: string;
}

declare global {
  interface Window {
    dataLayer: DataLayerEvent[];
  }
}
