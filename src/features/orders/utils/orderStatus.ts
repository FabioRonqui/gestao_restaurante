
import type { OrderStatus } from '../types/order';

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Pending confirmation',
  confirmed: 'Order confirmed',
  preparing: 'Preparing your food',
  out_for_delivery: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
