import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingCart, Heart, X, ChevronDown, Star, Zap, Truck, Shield,
  RotateCcw, Package, Check, Plus, Minus, Tag, ArrowRight, Menu,
  Instagram, Twitter, Youtube, Mail, MessageCircle, Home, ShoppingBag, History
} from "lucide-react";
import { CheckoutFlow } from "../components/CheckoutFlow";
import { OrderHistory } from "../components/OrderHistory";
import { products, categories } from "../data/products";
import { useCart } from "../hooks/use-cart";
import { useWishlist } from "../hooks/use-wishlist";
import { useToastNotify } from "../hooks/use-toast-notify";

function StarRating({ rating, small }) {
  return (
    <div className={`flex items-center gap-0.5 ${small ? "scale-90 origin-left" : ""}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${small ? "w-3 h-3" : "w-3.5 h-3.5"} ${i <= Math.round(rating) ? "fill-[#C8521A] text-[#C8521A]" : "text-[#D5D4CE]"}`} />
      ))}
    </div>
  );
}

function StockBadge({ stock }) {
  if (stock === "In Stock") return <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />In Stock</span>;
  if (stock === "Low Stock") return <span className="text-amber-600 text-xs font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />Low Stock</span>;
  return <span className="text-red-500 text-xs font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />Out of Stock</span>;
}

function Countdown() {
  const [time, setTime] = useState({ h: 5, m: 47, s: 33 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 11; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1.5">
      {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="bg-white/20 text-white font-mono font-bold text-sm sm:text-base px-2 py-1 rounded">{v}</span>
          {i < 2 && <span className="text-white font-bold">:</span>}
        </span>
      ))}
    </div>
  );
}

export function NaijaTemplate() {
  const { cart, addToCart, removeFromCart, updateQty, total, count, isInCart } = useCart();
  const { wishlist, toggle, isInWishlist, count: wishCount } = useWishlist();
  const { toasts, notify, dismiss } = useToastNotify();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [cartOpen, setCartOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [qvQty, setQvQty] = useState(1);
  const [qvColor, setQvColor] = useState(0);
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddToCart = useCallback((product, qty = 1) => {
    if (product.stock === "Out of Stock") return;
    addToCart(product, qty);
    notify(`${product.name} added to cart`, "success");
  }, [addToCart, notify]);

  const handleWishlist = useCallback((product) => {
    toggle(product.id);
    notify(isInWishlist(product.id) ? "Removed from wishlist" : `${product.name} saved`, "info");
  }, [toggle, isInWishlist, notify]);

  const applyPromo = () => {
    if (promoInput.trim().toUpperCase() === "XETECH10") {
      setPromoApplied(true); setPromoError(false);
      notify("10% discount applied!", "success");
    } else {
      setPromoError(true); setPromoApplied(false);
    }
  };

  const discount = promoApplied ? total * 0.1 : 0;
  const finalTotal = total - discount;
  const freeShipping = finalTotal >= 500;

  const filtered = products
    .filter(p => activeCategory === "All" || p.category === activeCategory)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "new") return (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0);
      return 0;
    });

  const saleProducts = products.filter(p => p.originalPrice).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAFAF5] text-[#1C1C1A] pb-16 sm:pb-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Toasts */}
      <div className="fixed top-6 md:top-20 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold min-w-[200px] max-w-[280px] bg-white ${t.type === "success" ? "border-[#C8521A]/40" : "border-[#E5E4DE]"}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.type === "success" ? "bg-[#C8521A]" : "bg-blue-400"}`} />
              <span className="flex-1 text-[#1C1C1A]">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="text-[#9A9A94] hover:text-[#1C1C1A]"><X className="w-3.5 h-3.5" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickView && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]" onClick={() => setQuickView(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-4 bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-3xl sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto bg-white border border-[#E5E4DE] rounded-2xl z-[160] overflow-hidden flex flex-col sm:flex-row max-h-[90vh] shadow-2xl">
              <div className="relative flex-shrink-0 w-full sm:w-72 h-56 sm:h-auto bg-[#F2F1EC] overflow-hidden">
                <img src={quickView.image} alt={quickView.name} className="w-full h-full object-cover" />
                {quickView.badge && (
                  <span className="absolute top-3 left-3 bg-[#C8521A] text-white text-xs font-bold px-2.5 py-1 rounded-full">{quickView.badge}</span>
                )}
              </div>
              <div className="flex-1 p-5 sm:p-7 overflow-y-auto flex flex-col gap-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-[#C8521A] text-xs font-semibold uppercase tracking-widest mb-1">{quickView.category}</p>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1C1C1A] leading-snug">{quickView.name}</h2>
                  </div>
                  <button onClick={() => setQuickView(null)} className="p-1.5 rounded-lg hover:bg-[#F2F1EC] text-[#9A9A94] hover:text-[#1C1C1A] flex-shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <StarRating rating={quickView.rating} />
                  <span className="text-[#9A9A94] text-sm">{quickView.rating} ({quickView.reviewCount?.toLocaleString()} reviews)</span>
                  <StockBadge stock={quickView.stock} />
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-[#1C1C1A]">${quickView.price}</span>
                  {quickView.originalPrice && <span className="text-[#9A9A94] text-lg line-through">${quickView.originalPrice}</span>}
                  {quickView.originalPrice && <span className="text-emerald-600 text-sm font-bold">-{Math.round((1 - quickView.price / quickView.originalPrice) * 100)}%</span>}
                </div>
                <p className="text-[#5A5A54] text-sm leading-relaxed">{quickView.longDescription || quickView.description}</p>
                {quickView.colors && (
                  <div>
                    <p className="text-[#1C1C1A] text-sm font-semibold mb-2">Color: <span className="text-[#C8521A]">{quickView.colors[qvColor]}</span></p>
                    <div className="flex gap-2 flex-wrap">
                      {quickView.colors.map((c, i) => (
                        <button key={i} onClick={() => setQvColor(i)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-colors ${qvColor === i ? "border-[#C8521A] bg-[#C8521A]/10 text-[#C8521A]" : "border-[#E5E4DE] text-[#5A5A54] hover:border-[#C8521A]"}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {quickView.specs && (
                  <div className="grid grid-cols-2 gap-2 bg-[#F2F1EC] rounded-xl p-3">
                    {Object.entries(quickView.specs).slice(0, 6).map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[#9A9A94] text-xs">{k}</p>
                        <p className="text-[#1C1C1A] text-xs font-semibold leading-snug">{v}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-auto pt-2">
                  <div className="flex items-center border border-[#E5E4DE] rounded-xl overflow-hidden">
                    <button onClick={() => setQvQty(q => Math.max(1, q - 1))} className="px-3 py-2.5 hover:bg-[#F2F1EC] text-[#5A5A54]"><Minus className="w-4 h-4" /></button>
                    <span className="w-10 text-center text-sm font-bold text-[#1C1C1A]">{qvQty}</span>
                    <button onClick={() => setQvQty(q => q + 1)} className="px-3 py-2.5 hover:bg-[#F2F1EC] text-[#5A5A54]"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => { handleAddToCart(quickView, qvQty); setQuickView(null); setQvQty(1); }}
                    disabled={quickView.stock === "Out of Stock"}
                    className="flex-1 bg-[#C8521A] hover:bg-[#A8411A] disabled:bg-[#E5E4DE] disabled:text-[#9A9A94] text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
                    {quickView.stock === "Out of Stock" ? "Out of Stock" : "Add to Cart"}
                  </button>
                  <button onClick={() => handleWishlist(quickView)}
                    className={`p-2.5 rounded-xl border transition-colors ${isInWishlist(quickView.id) ? "border-pink-500 text-pink-500 bg-pink-50" : "border-[#E5E4DE] text-[#9A9A94] hover:border-pink-500 hover:text-pink-500"}`}>
                    <Heart className={`w-5 h-5 ${isInWishlist(quickView.id) ? "fill-pink-500" : ""}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[120]" onClick={() => setCartOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#FAFAF5] border-l border-[#E5E4DE] z-[130] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-[#E5E4DE] bg-white">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-[#1C1C1A]">Your Cart</h2>
                  <span className="bg-[#C8521A] text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
                </div>
                <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-lg hover:bg-[#F2F1EC] text-[#9A9A94]"><X className="w-5 h-5" /></button>
              </div>
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <Package className="w-12 h-12 text-[#D5D4CE]" />
                  <p className="text-[#5A5A54] font-semibold">Your cart is empty</p>
                  <button onClick={() => setCartOpen(false)} className="bg-[#C8521A] text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-[#A8411A] transition-colors">
                    Browse Products
                  </button>
                </div>
              ) : (
                <>
                  {!freeShipping && (
                    <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <p className="text-amber-700 text-xs font-medium">Add <span className="font-bold">${(500 - finalTotal).toFixed(0)}</span> more for free shipping</p>
                    </div>
                  )}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map(({ product, qty }) => (
                      <div key={product.id} className="bg-white border border-[#E5E4DE] rounded-xl p-3 flex items-start gap-3 shadow-sm">
                        <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-[#F2F1EC]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#C8521A] font-semibold mb-0.5">{product.category}</p>
                          <p className="text-sm font-semibold text-[#1C1C1A] leading-snug line-clamp-1">{product.name}</p>
                          <p className="text-[#C8521A] font-bold text-sm mt-0.5">${(product.price * qty).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button onClick={() => removeFromCart(product.id)} className="text-[#9A9A94] hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                          <div className="flex items-center border border-[#E5E4DE] rounded-lg overflow-hidden">
                            <button onClick={() => updateQty(product.id, qty - 1)} className="px-2 py-1 hover:bg-[#F2F1EC] text-[#5A5A54]"><Minus className="w-3 h-3" /></button>
                            <span className="w-7 text-center text-xs font-bold text-[#1C1C1A]">{qty}</span>
                            <button onClick={() => updateQty(product.id, qty + 1)} className="px-2 py-1 hover:bg-[#F2F1EC] text-[#5A5A54]"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-[#E5E4DE] space-y-3 bg-white">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A94]" />
                        <input value={promoInput} onChange={e => { setPromoInput(e.target.value); setPromoError(false); }}
                          placeholder="Promo code (XETECH10)"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#F2F1EC] border border-[#E5E4DE] rounded-xl text-sm text-[#1C1C1A] placeholder:text-[#9A9A94] focus:outline-none focus:border-[#C8521A] transition-colors" />
                      </div>
                      <button onClick={applyPromo} disabled={promoApplied}
                        className="px-3 bg-[#1C1C1A] hover:bg-[#C8521A] disabled:bg-[#E5E4DE] disabled:text-[#9A9A94] text-white rounded-xl text-sm font-bold transition-colors flex-shrink-0 flex items-center gap-1">
                        {promoApplied ? <Check className="w-4 h-4" /> : "Apply"}
                      </button>
                    </div>
                    {promoError && <p className="text-red-500 text-xs font-medium">Invalid promo code</p>}
                    {promoApplied && <p className="text-emerald-600 text-xs font-medium flex items-center gap-1"><Check className="w-3.5 h-3.5" />10% discount applied</p>}
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between text-[#5A5A54]"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                      {promoApplied && <div className="flex justify-between text-emerald-600"><span>Discount (10%)</span><span>-${discount.toFixed(2)}</span></div>}
                      <div className="flex justify-between text-[#5A5A54]"><span>Shipping</span><span className={freeShipping ? "text-emerald-600 font-semibold" : ""}>{freeShipping ? "Free" : "$12.99"}</span></div>
                      <div className="flex justify-between text-[#1C1C1A] font-bold text-base pt-1.5 border-t border-[#E5E4DE]"><span>Total</span><span>${(finalTotal + (freeShipping ? 0 : 12.99)).toFixed(2)}</span></div>
                    </div>
                    <button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                      className="w-full bg-[#C8521A] hover:bg-[#A8411A] text-white font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2 text-sm">
                      Checkout <ArrowRight className="w-4 h-4" />
                    </button>
                    <div className="flex items-center justify-center gap-4 text-xs text-[#9A9A94]">
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Secure checkout</span>
                      <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" />14-day returns</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Announcement Bar */}
      <div className="bg-[#C8521A] text-white text-center py-2 px-4 text-xs font-medium tracking-wide">
        Free delivery on orders above $500 — Use code <strong>XETECH10</strong> for 10% off
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-[100] bg-[#FAFAF5]/95 backdrop-blur-md border-b border-[#E5E4DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col leading-none flex-shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#1C1C1A]">XE<span className="text-[#C8521A]">Store</span></span>
            <span className="text-[9px] text-[#C8521A] font-semibold tracking-widest uppercase leading-none">by XEStudioz</span>
          </div>
          <div className="hidden md:flex items-center gap-6 ml-6 text-sm font-semibold text-[#5A5A54]">
            <button onClick={() => scrollTo("store-products")} className="hover:text-[#C8521A] transition-colors">Shop</button>
            <button onClick={() => scrollTo("store-about")} className="hover:text-[#C8521A] transition-colors">About</button>
          </div>
          <div className="flex-1 relative max-w-md hidden sm:block mx-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A94]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gadgets..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E4DE] rounded-full text-sm text-[#1C1C1A] placeholder:text-[#9A9A94] focus:outline-none focus:border-[#C8521A] transition-colors" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] hover:text-[#1C1C1A]"><X className="w-3.5 h-3.5" /></button>}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-2 text-[#5A5A54] hover:text-[#1C1C1A]"><Menu className="w-5 h-5" /></button>
            <button onClick={() => setWishlistOpen(true)} className="relative p-2 text-[#9A9A94] hover:text-pink-500 transition-colors">
              <Heart className="w-5 h-5" />
              {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{wishCount}</span>}
            </button>
            <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 bg-[#C8521A] hover:bg-[#A8411A] text-white px-3 sm:px-4 py-2 rounded-full text-sm font-semibold transition-colors">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && <span className="bg-white text-[#C8521A] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{count}</span>}
            </button>
          </div>
        </div>
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A94]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gadgets..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E4DE] rounded-full text-sm text-[#1C1C1A] placeholder:text-[#9A9A94] focus:outline-none focus:border-[#C8521A] transition-colors" />
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-[90]" onClick={() => setMenuOpen(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 h-full w-64 bg-[#FAFAF5] border-r border-[#E5E4DE] z-[95] flex flex-col p-6 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-lg text-[#1C1C1A]">XE<span className="text-[#C8521A]">Store</span></span>
                <button onClick={() => setMenuOpen(false)}><X className="w-5 h-5 text-[#9A9A94]" /></button>
              </div>
              <button onClick={() => scrollTo("store-products")} className="text-left text-base font-semibold py-4 border-b border-[#E5E4DE] text-[#1C1C1A] hover:text-[#C8521A] transition-colors">Shop</button>
              <button onClick={() => scrollTo("store-about")} className="text-left text-base font-semibold py-4 border-b border-[#E5E4DE] text-[#1C1C1A] hover:text-[#C8521A] transition-colors">About</button>
              <button onClick={() => { setMenuOpen(false); setCartOpen(true); }} className="mt-6 bg-[#C8521A] text-white py-3 rounded-full font-semibold text-sm">View Cart ({count})</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Flash Sale Banner */}
      <div className="bg-gradient-to-r from-[#7C2D12] via-[#C8521A] to-[#9A3412]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-[#FFD600] flex-shrink-0" />
            <div>
              <p className="font-bold text-white text-sm sm:text-base">Flash Sale — Up to 40% off</p>
              <p className="text-white/70 text-xs">Limited time. Ends in:</p>
            </div>
          </div>
          <Countdown />
          <button onClick={() => setActiveCategory("All")}
            className="bg-[#FFD600] hover:bg-yellow-300 text-[#1C1C1A] font-bold text-xs sm:text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap">
            Shop Sale <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sale Strip */}
      <div className="bg-white border-b border-[#E5E4DE] overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-3 px-4 sm:px-6 py-3 w-max sm:w-auto sm:max-w-7xl sm:mx-auto">
          {saleProducts.map(p => (
            <button key={p.id} onClick={() => setQuickView(p)}
              className="flex items-center gap-2.5 bg-[#F2F1EC] hover:bg-[#E5E4DE] border border-[#E5E4DE] rounded-xl px-3 py-2 transition-colors flex-shrink-0">
              <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
              <div className="text-left">
                <p className="text-[#1C1C1A] text-xs font-semibold line-clamp-1">{p.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[#C8521A] text-xs font-bold">${p.price}</span>
                  <span className="text-[#9A9A94] text-xs line-through">${p.originalPrice}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div id="store-products" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {["All", ...categories].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all border ${activeCategory === cat ? "bg-[#C8521A] border-[#C8521A] text-white" : "bg-transparent border-[#E5E4DE] text-[#5A5A54] hover:border-[#C8521A] hover:text-[#C8521A]"}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <p className="text-[#9A9A94] text-sm hidden sm:block">{filtered.length} products</p>
            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-[#E5E4DE] rounded-full pl-3 pr-8 py-2 text-sm text-[#1C1C1A] focus:outline-none focus:border-[#C8521A] cursor-pointer">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="new">New Arrivals</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A94] pointer-events-none" />
            </div>
          </div>
        </div>
        <p className="text-[#9A9A94] text-sm mb-4 sm:hidden">{filtered.length} products</p>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-[#D5D4CE] mx-auto mb-4" />
            <p className="text-[#5A5A54] font-semibold text-lg mb-2">No products found</p>
            <button onClick={() => { setSearch(""); setActiveCategory("All"); }} className="bg-[#C8521A] text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-[#A8411A] transition-colors">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {filtered.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="bg-white border border-[#E5E4DE] rounded-2xl overflow-hidden group hover:border-[#C8521A]/40 hover:shadow-md transition-all cursor-pointer">
                <div className="relative overflow-hidden bg-[#F2F1EC] aspect-square" onClick={() => { setQuickView(product); setQvColor(0); setQvQty(1); }}>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {product.badge && (
                    <span className={`absolute top-2 left-2 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${product.badge === "Sale" ? "bg-red-500" : product.badge === "Limited" ? "bg-amber-500" : product.badge === "Hot" ? "bg-orange-500" : "bg-[#C8521A]"}`}>
                      {product.badge}
                    </span>
                  )}
                  {product.stock === "Out of Stock" && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="bg-white text-[#5A5A54] text-xs font-bold px-3 py-1.5 rounded-full border border-[#E5E4DE]">Out of Stock</span>
                    </div>
                  )}
                  <button onClick={e => { e.stopPropagation(); handleWishlist(product); }}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-all shadow-sm ${isInWishlist(product.id) ? "bg-pink-500 text-white" : "bg-white text-[#9A9A94] hover:text-pink-500"}`}>
                    <Heart className={`w-3.5 h-3.5 ${isInWishlist(product.id) ? "fill-white" : ""}`} />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 to-transparent py-2 px-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                    <button onClick={e => { e.stopPropagation(); handleAddToCart(product); }} disabled={product.stock === "Out of Stock"}
                      className="w-full bg-[#C8521A] hover:bg-[#A8411A] disabled:bg-[#E5E4DE] text-white text-xs font-bold py-2 rounded-full transition-colors">
                      {isInCart(product.id) ? "Add More" : "Add to Cart"}
                    </button>
                  </div>
                </div>
                <div className="p-3 sm:p-4" onClick={() => { setQuickView(product); setQvColor(0); setQvQty(1); }}>
                  <p className="text-[#C8521A] text-[10px] sm:text-xs font-semibold uppercase tracking-wide mb-1">{product.category}</p>
                  <h3 className="font-semibold text-sm sm:text-base text-[#1C1C1A] leading-snug mb-1.5 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-1.5 mb-2">
                    <StarRating rating={product.rating} small />
                    <span className="text-[#9A9A94] text-[10px]">({product.reviewCount?.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm sm:text-base text-[#1C1C1A]">${product.price}</span>
                      {product.originalPrice && <span className="text-[#9A9A94] text-xs line-through ml-1">${product.originalPrice}</span>}
                    </div>
                    <StockBadge stock={product.stock} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Trust */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-16">
          {[
            { icon: <Truck className="w-5 h-5" />, label: "Free Shipping", sub: "On orders above $500" },
            { icon: <Shield className="w-5 h-5" />, label: "Secure Payments", sub: "256-bit SSL encryption" },
            { icon: <RotateCcw className="w-5 h-5" />, label: "Easy Returns", sub: "14-day no-hassle" },
            { icon: <Package className="w-5 h-5" />, label: "Genuine Products", sub: "100% authentic" },
          ].map((t, i) => (
            <div key={i} className="bg-white border border-[#E5E4DE] rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center gap-2 sm:gap-3 hover:border-[#C8521A]/40 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-[#C8521A]/10 rounded-xl flex items-center justify-center text-[#C8521A]">{t.icon}</div>
              <div>
                <p className="font-bold text-sm text-[#1C1C1A]">{t.label}</p>
                <p className="text-[#9A9A94] text-xs mt-0.5">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <section id="store-about" className="py-14 sm:py-20 bg-[#F2F1EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-10 sm:gap-16 items-center">
            <motion.div className="flex-1" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-[#C8521A] text-xs font-semibold uppercase tracking-widest mb-2">Who We Are</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1C1A] mb-4 leading-snug">
                Gadgets for the<br />bold generation.
              </h2>
              <p className="text-[#5A5A54] leading-relaxed mb-6 text-sm sm:text-base">
                XE Store is an Afrotech-forward gadget brand bringing premium electronics to everyday people across Africa and beyond. We source only the best, price fairly, and back every order with world-class support.
              </p>
              <div className="flex items-center gap-3 mb-6">
                {[
                  { icon: <Instagram className="w-4 h-4" />, color: "#E1306C" },
                  { icon: <Twitter className="w-4 h-4" />, color: "#1DA1F2" },
                  { icon: <Youtube className="w-4 h-4" />, color: "#FF0000" },
                  { icon: <span className="text-xs font-black">TK</span>, color: "#000000" },
                ].map((s, i) => (
                  <a key={i} href="#"
                    className="w-9 h-9 bg-white border border-[#E5E4DE] rounded-full flex items-center justify-center text-[#5A5A54] hover:text-white transition-all shadow-sm"
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = s.color)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "white")}>
                    {s.icon}
                  </a>
                ))}
              </div>
              <div className="space-y-2.5">
                <a href="mailto:hello@xestore.tech" className="flex items-center gap-2.5 text-sm text-[#5A5A54] hover:text-[#C8521A] transition-colors">
                  <div className="w-8 h-8 bg-[#C8521A]/10 rounded-lg flex items-center justify-center text-[#C8521A] flex-shrink-0"><Mail className="w-3.5 h-3.5" /></div>
                  hello@xestore.tech
                </a>
                <a href="#" className="flex items-center gap-2.5 text-sm text-[#5A5A54] hover:text-[#C8521A] transition-colors">
                  <div className="w-8 h-8 bg-[#C8521A]/10 rounded-lg flex items-center justify-center text-[#C8521A] flex-shrink-0"><MessageCircle className="w-3.5 h-3.5" /></div>
                  WhatsApp: +234 800 XE TECH
                </a>
              </div>
            </motion.div>
            <motion.div className="flex-1 w-full max-w-sm lg:max-w-none mx-auto" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="relative">
                <div className="absolute inset-0 bg-[#C8521A]/15 rounded-3xl transform rotate-2" />
                <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=700&q=80" alt="About XE Store"
                  className="relative w-full h-64 sm:h-80 object-cover rounded-2xl shadow-xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-gradient-to-br from-[#C8521A]/10 via-white to-amber-50 border border-[#C8521A]/20 rounded-2xl p-6 sm:p-10 text-center">
          <p className="text-[#C8521A] text-xs font-semibold uppercase tracking-widest mb-2">Stay Updated</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#1C1C1A] mb-2 sm:mb-3">Drop alerts, deals &amp; launches</h3>
          <p className="text-[#5A5A54] text-sm mb-5 sm:mb-7 max-w-md mx-auto leading-relaxed">Get notified before the crowd. Flash sales, restocks, and exclusive member offers — straight to your inbox.</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Your email address"
              className="flex-1 px-4 py-3 bg-white border border-[#E5E4DE] rounded-full text-[#1C1C1A] placeholder:text-[#9A9A94] focus:outline-none focus:border-[#C8521A] text-sm transition-colors" />
            <button onClick={() => notify("Subscribed! Check your inbox.", "success")}
              className="bg-[#C8521A] hover:bg-[#A8411A] text-white font-bold px-6 py-3 rounded-full transition-colors text-sm whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1C1C1A] border-t border-[#3A3A34] py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between gap-6 mb-6">
            <div>
              <p className="text-xl font-extrabold text-white mb-0.5">XE<span className="text-[#C8521A]">Store</span></p>
              <p className="text-xs text-[#C8521A] font-semibold mb-2">made by XEStudioz</p>
              <p className="text-[#5A5A54] text-xs max-w-xs leading-relaxed">Premium gadgets, verified products, and world-class service.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
              {[
                { title: "Shop", links: ["Smartphones", "Laptops", "Earbuds", "Tablets"] },
                { title: "Support", links: ["Contact Us", "Track Order", "Returns", "FAQ"] },
                { title: "Company", links: ["About", "Blog", "Careers", "Press"] }
              ].map(col => (
                <div key={col.title}>
                  <p className="font-bold text-white mb-2">{col.title}</p>
                  {col.links.map(l => <p key={l} className="text-[#5A5A54] hover:text-[#C8521A] cursor-pointer py-0.5 transition-colors">{l}</p>)}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-[#3A3A34] pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#5A5A54]">
            <p>2026 XE Tech. All rights reserved.</p>
            <p className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure &amp; Encrypted</p>
          </div>
        </div>
      </footer>

      <CheckoutFlow isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <OrderHistory isOpen={orderHistoryOpen} onClose={() => setOrderHistoryOpen(false)} />

      {/* Wishlist Drawer */}
      <AnimatePresence>
        {wishlistOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[170]" onClick={() => setWishlistOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-xs sm:max-w-sm bg-[#FAFAF5] z-[180] flex flex-col shadow-2xl border-l border-[#E5E4DE]">
              <div className="flex items-center justify-between p-4 border-b border-[#E5E4DE]">
                <div>
                  <h2 className="text-lg font-bold text-[#1C1C1A]">Saved Items</h2>
                  <p className="text-xs text-[#9A9A94]">{wishCount} item{wishCount !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setWishlistOpen(false)} className="p-2 rounded-full hover:bg-[#F2F1EC] transition-colors"><X className="w-5 h-5 text-[#1C1C1A]" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {wishlistProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <Heart className="w-12 h-12 text-[#D5D4CE]" />
                    <p className="font-semibold text-[#1C1C1A]">Nothing saved yet</p>
                    <p className="text-sm text-[#9A9A94]">Tap the heart on any product</p>
                    <button onClick={() => { setWishlistOpen(false); scrollTo("store-products"); }}
                      className="mt-2 bg-[#C8521A] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#A8411A] transition-colors">Browse Shop</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {wishlistProducts.map(product => (
                      <div key={product.id} className="flex gap-3 bg-white rounded-xl p-3 border border-[#E5E4DE]">
                        <img src={product.image} alt={product.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1C1C1A] line-clamp-1">{product.name}</p>
                          <p className="text-[#C8521A] font-bold text-sm">${product.price}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => handleAddToCart(product)}
                            className="text-xs bg-[#C8521A] text-white px-2 py-1 rounded-lg font-semibold hover:bg-[#A8411A] transition-colors">Add</button>
                          <button onClick={() => { toggle(product.id); notify("Removed from wishlist", "info"); }}
                            className="text-xs text-[#9A9A94] hover:text-red-500 transition-colors px-2 py-1">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-[150] sm:hidden bg-[#1C1C1A] border-t-2 border-[#C8521A]/40 flex items-stretch">
        {[
          { icon: <Home className="w-5 h-5" />, label: "Home", action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
          { icon: <ShoppingBag className="w-5 h-5" />, label: "Shop", action: () => scrollTo("store-products") },
          { icon: <Heart className="w-5 h-5" fill={wishCount > 0 ? "#C8521A" : "none"} stroke={wishCount > 0 ? "#C8521A" : "#9A9A94"} />, label: "Saved", badge: wishCount, action: () => setWishlistOpen(true) },
          { icon: <ShoppingCart className="w-5 h-5" />, label: "Cart", badge: count, action: () => setCartOpen(true) },
          { icon: <History className="w-5 h-5" />, label: "Orders", action: () => setOrderHistoryOpen(true) },
        ].map(({ icon, label, badge, action }) => (
          <button key={label} onClick={action}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative hover:bg-[#C8521A]/10 transition-colors active:bg-[#C8521A]/20">
            <span className="relative text-[#9A9A94]">
              {icon}
              {badge && badge > 0 ? <span className="absolute -top-1.5 -right-1.5 bg-[#C8521A] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{badge}</span> : null}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[#5A5A54]">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
