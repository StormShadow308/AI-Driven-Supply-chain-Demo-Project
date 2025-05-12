
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}

export const ProgressIndicator = ({
  value,
  className,
  indicatorClassName
}: ProgressIndicatorProps) => {
  return (
    <div className={cn("relative w-full h-2 bg-secondary/20 overflow-hidden rounded-full", className)}>
      <div 
        className={cn("h-full bg-primary transition-all duration-300", indicatorClassName)} 
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default ProgressIndicator;
