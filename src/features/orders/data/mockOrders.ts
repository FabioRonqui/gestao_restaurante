//Aqui nois temos um mock de pedidos que significa que eles são dados falsos
//que nao vem de nenhum DB, mas que servem para testar a aplicação.

import type { Order } from '../types/order';

export const mockOrders: Order[] = [
  {
    id: 'YQ-1001',
    restaurantId: 'rest-01',
    restaurantName: 'Burger House',
    items: [
      {
          productId: 'prod-01',
          name: 'Classic Burger',
          quantity: 2,
          unitPriceCents: 2590,
          unitPrice: 0
      },
      {
          productId: 'prod-02',
          name: 'French Fries',
          quantity: 1,
          unitPriceCents: 990,
          unitPrice: 0
      },
    ],
    subtotalCents: 6070,
    deliveryFeeCents: 500,
    totalCents: 6570,
    status: 'preparing',
    deliveryAddress: 'Av. Central, 120',
    createdAt: '2026-10-17T11:30:00',
  },
  {
    id: 'YQ-1002',
    restaurantId: 'rest-02',
    restaurantName: 'Pizza Corner',
    items: [
      {
          productId: 'prod-03',
          name: 'Margherita Pizza',
          quantity: 1,
          unitPriceCents: 4590,
          unitPrice: 0
      },
    ],
    subtotalCents: 4590,
    deliveryFeeCents: 700,
    totalCents: 5290,
    status: 'delivered',
    deliveryAddress: 'Rua das Flores, 45',
    createdAt: '2026-10-16T19:15:00',
  },
  {
    id: 'YQ-1003',
    restaurantId: 'rest-03',
    restaurantName: 'Green Bowl',
    items: [
      {
          productId: 'prod-04',
          name: 'Chicken Salad',
          quantity: 1,
          unitPriceCents: 2890,
          unitPrice: 0
      },
    ],
    subtotalCents: 2890,
    deliveryFeeCents: 400,
    totalCents: 3290,
    status: 'out_for_delivery',
    deliveryAddress: 'Rua Paraná, 80',
    createdAt: '2026-10-17T12:00:00',
  },
];
