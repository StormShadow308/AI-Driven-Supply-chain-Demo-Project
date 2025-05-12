import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Upload, BarChart2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/App';
import { getFileAnalysis } from '@/services/api';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

const ReviewsAnalysisPage = () => {
  const navigate = useNavigate();
  const { getActiveDepartmentState } = useAppState();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasData, setHasData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load review data on component mount if available
  useEffect(() => {
    const loadReviewData = async () => {
      // Check if we have data for the reviews department
      const reviewsState = getActiveDepartmentState('reviews');
      
      if (reviewsState) {
        setIsLoading(true);
        setError(null);
        
        try {
          const result = await getFileAnalysis('reviews', reviewsState.fileId);
          
          if (result.success) {
            setHasData(true);
            // Instead of redirecting, we'll display the data here
            // The FileAnalysis component will be rendered below if hasData is true
            console.log("Successfully loaded review data", result);
            
            // Redirect to the detailed analysis page
            navigate(`/analysis/reviews/${reviewsState.fileId}`);
          } else {
            setError(result.error || 'Failed to load review data');
            setHasData(false);
          }
        } catch (err) {
          console.error("Error loading review data:", err);
          setError('An error occurred while loading review data');
          setHasData(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        // No data to load
        setHasData(false);
      }
    };
    
    loadReviewData();
  }, [getActiveDepartmentState, navigate]);

  const handleUploadClick = () => {
    navigate('/upload', { state: { preselectedDepartment: 'reviews' } });
  };

  const handleRetryClick = () => {
    // Force reload
    window.location.reload();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 space-y-6 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Reviews Analytics</h2>
          </div>
          
          <Card className="p-8 flex flex-col items-center justify-center">
            <Spinner className="mb-4 h-8 w-8" />
            <p className="text-muted-foreground">Loading review data...</p>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 space-y-6 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Reviews Analytics</h2>
          </div>
          
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Review Data</AlertTitle>
            <AlertDescription className="flex flex-col gap-4">
              <p>{error}</p>
              <div className="flex flex-wrap gap-3 mt-2">
                <Button 
                  onClick={handleRetryClick}
                  className="w-fit"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button 
                  onClick={handleUploadClick}
                  className="w-fit"
                  variant="default"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Data
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Render a message when no data exists
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Reviews Analytics</h2>
        </div>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Recent Reviews File</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>
              No reviews file analysis is available. Please upload a reviews file to view analysis.
            </p>
            <Button 
              onClick={handleUploadClick}
              className="w-fit"
              variant="default"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Reviews Data
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ReviewsAnalysisPage; 