import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  AlertTriangle, 
  ChevronRight, 
  RefreshCw, 
  Upload 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import EmptyDashboard from "@/components/EmptyDashboard";
import { checkApiHealth, getDepartments } from "@/services/api";
import { useAppState } from "@/App";

const IndexPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pageState, updatePageState } = useAppState();
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [departmentData, setDepartmentData] = useState<any>(null);
  
  useEffect(() => {
    // Check API health and load department data
    const checkApiAndLoadData = async () => {
      try {
        const healthResult = await checkApiHealth();
        setApiConnected(healthResult);
        
        if (healthResult) {
          try {
            const departments = await getDepartments();
            setDepartmentData({ departments });
          } catch (error) {
            console.error('Failed to load department data:', error);
          }
        }
      } catch (error) {
        console.error('API health check failed:', error);
        setApiConnected(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkApiAndLoadData();
    
    // Check if we have a lastAnalysis in the state to redirect
    if (location.state?.preserveState && pageState.lastAnalysis) {
      const { department, fileId } = pageState.lastAnalysis;
      navigate(`/analysis/${department}/${fileId}`);
    }
  }, []);
  
  // Determine what content to show based on API connection and data
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Connecting to backend...</p>
          </div>
        </div>
      );
    }
    
    if (apiConnected === false) {
      return (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>API Connection Error</AlertTitle>
            <AlertDescription>
              Unable to connect to the backend API. Please make sure the Flask server is running.
            </AlertDescription>
          </Alert>
          
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="text-lg font-medium mb-4">Troubleshooting Steps</h3>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              <li>Ensure the Flask API server is running on http://localhost:5000</li>
              <li>Check if there are any CORS issues in the console</li>
              <li>Verify network connectivity between the frontend and backend</li>
            </ul>
            <Button 
              onClick={() => {
                setIsLoading(true);
                checkApiHealth()
                  .then(result => {
                    setApiConnected(result);
                  })
                  .catch(() => {
                    setApiConnected(false);
                  })
                  .finally(() => {
                    setIsLoading(false);
                  });
              }}
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Connection
            </Button>
          </div>
        </div>
      );
    }
    
    // If we have data, show the dashboard with visualizations
    if (departmentData && departmentData.departments && departmentData.departments.length > 0) {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-medium">Data available for analysis</h3>
          <p className="text-muted-foreground">
            Select a department below to view data analysis
          </p>
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            {departmentData.departments.map((dept: string) => (
              <Card 
                key={dept} 
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/department/${dept}`)}
              >
                <h4 className="font-medium capitalize">{dept}</h4>
                <p className="text-sm text-muted-foreground">View {dept} data analysis</p>
              </Card>
            ))}
          </div>
        </div>
      );
    }
    
    // Otherwise show empty state using the EmptyDashboard component
    return <EmptyDashboard />;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Supply Line Insight</h2>
        <div className="flex items-center space-x-2">
          <Button 
            className="justify-between"
            onClick={() => navigate('/upload')}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Data
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    
      {renderContent()}
    </div>
  );
};

export default IndexPage;
