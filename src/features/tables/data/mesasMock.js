// Dados fictícios das mesas (ainda não há integração com o backend).
// Quando o backend existir, estes dados virão de um service
// (src/features/tables/services) e este arquivo poderá ser removido.

export const MESAS_MOCK = [
  { id: 1, numero: 1, pessoas: 2, status: 'livre' },
  { id: 2, numero: 2, pessoas: 4, status: 'ocupada' },
  { id: 3, numero: 3, pessoas: 4, status: 'reservada' },
  { id: 4, numero: 4, pessoas: 6, status: 'livre' },
  { id: 5, numero: 5, pessoas: 2, status: 'ocupada' },
  { id: 6, numero: 6, pessoas: 8, status: 'reservada' },
  { id: 7, numero: 7, pessoas: 4, status: 'livre' },
  { id: 8, numero: 8, pessoas: 6, status: 'ocupada' },
  { id: 9, numero: 9, pessoas: 2, status: 'livre' },
  { id: 10, numero: 10, pessoas: 10, status: 'reservada' },
];
