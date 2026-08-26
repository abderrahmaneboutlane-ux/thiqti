"use client";

interface SkeletonCardProps {
  variant?: "inline" | "full";
}

export default function SkeletonCard({ variant = "inline" }: SkeletonCardProps) {
  if (variant === "full") {
    return (
      <div className="liquid-glass relative overflow-hidden rounded-xl p-4 shadow-elev-1">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
        <div className="h-48 w-full rounded-xl bg-slate-200/50" />
        <div className="mt-4 space-y-3">
          <div className="h-5 w-2/3 rounded-lg bg-slate-200/50" />
          <div className="h-4 w-1/3 rounded-lg bg-slate-200/50" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-16 rounded-full bg-slate-200/50" />
            <div className="h-6 w-20 rounded-full bg-slate-200/50" />
            <div className="h-6 w-14 rounded-full bg-slate-200/50" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="h-6 w-24 rounded-lg bg-slate-200/50" />
            <div className="h-8 w-20 rounded-lg bg-slate-200/50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="liquid-glass relative overflow-hidden rounded-xl p-3 shadow-elev-1">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-28 w-full shrink-0 rounded-lg bg-slate-200/50 sm:h-24 sm:w-32" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 w-3/4 rounded bg-slate-200/50" />
          <div className="h-3 w-1/2 rounded bg-slate-200/50" />
          <div className="flex gap-2 pt-2">
            <div className="h-5 w-14 rounded-full bg-slate-200/50" />
            <div className="h-5 w-16 rounded-full bg-slate-200/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
