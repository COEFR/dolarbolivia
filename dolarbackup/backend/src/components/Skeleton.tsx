import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-white/[0.04] ${className}`} />
);

export const SkeletonCard: React.FC = () => (
  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="h-4 w-32 rounded" />
    </div>
    <Skeleton className="h-3 w-full rounded" />
    <Skeleton className="h-3 w-3/4 rounded" />
    <div className="flex gap-4 pt-2">
      <Skeleton className="h-8 w-24 rounded-lg" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  </div>
);

export const SkeletonPrice: React.FC = () => (
  <div className="flex flex-col items-center gap-4 pt-10">
    <Skeleton className="h-10 w-48 rounded-xl" />
    <Skeleton className="h-32 w-72 rounded-2xl" />
    <Skeleton className="h-4 w-40 rounded" />
  </div>
);
