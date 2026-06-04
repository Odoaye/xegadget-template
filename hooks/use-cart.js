import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "xe-cart";

export function useCart() {
  const [cart, setCart] = useState([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {}
    loadedRef.current = true;
  }, []);

  useEffect(() => {
    if (loadedRef.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = useCallback((product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product, qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQty = useCallback((productId, qty) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setCart(prev => prev.map(i => i.product.id === productId ? { ...i, qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const total = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const isInCart = (productId) => cart.some(i => i.product.id === productId);

  return { cart, addToCart, removeFromCart, updateQty, clearCart, total, count, isInCart };
}
