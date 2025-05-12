export interface FileUploaderProps {
  onUpload: (files: File[], department: string) => void;
  onMultiDeptUpload?: (filesWithDepts: FileWithDepartment[]) => void;
  multiple?: boolean;
  multiDepartment?: boolean;
  categories?: string[];
}

export interface FileValidation {
  valid: boolean;
  format: string | null;
}

export interface FileWithDepartment {
  file: File;
  department: string;
}

export interface FileWithValidation {
  file: File;
  validation: FileValidation;
}
