"use client";

import { useState, useRef, useEffect } from "react";
import { Edit3, X } from "lucide-react";

interface CritereChipProps {
  label: string;
  value: string;
  onEdit?: (label: string, newValue: string) => void;
  onRemove?: (label: string) => void;
  editable?: boolean;
}

export default function CritereChip({ label, value, onEdit, onRemove, editable = true }: CritereChipProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== value) {
      onEdit?.(label, trimmed);
    } else {
      setEditValue(value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  return (
    <span className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs transition-all hover:border-corporate/40 hover:shadow-sm">
      <span className="text-slate-500">{label}:</span>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-20 border-none bg-transparent text-xs font-bold text-corporate outline-none"
        />
      ) : (
        <span className="font-bold text-corporate">{value}</span>
      )}

      {editable && !isEditing && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="ml-0.5 rounded-full p-0.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-corporate"
          aria-label={`Modifier ${label}`}
        >
          <Edit3 className="h-3 w-3" />
        </button>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(label)}
          className="ml-0.5 rounded-full p-0.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
          aria-label={`Retirer ${label}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
