import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, Plus, Minus, Package, ArrowRight, Heart } from "lucide-react";
import { useWishlist } from "../hooks/use-wishlist";
import { products } from "../data/products";
import { useCart } from "../hooks/use-cart";
import { useToastNotify } from "../hooks/use-toast-notify";
import { CheckoutFlow } from "../components/CheckoutFlow";

export function VoltTemplate() {
  const { cart, addToCart, removeFromCart, updateQty, total, count } = useCart();
  const { toasts, notify, dismiss } = useToastNotify();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { wishlist, toggle, isInWishlist, count: wishlistCount } = useWishlist();
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleAdd = (product) => {
    addToCart(product);
    notify(`${product.name} added!`, "success");
  };

  const handleWishlist = (product) => {
    toggle(product.id);
    notify(isInWishlist(product.id) ? "Removed from wishlist" : `${product.name} saved!`, "info");
  };

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 bg-zinc-950 border-l-4 border-[#FF6B00] text-white shadow-xl text-sm font-bold uppercase min-w-[180px] max-w-[260px]">
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="text-zinc-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/50 z-[120]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white border-l-4 border-zinc-950 z-[130] flex flex-col">

              <div className="flex items-center justify-between p-5 border-b-4 border-zinc-950 bg-[#FFD600]">
                <h2 className="text-2xl font-black italic uppercase">Your Gear ({count})</h2>
                <button onClick={() => setCartOpen(false)} className="p-1.5 bg-zinc-950 text-white"><X className="w-5 h-5" /></button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <Package className="w-12 h-12 text-zinc-300" />
                  <p className="font-black uppercase text-xl">Cart Empty</p>
                  <button onClick={() => { setCartOpen(false); scrollTo('volt-products'); }}
                    className="bg-zinc-950 text-white font-black uppercase px-6 py-3 hover:bg-[#FF6B00] transition-colors border-4 border-zinc-950">
                    Browse Gear
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map(({ product, qty }) => (
                      <div key={product.id} className="border-4 border-zinc-950 p-3 flex items-start gap-3 bg-white shadow-[4px_4px_0_0_#FFD600]">
                        <img src={product.image} alt={product.name} className="w-14 h-14 object-cover flex-shrink-0 border-2 border-zinc-950" />
                        <div className="flex-1 min-w-0">
                          <p className="font-black uppercase text-sm leading-tight line-clamp-1">{product.name}</p>
                          <p className="font-bold text-[#FF6B00] text-base">${(product.price * qty).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button onClick={() => removeFromCart(product.id)} className="text-zinc-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                          <div className="flex items-center border-2 border-zinc-950">
                            <button onClick={() => updateQty(product.id, qty - 1)} className="px-2 py-1 hover:bg-[#FFD600]"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="w-8 text-center text-sm font-black">{qty}</span>
                            <button onClick={() => updateQty(product.id, qty + 1)} className="px-2 py-1 hover:bg-[#FFD600]"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t-4 border-zinc-950">
                    <div className="flex justify-between items-center mb-4 border-b-4 border-zinc-950 pb-3">
                      <span className="font-black uppercase text-xl">Total</span>
                      <span className="font-black text-2xl text-[#FF6B00]">${total.toFixed(2)}</span>
                    </div>
                    <button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                      className="w-full bg-zinc-950 text-white font-black uppercase text-lg py-4 hover:bg-[#FF6B00] hover:text-zinc-950 transition-colors border-4 border-zinc-950 flex items-center justify-center gap-2">
                      Checkout <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b-4 border-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex flex-col leading-none cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="text-2xl sm:text-4xl font-black italic tracking-tighter">XE TECH</div>
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-[#FF6B00] leading-none">made by XEStudioz</span>
          </div>

          <div className="hidden md:flex gap-6 lg:gap-8 text-lg lg:text-xl font-bold tracking-wider uppercase">
            <button onClick={() => scrollTo('volt-products')} className="hover:text-[#FF6B00] transition-colors">Gear</button>
            <button onClick={() => scrollTo('volt-promo')} className="hover:text-[#FF6B00] transition-colors">Deals</button>
            <button onClick={() => scrollTo('volt-footer')} className="hover:text-[#FF6B00] transition-colors">Contact</button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setWishlistOpen(true)} className="relative hidden sm:flex items-center gap-1.5 border-2 border-zinc-950 px-3 py-2 font-bold uppercase text-sm hover:bg-[#FFD600] transition-colors">
              <Heart className="w-4 h-4" fill={wishlistCount > 0 ? "currentColor" : "none"} />
              {wishlistCount > 0 && <span className="bg-[#FF6B00] text-white text-xs font-black w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>}
            </button>
            <button onClick={() => setCartOpen(true)} className="flex items-center gap-2 bg-zinc-950 text-white font-bold px-3 sm:px-5 py-2 sm:py-2.5 uppercase text-sm sm:text-base hover:bg-[#FF6B00] transition-colors skew-x-[-10deg]">
              <span className="skew-x-[10deg] flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {count > 0 && <span className="bg-[#FFD600] text-zinc-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">{count}</span>}
              </span>
            </button>
            <button onClick={() => setMenuOpen(true)} className="md:hidden p-1.5 border-2 border-zinc-950"><Menu className="w-5 h-5" /></button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-64 bg-white border-l-4 border-zinc-950 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <span className="text-2xl font-black italic">XE TECH</span>
              <button onClick={() => setMenuOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            {["Gear", "Deals", "Contact"].map((item, i) => (
              <button key={i} onClick={() => scrollTo(item === "Gear" ? "volt-products" : item === "Deals" ? "volt-promo" : "volt-footer")}
                className="text-left text-xl font-black uppercase py-4 border-b-2 border-zinc-200 hover:text-[#FF6B00] transition-colors">{item}</button>
            ))}
            <button onClick={() => { setMenuOpen(false); setCartOpen(true); }} className="mt-6 bg-zinc-950 text-white font-black uppercase py-3 text-lg hover:bg-[#FF6B00] transition-colors border-4 border-zinc-950">
              Cart ({count})
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="pt-16 sm:pt-20 min-h-screen flex items-stretch relative overflow-hidden">
        <div className="absolute inset-0 bg-[#FFD600] w-1/2" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-28 flex flex-col lg:flex-row items-center relative z-10 w-full gap-8 sm:gap-12">
          <motion.div className="flex-1 text-center lg:text-left" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }}>
            <div className="text-lg sm:text-2xl font-bold uppercase tracking-widest mb-3 sm:mb-4 inline-block bg-zinc-950 text-white px-3 sm:px-4 py-1 skew-x-[-10deg]">
              <span className="skew-x-[10deg] block">New Arrival</span>
            </div>
            <h1 className="text-7xl sm:text-8xl md:text-[10rem] lg:text-[12rem] font-black italic leading-[0.85] uppercase mb-6 sm:mb-8">
              Push<br />The<br /><span className="text-[#FF6B00]">Limit</span>
            </h1>
            <button onClick={() => scrollTo('volt-products')} className="bg-zinc-950 text-white text-lg sm:text-2xl font-black uppercase px-8 sm:px-12 py-4 sm:py-6 hover:bg-[#FF6B00] transition-colors skew-x-[-10deg] shadow-[6px_6px_0_0_#FF6B00] sm:shadow-[8px_8px_0_0_#FF6B00]">
              <span className="skew-x-[10deg] block">Shop Now</span>
            </button>
          </motion.div>
          <motion.div className="flex-1 w-full max-w-xs sm:max-w-sm lg:max-w-none mx-auto" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
            <img src="https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=1000&q=80" alt="XE Tech" className="w-full transform -rotate-6 sm:-rotate-12 scale-105 sm:scale-110 drop-shadow-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Ticker */}
      <div className="bg-[#FF6B00] text-zinc-950 py-3 sm:py-4 overflow-hidden border-y-4 border-zinc-950">
        <div className="whitespace-nowrap flex font-black text-2xl sm:text-3xl italic uppercase">
          <span className="mx-4">DOMINATE THE GAME</span><span className="mx-2">•</span>
          <span className="mx-4">UNLEASH POWER</span><span className="mx-2">•</span>
          <span className="mx-4">NEXT GEN TECH</span><span className="mx-2">•</span>
          <span className="mx-4">DOMINATE THE GAME</span><span className="mx-2">•</span>
          <span className="mx-4">UNLEASH POWER</span><span className="mx-2">•</span>
          <span className="mx-4">NEXT GEN TECH</span>
        </div>
      </div>

      {/* Products */}
      <section id="volt-products" className="py-14 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-5xl sm:text-6xl font-black italic uppercase mb-8 sm:mb-12">Hot Drops</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, i) => (
            <motion.div key={product.id} className="group border-4 border-zinc-950 p-4 sm:p-6 relative bg-white hover:bg-zinc-50 transition-colors"
              initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} whileHover={{ scale: 1.03 }} transition={{ delay: i * 0.05 }}>
              {product.badge && (
                <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-[#FFD600] border-4 border-zinc-950 px-3 sm:px-4 py-1.5 sm:py-2 font-black italic text-lg sm:text-xl z-10 rotate-12 group-hover:scale-110 transition-transform">
                  {product.badge}
                </div>
              )}
              <div className="aspect-square bg-zinc-100 border-2 border-zinc-950 mb-4 sm:mb-6 p-3 sm:p-4 overflow-hidden relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" />
                <button onClick={e => { e.stopPropagation(); handleWishlist(product); }}
                  className={`absolute top-1 right-1 p-1.5 border-2 border-zinc-950 transition-all shadow-[2px_2px_0_0_#1a1a1a] ${isInWishlist(product.id) ? "bg-[#FF6B00] text-white" : "bg-white text-zinc-400 hover:bg-[#FFD600] hover:text-zinc-950"}`}>
                  <Heart className="w-3.5 h-3.5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold uppercase leading-none mb-1 sm:mb-2">{product.name}</h3>
              <p className="text-zinc-600 font-sans text-xs sm:text-sm font-medium mb-3 sm:mb-4 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between border-t-2 border-zinc-950 pt-3 sm:pt-4">
                <div>
                  <span className="text-3xl sm:text-4xl font-black">${product.price}</span>
                  {product.originalPrice && <span className="text-zinc-400 text-sm line-through ml-2">${product.originalPrice}</span>}
                </div>
                <button onClick={() => handleAdd(product)} disabled={product.stock === "Out of Stock"}
                  className="bg-zinc-950 text-white px-3 sm:px-4 py-1.5 sm:py-2 font-bold uppercase text-sm hover:bg-[#FF6B00] disabled:bg-zinc-300 transition-colors">
                  Add
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Promo */}
      <section id="volt-promo" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 lg:py-24">
        <div className="bg-zinc-950 text-white p-8 sm:p-16 lg:p-24 border-8 border-[#FFD600] relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 sm:w-1/2 bg-[#FF6B00]" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }} />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
            <div className="max-w-xl w-full">
              <h2 className="text-5xl sm:text-7xl font-black italic uppercase mb-4 sm:mb-6 leading-none">Flash<br />Sale</h2>
              <p className="text-xl sm:text-2xl font-sans text-zinc-300 mb-6 sm:mb-8">48 hours only. Insane drops.</p>
              <div className="flex gap-3 sm:gap-4 font-mono text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">
                <div className="bg-white text-zinc-950 px-3 sm:px-4 py-1.5 sm:py-2">48</div>
                <span className="flex items-center">:</span>
                <div className="bg-white text-zinc-950 px-3 sm:px-4 py-1.5 sm:py-2">00</div>
                <span className="flex items-center">:</span>
                <div className="bg-white text-zinc-950 px-3 sm:px-4 py-1.5 sm:py-2">00</div>
              </div>
              <button onClick={() => scrollTo('volt-products')} className="bg-[#FFD600] text-zinc-950 font-black uppercase text-lg sm:text-2xl px-8 sm:px-12 py-3 sm:py-5 hover:bg-white transition-colors skew-x-[-10deg]">
                <span className="skew-x-[10deg] block">Shop Flash Sale</span>
              </button>
            </div>
            <img src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80" alt="Sale" className="hidden sm:block w-48 sm:w-64 lg:w-80 xl:w-96 transform rotate-12 mix-blend-luminosity hover:mix-blend-normal transition-all" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="volt-footer" className="bg-zinc-950 text-zinc-400 py-8 sm:py-10 px-4 sm:px-6 border-t-4 border-[#FF6B00]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <p className="font-black italic text-xl sm:text-2xl text-white">XE TECH</p>
            <p className="text-xs sm:text-sm font-bold text-[#FF6B00] mt-0.5">made by XEStudioz</p>
          </div>
          <p className="text-xs text-center">2026 XE Tech. All rights reserved.</p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm font-bold uppercase">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>

      {/* Wishlist Drawer */}
      <AnimatePresence>
        {wishlistOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[120]" onClick={() => setWishlistOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 22, stiffness: 180 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white border-l-4 border-zinc-950 z-[130] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b-4 border-zinc-950 bg-[#FFD600]">
                <div>
                  <h2 className="text-2xl font-black italic uppercase">Saved Gear</h2>
                  <p className="text-xs font-bold uppercase">{wishlistCount} item{wishlistCount !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setWishlistOpen(false)} className="bg-zinc-950 text-white p-2 hover:bg-[#FF6B00] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              {wishlistProducts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
                  <div className="text-6xl font-black italic text-zinc-200">0</div>
                  <p className="font-black uppercase text-xl">Nothing Saved Yet</p>
                  <button onClick={() => { setWishlistOpen(false); scrollTo('volt-products'); }}
                    className="bg-zinc-950 text-white font-black uppercase px-8 py-3 hover:bg-[#FF6B00] transition-colors border-4 border-zinc-950 shadow-[4px_4px_0_0_#FFD600]">
                    Browse Gear
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {wishlistProducts.map(product => (
                    <div key={product.id} className="border-4 border-zinc-950 p-3 flex items-start gap-3 bg-white shadow-[4px_4px_0_0_#FFD600] relative">
                      <img src={product.image} alt={product.name} className="w-14 h-14 object-cover border-2 border-zinc-950 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-black uppercase text-sm leading-tight line-clamp-1">{product.name}</p>
                        <p className="font-bold text-[#FF6B00] text-lg">${product.price}</p>
                        {product.stock === "Out of Stock" && <p className="text-red-500 text-xs font-bold">Out of Stock</p>}
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => handleWishlist(product)} className="text-zinc-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                        <button onClick={() => handleAdd(product)}
                          disabled={product.stock === "Out of Stock"}
                          className="bg-zinc-950 text-white text-xs font-black uppercase px-2.5 py-1.5 hover:bg-[#FF6B00] transition-colors border-2 border-zinc-950 disabled:opacity-40">
                          Add
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
    </div>
  );
}
