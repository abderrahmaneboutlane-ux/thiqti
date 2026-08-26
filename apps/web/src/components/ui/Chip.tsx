"use client";

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  variant?: "default" | "brand" | "success" | "warning" | "danger" | "price";
  size?: "sm" | "md";
  removable?: boolean;
}

const variantStyles = {
  default: "chip",
  brand: "chip-brand",
  success: "chip-success",
  warning: "chip-warning",
  danger: "chip-danger",
  price: "chip-price",
};

const selectedStyles = {
  default: "bg-brand-50 border-brand-300 text-brand-700",
  brand: "bg-brand-100 border-brand-300 text-brand-700",
  success: "bg-success-100 border-success-300 text-success-700",
  warning: "bg-warning-100 border-warning-300 text-warning-700",
  danger: "bg-danger-100 border-danger-300 text-danger-700",
  price: "bg-price-100 border-price-300 text-price-700",
};

export default function Chip({
  label,
  selected = false,
  onClick,
  onRemove,
  variant = "default",
  size = "sm",
  removable = false,
}: ChipProps) {
  const sizeClass = size === "sm" ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-xs";
  const baseStyle = selected ? selectedStyles[variant] : variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-all ${onClick ? "cursor-pointer" : ""} ${baseStyle} ${sizeClass}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {label}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-slate-100"
          aria-label={`Retirer ${label}`}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}