"use client";

interface TagProps {
  type: "positive" | "negative" | "neutral";
  label: string;
  score?: number;
}

const styles = {
  positive: "bg-green-500/10 text-green-400 border-green-500/20",
  negative: "bg-red-500/10 text-red-400 border-red-500/20",
  neutral: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function Tag({ type, label, score }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${styles[type]}`}
    >
      {type === "positive" && (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {type === "negative" && (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {label}
      {score !== undefined && (
        <span className="ml-0.5 opacity-70">{score}</span>
      )}
    </span>
  );
}
