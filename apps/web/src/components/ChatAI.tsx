"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Bot, User, Loader } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatAIProps {
  onSearch?: (query: string) => void;
}

export default function ChatAI({ onSearch }: ChatAIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour! Je suis votre assistant automobile. Decrivez-moi la voiture que vous recherchez. Par exemple: \"Je cherche un SUV familial autour de 300 000 DH\" ou \"Dacia Duster essence automatique\".",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("La reconnaissance vocale n'est pas supportee par votre navigateur.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "fr-FR";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Erreur serveur");

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply ?? data.message ?? "Je n'ai pas pu formuler une reponse.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.searchQuery && onSearch) {
        onSearch(data.searchQuery);
      }
    } catch {
      const errorMessage: Message = {
        role: "assistant",
        content: "Desole, une erreur s'est produite. Veuillez reessayer.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex h-[600px] flex-col rounded-xl border border-slate-200 bg-white shadow-corporate overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-200 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-corporate">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Assistant Auto</h3>
          <p className="text-xs text-slate-500">Posez-moi vos questions</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-corporate/5">
                  <Bot className="h-4 w-4 text-corporate" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl px-4 py-3 ${msg.role === "user" ? "bg-corporate text-white rounded-tr-sm" : "bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-sm"}`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <User className="h-4 w-4 text-slate-700" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-corporate/5">
                <Bot className="h-4 w-4 text-corporate" />
              </div>
              <div className="flex items-center gap-2 rounded-xl rounded-tl-sm bg-slate-50 border border-slate-200 px-4 py-3">
                <Loader className="h-4 w-4 animate-spin text-corporate" />
                <span className="text-sm text-slate-500">Reflexion...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Decrivez votre voiture ideale..."
            className="input-field flex-1"
            disabled={isLoading}
          />
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${isListening ? "bg-corporate text-white animate-pulse" : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <button onClick={sendMessage} disabled={!input.trim() || isLoading} className="btn-primary flex h-12 w-12 items-center justify-center">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
