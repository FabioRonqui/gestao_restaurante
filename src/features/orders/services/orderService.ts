import { apiRequest } from '../../../services/api';
import type { Order } from '../types/order';

export type CreateOrderInput = {
  tableNumber: number;
  sessionToken: string;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
};

export type TableSession = {
  tableNumber: number;
  token: string;
  expiresAt: string;
};

export function getTableAvailability(
  tableNumber: number,
  token: string | null,
): Promise<{ available: boolean }> {
  const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
  return apiRequest<{ available: boolean }>(
    `/tables/${tableNumber}/availability${tokenParam}`,
  );
}

export function startTableSession(
  tableNumber: number,
  token: string | null,
): Promise<TableSession> {
  return apiRequest<TableSession>('/tables/session', {
    method: 'POST',
    body: JSON.stringify({ tableNumber, token }),
  });
}

export function releaseTableSession(
  tableNumber: number,
  token: string,
): Promise<{ released: boolean }> {
  return apiRequest<{ released: boolean }>(
    `/tables/${tableNumber}/session?token=${encodeURIComponent(token)}`,
    { method: 'DELETE' },
  );
}

export function getOrders(tableNumber: number, token: string): Promise<Order[]> {
  return apiRequest<Order[]>(
    `/orders?tableNumber=${encodeURIComponent(tableNumber)}&sessionToken=${encodeURIComponent(token)}`,
  );
}

export function createOrder(input: CreateOrderInput): Promise<Order> {
  return apiRequest<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}