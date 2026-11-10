import { apiRequest } from '../../../services/api';
import type { Order } from '../types/order';

export type CreateOrderInput = {
  tableNumber: number;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
};

export function getOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders');
}

export function createOrder(input: CreateOrderInput): Promise<Order> {
  return apiRequest<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}