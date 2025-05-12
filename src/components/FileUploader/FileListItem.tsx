
import React from 'react';
import { File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileFormatLabel from './FileFormatLabel';

interface FileListItemProps {
  file: File;
  index: number;
  validation: { valid: boolean; format: string | null } | undefined;
  onRemove: (index: number) => void;
}

const FileListItem: React.FC<FileListItemProps> = ({ file, index, validation, onRemove }) => {
  return (
    <li className="flex items-center justify-between p-2 bg-muted rounded-md">
      <div className="flex items-center flex-1 min-w-0">
        <File className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
        <div className="truncate">
          <span className="text-sm truncate block">{file.name}</span>
          <div className="flex items-center mt-1">
            <span className="text-xs text-muted-foreground mr-2">
              {(file.size / 1024).toFixed(1)} KB
            </span>
            <FileFormatLabel fileName={file.name} validation={validation} />
          </div>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 rounded-full ml-2 flex-shrink-0" 
        onClick={() => onRemove(index)}
      >
        <X className="h-4 w-4" />
      </Button>
    </li>
  );
};

export default FileListItem;
