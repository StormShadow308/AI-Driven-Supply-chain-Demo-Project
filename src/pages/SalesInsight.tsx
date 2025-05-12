import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Bot, 
  BarChart3, 
  ChevronRight, 
  FileText, 
  Zap,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getDepartments } from '@/services/api';
import SalesAIAgent from '@/components/SalesAIAgent';

const SalesInsight: React.FC = () => {
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch departments with data
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await getDepartments();
        
        if (response.success) {
          const salesDepartments = response.departments.filter(
            dept => dept === 'sales' || dept.includes('sales')
          );
          
          setDepartments(salesDepartments);
          
          // Auto-select the first department if available
          if (salesDepartments.length > 0 && !selectedDepartment) {
            setSelectedDepartment(salesDepartments[0]);
          }
        } else {
          throw new Error('Failed to fetch departments');
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments. Please try again later.');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load departments with sales data.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDepartments();
  }, [toast]);

  // Handle department change
  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
  };

  // If there's an error
  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center">
            <Zap className="h-6 w-6 mr-2 text-primary" /> 
            Sales Insight AI
          </h1>
          <p className="text-muted-foreground">
            Intelligent analysis of your sales data powered by AI
          </p>
        </div>
      </div>
      
      {/* Department selector for sales */}
      {departments.length > 0 ? (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Select Sales Data Source
            </CardTitle>
            <CardDescription>
              Choose a department to analyze with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <Button
                  key={dept}
                  variant={selectedDepartment === dept ? "default" : "outline"}
                  className="flex items-center"
                  onClick={() => handleDepartmentChange(dept)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {dept}
                  {selectedDepartment === dept && (
                    <ChevronRight className="h-4 w-4 ml-1" />
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Loading departments...</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Sales Data</AlertTitle>
          <AlertDescription>
            No departments with sales data were found. Please upload sales data files first.
          </AlertDescription>
        </Alert>
      )}
      
      {/* AI Agent section */}
      {selectedDepartment && (
        <div className="grid md:grid-cols-1 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Bot className="h-5 w-5 mr-2 text-primary" />
                AI Sales Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about your sales data and get intelligent insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesAIAgent 
                department={selectedDepartment}
                onAnalyze={(query) => {
                  console.log("Analysis query:", query);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Call to action if no department selected */}
      {!loading && !selectedDepartment && departments.length > 0 && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertTitle>Select a Department</AlertTitle>
          <AlertDescription>
            Please select a department from above to start analyzing with AI.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Upload data prompt if no departments */}
      {!loading && departments.length === 0 && (
        <div className="text-center p-6 border border-dashed rounded-lg">
          <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Sales Data Available</h3>
          <p className="mb-4 text-muted-foreground">
            Upload sales data files to start using the AI Sales Insight tool.
          </p>
          <Button onClick={() => window.location.href = '/upload'}>
            Upload Sales Data
          </Button>
        </div>
      )}
    </div>
  );
};

export default SalesInsight; 