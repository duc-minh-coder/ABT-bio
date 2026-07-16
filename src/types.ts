export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // in VND
  unit: string;
  image: string;
  description: string;
  specs: string[];
  stock: number;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "shipping"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  date: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  organization: string; // Tên bệnh viện / phòng thí nghiệm
  paymentMethod: "payos" | "paypal";
  items: {
    product: Product;
    quantity: number;
    priceAtOrder: number;
  }[];
  status: OrderStatus;
  total: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  notes?: string;
}

export type AppRole = "user" | "admin";
export type ActiveTab =
  | "home"
  | "products"
  | "cart"
  | "checkout"
  | "orders"
  | "admin"
  | "posts"
  | "login";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  status: "active" | "blocked";
  department: string;
  createdAt: string;
  avatarUrl?: string;
  verified?: boolean;
  lastTimeChange?: string;
  updatedAt?: string;
  contactPhone?: string;
}

export interface Post {
  id: string;
  title: string;
  category: string; // 'Hướng dẫn sử dụng' | 'Công nghệ mới' | 'An toàn phòng thí nghiệm'
  summary: string;
  content: string;
  author: string;
  date: string;
  image: string;
  readTime: string;
}
