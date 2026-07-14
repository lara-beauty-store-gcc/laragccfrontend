'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ProductConfig } from '@/config/products';
import type { ProductOffer } from '@/config/types';

export type CartLine = {
  productId: string;
  slug: string;
  sku: string;
  name: string;
  offerId: string;
  offerQuantity: number;
  offerLabel: string;
  price: number;
  qty: number;
};

type CartContextValue = {
  items: CartLine[];
  addOffer: (product: ProductConfig, offer: ProductOffer, qty?: number) => void;
  remove: (productId: string, offerId: string) => void;
  clear: () => void;
  count: number;
  total: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'lara-cart-v2';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addOffer = useCallback(
    (product: ProductConfig, offer: ProductOffer, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.productId === product.id && i.offerId === offer.id,
        );
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id && i.offerId === offer.id
              ? { ...i, qty: i.qty + qty }
              : i,
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            sku: product.sku,
            name: product.name,
            offerId: offer.id,
            offerQuantity: offer.quantity,
            offerLabel: offer.label,
            price: offer.price,
            qty,
          },
        ];
      });
      setOpen(true);
    },
    [],
  );

  const remove = useCallback((productId: string, offerId: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.offerId === offerId)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const total = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addOffer,
      remove,
      clear,
      count,
      total,
      isOpen,
      setOpen,
    }),
    [items, addOffer, remove, clear, count, total, isOpen],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
