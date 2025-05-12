import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/App';

const SalesAnalytics = () => {
  const navigate = useNavigate();
  const { getActiveDepartmentState } = useAppState();
  
  useEffect(() => {
    // Check if we have a department state for sales, and if so, redirect to it
    const salesState = getActiveDepartmentState('sales');
    if (salesState) {
      navigate(`/analysis/sales/${salesState.fileId}`);
    }
  }, [getActiveDepartmentState, navigate]);

  const handleUploadClick = () => {
    navigate('/upload', { state: { preselectedDepartment: 'sales' } });
  };

  // Render a message while checking, or if no recent file exists
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Sales Analytics</h2>
        </div>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Recent Sales File</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>
              No sales file analysis is available. Please upload a sales file to view analysis.
            </p>
            <Button 
              onClick={handleUploadClick}
              className="w-fit"
              variant="default"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Sales Data
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default SalesAnalytics;
