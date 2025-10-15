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
  damage_dealt?: number;
  power_level?: string;
  outcome?: string;
}

declare global {
  interface Window {
    dataLayer: DataLayerEvent[];
  }
}
