import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { detectCsvFormat } from '@/utils/csvParser';
import { toast } from '@/hooks/use-toast';
import { amazonCategories } from '@/types/amazonData';
import { FileUploaderProps, FileValidation, FileWithDepartment } from './types';
import DepartmentSelector from './DepartmentSelector';
import DropZone from './DropZone';
import FileListItem from './FileListItem';
import ValidationProgress from './ValidationProgress';
import FormatExamples from './FormatExamples';

const FileUploader = ({ onUpload, onMultiDeptUpload, multiple = false, multiDepartment = false }: FileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [filesWithDepts, setFilesWithDepts] = useState<FileWithDepartment[]>([]);
  const [department, setDepartment] = useState<string>('');
  const [fileValidation, setFileValidation] = useState<{[key: string]: FileValidation}>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  
  useEffect(() => {
    // Set default department if none selected
    if (!department && amazonCategories.length > 0) {
      setDepartment(amazonCategories[0].name);
    }
  }, []);

  const validateFile = useCallback(async (file: File): Promise<FileValidation> => {
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
        
        // Parse headers from the first line
        const headerLine = lines[0];
        const headers = headerLine.split(',').map(h => h.trim());
        const format = detectCsvFormat(headers);
        resolve({valid: format !== null && format !== 'unknown', format});
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
      if (multiDepartment) {
        // For multi-department uploads, add each file with the current department
        const newFilesWithDepts = validFiles.map(file => ({
          file,
          department: department || amazonCategories[0].name,
        }));
        setFilesWithDepts(prev => [...prev, ...newFilesWithDepts]);
      } else {
        // For single department uploads
        setFiles(prev => [...prev, ...validFiles]);
      }
      
      toast({
        title: `${validFiles.length} file${validFiles.length > 1 ? 's' : ''} added`,
        description: "Ready to process when you're ready.",
      });
    }
    
    setIsValidating(false);
  }, [fileValidation, validateFile, department, multiDepartment]);

  const removeFile = (index: number) => {
    if (multiDepartment) {
      setFilesWithDepts(prev => {
        const newFiles = [...prev];
        const removedFile = newFiles[index];
        newFiles.splice(index, 1);
        
        // Remove validation record
        if (removedFile) {
          const newValidation = { ...fileValidation };
          delete newValidation[removedFile.file.name];
          setFileValidation(newValidation);
        }
        
        return newFiles;
      });
    } else {
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
    }
  };

  const updateFileDepartment = (index: number, newDepartment: string) => {
    if (!multiDepartment) return;
    
    setFilesWithDepts(prev => {
      const newFiles = [...prev];
      newFiles[index] = {
        ...newFiles[index],
        department: newDepartment
      };
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (multiDepartment) {
      if (filesWithDepts.length === 0 || isProcessing) return;
      
      setIsProcessing(true);
      
      try {
        if (onMultiDeptUpload) {
          onMultiDeptUpload(filesWithDepts);
        }
        
        // Clear files after successful upload
        setTimeout(() => {
          setFilesWithDepts([]);
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
    } else {
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
    }
  };

  return (
    <div className="space-y-4">
      {!multiDepartment && (
        <div className="grid gap-4 mb-2">
          <DepartmentSelector department={department} setDepartment={setDepartment} />
        </div>
      )}

      {multiDepartment ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium">Add Files with Departments</h3>
            <div className="grid gap-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={autoDetect} 
                    onChange={(e) => setAutoDetect(e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                  <span>Auto-detect departments</span>
                </label>
                
                <DepartmentSelector 
                  label="Default Department"
                  department={department} 
                  setDepartment={setDepartment} 
                />
              </div>
            </div>
          </div>
          <DropZone onDrop={onDrop} multiple={true} />
        </>
      ) : (
        <DropZone onDrop={onDrop} multiple={multiple} />
      )}

      {multiDepartment ? (
        filesWithDepts.length > 0 && (
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium">Selected Files with Departments</label>
            <ul className="space-y-2">
              {filesWithDepts.map((item, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center flex-1 min-w-0 mr-2">
                    <span className="truncate">{item.file.name}</span>
                    {fileValidation[item.file.name] && (
                      <span className="ml-2">
                        {fileValidation[item.file.name].format && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {fileValidation[item.file.name].format}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex-shrink-0 w-1/3">
                    {autoDetect ? (
                      <div className="text-sm text-muted-foreground">
                        Auto-detecting
                        {fileValidation[item.file.name]?.format && (
                          <span className="ml-1 font-medium">(Detected: {fileValidation[item.file.name].format})</span>
                        )}
                      </div>
                    ) : (
                      <DepartmentSelector
                        small
                        department={item.department}
                        setDepartment={(newDept) => updateFileDepartment(index, newDept)}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 p-1 rounded-full hover:bg-muted-foreground/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      ) : (
        files.length > 0 && (
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium">Selected Files</label>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <FileListItem
                  key={index}
                  file={file}
                  index={index}
                  validation={fileValidation[file.name]}
                  onRemove={removeFile}
                />
              ))}
            </ul>
          </div>
        )
      )}

      <ValidationProgress isValidating={isValidating} />

      <div className="flex justify-end space-x-2 mt-4">
        <Button
          type="button"
          disabled={
            (multiDepartment ? filesWithDepts.length === 0 : (files.length === 0 || !department)) || 
            isProcessing || 
            isValidating
          }
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

      <FormatExamples />
    </div>
  );
};

export default FileUploader;
