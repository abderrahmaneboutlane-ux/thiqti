"use client";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export default function Select({
  label,
  options,
  placeholder,
  error,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-gray-400">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white transition-all focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500/50 focus:ring-red-500/30"
            : "border-white/10 focus:border-primary/50 focus:ring-primary/30"
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" className="bg-dark-800 text-gray-400">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
            className="bg-dark-800 text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
