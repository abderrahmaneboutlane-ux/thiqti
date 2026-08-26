"use client";

interface RecapTag {
  label: string;
  value: string;
}

interface RecapCardProps {
  brand: string;
  answers: RecapTag[];
  onConfirm: () => void;
  onEdit: () => void;
}

export default function RecapCard({ brand, answers, onConfirm, onEdit }: RecapCardProps) {
  const allTags = [{ label: "Marque", value: brand }, ...answers];

  return (
    <div className="rounded-xl border border-corporate/30 bg-surface-raised p-6 shadow-glow">
      <h3 className="mb-4 text-sm font-bold text-text">
        Recapitulatif de votre recherche
      </h3>
      <div className="mb-6 flex flex-wrap gap-2">
        {allTags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 rounded-full border border-corporate/20 bg-corporate/10 px-3 py-1.5 text-xs font-medium text-corporate-700"
          >
            <span className="text-text-faint">{tag.label} :</span>
            {tag.value}
          </span>
        ))}
      </div>
      <p className="mb-5 text-xs text-text-muted">
        Toutes vos reponses sont collectees. Decouvrez les vehicules qui correspondent a votre profil.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-corporate px-4 py-3 text-sm font-semibold text-white transition hover:bg-corporate-700 focus-visible:ring-2 focus-visible:ring-corporate focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
        >
          Voir les vehicules correspondants
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-xl border border-border bg-surface-overlay px-4 py-3 text-sm font-medium text-text-muted transition hover:border-corporate/40 hover:text-text"
        >
          Modifier
        </button>
      </div>
    </div>
  );
}
