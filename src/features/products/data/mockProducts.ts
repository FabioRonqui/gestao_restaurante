// Dados fictícios (mock): ainda não existe backend, então usamos esta lista
// para montar a tela. Quando o backend existir, basta trocar esta importação
// por uma chamada à API (ex.: um productService em features/products/services).

import type { Product } from '../types/product';

export const restaurantName = 'Delícias Rápidas';

export const mockProducts: Product[] = [
  {
    id: 'prod-01',
    name: 'Hambúrguer Clássico',
    priceCents: 2590,
    description: 'Pão macio, hambúrguer bovino, queijo, alface, tomate e molho da casa.',
    imageUrl: 'https://picsum.photos/seed/hamburguer/160',
    category: 'Lanches',
  },
  {
    id: 'prod-02',
    name: 'Batata Frita',
    priceCents: 990,
    description: 'Porção de batatas fritas crocantes com sal.',
    imageUrl: 'https://picsum.photos/seed/batata/160',
    category: 'Acompanhamentos',
  },
  {
    id: 'prod-03',
    name: 'Pizza Margherita',
    priceCents: 4590,
    description: 'Molho de tomate, muçarela, manjericão fresco e azeite.',
    imageUrl: 'https://picsum.photos/seed/pizza/160',
    category: 'Pizzas',
  },
  {
    id: 'prod-04',
    name: 'Salada de Frango',
    priceCents: 2890,
    description: 'Mix de folhas, frango grelhado, tomate cereja e molho de mostarda e mel.',
    imageUrl: 'https://picsum.photos/seed/salada/160',
    category: 'Saladas',
  },
  {
    id: 'prod-05',
    name: 'Suco de Laranja',
    priceCents: 890,
    description: 'Suco de laranja natural, 400 ml.',
    category: 'Bebidas', // sem imagem de propósito, para testar o quadrado cinza
  },
  {
    id: 'prod-06',
    name: 'Brownie de Chocolate',
    priceCents: 1290,
    description: 'Brownie de chocolate meio amargo servido com sorvete de creme.',
    imageUrl: 'https://picsum.photos/seed/brownie/160',
    category: 'Sobremesas',
  },
];
