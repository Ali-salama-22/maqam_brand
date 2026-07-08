"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  cartId: string; // Unique ID for the cart (since same product can have different sizes/colors)
  id: string; // Product DB ID
  name: string;
  price: number;
  image_url: string;
  size: string;
  color?: string; // Optinal color hex
  colorName?: string; // Optional color name
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string) => void;
  updateQty: (cartId: string, qty: number) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from LocalStorage on mount
    const saved = localStorage.getItem("maqam_cart");
    if (saved) setItems(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("maqam_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      // Logic: Same product + Same size + Same color = Same item
      const existing = prev.find(
        (i) => i.id === newItem.id && i.size === newItem.size && i.color === newItem.color
      );
      if (existing) {
        return prev.map((i) =>
          i.cartId === existing.cartId ? { ...i, qty: i.qty + newItem.qty } : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartId: string) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const updateQty = (cartId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(cartId);
    setItems((prev) => prev.map((i) => (i.cartId === cartId ? { ...i, qty } : i)));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error("useCart must be used within a CartProvider");
  return context;
};
