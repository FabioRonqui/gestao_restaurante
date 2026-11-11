import { getTables, registerTable } from '../services/tableService';

export async function loadMesas() {
  const { mesas, totalMesas } = await getTables();
  return {
    totalMesas,
    mesas: mesas.map((mesa) => ({
      id: mesa.numero,
      numero: mesa.numero,
      pessoas: mesa.pessoas,
      status: mesa.status,
      ativa: true,
    })),
  };
}

export async function addMesa(numero) {
  if (!Number.isSafeInteger(numero) || numero < 1) {
    throw new Error('O número da mesa precisa ser um inteiro positivo.');
  }

  const result = await registerTable(numero);
  return result.cadastrada;
}
