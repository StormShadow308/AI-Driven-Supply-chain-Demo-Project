
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ValidationProgressProps {
  isValidating: boolean;
}

const ValidationProgress: React.FC<ValidationProgressProps> = ({ isValidating }) => {
  if (!isValidating) return null;
  
  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm">Validating files...</span>
        <span className="text-xs text-muted-foreground">Please wait</span>
      </div>
      <Progress value={undefined} className="h-1.5" />
    </div>
  );
};

export default ValidationProgress;
