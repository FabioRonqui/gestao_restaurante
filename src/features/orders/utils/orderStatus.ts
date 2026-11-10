import type { OrderStatus } from '../types/order';

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Aguardando confirmação',
  confirmed: 'Pedido confirmado',
  preparing: 'Em preparo',
  out_for_delivery: 'A caminho',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};
