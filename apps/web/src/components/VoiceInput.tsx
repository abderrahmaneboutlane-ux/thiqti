"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

type RecordingState = "idle" | "listening" | "processing" | "error";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

import { motion } from "framer-motion";

export default function VoiceInput({ onTranscript, className = "" }: VoiceInputProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const API = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!API) setIsSupported(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const createRecognition = useCallback(() => {
    const API = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!API) return null;
    const recognition = new API();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "fr-FR";
    recognition.onstart = () => { setState("listening"); timeoutRef.current = setTimeout(() => recognitionRef.current?.stop(), 30000); };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = Array.from(event.results).map((r) => r[0].transcript).join("");
      if (text) onTranscript(text.trim());
    };
    recognition.onerror = () => setState("error");
    recognition.onend = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setState("idle"); };
    return recognition;
  }, [onTranscript]);

  const toggle = useCallback(() => {
    if (!isSupported) return;
    if (state === "listening") { recognitionRef.current?.stop(); setState("processing"); }
    else {
      recognitionRef.current = createRecognition();
      try { recognitionRef.current?.start(); } catch { setState("error"); }
    }
  }, [state, isSupported, createRecognition]);

  if (!isSupported) return null;

  const isActive = state === "listening";
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <button
        onClick={toggle}
        type="button"
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-brand-500/15 text-brand-600 border border-brand-500/30 shadow-sm"
            : state === "error"
              ? "bg-red-50 text-red-500"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
        }`}
        aria-label={isActive ? "Arrêter la dictée vocale" : "Démarrer la dictée vocale"}
      >
        {isActive && <span className="absolute inset-0 animate-ping rounded-xl bg-brand-500/20" />}
        {state === "processing" ? (
          <Loader2 className="h-[18px] w-[18px] animate-spin" />
        ) : isActive ? (
          <Mic className="h-[18px] w-[18px] text-brand-600" />
        ) : state === "error" ? (
          <MicOff className="h-[18px] w-[18px]" />
        ) : (
          <Mic className="h-[18px] w-[18px]" />
        )}
      </button>

      {isActive && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20">
          <div className="flex items-center gap-0.5 h-4">
            {[0.4, 1, 0.6, 0.9, 0.3].map((heightScale, i) => (
              <motion.span
                key={i}
                className="w-1 bg-brand-600 rounded-full"
                animate={{
                  height: ["4px", `${heightScale * 16}px`, "4px"],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-brand-700">Écoute...</span>
        </div>
      )}

      {state === "error" && <span className="text-xs font-medium text-red-500">Micro non autorisé</span>}
    </div>
  );
}
