import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, X, Check } from "lucide-react";

const TEMPLATES = [
  {
    id: "volt",
    name: "Volt",
    tag: "Energetic",
    description: "High-voltage, bold layout with electric yellow & orange accents.",
    accent: "#FF6B00",
    bg: "#FFD600",
  },
  {
    id: "neon",
    name: "Neon Drop",
    tag: "Streetwear",
    description: "Hype-beast dark culture — neon green on obsidian, raw and loud.",
    accent: "#b4ff00",
    bg: "#141414",
  },
  {
    id: "lagos",
    name: "Lagos",
    tag: "Nigerian Minimal",
    description: "Warm terracotta tones and clean editorial layout for everyday shoppers.",
    accent: "#C8521A",
    bg: "#FAFAF5",
  },
  {
    id: "naija",
    name: "XE Store",
    tag: "Full Catalog",
    description: "Full store — search, filter, cart, wishlist & quick view. Production-ready.",
    accent: "#C8521A",
    bg: "#FAFAF5",
  },
];

export function TemplateSwitcher({ active, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (t) => {
    onChange?.(t);
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[100]">
        <button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl bg-zinc-900 text-white hover:bg-zinc-700 border-2 border-zinc-600 flex items-center justify-center transition-colors"
          aria-label="Switch template"
        >
          <Palette className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xs sm:max-w-sm bg-white shadow-2xl z-[120] flex flex-col"
            >
              <div className="p-4 sm:p-6 border-b border-zinc-100 flex items-start justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">XE Tech</h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Choose your template</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
                {TEMPLATES.map((t) => {
                  const isActive = active === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleChange(t.id)}
                      className={`w-full text-left rounded-xl border-2 overflow-hidden transition-all duration-200 ${isActive ? "border-zinc-900 shadow-md" : "border-zinc-100 hover:border-zinc-300"}`}
                    >
                      <div className="h-1.5 sm:h-2 w-full" style={{ backgroundColor: t.accent }} />
                      <div className="p-3 sm:p-4 flex items-start justify-between gap-2 sm:gap-3">
                        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                          <div
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0 mt-0.5 border border-zinc-200"
                            style={{ backgroundColor: t.bg }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span className="font-bold text-sm sm:text-base text-zinc-900 leading-tight">{t.name}</span>
                              <span
                                className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: `${t.accent}22`, color: t.accent }}
                              >
                                {t.tag}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5 sm:mt-1 leading-snug line-clamp-2">{t.description}</p>
                          </div>
                        </div>
                        {isActive && (
                          <div className="flex-shrink-0 mt-1">
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-900" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 sm:p-4 border-t border-zinc-100 text-center">
                <p className="text-[10px] sm:text-xs text-zinc-400">XE Tech · made by XEStudioz</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
