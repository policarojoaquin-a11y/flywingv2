export interface Sneaker {
  id: string;
  name: string;
  category: string;
  colors: string[];
  sizes: string;
  pack_size: number;
  created_at: string;
  imagenes_producto?: {
    id: number;
    url: string;
    color_variante?: string;
  }[];
}

export interface WholesaleInfo {
  minPurchaseAmount: string;
  shippingInfo: string;
  paymentMethods: string[];
}
