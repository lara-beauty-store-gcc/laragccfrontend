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

export type CartView = 'cart' | 'checkout' | 'crosssell';

type CartContextValue = {
  items: CartLine[];
  addOffer: (product: ProductConfig, offer: ProductOffer, qty?: number) => void;
  remove: (productId: string, offerId: string) => void;
  updateQty: (productId: string, offerId: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
  isOpen: boolean;
  view: CartView;
  openCart: () => void;
  openCheckout: () => void;
  setView: (view: CartView) => void;
  setOpen: (open: boolean) => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'lara-cart-v2';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<CartView>('cart');
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

  const openCart = useCallback(() => {
    setView('cart');
    setIsOpen(true);
  }, []);

  const openCheckout = useCallback(() => {
    setView('checkout');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setView('cart');
  }, []);

  const setOpen = useCallback((open: boolean) => {
    if (open) {
      setView('cart');
      setIsOpen(true);
      return;
    }
    close();
  }, [close]);

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
      setView('cart');
      setIsOpen(true);
    },
    [],
  );

  const remove = useCallback((productId: string, offerId: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.offerId === offerId)),
    );
  }, []);

  const updateQty = useCallback((productId: string, offerId: string, qty: number) => {
    if (qty < 1) {
      setItems((prev) =>
        prev.filter((i) => !(i.productId === productId && i.offerId === offerId)),
      );
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.offerId === offerId ? { ...i, qty } : i,
      ),
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
      updateQty,
      clear,
      count,
      total,
      isOpen,
      view,
      openCart,
      openCheckout,
      setView,
      setOpen,
      close,
    }),
    [
      items,
      addOffer,
      remove,
      updateQty,
      clear,
      count,
      total,
      isOpen,
      view,
      openCart,
      openCheckout,
      setOpen,
      close,
    ],
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
