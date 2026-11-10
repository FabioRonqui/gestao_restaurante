import AsyncStorage from '@react-native-async-storage/async-storage';
import { MESAS_MOCK } from './mesasMock';

const STORAGE_KEY = '@gestao_restaurante/mesas';

function isMesa(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'number' &&
    typeof value.numero === 'number' &&
    typeof value.pessoas === 'number' &&
    typeof value.status === 'string' &&
    typeof value.ativa === 'boolean'
  );
}

export async function loadMesas() {
  const storedMesas = await AsyncStorage.getItem(STORAGE_KEY);

  if (storedMesas === null) {
    const initialMesas = MESAS_MOCK.map((mesa) => ({ ...mesa, ativa: true }));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialMesas));
    return initialMesas;
  }

  const parsedMesas = JSON.parse(storedMesas);
  if (!Array.isArray(parsedMesas) || !parsedMesas.every(isMesa)) {
    throw new Error('Os dados salvos das mesas estão em um formato inválido.');
  }

  return parsedMesas;
}

export async function addMesa(numero) {
  if (!Number.isSafeInteger(numero) || numero < 1) {
    throw new Error('O número da mesa precisa ser um inteiro positivo.');
  }

  const mesas = await loadMesas();
  if (mesas.some((mesa) => mesa.numero === numero)) {
    return false;
  }

  const novaMesa = {
    id: Math.max(0, ...mesas.map((mesa) => mesa.id)) + 1,
    numero,
    pessoas: 2,
    status: 'livre',
    ativa: true,
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...mesas, novaMesa]));
  return true;
}
