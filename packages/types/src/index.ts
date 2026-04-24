export interface Order {
  id: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' | 'CANCELLED';
  customerName?: string | null;
  customerPhone?: string | null;
  isLocked: boolean;
  lockedById?: string | null;
  tableId?: string | null;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  categoryId?: string | null;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  method: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  paymentId?: string | null;
  amount: number;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
}
