
import React from 'react';
import { AlertCircle, Info } from 'lucide-react';

interface FileFormatLabelProps {
  fileName: string;
  validation: {
    valid: boolean;
    format: string | null;
  } | undefined;
}

const FileFormatLabel: React.FC<FileFormatLabelProps> = ({ fileName, validation }) => {
  if (!validation) return null;
  
  if (!validation.valid) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        <AlertCircle className="mr-1 h-3 w-3" />
        Invalid format
      </span>
    );
  }
  
  switch (validation.format) {
    case 'sales':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          <Info className="mr-1 h-3 w-3" />
          Sales data
        </span>
      );
    case 'inventory':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <Info className="mr-1 h-3 w-3" />
          Inventory data
        </span>
      );
    case 'reviews':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
          <Info className="mr-1 h-3 w-3" />
          Review data
        </span>
      );
    default:
      return null;
  }
};

export default FileFormatLabel;
