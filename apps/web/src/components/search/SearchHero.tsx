"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";

interface SearchHeroProps {
  onSubmit: (query: string) => void;
}

export default function SearchHero({ onSubmit }: SearchHeroProps) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) return;
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionConstructor();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "fr-FR";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((r) => r[0].transcript).join("");
      setQuery(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);
    onSubmit(trimmed);
  };

  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl text-center">
        <h1 className="mb-4 text-h1 md:text-display">
          Decrivez la voiture que vous cherchez,
          <br />
          <span className="text-brand">comme a un ami.</span>
        </h1>
        <p className="mb-10 text-body-lg text-muted">
          Un seul champ, pas de filtres compliques. L&apos;IA s&apos;occupe du reste.
        </p>

        <div className="search-bar" role="search">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSubmit(); }}
            placeholder="Ex : Je veux une voiture pour la famille, autour de 200 000 DH..."
            className="search-input"
            disabled={isLoading}
            aria-label="Decrivez la voiture recherchee"
          />

          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
            className={`btn btn-ghost btn-icon ${isListening ? "bg-brand-50 text-brand-600" : "text-muted hover:text-brand-600"}`}
            aria-label={isListening ? "Arreter l'ecoute" : "Saisie vocale"}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading}
            className="btn btn-primary btn-icon"
            aria-label="Envoyer"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </section>
  );
}