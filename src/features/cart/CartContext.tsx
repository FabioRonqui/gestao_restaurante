import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Product } from '../products/types/product';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  selectedTableNumber: number | null;
  addProduct: (product: Product) => void;
  setSelectedTableNumber: (tableNumber: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeProduct: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      selectedTableNumber,
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
    [items, selectedTableNumber],
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
