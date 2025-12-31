import React from 'react';
import Card from './ui/Card';

const SkeletonLine = ({ className = '' }: { className?: string }) => (
  <div className={`bg-slate-700 rounded-md animate-pulse ${className}`} />
);

const ReportSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Analyzing your performance...</h1>
        <p className="text-slate-400 mt-2">This might take a moment. We're preparing your detailed feedback.</p>
      </header>
      
      <Card>
        <div className="p-6">
          <SkeletonLine className="w-1/2 h-8 mb-6" />
          <div className="space-y-6">
            {/* Skeleton for an individual feedback item */}
            <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-lg">
              <SkeletonLine className="w-3/4 h-7 mb-4" />
              <div className="mt-4 pl-4 border-l-2 border-slate-600 space-y-2">
                <SkeletonLine className="w-1/4 h-5" />
                <SkeletonLine className="w-full h-5" />
                <SkeletonLine className="w-5/6 h-5" />
              </div>
            </div>
            {/* Another skeleton feedback item */}
             <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-lg opacity-60">
              <SkeletonLine className="w-2/3 h-7 mb-4" />
              <div className="mt-4 pl-4 border-l-2 border-slate-600 space-y-2">
                <SkeletonLine className="w-1/4 h-5" />
                <SkeletonLine className="w-full h-5" />
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Skeleton for summary cards */}
      {[...Array(2)].map((_, index) => (
        <Card key={index} className="opacity-50">
          <div className="p-6">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-slate-700 rounded-full mr-4 animate-pulse">
                 <div className="w-6 h-6 bg-slate-600 rounded-full"></div>
              </div>
              <SkeletonLine className="w-1/3 h-8" />
            </div>
            <div className="space-y-3">
                <SkeletonLine className="w-full h-5" />
                <SkeletonLine className="w-11/12 h-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ReportSkeleton;
