"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatAssistant from "@/components/ChatAssistant";

/**
 * ChatWidget — Floating chat button (FAB) + expandable chat panel.
 * Inspired by Jeep.com/ma chat pattern.
 *
 * - Bottom-right corner, 20px from edges
 * - FAB with pulse animation + "Votre assistant IA" pill
 * - Click opens the ChatAssistant in popup mode (native overlay)
 * - Hidden on /chat, /login, /admin, homepage pages
 */
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPill, setShowPill] = useState(true);
  const pathname = usePathname();

  // Hide on special pages
  if (pathname === "/" || pathname === "/login" || pathname === "/admin" || pathname === "/chat") {
    return null;
  }

  // Hide the pill after 8 seconds, reappear on hover
  useEffect(() => {
    if (isOpen) return;
    const timer = setTimeout(() => setShowPill(false), 8000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <>
      {/* ChatAssistant popup mode — renders its own overlay + panel */}
      <ChatAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* FAB + Pill */}
      <div className="fixed bottom-5 right-5 z-[2147483646] flex items-center gap-3">
        {/* Pill label */}
        <AnimatePresence>
          {showPill && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: 1, duration: 0.3 }}
              className="hidden sm:block"
            >
              <div
                className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-lg transition-shadow hover:shadow-xl"
                onClick={() => { setIsOpen(true); setShowPill(false); }}
              >
                <p className="text-sm font-semibold text-slate-800">Votre assistant IA</p>
                <p className="text-[11px] text-slate-500">Posez votre question</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB Button */}
        <button
          onClick={() => { setIsOpen(!isOpen); setShowPill(false); }}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95"
          aria-label={isOpen ? "Fermer le chat" : "Ouvrir le chat"}
        >
          {/* Pulse rings */}
          {!isOpen && (
            <>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-20" />
              <span className="absolute inline-flex h-full w-[120%] animate-ping rounded-full bg-blue-400 opacity-10" style={{ animationDelay: "0.5s" }} />
            </>
          )}

          {isOpen ? (
            <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </button>
      </div>
    </>
  );
}
