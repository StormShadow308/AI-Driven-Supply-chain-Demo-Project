import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileIcon, AlertCircle, Info, Eye, CheckCircle, AlertTriangle, Folder, ArrowRight, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { uploadFile, uploadMultipleFiles, getDepartments, uploadMultiFilesWithDepartments } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { detectCsvFormat } from '@/utils/csvParser';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/App';

interface UploadTabProps {
  handleFilesUpload?: (files: File[], department: string) => Promise<void>;
  preselectedDepartment?: string;
}

interface UploadedFileInfo {
  filename: string;
  row_count: number;
  column_count: number;
  columns: string[];
  format: string;
  department: string;
  sample_data?: any[];
}

interface FailedFileInfo {
  filename: string;
  error: string;
  detected_format?: string;
}

const UploadTab: React.FC<UploadTabProps> = ({ handleFilesUpload, preselectedDepartment }) => {
  const navigate = useNavigate();
  const { updatePageState, updateDepartmentState } = useAppState();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(preselectedDepartment || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);
  const [csvPreview, setCsvPreview] = useState<{ content: string, fileName: string } | null>(null);
  const fileReaderRef = useRef<FileReader | null>(null);
  const [showFormatInfo, setShowFormatInfo] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [viewFileInfo, setViewFileInfo] = useState<UploadedFileInfo | null>(null);
  const [failedFiles, setFailedFiles] = useState<FailedFileInfo[]>([]);
  const [invalidDepartmentFiles, setInvalidDepartmentFiles] = useState<FailedFileInfo[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const [currentStep, setCurrentStep] = useState<'select' | 'assign' | 'upload'>('select');
  const [filesWithDetectedFormats, setFilesWithDetectedFormats] = useState<{
    file: File, 
    detectedFormat: string | null, 
    assignedDepartment: string
  }[]>([]);
  const [isDetectingFormats, setIsDetectingFormats] = useState(false);
  const [useAutoDetect, setUseAutoDetect] = useState(true);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getDepartments();
        if (response.success && response.departments) {
          const formattedDepartments = response.departments.map((dept: string) => ({
            id: dept,
            name: dept.charAt(0).toUpperCase() + dept.slice(1)
          }));
          setDepartments(formattedDepartments);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    // Update selectedDepartment when preselectedDepartment prop changes
    if (preselectedDepartment) {
      setSelectedDepartment(preselectedDepartment);
    }
  }, [preselectedDepartment]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFiles = acceptedFiles.filter(file =>
      file.type === 'text/csv' || file.name.endsWith('.csv')
    );

    if (csvFiles.length !== acceptedFiles.length) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Only CSV files are allowed",
      });
    }

    setSelectedFiles(prev => [...prev, ...csvFiles]);
    setUploadError(null);
    setUploadSuccess(false);
    setFailedFiles([]);
    setInvalidDepartmentFiles([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxSize: 5000 * 1024 * 1024  // 5GB max file size
  });

  const removeFile = (index: number) => {
    if (currentStep === 'select') {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    } else if (currentStep === 'assign') {
      setFilesWithDetectedFormats(prev => prev.filter((_, i) => i !== index));
    }
  };

  const detectFileFormats = async () => {
    if (selectedFiles.length === 0) {
      toast({
        variant: "warning",
        title: "No files selected",
        description: "Please select at least one CSV file to continue",
      });
      return;
    }

    setIsDetectingFormats(true);
    
    try {
      const filesWithFormats = await Promise.all(
        selectedFiles.map(async (file) => {
          const format = await readAndDetectFormat(file);
          
          return {
            file,
            detectedFormat: format,
            assignedDepartment: format || (departments.length > 0 ? departments[0].id : 'sales')
          };
        })
      );
      
      setFilesWithDetectedFormats(filesWithFormats);
      setCurrentStep('assign');
      
      toast({
        variant: "info",
        title: "Formats detected",
        description: "Review and adjust departments if needed before uploading",
      });
    } catch (error) {
      console.error('Error detecting formats:', error);
      toast({
        variant: "destructive",
        title: "Detection failed",
        description: "Failed to analyze some files. Please try again.",
      });
    } finally {
      setIsDetectingFormats(false);
    }
  };

  const readAndDetectFormat = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string || '';
          const lines = content.split('\n');
          
          if (lines.length > 0) {
            const headerLine = lines[0];
            const headers = headerLine.split(',').map(h => h.trim());
            const format = detectCsvFormat(headers);
            
            resolve(format === 'unknown' ? null : format);
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('Error reading file:', error);
          resolve(null);
        }
      };
      
      reader.onerror = () => {
        console.error('Error reading file');
        resolve(null);
      };
      
      reader.readAsText(file);
    });
  };

  const updateDepartment = (index: number, department: string) => {
    setFilesWithDetectedFormats(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, assignedDepartment: department } : item
      )
    );
  };

  const autoAssignDepartments = () => {
    setFilesWithDetectedFormats(prev => 
      prev.map(item => {
        let assignedDepartment = item.assignedDepartment;
        
        // Auto-assign based on detected format
        if (item.detectedFormat) {
          switch (item.detectedFormat) {
            case 'sales':
              assignedDepartment = 'sales';
              break;
            case 'inventory':
              assignedDepartment = 'inventory';
              break;
            case 'reviews':
              assignedDepartment = 'reviews';
              break;
            default:
              // Use the existing assigned department
              break;
          }
        }
        
        return { ...item, assignedDepartment };
      })
    );
    
    toast({
      variant: "info",
      title: "Auto-assigned",
      description: "Departments have been assigned based on detected formats",
    });
  };

  const uploadFiles = async () => {
    if (filesWithDetectedFormats.length === 0) {
      toast({
        variant: "warning",
        title: "No files selected",
        description: "Please select at least one CSV file to upload",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadSuccess(false);
    setUploadError(null);
    setUploadedFiles([]);
    setFailedFiles([]);
    setInvalidDepartmentFiles([]);
    
    try {
      // Prepare files with their respective departments
      const filesWithDepartments = filesWithDetectedFormats.map(item => ({
        file: item.file,
        department: item.assignedDepartment
      }));
      
      // Call the API to upload files with department assignments
      const response = await uploadMultiFilesWithDepartments(filesWithDepartments);
      
      if (response.success) {
        setUploadSuccess(true);
        
        if (response.uploaded_files && response.uploaded_files.length > 0) {
          setUploadedFiles(response.uploaded_files);
          
          // Update department states for each successfully uploaded file
          response.uploaded_files.forEach(fileInfo => {
            updateDepartmentState(fileInfo.department, fileInfo.filename);
          });
          
          toast({
            title: "Files Uploaded Successfully",
            description: `${response.uploaded_files.length} files have been uploaded and analyzed.`,
          });
        }
        
        if (response.failed_files && response.failed_files.length > 0) {
          setFailedFiles(response.failed_files);
        }
        
        if (response.invalid_department_files && response.invalid_department_files.length > 0) {
          setInvalidDepartmentFiles(response.invalid_department_files);
        }
        
        // Clear selected files after successful upload
        resetToFileSelection();
        setSelectedFiles([]);
      } else {
        setUploadError(response.error || "Failed to upload files");
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: response.error || "Failed to upload files. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadError("An unexpected error occurred during upload");
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "An unexpected error occurred during upload. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const previewCsv = (file: File) => {
    if (fileReaderRef.current) {
      fileReaderRef.current.abort();
    }

    const reader = new FileReader();
    fileReaderRef.current = reader;

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string || '';
        const lines = content.split('\n').slice(0, 100).join('\n');
        setCsvPreview({
          content: lines,
          fileName: file.name
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to read the file content",
          duration: 2000,
        });
      }
    };

    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to read the file",
        duration: 2000,
      });
    };

    try {
      reader.readAsText(file, 'UTF-8');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to read the file, may be binary or corrupted",
        duration: 2000,
      });
    }
  };

  const viewFileDetails = (fileInfo: UploadedFileInfo) => {
    setViewFileInfo(fileInfo);
  };
  
  const getDepartmentColor = (department: string) => {
    switch (department.toLowerCase()) {
      case 'sales': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inventory': return 'bg-green-100 text-green-800 border-green-200';
      case 'finance': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'hr': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'reviews': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const resetToFileSelection = () => {
    setCurrentStep('select');
    setFilesWithDetectedFormats([]);
  };

  const analyzeFile = (fileInfo: UploadedFileInfo) => {
    // Update the department state for this file
    updateDepartmentState(fileInfo.department, fileInfo.filename);
    
    // Navigate to the file analysis page
    navigate(`/analysis/${fileInfo.department}/${fileInfo.filename}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg sm:text-xl font-semibold">Upload Data Files</h3>
        
        <div className="flex items-center">
          <div className="hidden sm:flex items-center text-sm">
            <span className={`${currentStep === 'select' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              1. Select Files
            </span>
            <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
            <span className={`${currentStep === 'assign' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              2. Assign Departments
            </span>
            <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
            <span className={`${currentStep === 'upload' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              3. Complete
            </span>
          </div>
          <div className="flex sm:hidden">
            <Badge variant={currentStep === 'select' ? 'default' : 'outline'} className="mr-1">1</Badge>
            <Badge variant={currentStep === 'assign' ? 'default' : 'outline'} className="mr-1">2</Badge>
            <Badge variant={currentStep === 'upload' ? 'default' : 'outline'}>3</Badge>
          </div>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {currentStep === 'select' && "Select your CSV files. Files up to 500MB are supported."}
          {currentStep === 'assign' && "Review the detected formats and assign departments before uploading."}
          {currentStep === 'upload' && "Your files have been uploaded successfully."}
        </AlertDescription>
      </Alert>

      {currentStep === 'select' && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium mb-4">Select CSV Files</h3>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-card/60'
            } flex flex-col items-center justify-center cursor-pointer`}
          >
            <input {...getInputProps()} />
            <Upload className={`w-12 h-12 mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-center mb-2">
              {isDragActive ? "Drop the CSV files here" : "Drag & drop CSV files here, or click to select files"}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Only CSV files are supported. Maximum file size: 5 GB
            </p>
          </div>
          
          {selectedFiles.length > 0 && (
            <div>
              <h4 className="text-xs sm:text-sm font-medium mb-2">Selected Files ({selectedFiles.length})</h4>
              <div className="max-h-48 overflow-y-auto border rounded-md">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border-b last:border-0">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <FileIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[250px]">{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => previewCsv(file)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <span aria-hidden="true">×</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button
                  onClick={detectFileFormats}
                  disabled={isDetectingFormats || selectedFiles.length === 0}
                  className="w-full"
                >
                  {isDetectingFormats ? (
                    <>
                      <Spinner className="mr-2" />
                      Analyzing Files...
                    </>
                  ) : (
                    "Continue to Department Assignment"
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {currentStep === 'assign' && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h3 className="text-base sm:text-lg font-medium">Assign Departments</h3>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center space-x-2 text-xs sm:text-sm">
                <input 
                  type="checkbox"
                  checked={useAutoDetect}
                  onChange={(e) => setUseAutoDetect(e.target.checked)}
                  className="checkbox checkbox-sm"
                />
                <span>Auto-detect</span>
              </label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={autoAssignDepartments}
                className="text-xs h-8"
              >
                Auto-assign
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={resetToFileSelection}
                className="text-xs h-8"
              >
                Back
              </Button>
            </div>
          </div>

          {filesWithDetectedFormats.length > 0 ? (
            <div>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">File Name</TableHead>
                        <TableHead className="whitespace-nowrap">Format</TableHead>
                        <TableHead className="whitespace-nowrap">Department</TableHead>
                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filesWithDetectedFormats.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium truncate max-w-[120px] sm:max-w-[250px]">
                            {item.file.name}
                          </TableCell>
                          <TableCell>
                            {item.detectedFormat ? (
                              <Badge variant="outline" className={getDepartmentColor(item.detectedFormat)}>
                                {item.detectedFormat}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs sm:text-sm">Unknown</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={item.assignedDepartment}
                              onValueChange={(value) => updateDepartment(index, value)}
                            >
                              <SelectTrigger className="w-[100px] sm:w-[180px] text-xs sm:text-sm h-8 sm:h-10">
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map(dept => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => previewCsv(item.file)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFile(index)}
                                className="h-8 w-8 p-0"
                              >
                                <span aria-hidden="true">×</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  onClick={uploadFiles}
                  disabled={isUploading || filesWithDetectedFormats.length === 0}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Spinner className="mr-2" />
                      Uploading Files...
                    </>
                  ) : (
                    "Upload Files"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Folder className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No files selected. Go back to add files.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToFileSelection}
                className="mt-4"
              >
                Select Files
              </Button>
            </div>
          )}
        </Card>
      )}

      {currentStep === 'upload' && uploadSuccess && (
        <Card className="p-4 sm:p-6 border-green-200 bg-green-50">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-2" />
            <h3 className="text-base sm:text-lg font-medium text-green-700">Upload Complete</h3>
          </div>
          <p className="text-green-600 mb-4 text-xs sm:text-sm">
            Your files have been successfully uploaded and processed.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                if (uploadedFiles.length > 0 && uploadedFiles[0].department === 'reviews') {
                  navigate('/analytics/reviews');
                } else {
                  navigate('/analytics/sales');
                }
              }}
              variant="secondary"
              className="flex items-center"
            >
              <BarChart2 className="h-4 w-4 mr-2" /> Analyze Now
            </Button>
            <Button
              onClick={resetToFileSelection}
              variant="outline"
            >
              Upload More Files
            </Button>
          </div>
        </Card>
      )}

      {uploadError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {failedFiles.length > 0 && (
        <Card className="p-4 sm:p-6 border-amber-200 bg-amber-50">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <h3 className="text-base sm:text-lg font-medium text-amber-700">Failed Files</h3>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failedFiles.map((file, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-xs sm:text-sm truncate max-w-[150px] sm:max-w-full">
                        {file.filename}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {file.error}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      )}

      {uploadedFiles.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium mb-4">Uploaded Files</h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead className="hidden sm:table-cell">Rows</TableHead>
                    <TableHead className="hidden sm:table-cell">Columns</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadedFiles.map((file, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-full">
                        {file.filename}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                        {file.row_count}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                        {file.column_count}
                      </TableCell>
                      <TableCell className="capitalize text-xs sm:text-sm">
                        <Badge variant="outline" className={getDepartmentColor(file.department)}>
                          {file.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewFileDetails(file)}
                            className="h-8 text-xs whitespace-nowrap"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> View
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => analyzeFile(file)}
                            className="h-8 text-xs whitespace-nowrap"
                          >
                            <BarChart2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Analyze
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      )}

      <Dialog open={!!csvPreview} onOpenChange={(open) => !open && setCsvPreview(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview: {csvPreview?.fileName}</DialogTitle>
            <DialogDescription>
              Showing the first 100 lines of the CSV file
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto flex-1 mt-4">
            <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-md">
              {csvPreview?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewFileInfo} onOpenChange={(open) => !open && setViewFileInfo(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>File Details: {viewFileInfo?.filename}</DialogTitle>
            <DialogDescription>
              Information about the uploaded CSV file
            </DialogDescription>
          </DialogHeader>
          
          {viewFileInfo && (
            <div className="overflow-auto flex-1 mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Rows:</p>
                  <p className="text-sm">{viewFileInfo.row_count}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Columns:</p>
                  <p className="text-sm">{viewFileInfo.column_count}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Format:</p>
                  <p className="text-sm capitalize">{viewFileInfo.format}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Department:</p>
                  <Badge variant="outline" className={getDepartmentColor(viewFileInfo.department)}>
                    {viewFileInfo.department}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Columns:</p>
                <div className="bg-muted rounded-md p-2 overflow-x-auto">
                  <code className="text-xs">
                    {viewFileInfo.columns.join(', ')}
                  </code>
                </div>
              </div>
              
              {viewFileInfo.sample_data && viewFileInfo.sample_data.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Sample Data:</p>
                  <div className="overflow-x-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(viewFileInfo.sample_data[0]).map((key) => (
                            <TableHead key={key}>{key}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewFileInfo.sample_data.map((row, index) => (
                          <TableRow key={index}>
                            {Object.values(row).map((value: any, i) => (
                              <TableCell key={i}>
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadTab;
