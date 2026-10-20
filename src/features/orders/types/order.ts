//O que isso representa?
//Imagine que um cliente compre dois hambúrgueres e um refrigerante.
//O pedido precisa guardar:
//- Quem vendeu os produtos.
//- Quais produtos foram comprados e suas quantidades.
//- Quanto custavam os produtos.
//- Qual foi a taxa de entrega.
//- Qual é o valor total.
//- Para onde o pedido deve ser enviado.
//- Em qual etapa da entrega ele está.
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type OrderItem = {
  unitPriceCents: number;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  status: OrderStatus;
  deliveryAddress: string;
  createdAt: string;
};
