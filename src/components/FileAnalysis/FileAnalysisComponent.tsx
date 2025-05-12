import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, BarChart2, PieChart, TrendingUp, AlertTriangle, Bot } from 'lucide-react';
import { getFileAnalysis, extractChartData, extractInsights, transformChartData, querySalesAgent } from '@/services/api';
import DataVisualization from '@/components/DataVisualization';
import { Skeleton } from '@/components/ui/skeleton';
import SalesAIAgent from '@/components/SalesAIAgent';
import ReviewAIAgent from '@/components/ReviewAIAgent';
import ASINScatterPlot from '@/components/ASINScatterPlot';

interface FileAnalysisProps {
  department: string;
  fileId: string;
}

interface InsightData {
  summary: string;
  categories?: string;
  trends?: string;
  demographics?: string;
  gender?: string;
  payments?: string;
  regions?: string;
  inventory_sales?: string;
  seasonality?: string;
  weather?: string;
  ratings?: string;
  recommendationsArray?: string[];
  recommendations?: string[];
  [key: string]: any; // Allow for other fields
}

const FileAnalysisComponent: React.FC<FileAnalysisProps> = ({ department, fileId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transformedChartData, setTransformedChartData] = useState<any[]>([]);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [aiInsights, setAiInsights] = useState<InsightData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('aiAssistant');
  const [fileFormat, setFileFormat] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  
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
  
  // Fetch AI-generated insights for different aspects of the data
  const fetchAIInsights = async (format: string): Promise<InsightData | null> => {
    if (format !== 'sales') return null;
    
    try {
      const insightQueries = {
        summary: "Give me a summary of this sales data",
        categories: "Analyze the sales performance by product category",
        trends: "What are the sales trends over time?",
        demographics: "Analyze customer demographics in this data",
        recommendations: "What are your top 3 recommendations based on this sales data?"
      };
      
      const aiResults: Record<string, string> = {};
      
      // Fetch insights in parallel using Promise.all
      const insightPromises = Object.entries(insightQueries).map(async ([key, query]) => {
        const response = await querySalesAgent(query, fileId, department);
        if (response.success && response.response) {
          return { key, response: response.response };
        }
        return { key, response: `Unable to analyze ${key}` };
      });
      
      const results = await Promise.all(insightPromises);
      
      // Organize results
      results.forEach(result => {
        aiResults[result.key] = result.response;
      });
      
      // Parse recommendations into an array if needed
      let recommendationsArray: string[] = [];
      if (aiResults.recommendations) {
        try {
          // Try to extract numbered recommendations into an array
          const recommendationMatches = aiResults.recommendations.match(/\d+\.\s+[^\n]+/g);
          if (recommendationMatches && recommendationMatches.length > 0) {
            // Clean up the recommendations by removing the numbering
            recommendationsArray = recommendationMatches.map(rec => 
              rec.replace(/^\d+\.\s+/, '').trim()
            );
          }
        } catch (error) {
          console.log("Error parsing recommendations:", error);
        }
      }
      
      return {
        ...aiResults,
        recommendationsArray,
        recommendations: recommendationsArray
      } as InsightData;
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      return null;
    }
  };
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        setTransformedChartData([]);
        
        console.log(`Fetching analysis for ${department}/${fileId}...`);
        const analysisResult = await getFileAnalysis(department, fileId);
        
        if (!analysisResult.success) {
          console.error(`Analysis failed with error: ${analysisResult.error}`);
          setError(analysisResult.error || 'Failed to analyze file');
          setLoading(false);
          return;
        }
        
        // Extract raw data
        const rawChartData = extractChartData(analysisResult);
        const textualInsights = extractInsights(analysisResult);
        const format = analysisResult.format;
        
        console.log(`Analysis successful. Format: ${format}, Raw chart data received:`, rawChartData);
        
        // Transform the chart data using the service function
        const processedChartData = transformChartData(rawChartData, format);
        console.log('Transformed chart data:', processedChartData);

        setFileFormat(format);
        // Store the transformed data, which should be an array
        setTransformedChartData(Array.isArray(processedChartData) ? processedChartData : []); 
        setInsights(textualInsights as InsightData);
        
        // Get AI-generated insights
        if (format === 'sales') {
          console.log('Fetching additional AI insights for sales data...');
          const aiResults = await fetchAIInsights(format);
          setAiInsights(aiResults);
        }
        
      } catch (err) {
        console.error('Error analyzing file:', err);
        setError(typeof err === 'string' ? err : err instanceof Error ? err.message : 'An error occurred while analyzing the file');
      } finally {
        setLoading(false);
      }
    };
    
    if (department && fileId) {
      fetchAnalysis();
    }
  }, [department, fileId]);
  
  // Helper to get chart icon
  const getChartIcon = (type: string) => {
    switch (type) {
      case 'pie':
        return <PieChart className="h-4 w-4" />;
      case 'area':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <BarChart2 className="h-4 w-4" />;
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] sm:h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[280px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] sm:h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Analysis Failed</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{error}</p>
          <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
            <p className="font-semibold">Debug Info:</p>
            <p>Department: {department}</p>
            <p>File ID: {fileId}</p>
            <p>Time: {new Date().toISOString()}</p>
          </div>
          <p className="text-sm mt-2">Try uploading another file with the correct format and required columns.</p>
        </AlertDescription>
      </Alert>
    );
  }
  
  // No data available check (update to check the transformedChartData object)
  if (transformedChartData.length === 0 && !insights) {
    return (
      <Alert variant="destructive">
        <FileText className="h-4 w-4" />
        <AlertTitle>No Analysis Data Available</AlertTitle>
        <AlertDescription>
          <p>The system could not generate analysis for this file. This might be because:</p>
          <ul className="list-disc pl-4 mt-2">
            <li>The file may be empty or have insufficient data</li>
            <li>The file format may not be supported for analysis</li>
            <li>There might be an issue with the data processing pipeline</li>
          </ul>
          <p className="mt-2">Try uploading another file with more complete data.</p>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Only show AI agent tab if it's sales data
  const showAIAgent = fileFormat === 'sales';
  
  // Decide which insights to use - prefer AI insights if available
  // Initialize with a default structure satisfying InsightData
  let displayInsights: InsightData = {
    summary: insights?.summary || "Summary not available",
    recommendations: insights?.recommendations || [],
    recommendationsArray: insights?.recommendationsArray || [],
    ...(insights || {}) // Spread the rest of the base insights if they exist
  };

  // If AI insights exist and it's sales data, merge them
  if (aiInsights && fileFormat === 'sales') {
    displayInsights = {
      ...displayInsights, // Keep base insights not overwritten by AI
      summary: aiInsights.summary || displayInsights.summary, // Prioritize AI summary
      categories: aiInsights.categories || displayInsights.categories,
      trends: aiInsights.trends || displayInsights.trends,
      demographics: aiInsights.demographics || displayInsights.demographics,
      recommendations: aiInsights.recommendations || displayInsights.recommendations,
      recommendationsArray: aiInsights.recommendationsArray || displayInsights.recommendationsArray
    };
  }
  
  return (
    <>
      <Tabs 
        defaultValue="aiAssistant" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className={`grid w-full ${fileFormat === 'sales' || fileFormat === 'reviews' ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {(fileFormat === 'sales' || fileFormat === 'reviews') && (
            <TabsTrigger value="aiAssistant">
              <Bot className="mr-2 h-4 w-4" /> AI Assistant
            </TabsTrigger>
          )}
          <TabsTrigger value="charts">
            <BarChart2 className="mr-2 h-4 w-4" /> Charts
          </TabsTrigger>
          <TabsTrigger value="insights">
            <FileText className="mr-2 h-4 w-4" /> Insights
          </TabsTrigger>
        </TabsList>
        
        {/* AI Assistant Tab - Conditionally render Sales or Review Agent */}
        {fileFormat === 'sales' && (
          <TabsContent value="aiAssistant" className="mt-4">
             <SalesAIAgent fileId={fileId} department={department} />
          </TabsContent>
        )}
        
        {/* Review AI Assistant Tab */} 
        {fileFormat === 'reviews' && (
           <TabsContent value="aiAssistant" className="mt-4">
             <ReviewAIAgent fileId={fileId} department={department} />
           </TabsContent>
         )}
        
        {/* Charts Tab */}
        <TabsContent value="charts" className="mt-4">
          {transformedChartData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {transformedChartData.map((chartConfig: any) => {
                // Special handling for ASIN Scatter Plot
                if (chartConfig.key === 'asinSentimentDistribution') {
                  // Add console log to inspect the data being passed
                  console.log('ASIN Scatter Data:', chartConfig.data);
                  return (
                    <Card key={chartConfig.key} className="col-span-1 lg:col-span-2"> {/* Allow scatter plot to span full width */} 
                      <CardHeader>
                        <CardTitle>{chartConfig.title || 'ASIN Sentiment Distribution'}</CardTitle>
                        {chartConfig.description && <CardDescription>{chartConfig.description}</CardDescription>}
                      </CardHeader>
                      <CardContent className="h-[400px]"> {/* Adjust height as needed */}
                        <ASINScatterPlot
                          title={chartConfig.title || 'ASIN Sentiment Distribution'}
                          description={chartConfig.description || ''}
                          data={chartConfig.data} 
                        />
                      </CardContent>
                    </Card>
                  );
                } 
                // Standard chart rendering
                else if (chartConfig.data && chartConfig.key) {
                  return (
                    <Card key={chartConfig.key}>
                       <CardHeader>
                         <CardTitle>{chartConfig.title || 'Chart'}</CardTitle>
                         {chartConfig.description && <CardDescription>{chartConfig.description}</CardDescription>}
                       </CardHeader>
                       <CardContent className="h-[300px]"> {/* Set a fixed height for consistency */} 
                         <DataVisualization
                           title={chartConfig.title || 'Chart'}
                           description={chartConfig.description || ''}
                           data={chartConfig.data || []} 
                           type={chartConfig.type || 'bar'}
                           dataKeys={chartConfig.yKey ? (Array.isArray(chartConfig.yKey) ? chartConfig.yKey : [chartConfig.yKey]) : ['value']} // Handle single or multiple yKeys
                           xAxisKey={chartConfig.xKey || 'name'}
                           nameKey={chartConfig.nameKey || 'name'} // For pie charts
                           colors={chartConfig.colors} // Pass colors if provided by transform
                         />
                       </CardContent>
                    </Card>
                  );
                } else {
                  console.warn(`Skipping chart due to missing data or key:`, chartConfig);
                  return null;
                }
              })}
            </div>
          ) : (
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>No Chart Data Available</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No visualization data could be generated for this file. Ensure the file contains necessary columns (e.g., timestamp, product_category, total_amount).
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Insights Tab */}
        <TabsContent value="insights">
          <Card>
            <CardHeader className={`${isMobile ? 'p-4' : 'p-6'}`}>
              <CardTitle className="text-base sm:text-lg flex items-center">
                <Bot className="h-4 w-4 mr-2 text-primary" />
                AI Analysis Summary
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                AI-generated insights for {fileFormat} data
              </CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'} pt-0 space-y-4`}>
              {/* Summary */}
              <div className="p-3 sm:p-4 bg-card rounded-md border">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Summary</h3>
                <p className="text-xs sm:text-sm">{displayInsights.summary}</p>
              </div>
              
              {/* AI Agent insights (deprecated - now using AI for all insights) */}
              {insights.ai_agent_insights && fileFormat === 'sales' && !aiInsights && (
                <div className="p-3 sm:p-4 bg-card rounded-md border border-primary/20">
                  <h3 className="font-semibold mb-2 text-sm sm:text-base flex items-center">
                    <Bot className="h-4 w-4 mr-2 text-primary" />
                    AI Agent Analysis
                  </h3>
                  <div className="text-xs sm:text-sm space-y-2">
                    {insights.ai_agent_insights.summary_stats && (
                      <div>
                        <p className="font-medium mb-1">Summary Statistics:</p>
                        <pre className="whitespace-pre-wrap bg-secondary/20 p-2 rounded text-xs overflow-x-auto">
                          {insights.ai_agent_insights.summary_stats}
                        </pre>
                      </div>
                    )}
                    {insights.ai_agent_insights.sales_by_category && (
                      <div>
                        <p className="font-medium mb-1">Sales by Category:</p>
                        <pre className="whitespace-pre-wrap bg-secondary/20 p-2 rounded text-xs overflow-x-auto">
                          {insights.ai_agent_insights.sales_by_category}
                        </pre>
                      </div>
                    )}
                    {insights.ai_agent_insights.sales_trend && (
                      <div>
                        <p className="font-medium mb-1">Sales Trend Analysis:</p>
                        <pre className="whitespace-pre-wrap bg-secondary/20 p-2 rounded text-xs overflow-x-auto">
                          {insights.ai_agent_insights.sales_trend}
                        </pre>
                      </div>
                    )}
                    {insights.ai_agent_insights.prediction_example && (
                      <div>
                        <p className="font-medium mb-1">Sales Prediction:</p>
                        <p className="bg-secondary/20 p-2 rounded text-xs">
                          {insights.ai_agent_insights.prediction_example}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* All insights in sections - show AI generated if available */}
              {Object.entries(displayInsights).map(([key, value]) => {
                // Skip recommendations, summary, and deprecated ai_agent_insights (handled separately)
                if (key === 'recommendations' || key === 'summary' || key === 'recommendationsArray' || key === 'ai_agent_insights') {
                  return null;
                }
                
                return (
                  <div key={key} className="p-3 sm:p-4 bg-card rounded-md border">
                    <h3 className="font-semibold mb-2 text-sm sm:text-base capitalize">{key.replace('_', ' ')}</h3>
                    <p className="text-xs sm:text-sm">{value as string}</p>
                  </div>
                );
              })}
              
              {/* Recommendations */}
              {displayInsights.recommendations && Array.isArray(displayInsights.recommendations) && displayInsights.recommendations.length > 0 && (
                <div className="p-3 sm:p-4 bg-card rounded-md border">
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">Recommendations</h3>
                  <ul className="list-disc pl-5 text-xs sm:text-sm space-y-1">
                    {displayInsights.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default FileAnalysisComponent; 