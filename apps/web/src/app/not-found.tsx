import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-7xl font-extrabold text-slate-200">404</p>
      <h1 className="mb-2 font-serif text-2xl font-bold text-slate-900">
        Page introuvable
      </h1>
      <p className="mb-6 max-w-md text-sm text-slate-500">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
