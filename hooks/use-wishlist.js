import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "xe-wishlist";

export function useWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setWishlist(JSON.parse(raw));
    } catch {}
    loadedRef.current = true;
  }, []);

  useEffect(() => {
    if (loadedRef.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const toggle = useCallback((productId) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  }, []);

  const isInWishlist = useCallback((productId) => wishlist.includes(productId), [wishlist]);
  const count = wishlist.length;

  return { wishlist, toggle, isInWishlist, count };
}
