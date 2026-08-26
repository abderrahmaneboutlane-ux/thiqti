"use client";

interface ReviewExcerptProps {
  text: string;
  sentiment: "positive" | "negative" | "neutral";
  score?: number;
  maxLines?: number;
}

const sentimentConfig = {
  positive: {
    border: "border-l-green-500",
    bg: "bg-green-500/5",
    badge: "bg-green-500/10 text-green-400",
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  negative: {
    border: "border-l-red-500",
    bg: "bg-red-500/5",
    badge: "bg-red-500/10 text-red-400",
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  neutral: {
    border: "border-l-gray-500",
    bg: "bg-gray-500/5",
    badge: "bg-gray-500/10 text-gray-400",
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ),
  },
};

export default function ReviewExcerpt({
  text,
  sentiment,
  score,
  maxLines = 3,
}: ReviewExcerptProps) {
  const config = sentimentConfig[sentiment];

  return (
    <div
      className={`rounded-xl border-l-2 ${config.border} ${config.bg} p-4`}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${config.badge}`}>
            {config.icon}
            {sentiment === "positive" ? "Positif" : sentiment === "negative" ? "Negatif" : "Neutre"}
          </span>
          {score !== undefined && (
            <span className="text-xs text-gray-500">{score}/10</span>
          )}
        </div>
      </div>
      <p
        className="mt-2 text-sm text-gray-300 italic"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}
