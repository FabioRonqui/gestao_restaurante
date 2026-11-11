import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Product } from '../products/types/product';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  selectedTableNumber: number | null;
  tableSessionToken: string | null;
  tableSessionReady: boolean;
  tableSessionError: string;
  addProduct: (product: Product) => void;
  setSelectedTableNumber: (tableNumber: number) => void;
  setTableSession: (tableNumber: number, token: string) => Promise<void>;
  clearTableSession: () => Promise<void>;
  retryTableSessionRestore: () => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeProduct: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const TABLE_SESSION_STORAGE_KEY = '@gestao_restaurante/table-session';

function isStoredTableSession(
  value: unknown,
): value is { tableNumber: number; token: string } {
  if (typeof value !== 'object' || value === null) return false;
  if (!('tableNumber' in value) || !('token' in value)) return false;
  return (
    typeof value.tableNumber === 'number' &&
    Number.isSafeInteger(value.tableNumber) &&
    value.tableNumber > 0 &&
    typeof value.token === 'string' &&
    value.token.length > 0
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null);
  const [tableSessionToken, setTableSessionToken] = useState<string | null>(null);
  const [tableSessionReady, setTableSessionReady] = useState(false);
  const [tableSessionError, setTableSessionError] = useState('');
  const [sessionRestoreAttempt, setSessionRestoreAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(TABLE_SESSION_STORAGE_KEY)
      .then((storedSession) => {
        if (!active) return;
        if (storedSession !== null) {
          const session: unknown = JSON.parse(storedSession);
          if (!isStoredTableSession(session)) {
            throw new Error('Os dados salvos da sessão da mesa são inválidos.');
          }
          setSelectedTableNumber(session.tableNumber);
          setTableSessionToken(session.token);
        }
        setTableSessionError('');
      })
      .catch((error: unknown) => {
        if (active) {
          console.error('Não foi possível restaurar a sessão da mesa.', error);
          setTableSessionError(
            error instanceof Error
              ? error.message
              : 'Não foi possível restaurar a sessão da mesa.',
          );
        }
      })
      .finally(() => {
        if (active) setTableSessionReady(true);
      });

    return () => {
      active = false;
    };
  }, [sessionRestoreAttempt]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      selectedTableNumber,
      tableSessionToken,
      addProduct: (product) => {
        setItems((current) => {
          const existing = current.find((item) => item.product.id === product.id);
          if (existing) {
            return current.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          }
          return [...current, { product, quantity: 1 }];
        });
      },
      setSelectedTableNumber: (tableNumber) =>
        setSelectedTableNumber(tableNumber),
      setTableSession: async (tableNumber, token) => {
        await AsyncStorage.setItem(
          TABLE_SESSION_STORAGE_KEY,
          JSON.stringify({ tableNumber, token }),
        );
        setSelectedTableNumber(tableNumber);
        setTableSessionToken(token);
      },
      clearTableSession: async () => {
        await AsyncStorage.removeItem(TABLE_SESSION_STORAGE_KEY);
        setSelectedTableNumber(null);
        setTableSessionToken(null);
      },
      tableSessionReady,
      tableSessionError,
      retryTableSessionRestore: () => {
        setTableSessionReady(false);
        setTableSessionError('');
        setSessionRestoreAttempt((attempt) => attempt + 1);
      },
      setQuantity: (productId, quantity) => {
        setItems((current) =>
          quantity < 1
            ? current.filter((item) => item.product.id !== productId)
            : current.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item,
              ),
        );
      },
      removeProduct: (productId) => {
        setItems((current) =>
          current.filter((item) => item.product.id !== productId),
        );
      },
      clearCart: () => setItems([]),
    }),
    [
      items,
      selectedTableNumber,
      tableSessionError,
      tableSessionReady,
      tableSessionToken,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider.');
  }
  return context;
}
