
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, File, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { amazonCategories } from '@/types/amazonData';
import { detectCsvFormat } from '@/utils/csvParser';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface FileUploaderProps {
  onUpload: (files: File[], department: string) => void;
  multiple?: boolean;
  categories?: string[];
}

const FileUploader = ({ onUpload, multiple = false }: FileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [department, setDepartment] = useState<string>('');
  const [fileValidation, setFileValidation] = useState<{[key: string]: {valid: boolean, format: string | null}}>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const categories = amazonCategories.map(cat => cat.name);
  
  useEffect(() => {
    // Set default department if none selected
    if (!department && categories.length > 0) {
      setDepartment(categories[0]);
    }
  }, [categories]);

  const validateFile = useCallback(async (file: File): Promise<{valid: boolean, format: string | null}> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (!event.target || typeof event.target.result !== 'string') {
          resolve({valid: false, format: null});
          return;
        }
        
        const content = event.target.result;
        const lines = content.split('\n');
        
        if (lines.length < 2) {
          resolve({valid: false, format: null});
          return;
        }
        
        const format = detectCsvFormat(lines[0]);
        resolve({valid: format !== null, format});
      };
      
      reader.onerror = () => {
        resolve({valid: false, format: null});
      };
      
      reader.readAsText(file);
    });
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsValidating(true);
    
    // Validate each file
    const validationPromises = acceptedFiles.map(async (file) => {
      const result = await validateFile(file);
      return { file, result };
    });
    
    const validatedFiles = await Promise.all(validationPromises);
    const newFileValidation = { ...fileValidation };
    
    // Update file validation state
    validatedFiles.forEach(({ file, result }) => {
      newFileValidation[file.name] = result;
    });
    
    setFileValidation(newFileValidation);
    
    // Only add valid files
    const validFiles = validatedFiles
      .filter(({ result }) => result.valid)
      .map(({ file }) => file);
    
    if (validFiles.length !== acceptedFiles.length) {
      const invalidCount = acceptedFiles.length - validFiles.length;
      toast({
        title: `${invalidCount} file${invalidCount > 1 ? 's' : ''} invalid`,
        description: "Only files in the expected CSV format can be processed.",
        variant: "destructive"
      });
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast({
        title: `${validFiles.length} file${validFiles.length > 1 ? 's' : ''} added`,
        description: "Ready to process when you're ready.",
      });
    }
    
    setIsValidating(false);
  }, [fileValidation, validateFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple
  });

  const removeFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const removedFile = newFiles[index];
      newFiles.splice(index, 1);
      
      // Remove validation record
      if (removedFile) {
        const newValidation = { ...fileValidation };
        delete newValidation[removedFile.name];
        setFileValidation(newValidation);
      }
      
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0 || !department || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      onUpload(files, department);
      
      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
        setFileValidation({});
        setIsProcessing(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error during upload:', error);
      setIsProcessing(false);
      
      toast({
        title: "Upload failed",
        description: "There was an error processing your files.",
        variant: "destructive"
      });
    }
  };

  const getFileFormatLabel = (fileName: string) => {
    const validation = fileValidation[fileName];
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

  return (
    <div className="space-y-4">
      <div className="grid gap-4 mb-2">
        <div>
          <Label htmlFor="department">Select Department</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger id="department">
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => {
                const displayName = amazonCategories.find(c => c.name === cat)?.displayName || cat.replace(/_/g, ' ');
                return (
                  <SelectItem key={cat} value={cat}>{displayName}</SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

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

      {files.length > 0 && (
        <div className="space-y-2 mt-4">
          <Label>Selected Files</Label>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <div className="flex items-center flex-1 min-w-0">
                  <File className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-sm truncate block">{file.name}</span>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-muted-foreground mr-2">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      {getFileFormatLabel(file.name)}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full ml-2 flex-shrink-0" 
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isValidating && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Validating files...</span>
            <span className="text-xs text-muted-foreground">Please wait</span>
          </div>
          <Progress value={undefined} className="h-1.5" />
        </div>
      )}

      <div className="flex justify-end space-x-2 mt-4">
        <Button
          type="button"
          disabled={files.length === 0 || !department || isProcessing || isValidating}
          onClick={handleUpload}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : 'Upload and Process'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="border rounded p-3">
          <img 
            src="/lovable-uploads/7c443840-1e9a-4f71-86d4-11b63099b7ea.png" 
            alt="Sales Data Format" 
            className="w-full h-auto rounded-md border mb-2"
          />
          <h4 className="text-sm font-medium">Sales Data Format</h4>
          <p className="text-xs text-muted-foreground">
            Transaction records with customer and product details
          </p>
        </div>
          
        <div className="border rounded p-3">
          <img 
            src="/lovable-uploads/523bf1ad-1295-45ea-b505-e2e842e2c3bf.png" 
            alt="Inventory Data Format" 
            className="w-full h-auto rounded-md border mb-2"
          />
          <h4 className="text-sm font-medium">Inventory Data Format</h4>
          <p className="text-xs text-muted-foreground">
            Stock levels and product inventory information
          </p>
        </div>
          
        <div className="border rounded p-3">
          <img 
            src="/lovable-uploads/28f882af-011b-4ac6-989d-f2849c62bc55.png" 
            alt="Review Data Format" 
            className="w-full h-auto rounded-md border mb-2"
          />
          <h4 className="text-sm font-medium">Review Data Format</h4>
          <p className="text-xs text-muted-foreground">
            Customer reviews and ratings for products
          </p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>CSV Format Requirements</AlertTitle>
        <AlertDescription>
          <p className="mb-2">Please ensure your CSV files match one of these formats shown in the images above:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Sales Data:</strong> Headers must include transaction_id, timestamp, customer_id, etc.</li>
            <li><strong>Inventory Data:</strong> Headers must include store_id, inventory_level, units_sold, etc.</li>
            <li><strong>Reviews Data:</strong> Headers must include asin, review_text, overall, etc.</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default FileUploader;
