export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  image: string;
  secondaryImage?: string;
  specs: Record<string, string>;
  rating: number;
  stock: number;
  colors?: string[];
  features?: string[];
  isNew?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  /** Дэд категориуд (Компьютерийн эд анги, Дагалдах хэрэгсэл зэрэг бүлэгт ашиглагдана) */
  subcategories?: Category[];
}
