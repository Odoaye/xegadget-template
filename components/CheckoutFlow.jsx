import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Check, Truck, Package, CreditCard,
  MapPin, Clock, Banknote, ShoppingBag, Tag, Minus, Plus, Copy,
  Lock, AlertCircle, Gift, StickyNote, History
} from "lucide-react";
import { useCart } from "../hooks/use-cart";
import { useToastNotify } from "../hooks/use-toast-notify";
import { OrderHistory } from "./OrderHistory";

const STEPS = ["cart", "shipping", "delivery", "payment", "confirmation"];
const STEP_LABELS = {
  cart: "Cart", shipping: "Shipping", delivery: "Delivery", payment: "Payment", confirmation: "Done"
};

const DELIVERY_OPTIONS = [
  { id: "standard", name: "Standard Delivery", description: "Regular postal service", days: "5–7 business days", daysNum: 7, price: 5.99, freeAbove: 500 },
  { id: "express", name: "Express Delivery", description: "Priority courier service", days: "2–3 business days", daysNum: 3, price: 14.99 },
  { id: "nextday", name: "Next Day Delivery", description: "Guaranteed next business day", days: "1 business day", daysNum: 1, price: 24.99 },
  { id: "pickup", name: "Store Pickup (Lagos)", description: "Collect from our Ikeja store", days: "Ready same day", daysNum: 0, price: 0 },
];

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States", "Canada", "Other"];

function formatCardNumber(v) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})(?=.)/g, "$1 ");
}
function formatExpiry(v) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}
function getDeliveryDate(daysNum) {
  const d = new Date();
  if (daysNum === 0) return "Today";
  if (daysNum === 1) {
    d.setDate(d.getDate() + 1);
    return "Tomorrow, " + d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  d.setDate(d.getDate() + daysNum);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function ProgressBar({ step }) {
  const visibleSteps = ["cart", "shipping", "delivery", "payment"];
  const current = visibleSteps.indexOf(step);
  if (step === "confirmation") return null;
  return (
    <div className="flex items-center justify-center gap-0 px-4 py-3 sm:py-4 border-b border-[#E5E4DE]">
      {visibleSteps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${i < current ? "bg-[#C8521A] text-white" : i === current ? "bg-[#1C1C1A] text-white ring-2 ring-[#C8521A] ring-offset-1" : "bg-[#E5E4DE] text-[#9A9A94]"}`}>
            {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          <span className={`hidden sm:block text-xs font-semibold ml-1.5 transition-colors ${i === current ? "text-[#1C1C1A]" : i < current ? "text-[#C8521A]" : "text-[#9A9A94]"}`}>
            {STEP_LABELS[s]}
          </span>
          {i < visibleSteps.length - 1 && (
            <div className={`h-0.5 w-6 sm:w-10 mx-1.5 sm:mx-2 rounded-full transition-colors duration-300 ${i < current ? "bg-[#C8521A]" : "bg-[#E5E4DE]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text", required = true, maxLength, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[#5A5A54] uppercase tracking-wide">
        {label}{required && <span className="text-[#C8521A] ml-0.5">*</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} maxLength={maxLength}
        className="w-full px-3.5 py-2.5 bg-white border border-[#E5E4DE] rounded-xl text-sm text-[#1C1C1A] placeholder:text-[#C5C4BE] focus:outline-none focus:border-[#C8521A] focus:ring-2 focus:ring-[#C8521A]/10 transition-all" />
      {hint && <p className="text-[10px] text-[#9A9A94]">{hint}</p>}
    </div>
  );
}

export function CheckoutFlow({ isOpen, onClose }) {
  const { cart, total, count, removeFromCart, updateQty, clearCart } = useCart();
  const { notify } = useToastNotify();

  const [step, setStep] = useState("cart");
  const [direction, setDirection] = useState(1);
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [delivery, setDelivery] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [orderNumber, setOrderNumber] = useState("");
  const [errors, setErrors] = useState({});

  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", country: "Nigeria", zip: "",
  });
  const [cardInfo, setCardInfo] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [giftWrap, setGiftWrap] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);

  const selectedDelivery = DELIVERY_OPTIONS.find(d => d.id === delivery);
  const isFreeDelivery = selectedDelivery.freeAbove != null && total >= selectedDelivery.freeAbove;
  const deliveryCost = isFreeDelivery ? 0 : selectedDelivery.price;
  const promoDiscount = promoApplied ? total * 0.1 : 0;
  const giftWrapCost = giftWrap ? 3.99 : 0;
  const grandTotal = total - promoDiscount + deliveryCost + giftWrapCost;

  const go = useCallback((target) => {
    const from = STEPS.indexOf(step);
    const to = STEPS.indexOf(target);
    setDirection(to > from ? 1 : -1);
    setStep(target);
  }, [step]);

  const validateShipping = () => {
    const e = {};
    if (!shipping.firstName.trim()) e.firstName = "Required";
    if (!shipping.lastName.trim()) e.lastName = "Required";
    if (!shipping.email.trim() || !shipping.email.includes("@")) e.email = "Valid email required";
    if (!shipping.phone.trim()) e.phone = "Required";
    if (!shipping.address.trim()) e.address = "Required";
    if (!shipping.city.trim()) e.city = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    if (paymentMethod !== "card") return true;
    const e = {};
    if (cardInfo.number.replace(/\s/g, "").length < 16) e.cardNumber = "Invalid card number";
    if (!cardInfo.name.trim()) e.cardName = "Required";
    if (cardInfo.expiry.length < 5) e.expiry = "Invalid expiry";
    if (cardInfo.cvv.length < 3) e.cvv = "Invalid CVV";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = () => {
    if (!validatePayment()) return;
    const num = `XE-${Math.floor(Math.random() * 900000 + 100000)}`;
    setOrderNumber(num);
    try {
      const order = {
        id: num, date: new Date().toISOString(),
        items: cart.map(i => ({ name: i.product.name, qty: i.qty, price: i.product.price })),
        total: grandTotal, shipping, delivery: selectedDelivery.name,
        payment: paymentMethod, giftWrap, notes: orderNotes,
      };
      const existing = JSON.parse(localStorage.getItem("xe-orders") || "[]");
      localStorage.setItem("xe-orders", JSON.stringify([order, ...existing].slice(0, 20)));
    } catch {}
    setDirection(1);
    setStep("confirmation");
    notify("Order placed successfully!", "success");
    clearCart();
  };

  const handleClose = () => {
    setStep("cart");
    setPromoInput("");
    setPromoApplied(false);
    setErrors({});
    onClose();
  };

  const updateShipping = (field) => (v) => {
    setShipping(prev => ({ ...prev, [field]: v }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? "-60%" : "60%", opacity: 0 }),
  };

  const CartStep = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <ShoppingBag className="w-16 h-16 text-[#E5E4DE]" />
            <p className="text-[#5A5A54] font-semibold text-lg">Your cart is empty</p>
            <button onClick={handleClose} className="bg-[#C8521A] text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#A8411A] transition-colors">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {cart.map(({ product, qty }) => (
              <div key={product.id} className="bg-[#FAFAF5] border border-[#E5E4DE] rounded-2xl p-3 flex items-start gap-3">
                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-[#F2F1EC]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#C8521A] font-semibold uppercase tracking-wide mb-0.5">{product.category}</p>
                  <p className="text-sm font-semibold text-[#1C1C1A] line-clamp-1 leading-snug">{product.name}</p>
                  <p className="text-[#C8521A] font-bold text-sm mt-1">${(product.price * qty).toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button onClick={() => removeFromCart(product.id)} className="text-[#C5C4BE] hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                  <div className="flex items-center border border-[#E5E4DE] rounded-lg overflow-hidden bg-white">
                    <button onClick={() => updateQty(product.id, qty - 1)} className="px-2 py-1.5 hover:bg-[#F2F1EC] text-[#5A5A54]"><Minus className="w-3 h-3" /></button>
                    <span className="w-7 text-center text-xs font-bold text-[#1C1C1A]">{qty}</span>
                    <button onClick={() => updateQty(product.id, qty + 1)} className="px-2 py-1.5 hover:bg-[#F2F1EC] text-[#5A5A54]"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-[#FAFAF5] border border-[#E5E4DE] rounded-2xl p-4">
              <p className="text-xs font-bold text-[#5A5A54] uppercase tracking-wide mb-2.5 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Promo Code</p>
              <div className="flex gap-2">
                <input value={promoInput} onChange={e => setPromoInput(e.target.value)}
                  placeholder="Enter code (try XETECH10)" disabled={promoApplied}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-[#E5E4DE] rounded-xl text-sm text-[#1C1C1A] placeholder:text-[#C5C4BE] focus:outline-none focus:border-[#C8521A] disabled:bg-[#F2F1EC] disabled:text-[#9A9A94]" />
                {promoApplied ? (
                  <button onClick={() => { setPromoApplied(false); setPromoInput(""); }}
                    className="px-3 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-emerald-600 transition-colors whitespace-nowrap">
                    <Check className="w-3.5 h-3.5" /> Applied
                  </button>
                ) : (
                  <button onClick={() => {
                    if (promoInput.trim().toUpperCase() === "XETECH10") { setPromoApplied(true); notify("10% discount applied!", "success"); }
                    else notify("Invalid promo code", "error");
                  }} className="px-4 bg-[#1C1C1A] hover:bg-[#C8521A] text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap">
                    Apply
                  </button>
                )}
              </div>
              {promoApplied && <p className="text-emerald-600 text-xs font-semibold mt-1.5 flex items-center gap-1"><Check className="w-3 h-3" />10% discount applied</p>}
            </div>

            <div className="bg-white border border-[#E5E4DE] rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#5A5A54]"><span>{count} item{count !== 1 ? "s" : ""}</span><span>${total.toFixed(2)}</span></div>
              {promoApplied && <div className="flex justify-between text-emerald-600 font-medium"><span>Promo (XETECH10)</span><span>-${promoDiscount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-[#9A9A94] text-xs pt-1"><span>Delivery cost calculated next</span><span>—</span></div>
              <div className="flex justify-between font-bold text-base text-[#1C1C1A] pt-1.5 border-t border-[#E5E4DE]">
                <span>Subtotal</span><span>${(total - promoDiscount).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div className="p-4 sm:p-6 border-t border-[#E5E4DE] bg-white">
          <button onClick={() => go("shipping")} className="w-full bg-[#C8521A] hover:bg-[#A8411A] text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
            Proceed to Checkout <ChevronRight className="w-4 h-4" />
          </button>
          <p className="text-center text-[#9A9A94] text-xs mt-2.5 flex items-center justify-center gap-1"><Lock className="w-3 h-3" />Secure 256-bit SSL checkout</p>
        </div>
      )}
    </div>
  );

  const ShippingStep = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="bg-[#C8521A]/5 border border-[#C8521A]/20 rounded-xl p-3 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-[#C8521A] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#5A5A54] leading-relaxed">Enter your delivery address. All fields marked <span className="text-[#C8521A]">*</span> are required.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <InputField label="First Name" value={shipping.firstName} onChange={updateShipping("firstName")} placeholder="John" />
            {errors.firstName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.firstName}</p>}
          </div>
          <div>
            <InputField label="Last Name" value={shipping.lastName} onChange={updateShipping("lastName")} placeholder="Doe" />
            {errors.lastName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.lastName}</p>}
          </div>
          <div className="sm:col-span-2">
            <InputField label="Email Address" type="email" value={shipping.email} onChange={updateShipping("email")} placeholder="john@example.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
          </div>
          <div>
            <InputField label="Phone Number" type="tel" value={shipping.phone} onChange={updateShipping("phone")} placeholder="+234 800 000 0000" />
            {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
          </div>
          <div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#5A5A54] uppercase tracking-wide">Country<span className="text-[#C8521A] ml-0.5">*</span></label>
              <select value={shipping.country} onChange={e => updateShipping("country")(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E4DE] rounded-xl text-sm text-[#1C1C1A] focus:outline-none focus:border-[#C8521A] transition-all">
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="sm:col-span-2">
            <InputField label="Street Address" value={shipping.address} onChange={updateShipping("address")} placeholder="123 Allen Avenue, Ikeja" />
            {errors.address && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.address}</p>}
          </div>
          <div>
            <InputField label="City" value={shipping.city} onChange={updateShipping("city")} placeholder="Lagos" />
            {errors.city && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.city}</p>}
          </div>
          <InputField label="State / Province" value={shipping.state} onChange={updateShipping("state")} placeholder="Lagos State" required={false} />
          <InputField label="ZIP / Postal Code" value={shipping.zip} onChange={updateShipping("zip")} placeholder="100001" required={false} />
        </div>
      </div>

      <div className="p-4 sm:p-6 border-t border-[#E5E4DE] bg-white flex gap-3">
        <button onClick={() => go("cart")} className="flex items-center gap-1.5 px-5 py-3 border-2 border-[#E5E4DE] hover:border-[#1C1C1A] text-[#1C1C1A] rounded-full font-semibold text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => { if (validateShipping()) go("delivery"); }} className="flex-1 bg-[#C8521A] hover:bg-[#A8411A] text-white font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
          Continue to Delivery <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const DeliveryStep = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
        <p className="text-sm text-[#5A5A54]">Choose a delivery option for your order to <span className="font-semibold text-[#1C1C1A]">{shipping.city || "your location"}</span>.</p>
        {DELIVERY_OPTIONS.map(opt => {
          const free = opt.freeAbove != null && total >= opt.freeAbove;
          const price = free ? 0 : opt.price;
          const isSelected = delivery === opt.id;
          return (
            <button key={opt.id} onClick={() => setDelivery(opt.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${isSelected ? "border-[#C8521A] bg-[#C8521A]/5 shadow-sm" : "border-[#E5E4DE] bg-white hover:border-[#C8521A]/40"}`}>
              <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center ${isSelected ? "bg-[#C8521A] text-white" : "bg-[#F2F1EC] text-[#9A9A94]"}`}>
                {opt.id === "standard" && <Truck className="w-5 h-5" />}
                {opt.id === "express" && <Package className="w-5 h-5" />}
                {opt.id === "nextday" && <Clock className="w-5 h-5" />}
                {opt.id === "pickup" && <MapPin className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm text-[#1C1C1A]">{opt.name}</p>
                  {free && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">FREE</span>}
                </div>
                <p className="text-[#9A9A94] text-xs mt-0.5">{opt.description}</p>
                <p className="text-[#C8521A] text-xs font-semibold mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{opt.days}
                  {opt.daysNum > 0 && <span className="text-[#9A9A94] font-normal ml-1">· Est. {getDeliveryDate(opt.daysNum)}</span>}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-base text-[#1C1C1A]">{price === 0 ? "Free" : `$${price.toFixed(2)}`}</p>
                {free && <p className="text-[#9A9A94] text-xs line-through">${opt.price.toFixed(2)}</p>}
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? "border-[#C8521A] bg-[#C8521A]" : "border-[#E5E4DE]"}`}>
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          );
        })}

        <div className="bg-[#F2F1EC] rounded-2xl p-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-[#5A5A54]"><span>Subtotal</span><span>${(total - promoDiscount).toFixed(2)}</span></div>
          <div className="flex justify-between text-[#5A5A54]"><span>Delivery</span><span className={deliveryCost === 0 ? "text-emerald-600 font-semibold" : ""}>{deliveryCost === 0 ? "Free" : `$${deliveryCost.toFixed(2)}`}</span></div>
          <div className="flex justify-between font-bold text-base text-[#1C1C1A] pt-1.5 border-t border-[#D5D4CE]">
            <span>Total</span><span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 border-t border-[#E5E4DE] bg-white flex gap-3">
        <button onClick={() => go("shipping")} className="flex items-center gap-1.5 px-5 py-3 border-2 border-[#E5E4DE] hover:border-[#1C1C1A] text-[#1C1C1A] rounded-full font-semibold text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => go("payment")} className="flex-1 bg-[#C8521A] hover:bg-[#A8411A] text-white font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
          Continue to Payment <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const PaymentStep = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "card", label: "Credit Card", icon: <CreditCard className="w-4 h-4" /> },
            { id: "bank", label: "Bank Transfer", icon: <Banknote className="w-4 h-4" /> },
            { id: "cod", label: "Pay on Delivery", icon: <Package className="w-4 h-4" /> },
          ].map(m => (
            <button key={m.id} onClick={() => setPaymentMethod(m.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${paymentMethod === m.id ? "border-[#C8521A] bg-[#C8521A]/5 text-[#C8521A]" : "border-[#E5E4DE] text-[#9A9A94] hover:border-[#C8521A]/40"}`}>
              {m.icon}
              <span className="text-[10px] sm:text-xs font-bold leading-tight">{m.label}</span>
            </button>
          ))}
        </div>

        {paymentMethod === "card" && (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-[#1C1C1A] to-[#3A3A34] rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden">
              <div className="absolute top-3 right-3 flex gap-1">
                <div className="w-7 h-5 bg-red-500 rounded-sm opacity-90" />
                <div className="w-7 h-5 bg-orange-400 rounded-sm opacity-70 -ml-3" />
              </div>
              <p className="font-mono text-base sm:text-lg tracking-[0.2em] mt-4 mb-3">
                {cardInfo.number || "•••• •••• •••• ••••"}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest">Card Holder</p>
                  <p className="text-sm font-semibold">{cardInfo.name || "YOUR NAME"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/50 uppercase tracking-widest">Expires</p>
                  <p className="text-sm font-semibold">{cardInfo.expiry || "MM/YY"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <InputField label="Card Number" value={cardInfo.number}
                  onChange={v => setCardInfo(p => ({ ...p, number: formatCardNumber(v) }))}
                  placeholder="1234 5678 9012 3456" maxLength={19}
                  hint="We accept Visa, Mastercard, Verve" />
                {errors.cardNumber && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cardNumber}</p>}
              </div>
              <div className="sm:col-span-2">
                <InputField label="Name on Card" value={cardInfo.name}
                  onChange={v => setCardInfo(p => ({ ...p, name: v }))} placeholder="John A. Doe" />
                {errors.cardName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cardName}</p>}
              </div>
              <div>
                <InputField label="Expiry Date" value={cardInfo.expiry}
                  onChange={v => setCardInfo(p => ({ ...p, expiry: formatExpiry(v) }))}
                  placeholder="MM/YY" maxLength={5} />
                {errors.expiry && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.expiry}</p>}
              </div>
              <div>
                <InputField label="CVV" value={cardInfo.cvv}
                  onChange={v => setCardInfo(p => ({ ...p, cvv: v.replace(/\D/g, "").slice(0, 4) }))}
                  placeholder="123" maxLength={4} hint="3-4 digits on back of card" />
                {errors.cvv && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cvv}</p>}
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "bank" && (
          <div className="bg-white border border-[#E5E4DE] rounded-2xl p-4 sm:p-5 space-y-4">
            <p className="text-sm text-[#5A5A54] leading-relaxed">Transfer the exact amount to the account below. Your order will be processed once payment is confirmed (1–2 business hours).</p>
            {[
              { label: "Bank", value: "Access Bank Nigeria" },
              { label: "Account Name", value: "XE Tech Ltd" },
              { label: "Account Number", value: "0123456789" },
              { label: "Amount", value: `$${grandTotal.toFixed(2)} (NGN equivalent)` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-[#F2F1EC] last:border-0 gap-4">
                <div>
                  <p className="text-[10px] text-[#9A9A94] font-semibold uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-bold text-[#1C1C1A]">{value}</p>
                </div>
                {label === "Account Number" && (
                  <button onClick={() => { navigator.clipboard?.writeText(value); notify("Account number copied!", "success"); }}
                    className="flex items-center gap-1.5 text-[#C8521A] text-xs font-bold hover:bg-[#C8521A]/10 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                )}
              </div>
            ))}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-amber-700 text-xs font-semibold">Use your email address as payment reference. Screenshot your receipt and send to orders@xetech.ng</p>
            </div>
          </div>
        )}

        {paymentMethod === "cod" && (
          <div className="space-y-3">
            <div className="bg-white border border-[#E5E4DE] rounded-2xl p-4 sm:p-5 text-center space-y-3">
              <div className="w-14 h-14 bg-[#C8521A]/10 rounded-full flex items-center justify-center mx-auto">
                <Package className="w-7 h-7 text-[#C8521A]" />
              </div>
              <div>
                <p className="font-bold text-[#1C1C1A] text-base">Pay When It Arrives</p>
                <p className="text-[#5A5A54] text-sm mt-1 leading-relaxed">Have the cash ready when our delivery person arrives. We accept cash and mobile money (OPay, Kuda, PalmPay).</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-amber-700 text-xs font-semibold">Note: Pay on Delivery is available within Lagos only. An extra ₦500 handling fee applies.</p>
            </div>
          </div>
        )}

        <button onClick={() => setGiftWrap(g => !g)}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${giftWrap ? "border-[#C8521A] bg-[#C8521A]/5" : "border-[#E5E4DE] bg-white hover:border-[#C8521A]/40"}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${giftWrap ? "bg-[#C8521A] text-white" : "bg-[#F2F1EC] text-[#9A9A94]"}`}>
            <Gift className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-[#1C1C1A]">Add Gift Wrapping</p>
            <p className="text-[#9A9A94] text-xs mt-0.5">Premium gift box with personalized note · <span className="font-semibold text-[#C8521A]">+$3.99</span></p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${giftWrap ? "border-[#C8521A] bg-[#C8521A]" : "border-[#D5D4CE]"}`}>
            {giftWrap && <Check className="w-3 h-3 text-white" />}
          </div>
        </button>

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#5A5A54] uppercase tracking-wide">
            <StickyNote className="w-3.5 h-3.5" /> Order Notes <span className="font-normal text-[#C5C4BE] normal-case tracking-normal">(optional)</span>
          </label>
          <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)}
            placeholder="Delivery instructions, gift message, preferences..."
            rows={3}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E4DE] rounded-xl text-sm text-[#1C1C1A] placeholder:text-[#C5C4BE] focus:outline-none focus:border-[#C8521A] focus:ring-2 focus:ring-[#C8521A]/10 transition-all resize-none" />
        </div>

        <div className="bg-[#F2F1EC] rounded-2xl p-4 space-y-1.5 text-sm">
          <p className="font-bold text-xs text-[#5A5A54] uppercase tracking-wide mb-2.5">Order Summary</p>
          {cart.map(({ product, qty }) => (
            <div key={product.id} className="flex justify-between text-[#5A5A54] gap-2">
              <span className="line-clamp-1 flex-1">{product.name} ×{qty}</span>
              <span className="font-semibold text-[#1C1C1A] flex-shrink-0">${(product.price * qty).toFixed(2)}</span>
            </div>
          ))}
          {promoApplied && <div className="flex justify-between text-emerald-600 pt-1"><span>Promo discount</span><span>-${promoDiscount.toFixed(2)}</span></div>}
          <div className="flex justify-between text-[#5A5A54] pt-1"><span>Delivery ({selectedDelivery.name})</span><span>{deliveryCost === 0 ? "Free" : `$${deliveryCost.toFixed(2)}`}</span></div>
          {giftWrap && <div className="flex justify-between text-[#C8521A]"><span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Gift wrapping</span><span>$3.99</span></div>}
          <div className="flex justify-between font-bold text-base text-[#1C1C1A] pt-2 border-t border-[#D5D4CE]">
            <span>Total</span><span className="text-[#C8521A]">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 border-t border-[#E5E4DE] bg-white space-y-3">
        <button onClick={placeOrder} className="w-full bg-[#C8521A] hover:bg-[#A8411A] text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 text-sm sm:text-base shadow-[0_6px_20px_rgba(200,82,26,0.3)]">
          <Lock className="w-4 h-4" /> Place Order · ${grandTotal.toFixed(2)}
        </button>
        <button onClick={() => go("delivery")} className="w-full flex items-center justify-center gap-1.5 py-2 text-[#9A9A94] hover:text-[#1C1C1A] text-sm font-semibold transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Delivery
        </button>
        <p className="text-center text-[#9A9A94] text-xs flex items-center justify-center gap-1"><Lock className="w-3 h-3" />Your data is encrypted and secure</p>
      </div>
    </div>
  );

  const ConfirmationStep = (
    <div className="flex flex-col items-center justify-start overflow-y-auto p-6 sm:p-10 gap-6 min-h-full">
      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
        className="w-20 h-20 bg-[#C8521A] rounded-2xl flex items-center justify-center shadow-[0_12px_32px_rgba(200,82,26,0.4)]">
        <Check className="w-10 h-10 text-white" />
      </motion.div>

      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1C1A] mb-2">Order Confirmed!</h2>
        <p className="text-[#5A5A54] text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
          Thank you for shopping with XE Tech. Your order is being prepared and will be on its way soon.
        </p>
      </div>

      <div className="bg-white border border-[#E5E4DE] rounded-2xl p-5 w-full max-w-sm space-y-3">
        <div className="flex justify-between items-center pb-2.5 border-b border-[#F2F1EC]">
          <p className="text-xs font-semibold text-[#9A9A94] uppercase tracking-wide">Order Number</p>
          <div className="flex items-center gap-2">
            <p className="font-mono font-bold text-[#C8521A] text-base">{orderNumber}</p>
            <button onClick={() => { navigator.clipboard?.writeText(orderNumber); notify("Copied!", "success"); }}
              className="text-[#C8521A] hover:text-[#A8411A]"><Copy className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#5A5A54]">Estimated Delivery</span>
          <span className="font-bold text-[#1C1C1A]">{delivery === "pickup" ? "Today (Store)" : getDeliveryDate(selectedDelivery.daysNum)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#5A5A54]">Delivery Method</span>
          <span className="font-bold text-[#1C1C1A] text-right max-w-[160px]">{selectedDelivery.name}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#5A5A54]">Amount Paid</span>
          <span className="font-bold text-[#C8521A]">${grandTotal.toFixed(2)}</span>
        </div>
        {shipping.address && (
          <div className="pt-2.5 border-t border-[#F2F1EC]">
            <p className="text-xs text-[#9A9A94] font-semibold uppercase tracking-wide mb-1">Delivering to</p>
            <p className="text-sm font-semibold text-[#1C1C1A]">{shipping.firstName} {shipping.lastName}</p>
            <p className="text-xs text-[#5A5A54]">{shipping.address}, {shipping.city}{shipping.state ? `, ${shipping.state}` : ""}, {shipping.country}</p>
          </div>
        )}
      </div>

      <div className="bg-[#C8521A]/5 border border-[#C8521A]/20 rounded-xl p-4 text-center w-full max-w-sm">
        <p className="text-sm text-[#5A5A54] leading-relaxed">
          A confirmation email has been sent to <span className="font-semibold text-[#1C1C1A]">{shipping.email || "your email"}</span>. Track your order at <span className="text-[#C8521A] font-semibold">xetech.ng/orders</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button onClick={handleClose}
          className="flex-1 bg-[#C8521A] hover:bg-[#A8411A] text-white font-bold px-8 py-3.5 rounded-full transition-colors shadow-[0_6px_20px_rgba(200,82,26,0.3)] text-sm sm:text-base">
          Continue Shopping
        </button>
        <button onClick={() => setOrderHistoryOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border-2 border-[#C8521A] text-[#C8521A] font-bold text-sm hover:bg-[#C8521A]/5 transition-colors">
          <History className="w-4 h-4" /> Orders
        </button>
      </div>

      <OrderHistory isOpen={orderHistoryOpen} onClose={() => setOrderHistoryOpen(false)} />
    </div>
  );

  const stepContent = {
    cart: CartStep, shipping: ShippingStep, delivery: DeliveryStep,
    payment: PaymentStep, confirmation: ConfirmationStep,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" onClick={step !== "confirmation" ? handleClose : undefined} />

          <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[210]">

            <div className="bg-[#FAFAF5] w-full sm:w-auto sm:min-w-[520px] sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-[#E5E4DE]">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E5E4DE] bg-white flex-shrink-0">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1C1C1A]">
                    {step === "confirmation" ? "Order Confirmed" : `Checkout · ${count} item${count !== 1 ? "s" : ""}`}
                  </h2>
                  {step !== "confirmation" && <p className="text-xs text-[#9A9A94] font-medium">{STEP_LABELS[step]}</p>}
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-[#F2F1EC] rounded-xl text-[#9A9A94] hover:text-[#1C1C1A] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-shrink-0 bg-white">
                <ProgressBar step={step} />
              </div>

              <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div key={step} custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="absolute inset-0 flex flex-col">
                    {stepContent[step]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
