import Link from "next/link";
import { Car } from "lucide-react";

export default function VehicleNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Car className="h-8 w-8 text-slate-400" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">
        Véhicule introuvable
      </h2>
      <p className="max-w-md text-center text-sm text-slate-500">
        Ce véhicule n&apos;existe pas ou a été retiré du catalogue.
      </p>
      <Link
        href="/results"
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700"
      >
        Parcourir les véhicules
      </Link>
    </div>
  );
}
