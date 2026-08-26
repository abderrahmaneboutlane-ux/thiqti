"use client";

import VehicleCard from "./VehicleCard";
import RecapCard from "./RecapCard";
import { MOCK_VEHICLES, QUESTIONS } from "@/lib/mock-data";

interface ResultsStateProps {
  brand: string;
  answers: Record<string, string>;
  onEdit: () => void;
}

function getRecapTags(brand: string, answers: Record<string, string>) {
  return QUESTIONS.map((q) => {
    const value = answers[q.id] ?? "";
    const option = q.options.find((o) => o.value === value);
    return { label: q.category, value: option?.label ?? value };
  }).filter((t) => t.value);
}

export default function ResultsState({ brand, answers, onEdit }: ResultsStateProps) {
  const recapTags = getRecapTags(brand, answers);

  const sortedVehicles = [...MOCK_VEHICLES].sort(
    (a, b) => b.matchPercent - a.matchPercent
  );

  return (
    <section className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <RecapCard
            brand={brand}
            answers={recapTags}
            onConfirm={() => {}}
            onEdit={onEdit}
          />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text">
            {sortedVehicles.length} vehicules trouves
          </h2>
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-medium text-corporate transition hover:text-corporate-700 focus-visible:ring-2 focus-visible:ring-corporate"
          >
            Modifier la recherche
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sortedVehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </div>
    </section>
  );
}
