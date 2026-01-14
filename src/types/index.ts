export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock?: number;
  image?: string;
  media?: { url: string; type: 'video' | 'image'; isPrimary?: boolean }[];
  category?: string;
}

export interface Comment {
  id: string;
  name: string;
  stars: number;
  body: string;
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}
