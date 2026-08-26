import Logo from "@/components/Logo";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Logo size="md" />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-corporate" />
        <p className="text-sm text-slate-400">Chargement de l&apos;assistant...</p>
      </div>
    </div>
  );
}
