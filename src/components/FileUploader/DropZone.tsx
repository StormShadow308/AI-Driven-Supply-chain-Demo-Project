
import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropzoneOptions, useDropzone } from 'react-dropzone';

interface DropZoneProps {
  onDrop: DropzoneOptions['onDrop'];
  multiple: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onDrop, multiple }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple
  });

  return (
    <div 
      {...getRootProps()} 
      className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-input'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">Drag and drop files here</p>
        <p className="text-xs text-muted-foreground mb-3">
          {multiple ? 'Upload multiple CSV files' : 'Upload a single CSV file'}
        </p>
        <Button type="button" variant="secondary" size="sm">
          Select Files
        </Button>
      </div>
    </div>
  );
};

export default DropZone;
