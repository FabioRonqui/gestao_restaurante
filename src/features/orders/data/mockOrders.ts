//Aqui nois temos um mock de pedidos que significa que eles são dados falsos
//que nao vem de nenhum DB, mas que servem para testar a aplicação.


import type { Order } from '../types/order';

export const mockOrders: Order[] = [
  {
    id: 'YQ-1001',
    restaurantId: 'restaurant-1',
    restaurantName: 'Chicken Curry',
    items: [
      {
        productId: 'product-1',
        name: 'Chicken Curry',
        quantity: 2,
        unitPriceCents: 2500,
        unitPrice: 0
      },
    ],
    subtotalCents: 5000,
    deliveryFeeCents: 0,
    totalCents: 5000,
    status: 'delivered',
    deliveryAddress: 'Av. Central, 120',
    createdAt: '2026-11-29T13:20:00',
  },
  {
    id: 'YQ-1002',
    restaurantId: 'restaurant-2',
    restaurantName: 'Bean and Vegetable Burger',
    items: [
      {
        productId: 'product-2',
        name: 'Bean and Vegetable Burger',
        quantity: 2,
        unitPriceCents: 2500,
        unitPrice: 0
      },
    ],
    subtotalCents: 5000,
    deliveryFeeCents: 0,
    totalCents: 5000,
    status: 'delivered',
    deliveryAddress: 'Rua das Flores, 45',
    createdAt: '2026-11-10T18:05:00',
  },
  {
    id: 'YQ-1003',
    restaurantId: 'restaurant-3',
    restaurantName: 'Coffee Latte',
    items: [
      {
        productId: 'product-3',
        name: 'Coffee Latte',
        quantity: 1,
        unitPriceCents: 800,
        unitPrice: 0
      },
    ],
    subtotalCents: 800,
    deliveryFeeCents: 0,
    totalCents: 800,
    status: 'delivered',
    deliveryAddress: 'Rua Paraná, 80',
    createdAt: '2026-11-10T11:30:00',
  },
  {
    id: 'YQ-1004',
    restaurantId: 'restaurant-4',
    restaurantName: 'Strawberry Cheesecake',
    items: [
      {
        productId: 'product-4',
        name: 'Strawberry Cheesecake',
        quantity: 2,
        unitPriceCents: 1100,
        unitPrice: 0
      },
    ],
    subtotalCents: 2200,
    deliveryFeeCents: 0,
    totalCents: 2200,
    status: 'delivered',
    deliveryAddress: 'Av. Brasil, 200',
    createdAt: '2026-10-03T15:40:00',
  },
];
