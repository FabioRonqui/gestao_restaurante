import { getTables } from '../services/tableService';

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
