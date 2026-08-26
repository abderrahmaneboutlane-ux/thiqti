"use client";

import {
  SearchX,
  Heart,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";

interface EmptyStateProps {
  type: "no-results" | "no-favorites" | "error-network" | "welcome";
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

const iconMap = {
  "no-results": SearchX,
  "no-favorites": Heart,
  "error-network": AlertTriangle,
  welcome: MessageCircle,
};

const iconColors = {
  "no-results": "text-slate-400",
  "no-favorites": "text-corporate",
  "error-network": "text-red-400",
  welcome: "text-corporate",
};

const bgColors = {
  "no-results": "bg-slate-50",
  "no-favorites": "bg-slate-50",
  "error-network": "bg-red-50",
  welcome: "bg-slate-50",
};

export default function EmptyState({ type, title, description, action }: EmptyStateProps) {
  const Icon = iconMap[type];

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${bgColors[type]}`}>
        <Icon className={`h-8 w-8 ${iconColors[type]}`} />
      </div>
      <h3 className="mb-1.5 text-base font-bold text-slate-900">{title}</h3>
      <p className="mb-6 max-w-xs text-sm text-slate-500 leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
