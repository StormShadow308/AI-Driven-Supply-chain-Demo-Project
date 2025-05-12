import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import FileAnalysisComponent from '@/components/FileAnalysis';
import { useAppState } from '@/App';

const FileAnalysisPage: React.FC = () => {
  const { department, fileId } = useParams<{ department: string; fileId: string }>();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const { updateDepartmentState } = useAppState();
  
  // Check for mobile viewport
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
  
  // Store the current analysis info in global state
  useEffect(() => {
    if (department && fileId) {
      console.log(`FileAnalysis: Setting department state - department: ${department}, fileId: ${fileId}`);
      updateDepartmentState(department, fileId);
    }
  }, [department, fileId, updateDepartmentState]);
  
  // Redirect if no department or fileId
  useEffect(() => {
    if (!department || !fileId) {
      navigate('/upload');
    }
  }, [department, fileId, navigate]);
  
  if (!department || !fileId) {
    return (
      <Alert>
        <AlertTitle>Missing Parameters</AlertTitle>
        <AlertDescription>
          Department and file ID are required for analysis.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div>
      {/* Breadcrumb Navigation - Hidden on very small screens */}
      <div className="hidden sm:block mb-6">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/upload">Upload</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/department/${department}`}>{department}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <span>File Analysis</span>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
      
      {/* Page Header */}
      <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'} mb-6 gap-4`}>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              <FileText className="inline-block mr-2" size={24} /> File Analysis
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {isMobile ? (
              fileId.length > 20 
                ? `${fileId.substring(0, 20)}...` 
                : fileId
            ) : (
              `AI analysis for file: ${fileId}`
            )}
          </p>
        </div>
      </div>
      
      {/* Analysis Content */}
      <div className="mt-4">
        <FileAnalysisComponent department={department} fileId={fileId} />
      </div>
    </div>
  );
};

export default FileAnalysisPage; 