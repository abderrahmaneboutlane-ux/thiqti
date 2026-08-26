"use client";

import { useState, useRef, useEffect } from "react";
import QuestionBubble from "./QuestionBubble";
import ProgressBar from "./ProgressBar";
import { QUESTIONS, ASSISTANT_CLARIFICATION_PREFIX } from "@/lib/mock-data";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatFlowProps {
  userQuery: string;
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}

export default function ChatFlow({ userQuery, onComplete, onBack }: ChatFlowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: ASSISTANT_CLARIFICATION_PREFIX },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStep]);

  const handleSelect = async (questionId: string, optionId: string, value: string) => {
    setSelectedIds((prev) => ({ ...prev, [questionId]: optionId }));
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    const question = QUESTIONS.find((q) => q.id === questionId);
    const selectedLabel = question?.options.find((o) => o.id === optionId)?.label ?? value;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: selectedLabel },
    ]);

    await new Promise((r) => setTimeout(r, 300));

    const nextStep = currentStep + 1;

    if (nextStep >= QUESTIONS.length) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Parfait, j'ai recu toutes vos reponses." },
      ]);
      await new Promise((r) => setTimeout(r, 500));
      onComplete({ ...answers, [questionId]: value });
    } else {
      setCurrentStep(nextStep);
    }
  };

  return (
    <section className="flex min-h-screen flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="mb-2 rounded-xl border border-border bg-surface-raised px-4 py-3">
            <p className="text-xs font-medium text-text-muted">
              <span className="text-text">Vous :</span> &laquo;{userQuery}&raquo;
            </p>
          </div>

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-corporate text-white"
                    : "bg-surface-elevated text-text border border-border"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {currentStep < QUESTIONS.length && (
            <div className="animate-fade-in">
              <QuestionBubble
                key={QUESTIONS[currentStep].id}
                question={QUESTIONS[currentStep]}
                selectedOptionId={selectedIds[QUESTIONS[currentStep].id] ?? null}
                onSelect={(optId, val) =>
                  handleSelect(QUESTIONS[currentStep].id, optId, val)
                }
              />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border bg-surface px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <ProgressBar current={currentStep} total={QUESTIONS.length} />
        </div>
      </div>
    </section>
  );
}
