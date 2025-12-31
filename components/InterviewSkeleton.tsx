import React from 'react';
import Card from './ui/Card';

const SkeletonLine = ({ className = '' }: { className?: string }) => (
  <div className={`bg-slate-700 rounded-md animate-pulse ${className}`} />
);

interface InterviewSkeletonProps {
  title: string;
  subtitle: string;
}

const InterviewSkeleton: React.FC<InterviewSkeletonProps> = ({ title, subtitle }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
        <p className="text-slate-400 mt-2">{subtitle}</p>
      </header>
      
      <Card>
        <div className="p-6">
          <SkeletonLine className="w-1/4 h-5 mb-4" />
          <div className="space-y-3">
            <SkeletonLine className="w-full h-6" />
            <SkeletonLine className="w-3/4 h-6" />
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <SkeletonLine className="w-1/3 h-6" />
            <SkeletonLine className="w-36 h-10" />
          </div>
          <div className="min-h-[100px] p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <SkeletonLine className="w-1/2 h-5" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InterviewSkeleton;
