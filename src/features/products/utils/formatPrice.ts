// Transforma centavos em texto de moeda brasileira.
// Exemplo: 2590 -> "R$ 25,90"
export function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
