// O que é um produto do cardápio?
// Cada produto guarda: nome, valor, descrição, imagem e categoria.
// Seguindo o padrão dos pedidos (features/orders), o valor é guardado em
// centavos (2590 = R$ 25,90) para evitar erros de arredondamento.

export type Product = {
  id: string;
  name: string;
  priceCents: number;
  description: string;
  imageUrl?: string; // opcional: se faltar (ou falhar), a tela mostra um quadrado cinza
  category: string;
};
