import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DataVisualization from '@/components/DataVisualization';
import ComparisonView from '@/components/ComparisonView';
import DataTable from '@/components/DataTable';
import DepartmentCard from '@/components/DepartmentCard';
import ASINScatterPlot from '@/components/ASINScatterPlot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, LineChart, PieChart, FileType, Bot, ArrowLeft, Upload, DownloadCloud, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import FileUploader from '@/components/FileUploader';
import { useToast } from '@/hooks/use-toast';
import { amazonCategories, sampleReviewData, sampleSalesData, sampleInventoryData } from '@/types/amazonData';
import { 
  getAggregatedSalesData, 
  getPerformanceData, 
  getComparisonData, 
  processUploadedFiles,
  analyzeDepartments,
  getChartColorByIndex
} from '@/utils/dataUtils';

interface ASINSummaryData {
  asin: string;
  reviewCount: number;
  averageRating: number;
}

const Category = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [showAgent, setShowAgent] = useState(false);
  const [agentAnalysis, setAgentAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [reviewData, setReviewData] = useState(sampleReviewData);
  const [salesData, setSalesData] = useState(sampleSalesData);
  const [inventoryData, setInventoryData] = useState(sampleInventoryData);
  const [asinSummaryData, setAsinSummaryData] = useState<ASINSummaryData[]>([]);
  const [isAsinLoading, setIsAsinLoading] = useState(true);
  
  const formattedCategoryName = categoryName?.replace(/-/g, ' ');
  
  const categoryInfo = amazonCategories.find(
    cat => cat.name.replace(/_/g, ' ').toLowerCase() === formattedCategoryName?.toLowerCase()
  );
  
  useEffect(() => {
    if (!categoryInfo && categoryName) {
      navigate('/');
      toast({
        variant: "destructive",
        title: "Category not found",
        description: `The category "${categoryName}" does not exist.`,
      });
    }
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // Fetch ASIN Summary Data
    const fetchAsinSummary = async () => {
      setIsAsinLoading(true);
      try {
        // Assuming backend runs on localhost:5000
        const response = await fetch('http://localhost:5000/api/reviews/asin-summary'); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setAsinSummaryData(result.data);
        } else {
          console.error("Failed to fetch or parse ASIN summary data:", result.error || "Invalid data format");
          toast({ 
            variant: "destructive",
            title: "Error Fetching ASIN Data", 
            description: result.error || "Could not load ASIN summary."
          });
          setAsinSummaryData([]); // Set to empty array on error
        }
      } catch (error) {
        console.error("Error fetching ASIN summary:", error);
        toast({ 
          variant: "destructive",
          title: "Network Error", 
          description: "Could not connect to the server to fetch ASIN data."
        });
        setAsinSummaryData([]); // Set to empty array on network error
      } finally {
        setIsAsinLoading(false);
      }
    };

    fetchAsinSummary();

    return () => clearTimeout(timer);
  }, [categoryName, categoryInfo, navigate, toast]);
  
  const handleUpload = async (files: File[], department: string) => {
    try {
      setIsLoading(true);
      
      const result = await processUploadedFiles(files);
      
      setReviewData(result.reviewData);
      setSalesData(result.salesData);
      setInventoryData(result.inventoryData);
      
      setUploadOpen(false);
      
      toast({
        title: "Files Processed Successfully",
        description: `${files.length} file(s) have been processed for ${department}.`,
      });
    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        variant: "destructive",
        title: "Error processing files",
        description: "There was an error processing your files.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAgentAnalysis = async (query: string) => {
    try {
      setIsAnalyzing(true);
      const analysis = await analyzeDepartments(query, formattedCategoryName);
      setAgentAnalysis(analysis);
      setActiveTab("analysis");
      setShowAgent(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "There was a problem analyzing the data.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const metrics = {
    reviews: categoryInfo ? categoryInfo.reviewCount : 0,
    rating: Math.min(5, Math.max(3.2, 3.5 + Math.random())).toFixed(1),
    products: Math.floor((categoryInfo ? categoryInfo.reviewCount : 0) / 15),
    sentiment: (65 + Math.random() * 25).toFixed(1) + '%',
    growth: (Math.random() * 8 + 1).toFixed(1) + '%'
  };
  
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <Navbar />
        <main className="flex-1 p-2 sm:p-4 md:p-6">
          <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mb-2" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {formattedCategoryName || 'Category'} Reviews Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                {categoryInfo 
                  ? `${categoryInfo.reviewCount.toLocaleString()} reviews in the ${formattedCategoryName} category` 
                  : 'Category dashboard with review insights'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant={showAgent ? "default" : "outline"}
                onClick={() => setShowAgent(!showAgent)}
              >
                <Bot className="mr-2 h-4 w-4" />
                {showAgent ? "Hide Assistant" : "Ask AI Assistant"}
              </Button>
              <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>Upload Data</DialogTitle>
                    <DialogDescription>
                      Upload CSV files containing review data for {formattedCategoryName}
                    </DialogDescription>
                  </DialogHeader>
                  <FileUploader 
                    onUpload={handleUpload} 
                    multiple 
                    categories={[formattedCategoryName || '']}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <DownloadCloud className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          {showAgent && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>
                  Ask questions about {formattedCategoryName} reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Ask about review trends, sentiment analysis, or product performance..." 
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAgentAnalysis((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                      if (input && input.value) {
                        handleAgentAnalysis(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Analyze
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <DepartmentCard
              title="Total Reviews"
              value={metrics.reviews.toLocaleString()}
              change={7.2}
              timeframe="last month"
              chartData={[3, 5, 4, 8, 6, 7, 9]}
              icon={BarChart3}
            />
            <DepartmentCard
              title="Avg Rating"
              value={`${metrics.rating}/5`}
              change={0.3}
              timeframe="last month"
              chartData={[4.0, 4.1, 4.0, 4.2, 4.1, 4.2, 4.2]}
              icon={LineChart}
            />
            <DepartmentCard
              title="Products Reviewed"
              value={metrics.products.toLocaleString()}
              change={2.5}
              timeframe="last month"
              chartData={[25, 23, 22, 19, 18, 16, 15]}
              icon={FileType}
            />
            <DepartmentCard
              title="Sentiment Score"
              value={metrics.sentiment}
              change={2.3}
              timeframe="last quarter"
              chartData={[80, 82, 83, 85, 84, 86, 87]}
              icon={PieChart}
            />
            <DepartmentCard
              title="Review Growth"
              value={metrics.growth}
              change={1.2}
              timeframe="last year"
              chartData={[2, 2.5, 3, 3.2, 3.8, 4.2, 4.7]}
              icon={TrendingUp}
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList className="w-full max-w-md grid grid-cols-4">
              <TabsTrigger value="dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="tables">
                <FileType className="w-4 h-4 mr-2" />
                Review Data
              </TabsTrigger>
              <TabsTrigger value="comparisons">
                <PieChart className="w-4 h-4 mr-2" />
                Comparisons
              </TabsTrigger>
              <TabsTrigger value="analysis">
                <Bot className="w-4 h-4 mr-2" />
                AI Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="pt-4 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <DataVisualization
                    title={`${formattedCategoryName} Monthly Review Volume`}
                    description="Trends in review submissions over time"
                    data={getAggregatedSalesData()}
                    type="line"
                    dataKeys={[formattedCategoryName || '']}
                    xAxisKey="month"
                  />
                </div>
                <div>
                  <ComparisonView
                    title="Review Rating Distribution"
                    data={getComparisonData('sales').map(item => ({
                      ...item,
                      department: item.department,
                      value: item.value,
                      color: item.color
                    }))}
                    metrics={['5 Star', '4 Star', '3 Star', '2 Star', '1 Star']}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DataVisualization
                  title="Sentiment Analysis"
                  description="Sentiment breakdown by rating and helpfulness"
                  data={getPerformanceData()}
                  type="area"
                  dataKeys={['rating', 'sentiment', 'helpfulness']}
                  xAxisKey="name"
                />
                <ComparisonView
                  title="Review Quality Metrics"
                  data={getComparisonData('efficiency').map(item => ({
                    ...item,
                    department: item.department,
                    value: item.value,
                    color: item.color
                  }))}
                  metrics={['Helpfulness', 'Detail Level', 'Verified Purchase']}
                />
              </div>

              <div>
                {isAsinLoading ? (
                  <Card className="h-[460px] flex items-center justify-center border border-muted/30 shadow-md">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-primary mb-4"></div>
                      <p className="text-muted-foreground">Loading ASIN Performance Data...</p>
                    </div>
                  </Card>
                ) : asinSummaryData.length > 0 ? (
                  <ASINScatterPlot
                    title="High-Impact ASIN Performance"
                    description="Products plotted by review count vs. average rating (Lower-right quadrant needs attention)"
                    data={asinSummaryData}
                  />
                ) : (
                  <Card className="h-[460px] flex items-center justify-center border border-muted/30 shadow-md">
                     <p className="text-muted-foreground">No ASIN performance data available.</p>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="tables" className="pt-4 space-y-6">
              <DataTable 
                data={reviewData} 
                title={`${formattedCategoryName} Product Reviews`} 
                description={`Customer reviews for products in the ${formattedCategoryName} category`}
              />
              
              <DataTable 
                data={salesData} 
                title={`${formattedCategoryName} Sales Data`} 
                description={`Sales transactions for products in the ${formattedCategoryName} category`}
              />
              
              <DataTable 
                data={inventoryData} 
                title={`${formattedCategoryName} Inventory Data`} 
                description={`Current stock levels for products in the ${formattedCategoryName} category`}
              />
            </TabsContent>
            
            <TabsContent value="comparisons" className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ComparisonView
                  title="Reviews by Rating"
                  data={getComparisonData('sales').map(item => ({
                    ...item,
                    department: item.department,
                    value: item.value,
                    color: item.color
                  }))}
                  metrics={['5 Star', '4 Star', '3 Star', '2 Star', '1 Star']}
                />
                <ComparisonView
                  title="Review Metrics"
                  data={getComparisonData('efficiency').map(item => ({
                    ...item,
                    department: item.department,
                    value: item.value,
                    color: item.color
                  }))}
                  metrics={['Helpfulness', 'Detail Level', 'Verified Purchase']}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <DataVisualization
                  title="Performance Over Time"
                  description="Trends in key performance metrics"
                  data={getPerformanceData()}
                  type="area"
                  dataKeys={['rating', 'helpfulness', 'sentiment']}
                  xAxisKey="name"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="pt-4">
              {isAnalyzing ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">
                      Analyzing {formattedCategoryName} review data...
                    </p>
                  </div>
                </div>
              ) : agentAnalysis ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>AI Analysis Results</CardTitle>
                          <CardDescription>
                            {formattedCategoryName} analysis insights
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="prose max-w-none">
                            <p>{agentAnalysis.analysis}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <Card>
                        <CardHeader>
                          <CardTitle>Key Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {agentAnalysis.insights.map((insight: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="mt-1 rounded-full bg-primary/10 p-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                                </div>
                                <span className="text-sm">{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {agentAnalysis.recommendations.map((rec: string, idx: number) => (
                          <Card key={idx} className="bg-card/50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                                  <span className="text-xs font-bold">{idx + 1}</span>
                                </div>
                                <h4 className="text-sm font-medium">Recommendation</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">{rec}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center p-12">
                  <div className="inline-block rounded-full bg-primary/10 p-3 text-primary mb-4">
                    <Bot className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Use the AI Assistant to analyze {formattedCategoryName} review data and discover insights.
                  </p>
                  <Button onClick={() => setShowAgent(true)}>
                    <Bot className="mr-2 h-4 w-4" />
                    Open AI Assistant
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Category;
