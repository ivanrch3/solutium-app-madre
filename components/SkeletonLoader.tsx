import React from 'react';

// Basic building block
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
);

// Skeleton for the Stat Cards at the top of the dashboard
export const StatsSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-slate-200">
    <Skeleton className="h-3 w-24 mb-3" />
    <Skeleton className="h-8 w-16" />
  </div>
);

// Skeleton for the Application Cards
export const AppCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex flex-col h-full">
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    <div className="space-y-2 flex-1 mb-6">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-4/6" />
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
  </div>
);

// Skeleton for the Header text
export const HeaderSkeleton: React.FC = () => (
  <div className="space-y-3 mb-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
  </div>
);