import type { Order } from '../types/order';

export const mockOrders: Order[] = [
  {
    id: 1001,
    tableNumber: 1,
    items: [
      {
        productId: 1,
        name: 'Hambúrguer Clássico',
        quantity: 2,
        unitPriceCents: 2590,
        subtotalCents: 5180,
      },
    ],
    totalCents: 5180,
    status: 'delivered',
    createdAt: '2026-11-29T13:20:00',
  },
  {
    id: 1002,
    tableNumber: 2,
    items: [
      {
        productId: 2,
        name: 'Batata Frita',
        quantity: 2,
        unitPriceCents: 990,
        subtotalCents: 1980,
      },
    ],
    totalCents: 1980,
    status: 'delivered',
    createdAt: '2026-11-10T18:05:00',
  },
];
