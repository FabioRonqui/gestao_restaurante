export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type OrderItem = {
  productId: number;
  name: string;
  description: string | null;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
};

export type Order = {
  id: number;
  tableNumber: number;
  items: OrderItem[];
  totalCents: number;
  status: OrderStatus;
  createdAt: string;
};
