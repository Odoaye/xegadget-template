import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Clock, ChevronDown, ChevronUp, Gift, StickyNote } from "lucide-react";

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(order.date);
  const paymentLabel = order.payment === "card" ? "Credit Card" : order.payment === "bank" ? "Bank Transfer" : "Pay on Delivery";

  return (
    <div className="bg-white border border-[#E5E4DE] rounded-2xl overflow-hidden shadow-sm">
      <button onClick={() => setExpanded(e => !e)} className="w-full p-4 text-left hover:bg-[#FAFAF5] transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono font-bold text-[#C8521A] text-sm tracking-wide">{order.id}</p>
            <p className="text-[10px] text-[#9A9A94] mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              &nbsp;·&nbsp;
              {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <p className="font-bold text-[#1C1C1A] text-base">${order.total.toFixed(2)}</p>
              <p className="text-[10px] text-[#9A9A94]">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-[#9A9A94]" /> : <ChevronDown className="w-4 h-4 text-[#9A9A94]" />}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">Delivered</span>
          <span className="bg-[#C8521A]/10 text-[#C8521A] text-[10px] font-bold px-2.5 py-0.5 rounded-full">{order.delivery}</span>
          <span className="bg-[#F2F1EC] text-[#5A5A54] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">{paymentLabel}</span>
          {order.giftWrap && (
            <span className="bg-pink-50 text-pink-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-pink-200 flex items-center gap-1">
              <Gift className="w-2.5 h-2.5" /> Gift Wrapped
            </span>
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden border-t border-[#F2F1EC]">
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center gap-3">
                    <span className="text-sm text-[#5A5A54] line-clamp-1 flex-1">{item.name}</span>
                    <span className="text-xs font-semibold text-[#9A9A94] flex-shrink-0">×{item.qty}</span>
                    <span className="text-sm font-bold text-[#1C1C1A] flex-shrink-0">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {(order.shipping.address || order.shipping.city) && (
                <div className="pt-3 border-t border-[#F2F1EC]">
                  <p className="text-[10px] text-[#9A9A94] font-bold uppercase tracking-wide mb-1.5">Shipping Address</p>
                  <p className="text-sm font-semibold text-[#1C1C1A]">{order.shipping.firstName} {order.shipping.lastName}</p>
                  <p className="text-xs text-[#5A5A54]">
                    {[order.shipping.address, order.shipping.city, order.shipping.state, order.shipping.country].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}

              {order.notes && (
                <div className="pt-3 border-t border-[#F2F1EC]">
                  <p className="text-[10px] text-[#9A9A94] font-bold uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <StickyNote className="w-3 h-3" /> Order Notes
                  </p>
                  <p className="text-xs text-[#5A5A54] italic">"{order.notes}"</p>
                </div>
              )}

              <div className="pt-3 border-t border-[#F2F1EC] flex justify-between items-center">
                <span className="text-sm text-[#5A5A54] font-semibold">Order Total</span>
                <span className="text-base font-bold text-[#C8521A]">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OrderHistory({ isOpen, onClose }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    try {
      setOrders(JSON.parse(localStorage.getItem("xe-orders") || "[]"));
    } catch {}
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" onClick={onClose} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FAFAF5] border-l border-[#E5E4DE] z-[210] flex flex-col shadow-2xl">

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E4DE] bg-white flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-[#1C1C1A]">Order History</h2>
                <p className="text-xs text-[#9A9A94] mt-0.5">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[#F2F1EC] rounded-xl text-[#9A9A94] hover:text-[#1C1C1A] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <div className="w-16 h-16 bg-[#F2F1EC] rounded-2xl flex items-center justify-center">
                    <Package className="w-8 h-8 text-[#C5C4BE]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1C1C1A] text-base mb-1">No orders yet</p>
                    <p className="text-sm text-[#9A9A94] max-w-xs mx-auto leading-relaxed">Your order history will appear here after you complete a checkout.</p>
                  </div>
                </div>
              ) : (
                orders.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
