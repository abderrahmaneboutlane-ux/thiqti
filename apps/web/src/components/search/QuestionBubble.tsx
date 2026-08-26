"use client";

import OptionChip from "./OptionChip";
import type { Question } from "@/lib/mock-data";

interface QuestionBubbleProps {
  question: Question;
  selectedOptionId: string | null;
  onSelect: (optionId: string, value: string) => void;
  disabled?: boolean;
}

export default function QuestionBubble({
  question,
  selectedOptionId,
  onSelect,
  disabled,
}: QuestionBubbleProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-raised p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-corporate to-corporate-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-text">{question.question}</p>
      </div>
      <div className="flex flex-wrap gap-2 pl-11">
        {question.options.map((opt) => (
          <OptionChip
            key={opt.id}
            label={opt.label}
            selected={selectedOptionId === opt.id}
            disabled={disabled}
            onClick={() => onSelect(opt.id, opt.value)}
          />
        ))}
      </div>
    </div>
  );
}
