"use client";

interface SkeletonProps {
  count?: number;
}

function SkeletonCard() {
  return (
    <div className="vehicle-card overflow-hidden">
      <div className="vehicle-image skeleton aspect-[4/3] w-full" />
      <div className="vehicle-info space-y-3 skeleton">
        <div className="h-5 w-2/3 rounded" />
        <div className="h-4 w-1/3 rounded" />
        <div className="h-4 w-full rounded" />
        <div className="h-4 w-3/4 rounded" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 rounded-full" />
          <div className="h-6 w-20 rounded-full" />
          <div className="h-6 w-14 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-24 rounded" />
          <div className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function Skeleton({ count = 6 }: SkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}