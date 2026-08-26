"use client";

interface OptionChipProps {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function OptionChip({ label, selected, disabled, onClick }: OptionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
        selected
          ? "border-corporate bg-corporate text-white shadow-glow"
          : "border-border bg-surface-elevated text-text-muted hover:border-corporate/40 hover:text-text"
      } ${disabled ? "pointer-events-none opacity-40" : ""}`}
    >
      {label}
    </button>
  );
}
