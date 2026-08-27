"use client";

import { X, Plus, Trash2 } from "lucide-react";
import CarImage from "@/components/CarImage";

interface ComparisonPanelProps {
  vehicles: any[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
}

interface SpecRow {
  label: string;
  getValue: (v: any) => string;
  best?: "min" | "max";
  numericKey?: string;
}

const specRows: SpecRow[] = [
  { label: "Prix", getValue: (v) => v.priceFormatted, numericKey: "price", best: "min" },
  { label: "Annee", getValue: (v) => String(v.year), numericKey: "year", best: "max" },
  { label: "Kilometrage", getValue: (v) => v.km?.toLocaleString("fr-FR") + " km", numericKey: "km", best: "min" },
  { label: "Carburant", getValue: (v) => v.fuel },
  { label: "Ville", getValue: (v) => v.city },
  { label: "Score", getValue: (v) => v.score + "%", numericKey: "score", best: "max" },
  { label: "Source", getValue: (v) => v.source },
];

function getBestValue(vehicles: any[], numericKey: string, direction: "min" | "max"): number {
  const values = vehicles.map((v) => v[numericKey]).filter((v) => typeof v === "number");
  if (values.length === 0) return -1;
  return direction === "max" ? Math.max(...values) : Math.min(...values);
}

function CellHighlight({ value, isBest, isWorst }: { value: string; isBest: boolean; isWorst: boolean }) {
  return (
    <td className={`px-4 py-3 text-sm text-center ${
      isBest ? "bg-emerald-50 text-emerald-700 font-bold" :
      isWorst ? "bg-red-50 text-red-700 font-semibold" :
      "text-slate-900"
    }`}>
      {value}
    </td>
  );
}

export default function ComparisonPanel({ vehicles, isOpen, onClose, onRemove }: ComparisonPanelProps) {
  if (!isOpen) return null;

  const maxSlots = 3;
  const filledSlots = vehicles.slice(0, maxSlots);
  const emptySlots = maxSlots - filledSlots.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-3xl max-h-[80vh] overflow-auto rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
        style={{ animation: "comparisonFadeIn 0.3s ease-out" }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            Comparaison ({filledSlots}/{maxSlots})
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-x-auto p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-1/4 px-4 py-3 text-left text-xs font-semibold text-slate-500">Spec</th>
                {filledSlots.map((v) => (
                  <th key={v.id} className="w-1/4 px-4 py-3">
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative h-16 w-24 overflow-hidden rounded-lg bg-slate-50">
                        <CarImage
                          src={v.image}
                          sources={v.photos}
                          alt={`${v.make} ${v.model}`}
                          make={v.make}
                          model={v.model}
                          bodyType={v.bodyType}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-900">{v.make} {v.model}</p>
                        <p className="text-[10px] text-slate-500">{v.year}</p>
                      </div>
                      <button
                        onClick={() => onRemove(v.id)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        aria-label={`Retirer ${v.make} ${v.model}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <th key={`empty-${i}`} className="w-1/4 px-4 py-3">
                    <div className="flex h-full items-center justify-center">
                      <button className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-6 text-slate-400 transition-colors hover:border-corporate hover:text-corporate">
                        <Plus className="h-6 w-6" />
                        <span className="text-xs font-medium">Ajouter</span>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specRows.map((row) => {
                let bestVal: number | undefined;
                let worstVal: number | undefined;
                if (row.numericKey && row.best && filledSlots.length > 1) {
                  bestVal = getBestValue(filledSlots, row.numericKey, row.best);
                  const vals = filledSlots
                    .map((v) => v[row.numericKey!])
                    .filter((v) => typeof v === "number");
                  worstVal = row.best === "max" ? Math.min(...vals) : Math.max(...vals);
                }

                return (
                  <tr key={row.label} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500">{row.label}</td>
                    {filledSlots.map((v) => {
                      const val = row.getValue(v);
                      const numVal = row.numericKey ? v[row.numericKey] : undefined;
                      const isBest = row.best != null && bestVal != null && numVal === bestVal && filledSlots.length > 1;
                      const isWorst = row.best != null && worstVal != null && numVal === worstVal && filledSlots.length > 1 && bestVal !== worstVal;
                      return (
                        <CellHighlight key={v.id} value={val} isBest={isBest} isWorst={isWorst} />
                      );
                    })}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                      <td key={`empty-${i}`} className="px-4 py-3 text-center text-sm text-slate-300">-</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes comparisonFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
