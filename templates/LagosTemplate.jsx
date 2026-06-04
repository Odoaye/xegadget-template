import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ShoppingBag, ShoppingCart, Home, Menu, X, ChevronRight, Star, Heart, Plus, Minus,
  Package, Tag, Check, ArrowRight, Zap, Shield, Truck, RotateCcw, Mail, MessageCircle, Clock
} from "lucide-react";
import { products } from "../data/products";
import { useCart } from "../hooks/use-cart";
import { useWishlist } from "../hooks/use-wishlist";
import { useToastNotify } from "../hooks/use-toast-notify";
import { CheckoutFlow } from "../components/CheckoutFlow";
import { OrderHistory } from "../components/OrderHistory";

function Card3D({ children, className = "", intensity = 15, style }) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale(1.02)`;
    ref.current.style.transition = "transform 80ms linear";
    const shine = ref.current.querySelector(".card3d-shine");
    if (shine) {
      shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(200,82,26,0.15) 0%, transparent 70%)`;
      shine.style.opacity = "1";
    }
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
    ref.current.style.transition = "transform 400ms ease";
    const shine = ref.current.querySelector(".card3d-shine");
    if (shine) shine.style.opacity = "0";
  };

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      className={className} style={{ transformStyle: "preserve-3d", willChange: "transform", ...style }}>
      <div className="card3d-shine absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity z-10" />
      {children}
    </div>
  );
}

function FloatingOrb({ size, x, y, color, delay = 0 }) {
  return (
    <motion.div className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, background: color, filter: "blur(60px)", opacity: 0.35 }}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }} />
  );
}

export function LagosTemplate() {
  const { cart, addToCart, removeFromCart, updateQty, total, count } = useCart();
  const { wishlist, toggle, isInWishlist, count: wishlistCount } = useWishlist();
  const { toasts, notify, dismiss } = useToastNotify();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const featured = products.slice(0, 6);
  const discount = promoApplied ? total * 0.1 : 0;
  const finalTotal = total - discount;
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddToCart = useCallback((product) => {
    addToCart(product);
    notify(`${product.name} added to cart`, "success");
  }, [addToCart, notify]);

  const handleWishlist = useCallback((product) => {
    toggle(product.id);
    notify(isInWishlist(product.id) ? "Removed from wishlist" : `${product.name} saved`, "info");
  }, [toggle, isInWishlist, notify]);

  return (
    <div className="min-h-screen overflow-x-hidden pb-16 sm:pb-0" style={{ background: "#FAFAF5", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Toasts */}
      <div className="fixed top-6 md:top-20 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 40, rotateY: -30 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} exit={{ opacity: 0, x: 40 }}
              style={{ perspective: 600 }}
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 bg-white border-l-4 border-[#C8521A] rounded-xl shadow-xl text-sm font-semibold min-w-[200px] max-w-[280px]">
              <span className="w-2 h-2 rounded-full bg-[#C8521A] flex-shrink-0" />
              <span className="flex-1 text-[#1C1C1A]">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="text-[#9A9A94]"><X className="w-3.5 h-3.5" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120]" />
            <motion.div initial={{ x: "100%", rotateY: 15 }} animate={{ x: 0, rotateY: 0 }} exit={{ x: "100%", rotateY: 15 }}
              transition={{ type: "spring", damping: 26, stiffness: 200 }}
              style={{ perspective: 1200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#FAFAF5] border-l border-[#E5E4DE] z-[130] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-[#E5E4DE] bg-white">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-[#1C1C1A]">Your Cart</h2>
                  {count > 0 && <span className="bg-[#C8521A] text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>}
                </div>
                <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-[#F2F1EC] rounded-lg text-[#5A5A54]"><X className="w-5 h-5" /></button>
              </div>
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Package className="w-12 h-12 text-[#C5C4BE]" />
                  </motion.div>
                  <p className="font-semibold text-[#5A5A54]">Your cart is empty</p>
                  <button onClick={() => { setCartOpen(false); scrollTo("lagos-products"); }}
                    className="bg-[#C8521A] text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-[#A8411A] transition-colors">
                    Browse Gadgets
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map(({ product, qty }, i) => (
                      <motion.div key={product.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-[#E5E4DE] p-3 flex items-start gap-3 shadow-sm">
                        <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#C8521A] font-semibold mb-0.5">{product.category}</p>
                          <p className="text-sm font-semibold text-[#1C1C1A] line-clamp-1">{product.name}</p>
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
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-[#E5E4DE] space-y-3 bg-white">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A94]" />
                        <input value={promoInput} onChange={e => setPromoInput(e.target.value)} placeholder="Promo code (XETECH10)"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#F2F1EC] border border-[#E5E4DE] rounded-xl text-sm text-[#1C1C1A] placeholder:text-[#9A9A94] focus:outline-none focus:border-[#C8521A] transition-colors" />
                      </div>
                      <button onClick={() => { if (promoInput.trim().toUpperCase() === "XETECH10") { setPromoApplied(true); notify("10% off applied!", "success"); } else notify("Invalid code", "error"); }}
                        disabled={promoApplied}
                        className="px-3 bg-[#1C1C1A] disabled:bg-[#E5E4DE] text-white rounded-xl text-sm font-semibold transition-colors flex items-center">
                        {promoApplied ? <Check className="w-4 h-4 text-[#C8521A]" /> : "Apply"}
                      </button>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between text-[#5A5A54]"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                      {promoApplied && <div className="flex justify-between text-emerald-600"><span>Discount (10%)</span><span>-${discount.toFixed(2)}</span></div>}
                      <div className="flex justify-between text-[#5A5A54]"><span>Delivery</span><span className={finalTotal >= 500 ? "text-emerald-600 font-semibold" : ""}>{finalTotal >= 500 ? "Free" : "$12.99"}</span></div>
                      <div className="flex justify-between font-bold text-base text-[#1C1C1A] pt-1.5 border-t border-[#E5E4DE]"><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>
                    </div>
                    <button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                      className="w-full bg-[#C8521A] hover:bg-[#A8411A] text-white font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2 text-sm shadow-md">
                      Checkout <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Announcement Bar */}
      <div className="bg-[#C8521A] text-white text-center py-2.5 px-4 text-xs sm:text-sm font-medium tracking-wide relative overflow-hidden">
        <motion.div className="absolute inset-0 bg-white/10" animate={{ x: ["100%", "-100%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ clipPath: "polygon(0 0, 30px 0, 60px 100%, 30px 100%)" }} />
        Free delivery on orders above $500 — Shop smarter with XE Tech
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#FAFAF5]/95 backdrop-blur-sm border-b border-[#E5E4DE]"
        style={{ boxShadow: "0 4px 24px -4px rgba(200,82,26,0.08), 0 2px 8px -2px rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex flex-col cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1C1A]">XE <span className="text-[#C8521A]">Tech</span></span>
            <span className="text-[9px] sm:text-[10px] text-[#C8521A] font-medium tracking-widest uppercase leading-none">made by XEStudioz</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#5A5A54]">
            <button onClick={() => scrollTo("lagos-products")} className="hover:text-[#C8521A] transition-colors">Shop</button>
            <button onClick={() => scrollTo("lagos-about")} className="hover:text-[#C8521A] transition-colors">About</button>
            <button onClick={() => scrollTo("lagos-reviews")} className="hover:text-[#C8521A] transition-colors">Reviews</button>
            <button onClick={() => scrollTo("lagos-contact")} className="hover:text-[#C8521A] transition-colors">Contact</button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setCartOpen(true)}
              className="flex items-center gap-1.5 bg-[#C8521A] text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-semibold hover:bg-[#A8411A] transition-colors shadow-[0_4px_12px_rgba(200,82,26,0.35)]">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && <span className="bg-white text-[#C8521A] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{count}</span>}
            </button>
            <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 text-[#1C1C1A]"><Menu className="w-6 h-6" /></button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 md:hidden" onClick={() => setMenuOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-72 bg-[#FAFAF5] shadow-2xl border-l border-[#E5E4DE] p-6 flex flex-col z-[60] md:hidden">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold text-[#1C1C1A]">Menu</span>
                <button onClick={() => setMenuOpen(false)}><X className="w-6 h-6 text-[#9A9A94]" /></button>
              </div>
              {["Shop", "About", "Reviews", "Contact"].map((item, i) => (
                <button key={i} onClick={() => scrollTo(`lagos-${item.toLowerCase()}`)}
                  className="text-left text-lg font-semibold py-4 border-b border-[#E5E4DE] text-[#1C1C1A] hover:text-[#C8521A] transition-colors">
                  {item}
                </button>
              ))}
              <button onClick={() => { setMenuOpen(false); setCartOpen(true); }}
                className="mt-6 bg-[#C8521A] text-white py-3 rounded-full font-semibold hover:bg-[#A8411A] transition-colors">
                View Cart ({count})
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #FAFAF5 0%, #F2F1EC 50%, #FDF4EF 100%)" }}>
        <FloatingOrb size={400} x="60%" y="-10%" color="radial-gradient(circle, rgba(200,82,26,0.4) 0%, transparent 70%)" delay={0} />
        <FloatingOrb size={300} x="80%" y="40%" color="radial-gradient(circle, rgba(255,200,150,0.4) 0%, transparent 70%)" delay={2} />
        <FloatingOrb size={200} x="-5%" y="20%" color="radial-gradient(circle, rgba(200,82,26,0.2) 0%, transparent 70%)" delay={1} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#C8521A 1px, transparent 1px), linear-gradient(90deg, #C8521A 1px, transparent 1px)", backgroundSize: "60px 60px", transform: "perspective(800px) rotateX(20deg)", transformOrigin: "top" }} />
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col lg:flex-row items-center gap-10 sm:gap-16 relative z-10 w-full">
          <motion.div initial={{ opacity: 0, x: -60, rotateY: -20 }} animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            style={{ perspective: 1000, transformStyle: "preserve-3d" }}
            className="flex-1 text-center lg:text-left">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-block bg-[#C8521A]/10 text-[#C8521A] text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-4 sm:mb-6 tracking-wide border border-[#C8521A]/20">
              Premium Gadgets for Every Home
            </motion.span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-[#1C1C1A] mb-4 sm:mb-6"
              style={{ textShadow: "4px 4px 0px rgba(200,82,26,0.08)" }}>
              Tech That Fits<br />
              <span className="text-[#C8521A] relative inline-block" style={{ textShadow: "6px 6px 0px rgba(200,82,26,0.15)" }}>
                Your Life
                <motion.span className="absolute bottom-0 left-0 h-1 bg-[#C8521A] rounded-full" style={{ width: "0%" }}
                  whileInView={{ width: "100%" }} transition={{ duration: 0.8, delay: 0.5 }} />
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#5A5A54] mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Quality gadgets at honest prices. From smartphones to earbuds, bringing you the best in tech — with support you can count on.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <motion.button onClick={() => scrollTo("lagos-products")}
                whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}
                className="bg-[#C8521A] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(200,82,26,0.3)]">
                Shop Now <ChevronRight className="w-4 h-4" />
              </motion.button>
              <motion.button onClick={() => scrollTo("lagos-about")}
                whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                className="border-2 border-[#1C1C1A] text-[#1C1C1A] px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base hover:border-[#C8521A] hover:text-[#C8521A] transition-colors">
                Our Story
              </motion.button>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="flex gap-6 mt-8 sm:mt-10 justify-center lg:justify-start">
              {[["2,400+", "Customers"], ["23", "Products"], ["8", "Categories"]].map(([num, label], i) => (
                <motion.div key={i} whileHover={{ y: -4, scale: 1.05 }} className="text-center cursor-default">
                  <p className="text-2xl sm:text-3xl font-bold text-[#C8521A]">{num}</p>
                  <p className="text-[#9A9A94] text-xs sm:text-sm font-medium">{label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 60, rotateY: 20 }} animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3, delay: 0.1 }}
            className="flex-1 w-full max-w-sm sm:max-w-md lg:max-w-none mx-auto relative"
            style={{ perspective: 1200 }}>
            <Card3D intensity={10} className="relative">
              <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}>
                <div className="relative" style={{ transform: "perspective(800px) rotateY(-8deg) rotateX(4deg)" }}>
                  <div className="absolute inset-0 bg-[#C8521A]/20 rounded-3xl transform translate-y-4 translate-x-4 blur-xl" />
                  <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80" alt="XE Tech"
                    className="relative w-full h-72 sm:h-96 object-cover rounded-2xl shadow-2xl border border-white/60" />
                  <motion.div animate={{ y: [0, -6, 0], rotateZ: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-[#E5E4DE] p-3 flex items-center gap-2"
                    style={{ transform: "perspective(600px) rotateY(-10deg) translateZ(20px)" }}>
                    <div className="w-8 h-8 bg-[#C8521A]/10 rounded-xl flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[#C8521A]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1C1C1A]">Flash Sale</p>
                      <p className="text-[10px] text-[#C8521A] font-semibold">Up to 40% off</p>
                    </div>
                  </motion.div>
                  <motion.div animate={{ y: [0, -8, 0], rotateZ: [0, -1, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-4 -left-4 bg-[#C8521A] rounded-2xl shadow-xl p-3 flex items-center gap-2"
                    style={{ transform: "perspective(600px) rotateY(10deg) translateZ(20px)" }}>
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <div>
                      <p className="text-xs font-bold text-white">2,400+ sold</p>
                      <p className="text-[10px] text-white/70">Across Nigeria</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </Card3D>
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#9A9A94] cursor-pointer z-10"
          onClick={() => scrollTo("lagos-trust")}>
          <span className="text-xs font-medium">Scroll</span>
          <div className="w-5 h-8 border-2 border-[#9A9A94] rounded-full flex items-start justify-center pt-1.5">
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1 h-1.5 bg-[#C8521A] rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Trust Bar */}
      <section id="lagos-trust" className="bg-[#1C1C1A] py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: <Truck className="w-5 h-5" />, label: "Fast Delivery", sub: "Lagos & nationwide" },
            { icon: <Shield className="w-5 h-5" />, label: "Genuine Products", sub: "100% authentic" },
            { icon: <RotateCcw className="w-5 h-5" />, label: "Easy Returns", sub: "14-day hassle-free" },
            { icon: <ShoppingBag className="w-5 h-5" />, label: "Secure Payment", sub: "Bank, card, USSD" },
          ].map((t, i) => (
            <Card3D key={i} intensity={12}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden group cursor-default">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }}
                  className="w-10 h-10 bg-[#C8521A]/20 rounded-xl flex items-center justify-center text-[#C8521A] mx-auto mb-3">
                  {t.icon}
                </motion.div>
                <p className="font-semibold text-sm text-white">{t.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{t.sub}</p>
              </motion.div>
            </Card3D>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="lagos-products" className="py-14 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <p className="text-[#C8521A] text-sm font-semibold uppercase tracking-widest mb-1 sm:mb-2">Our Selection</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1C1A]">Featured Gadgets</h2>
          </div>
          <button onClick={() => scrollTo("lagos-products")} className="text-[#C8521A] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all self-start sm:self-auto">
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featured.map((product, i) => (
            <Card3D key={product.id} intensity={12} className="bg-white rounded-2xl overflow-hidden group relative cursor-pointer"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <div className="relative h-48 sm:h-56 overflow-hidden bg-[#F2F1EC]">
                  <motion.img src={product.image} alt={product.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.08 }} transition={{ duration: 0.4 }} />
                  {product.badge && (
                    <motion.span whileHover={{ scale: 1.1, rotate: 2 }}
                      className="absolute top-3 left-3 bg-[#C8521A] text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg">
                      {product.badge}
                    </motion.span>
                  )}
                  <button onClick={e => { e.stopPropagation(); handleWishlist(product); }}
                    className={`absolute top-3 right-3 p-1.5 rounded-full transition-all shadow-md ${isInWishlist(product.id) ? "bg-pink-500 text-white" : "bg-white text-[#9A9A94] hover:text-pink-500"}`}>
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-white" : ""}`} />
                  </button>
                </div>
                <div className="p-4 sm:p-5">
                  <p className="text-xs text-[#C8521A] font-semibold uppercase tracking-wide mb-1">{product.category}</p>
                  <h3 className="font-bold text-base sm:text-lg text-[#1C1C1A] mb-1.5 leading-snug">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(product.rating) ? "fill-[#C8521A] text-[#C8521A]" : "text-[#E5E4DE]"}`} />)}
                    <span className="text-[#9A9A94] text-xs ml-1">({product.reviewCount.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-lg sm:text-xl text-[#1C1C1A]">${product.price}</span>
                      {product.originalPrice && <span className="text-[#9A9A94] text-sm line-through ml-2">${product.originalPrice}</span>}
                    </div>
                    <motion.button onClick={() => handleAddToCart(product)}
                      disabled={product.stock === "Out of Stock"}
                      whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                      className="bg-[#C8521A] disabled:bg-[#E5E4DE] disabled:text-[#9A9A94] text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-[#A8411A] transition-colors shadow-[0_4px_12px_rgba(200,82,26,0.3)]">
                      {product.stock === "Out of Stock" ? "Sold Out" : "Add to Cart"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </Card3D>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="lagos-about" className="bg-[#F2F1EC] py-14 sm:py-20 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 sm:gap-16">
          <motion.div className="flex-1 order-2 lg:order-1 relative" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="absolute -inset-4 bg-[#C8521A]/10 rounded-3xl transform rotate-2 blur-xl" />
            <Card3D intensity={8} className="relative">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=700&q=80" alt="Our Story"
                  className="w-full h-64 sm:h-80 object-cover rounded-2xl shadow-2xl" />
              </motion.div>
            </Card3D>
          </motion.div>
          <motion.div className="flex-1 order-1 lg:order-2 text-center lg:text-left" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="text-[#C8521A] text-sm font-semibold uppercase tracking-widest mb-2 sm:mb-3">Who We Are</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1C1A] mb-4 sm:mb-6 leading-snug">
              Built for Nigerians,<br />by People Who Get It
            </h2>
            <p className="text-[#5A5A54] leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
              XE Tech was born from the frustration of overpriced gadgets and poor after-sales service. We believe every Nigerian deserves access to quality technology without the stress.
            </p>
            <p className="text-[#5A5A54] leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
              Our team tests every product we carry. No middlemen, no markup games — just honest pricing and products that actually work.
            </p>
            <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
              {[{ icon: <Mail className="w-4 h-4" />, text: "hello@xetech.ng" }, { icon: <MessageCircle className="w-4 h-4" />, text: "WhatsApp Support" }].map((item, i) => (
                <motion.a key={i} href="#" whileHover={{ y: -3, scale: 1.03 }}
                  className="flex items-center gap-2 bg-white border border-[#E5E4DE] text-[#5A5A54] hover:text-[#C8521A] hover:border-[#C8521A] px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-sm">
                  {item.icon} {item.text}
                </motion.a>
              ))}
            </div>
            <motion.button onClick={() => scrollTo("lagos-contact")} whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}
              className="bg-[#1C1C1A] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base hover:bg-[#C8521A] transition-colors shadow-lg">
              Talk to Us
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Reviews */}
      <section id="lagos-reviews" className="py-14 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div className="text-center mb-8 sm:mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <p className="text-[#C8521A] text-sm font-semibold uppercase tracking-widest mb-2">What Customers Say</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1C1A]">People Love XE Tech</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { name: "Amaka O.", city: "Lagos", rating: 5, text: "Ordered my earbuds on a Tuesday, had them by Wednesday. No games, no drama. The quality is genuinely top-notch." },
            { name: "Emeka N.", city: "Abuja", rating: 5, text: "I was skeptical ordering online but XE Tech came through. Packaging was clean, product was legit, and customer service actually picked up." },
            { name: "Fatima A.", city: "Kano", rating: 4, text: "Finally a tech store that understands Nigerians. Good prices, good products, and they answered my WhatsApp at 11pm." }
          ].map((r, i) => (
            <Card3D key={i} intensity={10} className="bg-white rounded-2xl p-5 sm:p-6 cursor-default"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }}>
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {Array(r.rating).fill(0).map((_, j) => (
                    <motion.span key={j} initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 0.3 + j * 0.1 }} viewport={{ once: true }}>
                      <Star className="w-4 h-4 fill-[#C8521A] text-[#C8521A]" />
                    </motion.span>
                  ))}
                </div>
                <p className="text-[#5A5A54] text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">"{r.text}"</p>
                <div>
                  <p className="font-bold text-sm text-[#1C1C1A]">{r.name}</p>
                  <p className="text-[#9A9A94] text-xs">{r.city}, Nigeria</p>
                </div>
              </motion.div>
            </Card3D>
          ))}
        </div>
      </section>

      {/* Contact / Newsletter */}
      <section id="lagos-contact" className="py-14 sm:py-20 px-4 sm:px-6 overflow-hidden relative">
        <FloatingOrb size={300} x="70%" y="10%" color="radial-gradient(circle, rgba(200,82,26,0.2) 0%, transparent 70%)" delay={0} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="bg-gradient-to-br from-[#C8521A] to-[#9A3412] rounded-3xl p-8 sm:p-12 shadow-[0_32px_64px_rgba(200,82,26,0.4)] relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 relative z-10">Stay in the Loop</h2>
              <p className="text-white/80 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed relative z-10">
                Get notified about new arrivals, exclusive deals, and tech tips.
              </p>
              {emailSent ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/20 rounded-2xl p-6 text-white relative z-10">
                  <Check className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xl font-bold mb-1">You're in!</p>
                  <p className="text-white/80 text-sm">Check your inbox for a welcome message.</p>
                </motion.div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto relative z-10">
                  <input type="email" placeholder="Enter your email address"
                    className="flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-full bg-white text-[#1C1C1A] placeholder:text-[#9A9A94] focus:outline-none font-medium text-sm sm:text-base shadow-inner" />
                  <motion.button onClick={() => { setEmailSent(true); notify("Subscribed! Welcome to XE Tech.", "success"); }}
                    whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                    className="bg-[#1C1C1A] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-white hover:text-[#1C1C1A] transition-colors text-sm sm:text-base whitespace-nowrap shadow-lg">
                    Subscribe
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1C1C1A] text-[#9A9A94] py-6 sm:py-8 px-4 sm:px-6 text-center border-t-4 border-[#C8521A]">
        <motion.p whileHover={{ scale: 1.05 }} className="font-bold text-base sm:text-lg text-white mb-1 cursor-default">
          XE <span className="text-[#C8521A]">Tech</span>
        </motion.p>
        <p className="text-xs sm:text-sm font-medium text-[#C8521A] mb-2 sm:mb-3">made by XEStudioz</p>
        <p className="text-xs">2026 XE Tech. All rights reserved. Lagos, Nigeria.</p>
      </footer>

      {/* Wishlist Drawer */}
      <AnimatePresence>
        {wishlistOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[120]" onClick={() => setWishlistOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#FAFAF5] border-l border-[#E5E4DE] z-[130] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-[#E5E4DE] bg-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-[#1C1C1A]">Saved Items</h2>
                  {wishlistCount > 0 && <span className="bg-[#C8521A] text-white text-xs font-bold px-2 py-0.5 rounded-full">{wishlistCount}</span>}
                </div>
                <button onClick={() => setWishlistOpen(false)} className="p-2 hover:bg-[#F2F1EC] rounded-lg text-[#5A5A54]"><X className="w-5 h-5" /></button>
              </div>
              {wishlistProducts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="w-16 h-16 bg-[#F2F1EC] rounded-2xl flex items-center justify-center">
                    <Heart className="w-8 h-8 text-[#C5C4BE]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1C1C1A] mb-1">Your wishlist is empty</p>
                    <p className="text-sm text-[#9A9A94]">Save gadgets you love to buy them later.</p>
                  </div>
                  <button onClick={() => { setWishlistOpen(false); scrollTo("lagos-products"); }}
                    className="bg-[#C8521A] text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-[#A8411A] transition-colors">
                    Browse Gadgets
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {wishlistProducts.map(product => (
                    <motion.div key={product.id} layout className="bg-white rounded-2xl border border-[#E5E4DE] p-3 flex items-start gap-3 shadow-sm">
                      <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-[#F2F1EC]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-[#C8521A] font-semibold uppercase tracking-wide mb-0.5">{product.category}</p>
                        <p className="text-sm font-semibold text-[#1C1C1A] line-clamp-1">{product.name}</p>
                        <p className="text-[#C8521A] font-bold text-sm mt-0.5">${product.price}</p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0 items-end">
                        <button onClick={() => toggle(product.id)} className="text-[#C5C4BE] hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { addToCart(product); notify(`${product.name} added to cart`, "success"); }}
                          disabled={product.stock === "Out of Stock"}
                          className="bg-[#C8521A] text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#A8411A] transition-colors whitespace-nowrap disabled:opacity-40">
                          Add to Cart
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <OrderHistory isOpen={orderHistoryOpen} onClose={() => setOrderHistoryOpen(false)} />
      <CheckoutFlow isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      {/* Bottom Nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] sm:hidden" style={{ background: "#1C1C1A", borderTop: "2px solid rgba(200,82,26,0.35)" }}>
        <div className="flex items-center justify-around py-2 px-2" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
          <button onClick={() => scrollTo("lagos-trust")} className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#9A9A94] hover:text-[#C8521A] transition-colors active:scale-95">
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">Home</span>
          </button>
          <button onClick={() => scrollTo("lagos-products")} className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#9A9A94] hover:text-[#C8521A] transition-colors active:scale-95">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">Shop</span>
          </button>
          <button onClick={() => setWishlistOpen(true)} className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#9A9A94] hover:text-[#C8521A] transition-colors active:scale-95 relative">
            <Heart className="w-5 h-5" fill={wishlistCount > 0 ? "#C8521A" : "none"} stroke={wishlistCount > 0 ? "#C8521A" : "currentColor"} />
            {wishlistCount > 0 && <span className="absolute top-0 right-1.5 bg-[#C8521A] text-white text-[8px] font-black min-w-[14px] h-3.5 rounded-full flex items-center justify-center px-0.5 leading-none">{wishlistCount}</span>}
            <span className="text-[9px] font-bold uppercase tracking-wide">Saved</span>
          </button>
          <button onClick={() => setCartOpen(true)} className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#9A9A94] hover:text-[#C8521A] transition-colors active:scale-95 relative">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && <span className="absolute top-0 right-1.5 bg-[#C8521A] text-white text-[8px] font-black min-w-[14px] h-3.5 rounded-full flex items-center justify-center px-0.5 leading-none">{count}</span>}
            <span className="text-[9px] font-bold uppercase tracking-wide">Cart</span>
          </button>
          <button onClick={() => setOrderHistoryOpen(true)} className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#9A9A94] hover:text-[#C8521A] transition-colors active:scale-95">
            <Clock className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">Orders</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
