"use client";

import { useState, useEffect } from "react";
import { CarFront } from "lucide-react";

interface ChatBubbleProps {
  role: "user" | "assistant";
  children: React.ReactNode;
  isStreaming?: boolean;
  timestamp?: string;
}

function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400"
          style={{
            animation: "typingBounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </span>
  );
}

export default function ChatBubble({ role, children, isStreaming, timestamp }: ChatBubbleProps) {
  const [revealed, setRevealed] = useState(!isStreaming);
  const [displayedChildren, setDisplayedChildren] = useState<React.ReactNode>(children);

  useEffect(() => {
    if (isStreaming) {
      setRevealed(false);
      const timer = setTimeout(() => setRevealed(true), 600);
      return () => clearTimeout(timer);
    }
    setRevealed(true);
  }, [isStreaming]);

  useEffect(() => {
    if (!isStreaming || revealed) {
      setDisplayedChildren(children);
    }
  }, [children, isStreaming, revealed]);

  const isUser = role === "user";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      style={{ animation: "bubbleFadeIn 0.3s ease-out" }}
    >
      {!isUser && (
        <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-50">
          <CarFront className="h-3.5 w-3.5 text-corporate" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-corporate text-white rounded-tr-sm"
            : "bg-white border border-slate-200 text-slate-900 rounded-tl-sm"
        }`}
      >
        {isStreaming && !revealed ? <TypingIndicator /> : displayedChildren}
      </div>

      {timestamp && (
        <span className={`mt-auto ml-2 text-[10px] text-slate-400 ${isUser ? "mr-2" : ""}`}>
          {timestamp}
        </span>
      )}

      <style>{`
        @keyframes bubbleFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
