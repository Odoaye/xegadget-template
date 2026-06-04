import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Heart, X, Home, ShoppingBag, History,
  ArrowRight, Plus, Minus, Package, Check, Instagram, Twitter, Mail
} from "lucide-react";
import { products } from "../data/products";
import { useCart } from "../hooks/use-cart";
import { useWishlist } from "../hooks/use-wishlist";
import { useToastNotify } from "../hooks/use-toast-notify";
import { CheckoutFlow } from "../components/CheckoutFlow";
import { OrderHistory } from "../components/OrderHistory";

const CATEGORIES = ["All", "Smartphones", "Earbuds", "Smartwatches", "Laptops", "Gaming", "Tablets", "Cameras", "Power Banks"];

const SPECS = [
  { label: "100%", sublabel: "Authentic" },
  { label: "2yr", sublabel: "Warranty" },
  { label: "3-day", sublabel: "Delivery" },
  { label: "24/7", sublabel: "Support" },
];

export function NeonTemplate() {
  const { cart, addToCart, removeFromCart, updateQty, total, count } = useCart();
  const { wishlist, toggle, isInWishlist, count: wishlistCount } = useWishlist();
  const { toasts, notify, dismiss } = useToastNotify();

  const [activeCategory, setActiveCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const filtered = activeCategory === "All"
    ? products
    : products.filter(p => p.category === activeCategory);

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleAdd = (product) => {
    addToCart(product);
    notify(`${product.name} copped!`, "success");
  };

  const handleWishlist = (product) => {
    toggle(product.id);
    notify(isInWishlist(product.id) ? "Removed" : "Saved to wishlist", "info");
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#141414] text-[#f0f0f0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Toasts */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 items-center pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="pointer-events-auto flex items-center gap-2.5 px-5 py-3 bg-[#b4ff00] text-black shadow-xl text-sm font-black uppercase border-4 border-black">
              <span>{t.message}</span>
              <button onClick={() => dismiss(t.id)}><X className="w-3.5 h-3.5" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Marquee Ticker */}
      <div className="bg-[#b4ff00] text-black overflow-hidden border-b-4 border-black py-2.5">
        <div className="flex animate-marquee whitespace-nowrap gap-0">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex items-center gap-6 mx-0">
              {["XE_DROP · NEW GEAR JUST DROPPED", "FREE DELIVERY OVER $500", "USE CODE XETECH10 · 10% OFF", "AUTHENTIC. WARRANTIED. FAST.", "XE_DROP · NEW GEAR JUST DROPPED", "FREE DELIVERY OVER $500", "USE CODE XETECH10 · 10% OFF", "AUTHENTIC. WARRANTIED. FAST."].map((text, j) => (
                <span key={j} className="font-black uppercase text-xs sm:text-sm tracking-widest px-6">{text}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="fixed top-[40px] left-0 right-0 z-40 bg-[#141414]/95 backdrop-blur-sm border-b-4 border-[#b4ff00]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex flex-col cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="text-xl sm:text-2xl font-black italic text-[#b4ff00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>XE_DROP</span>
            <span className="text-[9px] font-bold text-[#a0a0a0] uppercase tracking-widest leading-none">made by XEStudioz</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-black uppercase tracking-wider text-[#a0a0a0]">
            <button onClick={() => scrollTo('neon-hero')} className="hover:text-[#b4ff00] transition-colors">Drop</button>
            <button onClick={() => scrollTo('neon-products')} className="hover:text-[#b4ff00] transition-colors">Shop</button>
            <button onClick={() => scrollTo('neon-contact')} className="hover:text-[#b4ff00] transition-colors">Contact</button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setWishlistOpen(true)} className="hidden sm:flex relative items-center gap-1 text-[#a0a0a0] hover:text-[#ff3c6e] transition-colors p-2 border-2 border-[#333] hover:border-[#ff3c6e]">
              <Heart className="w-4 h-4" fill={wishlistCount > 0 ? "#ff3c6e" : "none"} stroke={wishlistCount > 0 ? "#ff3c6e" : "currentColor"} />
              {wishlistCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#ff3c6e] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#141414]">{wishlistCount}</span>}
            </button>
            <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 bg-[#b4ff00] text-black px-3 sm:px-4 py-2 font-black uppercase text-sm border-4 border-black hover:bg-white transition-colors">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && <span className="bg-black text-[#b4ff00] text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">{count}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[190]" onClick={() => setCartOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 150 }}
              className="fixed top-0 right-0 h-full w-full max-w-xs sm:max-w-md bg-[#1e1e1e] border-l-4 sm:border-l-8 border-[#b4ff00] z-[200] flex flex-col">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b-4 border-white bg-[#141414]">
                <div>
                  <h2 className="text-2xl sm:text-4xl font-black italic text-[#b4ff00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>YOUR BAG</h2>
                  <p className="text-white text-xs font-bold uppercase mt-0.5">{count} item{count !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setCartOpen(false)} className="bg-white text-black p-1.5 sm:p-2 hover:bg-[#b4ff00] border-2 border-black transition-colors">
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              {cart.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="bg-black border-4 border-white p-6 sm:p-8 text-center rotate-[-2deg]">
                    <span className="text-2xl sm:text-4xl font-black block mb-2 text-[#b4ff00]">BAG EMPTY!</span>
                    <span className="uppercase font-bold tracking-widest text-xs sm:text-sm">Go cop something.</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {cart.map(({ product, qty }) => (
                      <div key={product.id} className="bg-white text-black border-4 border-black p-3 sm:p-4 shadow-[6px_6px_0px_#b4ff00] relative">
                        <button onClick={() => removeFromCart(product.id)} className="absolute -top-3 -right-3 bg-[#ff3c6e] text-white border-2 border-black p-1">
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <div className="flex gap-2 sm:gap-3">
                          <img src={product.image} alt={product.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover border-2 border-black flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-sm sm:text-base uppercase line-clamp-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{product.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <div className="text-base sm:text-xl font-bold border-2 border-black inline-block px-2 bg-[#f0f0f0]">${(product.price * qty).toFixed(2)}</div>
                              <div className="flex items-center border-2 border-black">
                                <button onClick={() => updateQty(product.id, qty - 1)} className="px-1.5 sm:px-2 py-1 hover:bg-[#b4ff00] text-sm"><Minus className="w-3 h-3" /></button>
                                <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-black">{qty}</span>
                                <button onClick={() => updateQty(product.id, qty + 1)} className="px-1.5 sm:px-2 py-1 hover:bg-[#b4ff00] text-sm"><Plus className="w-3 h-3" /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 sm:p-6 border-t-4 border-white bg-[#141414]">
                    <div className="flex justify-between items-center mb-4 border-b-4 border-[#b4ff00] pb-3">
                      <span className="font-black uppercase text-lg sm:text-2xl">Total</span>
                      <span className="font-black text-xl sm:text-3xl text-[#b4ff00]">${total.toFixed(2)}</span>
                    </div>
                    <button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                      className="w-full bg-[#b4ff00] text-black font-black uppercase text-base sm:text-xl py-3 sm:py-4 border-4 border-black hover:bg-white transition-colors flex items-center justify-center gap-2">
                      Checkout <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section id="neon-hero" className="pt-[96px] sm:pt-[104px] min-h-screen flex items-center relative overflow-hidden bg-[#141414]">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#b4ff00 1px, transparent 1px), linear-gradient(90deg, #b4ff00 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-[#b4ff00] rounded-full blur-[120px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-[#ff3c6e] rounded-full blur-[100px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-block bg-[#ff3c6e] text-white font-black uppercase text-xs sm:text-sm px-3 sm:px-4 py-1.5 border-4 border-black mb-4 sm:mb-6 rotate-[-1deg]">
              🔥 Season Drop 2026
            </div>
            <h1 className="text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px] font-black leading-[0.85] uppercase text-white mb-4 sm:mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif", WebkitTextStroke: "2px #b4ff00" }}>
              XE<br /><span className="text-[#b4ff00]" style={{ WebkitTextStroke: "2px #b4ff00" }}>DROP</span>
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
              <p className="text-base sm:text-xl text-[#a0a0a0] font-bold uppercase max-w-md">
                Premium tech. No cap. 23 products. Delivered to your door.
              </p>
              <button onClick={() => scrollTo('neon-products')} className="bg-[#b4ff00] text-black font-black uppercase text-sm sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-4 border-black hover:bg-white transition-colors flex-shrink-0 flex items-center gap-2">
                Shop Now <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-8">
              {SPECS.map(({ label, sublabel }) => (
                <div key={label} className="border-l-4 border-[#b4ff00] pl-3 sm:pl-4">
                  <p className="text-2xl sm:text-4xl font-black text-white">{label}</p>
                  <p className="text-[#a0a0a0] text-xs sm:text-sm font-bold uppercase tracking-wide">{sublabel}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products */}
      <section id="neon-products" className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <h2 className="text-4xl sm:text-6xl font-black uppercase text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            THE CATALOG
          </h2>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 sm:gap-3 flex-wrap mb-8 sm:mb-10">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 font-black uppercase text-xs sm:text-sm border-4 border-black transition-colors ${activeCategory === cat ? "bg-[#b4ff00] text-black" : "bg-transparent text-[#a0a0a0] border-[#333] hover:border-[#b4ff00] hover:text-[#b4ff00]"}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((product, i) => (
            <motion.div key={product.id}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="group bg-[#1e1e1e] border-4 border-[#333] hover:border-[#b4ff00] transition-all duration-200 relative flex flex-col">
              {product.badge && (
                <div className="absolute top-3 left-3 z-10 bg-[#ff3c6e] text-white text-xs font-black uppercase px-2.5 py-1 border-2 border-black">
                  {product.badge}
                </div>
              )}
              <div className="relative overflow-hidden aspect-square bg-[#111] border-b-4 border-[#333] group-hover:border-[#b4ff00] transition-colors">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <button onClick={e => { e.stopPropagation(); handleWishlist(product); }}
                  className={`absolute top-2 right-2 p-2 border-2 border-black transition-all ${isInWishlist(product.id) ? "bg-[#ff3c6e] text-white" : "bg-[#1e1e1e] text-[#a0a0a0] hover:bg-[#ff3c6e] hover:text-white"}`}>
                  <Heart className="w-3.5 h-3.5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="p-3 sm:p-4 flex flex-col flex-1">
                <p className="text-[#b4ff00] text-[10px] font-black uppercase tracking-widest mb-1">{product.category}</p>
                <h3 className="font-black uppercase text-sm sm:text-base leading-tight mb-2 flex-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{product.name}</h3>
                <div className="flex items-center justify-between border-t-4 border-[#333] pt-3">
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-white">${product.price}</span>
                    {product.originalPrice && <span className="text-[#666] text-xs line-through ml-1.5">${product.originalPrice}</span>}
                  </div>
                  <button onClick={() => handleAdd(product)} disabled={product.stock === "Out of Stock"}
                    className="bg-[#b4ff00] text-black px-3 sm:px-4 py-1.5 sm:py-2 font-black uppercase text-xs sm:text-sm border-2 border-black hover:bg-white disabled:bg-[#333] disabled:text-[#666] transition-colors">
                    {product.stock === "Out of Stock" ? "OOS" : "Cop"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="neon-contact" className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-[#1e1e1e] border-4 border-[#333] p-6 sm:p-8">
            <h3 className="text-2xl sm:text-3xl font-black uppercase mb-6 sm:mb-8 text-[#b4ff00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>HIT US UP</h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-black border-4 border-white px-4 py-3 font-black uppercase text-sm hover:bg-[#b4ff00] hover:text-black transition-colors flex-1 justify-center">
                <Instagram className="w-5 h-5" /> Instagram
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-black border-4 border-white px-4 py-3 font-black uppercase text-sm hover:bg-[#b4ff00] hover:text-black transition-colors flex-1 justify-center">
                <Twitter className="w-5 h-5" /> Twitter
              </a>
            </div>
            <div className="flex items-center gap-3 border-4 border-[#333] p-3 sm:p-4">
              <Mail className="w-5 h-5 text-[#b4ff00] flex-shrink-0" />
              <span className="font-bold text-sm sm:text-base">hello@xedrop.ng</span>
            </div>
            {contactSent ? (
              <div className="mt-4 bg-[#b4ff00] text-black border-4 border-black p-4 text-center font-black uppercase text-sm flex items-center justify-center gap-2">
                <Check className="w-5 h-5" /> Message sent. We'll respond within 24hrs.
              </div>
            ) : (
              <form className="mt-4 sm:mt-6 space-y-3 sm:space-y-4" onSubmit={e => { e.preventDefault(); setContactSent(true); notify("Message sent!", "success"); }}>
                <input required placeholder="NAME" className="w-full bg-[#f0f0f0] border-4 border-black p-3 sm:p-4 font-bold uppercase placeholder:text-[#a0a0a0] focus:outline-none focus:bg-[#b4ff00] text-black text-sm sm:text-base" />
                <input required type="email" placeholder="EMAIL" className="w-full bg-[#f0f0f0] border-4 border-black p-3 sm:p-4 font-bold uppercase placeholder:text-[#a0a0a0] focus:outline-none focus:bg-[#b4ff00] text-black text-sm sm:text-base" />
                <textarea required rows={4} placeholder="MESSAGE" className="w-full bg-[#f0f0f0] border-4 border-black p-3 sm:p-4 font-bold uppercase placeholder:text-[#a0a0a0] focus:outline-none focus:bg-[#b4ff00] resize-none text-black text-sm sm:text-base" />
                <button type="submit" className="w-full bg-black text-white font-black text-lg sm:text-xl uppercase py-3 sm:py-4 border-4 border-black hover:bg-[#ff3c6e] transition-colors flex justify-center items-center gap-2">
                  SEND IT <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </form>
            )}
          </div>

          <div className="bg-[#b4ff00] text-black border-4 border-black p-6 sm:p-8 rotate-1 shadow-[8px_8px_0px_white]">
            <h3 className="text-2xl sm:text-3xl font-black uppercase mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>NEVER MISS A DROP</h3>
            <p className="font-bold mb-4 sm:mb-6 text-sm sm:text-base">Join the cult. Get early access to new releases.</p>
            {newsletterSubscribed ? (
              <div className="bg-black text-white border-4 border-white p-4 text-center font-black uppercase text-sm flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-[#b4ff00]" /> YOU'RE IN. CHECK YOUR INBOX.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <input type="email" placeholder="YOUR EMAIL" className="flex-1 bg-white border-4 border-black p-3 sm:p-4 font-bold uppercase placeholder:text-[#a0a0a0] focus:outline-none text-sm" />
                <button onClick={() => { setNewsletterSubscribed(true); notify("You're in! Watch your inbox.", "success"); }} className="bg-black text-white font-black uppercase px-6 sm:px-8 py-3 sm:py-4 border-4 border-black hover:bg-[#ff3c6e] transition-colors text-sm">
                  JOIN
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t-8 border-[#b4ff00] py-6 sm:py-8 px-4 sm:px-6 text-center">
        <p className="font-black uppercase text-[#b4ff00] tracking-widest text-sm sm:text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>XE_DROP</p>
        <p className="text-[#a0a0a0] text-xs sm:text-sm font-bold mt-1">made by XEStudioz</p>
        <p className="text-[#a0a0a0] text-xs mt-2">2026 XE Tech. All rights reserved.</p>
      </footer>

      {/* Wishlist Drawer */}
      <AnimatePresence>
        {wishlistOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[190]" onClick={() => setWishlistOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 150 }}
              className="fixed top-0 right-0 h-full w-full max-w-xs sm:max-w-md bg-[#1e1e1e] border-l-4 sm:border-l-8 border-[#b4ff00] z-[200] flex flex-col">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b-4 border-white bg-[#141414]">
                <div>
                  <h2 className="text-2xl sm:text-4xl font-black italic text-[#b4ff00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>YOUR SAVES</h2>
                  <p className="text-white text-xs font-bold uppercase mt-0.5">{wishlistCount} item{wishlistCount !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setWishlistOpen(false)} className="bg-white text-black p-1.5 sm:p-2 hover:bg-[#ff3c6e] hover:text-white border-2 border-black transition-colors">
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              {wishlistProducts.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="bg-black border-4 border-white p-6 sm:p-8 text-center rotate-[-2deg]">
                    <span className="text-2xl sm:text-4xl font-black block mb-2 text-[#b4ff00]">NOTHING SAVED!</span>
                    <span className="uppercase font-bold tracking-widest text-xs sm:text-sm">Go save some gear.</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {wishlistProducts.map(product => (
                    <div key={product.id} className="bg-white text-black border-4 border-black p-3 sm:p-4 shadow-[6px_6px_0px_#b4ff00] relative">
                      <button onClick={() => handleWishlist(product)} className="absolute -top-3 -right-3 bg-[#ff3c6e] text-white border-2 border-black p-1">
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <div className="flex gap-2 sm:gap-3">
                        <img src={product.image} alt={product.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover border-2 border-black flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-sm sm:text-base uppercase line-clamp-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{product.name}</h4>
                          <div className="text-base sm:text-xl font-bold border-2 border-black inline-block px-2 bg-[#f0f0f0] mt-1">${product.price}</div>
                          {product.stock === "Out of Stock" && <p className="text-[#ff3c6e] text-xs font-black uppercase mt-1">Out of Stock</p>}
                        </div>
                        <button onClick={() => { handleAdd(product); }}
                          disabled={product.stock === "Out of Stock"}
                          className="self-end bg-[#b4ff00] text-black border-2 border-black px-3 py-1.5 font-black uppercase text-xs hover:bg-[#ff3c6e] hover:text-white transition-colors whitespace-nowrap disabled:opacity-40">
                          Cop It
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CheckoutFlow isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <OrderHistory isOpen={orderHistoryOpen} onClose={() => setOrderHistoryOpen(false)} />

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-[150] sm:hidden bg-[#141414] border-t-4 border-[#b4ff00] flex items-stretch">
        {[
          { icon: <Home className="w-5 h-5" />, label: "Home", action: () => scrollTo('neon-hero') },
          { icon: <ShoppingBag className="w-5 h-5" />, label: "Shop", action: () => scrollTo('neon-products') },
          { icon: <Heart className="w-5 h-5" fill={wishlistCount > 0 ? "#ff3c6e" : "none"} stroke={wishlistCount > 0 ? "#ff3c6e" : "currentColor"} />, label: "Saved", badge: wishlistCount, action: () => setWishlistOpen(true) },
          { icon: <ShoppingCart className="w-5 h-5" />, label: "Cart", badge: count, action: () => setCartOpen(true) },
          { icon: <History className="w-5 h-5" />, label: "Orders", action: () => setOrderHistoryOpen(true) },
        ].map(({ icon, label, badge, action }) => (
          <button key={label} onClick={action}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative hover:bg-[#b4ff00]/10 transition-colors active:bg-[#b4ff00]/20">
            <span className="relative">
              {icon}
              {badge && badge > 0 ? <span className="absolute -top-1.5 -right-1.5 bg-[#ff3c6e] text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-[#141414]">{badge}</span> : null}
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider text-[#f0f0f0]">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
