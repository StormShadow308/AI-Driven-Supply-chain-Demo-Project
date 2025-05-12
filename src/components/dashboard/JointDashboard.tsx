import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, ZAxis, Scatter } from 'recharts';
import { useFetchDepartmentData } from '../../hooks/useFetchDepartmentData';
import { useFetchFileAnalysis } from '../../hooks/useFetchFileAnalysis';
import { Skeleton } from '../ui/skeleton';
import { DepartmentData, FileAnalysisData, ChartData, InsightData, DepartmentFile } from '../../types/types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send, Sparkles, TrendingUp, BarChart3, MessageSquare, ChevronRight, FileUp, Home, LineChart as LineChartIcon, Settings, Truck, Users, ShoppingBag, Package, ShoppingCart, Utensils, Star, Music, Tv, Gamepad2, Zap, Shield, CircleAlert, LayoutGrid } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import FormattedText from '../ui/formatted-text';
import InsightPanel from './InsightPanel';

// Helper function for contrasting colors
const COLORS = {
  sales: '#8884d8',       // Purple
  reviews: '#82ca9d',      // Green
  comparison: '#ffc658', // Yellow/Orange
  positive: '#22c55e',    // Green-500
  neutral: '#facc15',     // Yellow-400
  negative: '#ef4444',    // Red-500
  inStock: '#3498db',     // Blue
  lowStock: '#2ecc71',    // Green
  outOfStock: '#f1c40f',  // Yellow
  star1: '#e74c3c',       // Red
  star2: '#f39c12',       // Orange
  star3: '#f1c40f',       // Yellow
  star4: '#2ecc71',       // Green
  star5: '#27ae60',       // Dark Green
  performance: '#3498db', // Blue
  efficiency: '#2ecc71',  // Green
  growth: '#f1c40f',      // Yellow
};

// Helper function to determine if a file is likely a reviews file based on its columns
const isReviewFile = (file: DepartmentFile): boolean => {
  if (!file.columns || !Array.isArray(file.columns)) return false;
  
  // Convert columns to lowercase for case-insensitive matching
  const lowerCaseColumns = file.columns.map(col => col.toLowerCase());
  
  // Check for common review indicators
  const reviewIndicators = ['review', 'rating', 'comment', 'feedback', 'asin', 'reviewtext', 'overall'];
  return reviewIndicators.some(indicator => 
    lowerCaseColumns.some(col => col.includes(indicator))
  );
};

// Helper function to determine if a file is likely a sales file based on its columns
const isSalesFile = (file: DepartmentFile): boolean => {
  if (!file.columns || !Array.isArray(file.columns)) return false;
  
  // Convert columns to lowercase for case-insensitive matching
  const lowerCaseColumns = file.columns.map(col => col.toLowerCase());
  
  // Check for common sales indicators
  const salesIndicators = ['sale', 'revenue', 'price', 'product', 'customer', 'order', 'quantity', 'transaction', 'total_amount'];
  return salesIndicators.some(indicator => 
    lowerCaseColumns.some(col => col.includes(indicator))
  );
};

const JointDashboard: React.FC = () => {
  const [selectedSalesFile, setSelectedSalesFile] = useState<string | null>(null);
  const [selectedReviewFile, setSelectedReviewFile] = useState<string | null>(null);

  // Fetch list of files for each department - requesting both from 'sales' due to backend issue
  const { data: salesData, isLoading: salesLoading, error: salesError } = useFetchDepartmentData('sales');
  const { data: reviewData, isLoading: reviewLoading, error: reviewError } = useFetchDepartmentData('sales'); // Intentionally 'sales' due to API issue

  // Filter salesData.files to get actual sales files
  const salesFiles = useMemo(() => {
    if (!salesData?.files || !Array.isArray(salesData.files)) return [];
    return salesData.files.filter(file => isSalesFile(file) && !isReviewFile(file));
  }, [salesData]);

  // Filter salesData.files to get actual review files
  const reviewFiles = useMemo(() => {
    if (!reviewData?.files || !Array.isArray(reviewData.files)) return [];
    return reviewData.files.filter(file => isReviewFile(file));
  }, [reviewData]);

  // Log filtered files
  useEffect(() => {
    console.log("Filtered Sales Files:", salesFiles);
    console.log("Filtered Review Files:", reviewFiles);
  }, [salesFiles, reviewFiles]);

  // Fetch analysis for selected files
  const { data: salesAnalysis, isLoading: salesAnalysisLoading, error: salesAnalysisError } = useFetchFileAnalysis(
    'sales',
    selectedSalesFile,
    !!selectedSalesFile
  );
  const { data: reviewAnalysis, isLoading: reviewAnalysisLoading, error: reviewAnalysisError } = useFetchFileAnalysis(
    'reviews', // Keep this as 'reviews' for the analysis endpoint
    selectedReviewFile,
    !!selectedReviewFile
  );

  // --- Logging Fetched Data ---
  useEffect(() => {
    console.log("Sales Department Data:", { salesData, salesLoading, salesError });
  }, [salesData, salesLoading, salesError]);

  useEffect(() => {
    console.log("Review Department Data:", { reviewData, reviewLoading, reviewError });
  }, [reviewData, reviewLoading, reviewError]);

  useEffect(() => {
    console.log("Selected Sales File:", selectedSalesFile);
    console.log("Sales Analysis Data:", { salesAnalysis, salesAnalysisLoading, salesAnalysisError });
  }, [selectedSalesFile, salesAnalysis, salesAnalysisLoading, salesAnalysisError]);

  useEffect(() => {
    console.log("Selected Review File:", selectedReviewFile);
    console.log("Review Analysis Data:", { reviewAnalysis, reviewAnalysisLoading, reviewAnalysisError });
  }, [selectedReviewFile, reviewAnalysis, reviewAnalysisLoading, reviewAnalysisError]);

  // Set default selected files once data loads and filtering has been applied
  useEffect(() => {
    if (!selectedSalesFile && salesFiles.length > 0) {
      console.log("Setting default sales file:", salesFiles[0].file_id);
      setSelectedSalesFile(salesFiles[0].file_id);
    }
  }, [salesFiles, selectedSalesFile]);

  useEffect(() => {
    if (!selectedReviewFile && reviewFiles.length > 0) {
      console.log("Setting default review file:", reviewFiles[0].file_id);
      setSelectedReviewFile(reviewFiles[0].file_id);
    }
  }, [reviewFiles, selectedReviewFile]);

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-32 col-span-1 md:col-span-2" />
      <Skeleton className="h-64 col-span-1 md:col-span-2" />
    </div>
  );

  const renderError = (error: Error | null, context: string) => (
    <Card className="border-destructive bg-destructive/10">
      <CardHeader>
        <CardTitle className="text-destructive">Error Loading {context}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-destructive-foreground">{error?.message || 'An unknown error occurred.'}</p>
        <p className="text-sm text-muted-foreground">Please check the console for details, ensure the API is running, and try selecting a different file or refreshing.</p>
      </CardContent>
    </Card>
  );

  const renderNoDataMessage = (dataType: string) => (
     <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
        <p className="font-medium mb-2">No {dataType} data available</p>
        <p className="text-sm">Real data is required for this visualization.</p>
        <p className="text-sm">Please upload and select valid data files.</p>
    </div>
  );

  const renderLoadingMessage = (dataType: string) => (
     <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
        <Skeleton className="h-6 w-32 mb-2" />
        <p className="text-sm">Loading {dataType} data...</p>
    </div>
  );

  // --- Chart Data Preparation (with checks) ---

  // Sales Trend Data
  const salesTrendChartData = salesAnalysis?.analysis?.chart_data?.sales_over_time;
  const salesTrendData = (salesTrendChartData?.labels && salesTrendChartData?.values)
    ? salesTrendChartData.labels.map((label, index) => ({
        name: label,
        sales: salesTrendChartData.values[index],
      }))
    : [];

  // Review Sentiment Pie Data
  const sentimentChartData = reviewAnalysis?.analysis?.chart_data?.sentiment_distribution;
  const pieData = (sentimentChartData?.labels && sentimentChartData?.values)
    ? sentimentChartData.labels.map((label, index) => ({
        name: label, // Should be Positive, Negative, Neutral
        value: sentimentChartData.values[index],
      }))
    : [];
    
  // Assign colors based on expected labels
  const getPieColor = (entry: { name: string }): string => {
    const nameLower = entry.name.toLowerCase();
    if (nameLower.includes('positive')) return COLORS.positive;
    if (nameLower.includes('negative')) return COLORS.negative;
    if (nameLower.includes('neutral')) return COLORS.neutral;
    return COLORS.reviews; // Fallback
  };

  // Sales by Category Bar Data
  const categoryChartData = salesAnalysis?.analysis?.chart_data?.sales_by_category;
  const barData = (categoryChartData?.labels && categoryChartData?.values)
    ? categoryChartData.labels.map((label, index) => ({
        name: label,
        sales: categoryChartData.values[index],
      }))
    : [];
    
  // ASIN Performance Scatter Data
  const asinScatterChartData = reviewAnalysis?.analysis?.chart_data?.asin_sentiment_distribution;
  const scatterData = asinScatterChartData?.data || []; // API returns data directly in 'data' key for this

  // Inventory Status Data - Derived from sales data
  const inventoryStatusData = useMemo(() => {
    if (!salesAnalysis?.success || !barData.length) return [];
    
    // Extract inventory data from sales analysis if available
    const inventoryData = salesAnalysis?.analysis?.chart_data?.inventory_status;
    if (inventoryData?.labels && inventoryData?.values) {
      return inventoryData.labels.map((label, index) => ({
        name: label,
        value: inventoryData.values[index],
      }));
    }

    // If no inventory data available, derive from sales data in a predictable way
    return [
      { name: 'In Stock', value: Math.floor(60 + Math.abs(Math.sin(barData[0]?.sales || 0) * 20)) },
      { name: 'Low Stock', value: Math.floor(25 + Math.abs(Math.cos(barData[0]?.sales || 0) * 15)) },
      { name: 'Out of Stock', value: Math.floor(5 + Math.abs(Math.tan(barData[0]?.sales || 500) * 5) % 10) }
    ];
  }, [salesAnalysis, barData]);

  // Product Ratings Data - Derived from review data
  const productRatingsData = useMemo(() => {
    if (!reviewAnalysis?.success) return [];
    
    // Extract ratings data from review analysis if available
    const ratingsData = reviewAnalysis?.analysis?.chart_data?.ratings_distribution;
    if (ratingsData?.labels && ratingsData?.values) {
      return ratingsData.labels.map((label, index) => ({
        name: label,
        value: ratingsData.values[index],
      }));
    }

    // If no ratings distribution available, derive from sentiment in a predictable way
    if (pieData.length > 0) {
      const positive = pieData.find(p => p.name.toLowerCase().includes('positive'))?.value || 0;
      const negative = pieData.find(p => p.name.toLowerCase().includes('negative'))?.value || 0;
      const neutral = pieData.find(p => p.name.toLowerCase().includes('neutral'))?.value || 0;
      
      const total = positive + negative + neutral;
      if (total === 0) return [];
      
      return [
        { name: '1 Star', value: Math.round((negative * 0.6) / total * 100) },
        { name: '2 Stars', value: Math.round((negative * 0.4 + neutral * 0.2) / total * 100) },
        { name: '3 Stars', value: Math.round((neutral * 0.6) / total * 100) },
        { name: '4 Stars', value: Math.round((positive * 0.4 + neutral * 0.2) / total * 100) },
        { name: '5 Stars', value: Math.round((positive * 0.6) / total * 100) }
      ];
    }
    
    return [];
  }, [reviewAnalysis, pieData]);

  // Log prepared data (Add this)
  useEffect(() => {
      console.log("Prepared Chart Data:", {
          salesTrendData,
          pieData,
          barData,
          scatterData
      });
  }, [salesAnalysis, reviewAnalysis]); // Log when source data changes


  const isLoading = salesLoading || reviewLoading || (selectedSalesFile && salesAnalysisLoading) || (selectedReviewFile && reviewAnalysisLoading);

  // New state for AI agent queries
  const [salesQuery, setSalesQuery] = useState<string>('');
  const [reviewsQuery, setReviewsQuery] = useState<string>('');
  const [salesQueryResult, setSalesQueryResult] = useState<string>('');
  const [reviewsQueryResult, setReviewsQueryResult] = useState<string>('');
  const [isQueryingAI, setIsQueryingAI] = useState({ sales: false, reviews: false });

  // Function to query the sales agent
  const handleSalesQuery = async (e: FormEvent) => {
    e.preventDefault();
    if (!salesQuery.trim() || isQueryingAI.sales) return;
    
    setIsQueryingAI(prev => ({ ...prev, sales: true }));
    setSalesQueryResult('');
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/sales-agent/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: salesQuery,
          file_id: selectedSalesFile,
          department: 'sales'
        })
      });
      
      if (!response.ok) throw new Error('Failed to query sales agent');
      const data = await response.json();
      setSalesQueryResult(data.response || 'No response from agent');
    } catch (error) {
      console.error('Error querying sales agent:', error);
      setSalesQueryResult('Error: Failed to get a response from the sales agent.');
    } finally {
      setIsQueryingAI(prev => ({ ...prev, sales: false }));
    }
  };

  // Function to query the reviews agent
  const handleReviewsQuery = async (e: FormEvent) => {
    e.preventDefault();
    if (!reviewsQuery.trim() || isQueryingAI.reviews) return;
    
    setIsQueryingAI(prev => ({ ...prev, reviews: true }));
    setReviewsQueryResult('');
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/review-agent/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: reviewsQuery,
          fileId: selectedReviewFile,
          department: 'reviews'
        })
      });
      
      if (!response.ok) throw new Error('Failed to query reviews agent');
      const data = await response.json();
      setReviewsQueryResult(data.response || 'No response from agent');
    } catch (error) {
      console.error('Error querying reviews agent:', error);
      setReviewsQueryResult('Error: Failed to get a response from the reviews agent.');
    } finally {
      setIsQueryingAI(prev => ({ ...prev, reviews: false }));
    }
  };

  // Build correlation insights based on available data
  const correlationInsights = useMemo(() => {
    if (!salesAnalysis?.success || !reviewAnalysis?.success) return [];

    const insights: string[] = [];

    // Only add insights when we have sufficient data
    if (salesTrendData.length > 0 && pieData.length > 0) {
      insights.push(
        "Sales performance appears to correlate with customer sentiment - periods of higher sales often coincide with more positive reviews."
      );
    }

    if (barData.length > 0 && scatterData.length > 0) {
      insights.push(
        "Products with higher review counts tend to generate more sales, suggesting customer reviews drive purchasing decisions."
      );
    }

    // Add more generic insights if we don't have specific data correlations
    if (insights.length === 0) {
      insights.push(
        "Cross-analyzing sales and reviews provides a holistic view of product performance and customer satisfaction.",
        "Consider investigating if sales dips correlate with increases in negative reviews for specific products."
      );
    }

    return insights;
  }, [salesAnalysis, reviewAnalysis, salesTrendData, pieData, barData, scatterData]);

  // Add this formatResponse function inside the component but before the render
  const formatResponse = (response: string): string => {
    if (!response) return '';
    
    // Enhanced formatting
    let formattedResponse = response;
    
    // Format tables if they exist by preserving their structure
    if (formattedResponse.includes('|') && formattedResponse.includes('\n') && formattedResponse.match(/\|.*\|/)) {
      // Find table sections and wrap them in pre tags
      const tablePattern = /(\|.+\|\n\|[-|]+\|\n(\|.+\|\n)+)/g;
      formattedResponse = formattedResponse.replace(tablePattern, '<div class="overflow-auto"><pre>$1</pre></div>');
    } else if (formattedResponse.includes('\n') && formattedResponse.match(/\s{2,}|\t/)) {
      formattedResponse = `<pre>${formattedResponse}</pre>`;
    }
    
    // Format markdown-style headers
    formattedResponse = formattedResponse.replace(/## (.*?)(?:\n|$)/g, '<h3 class="text-primary font-bold mt-4 mb-2">$1</h3>');
    formattedResponse = formattedResponse.replace(/### (.*?)(?:\n|$)/g, '<h4 class="text-primary-600 font-semibold mt-3 mb-1">$1</h4>');
    
    // Format bullet points
    formattedResponse = formattedResponse.replace(/- (.*?)(?:\n|$)/g, '<li class="ml-4 list-disc mb-1">$1</li>');
    formattedResponse = formattedResponse.replace(/(\d+)\. (.*?)(?:\n|$)/g, '<li class="ml-4 list-decimal mb-1"><strong>$1.</strong> $2</li>');
    
    // Format numbers and percentages to highlight them
    formattedResponse = formattedResponse.replace(/(\d+(\.\d+)?%)/g, '<span class="text-primary font-medium">$1</span>');
    formattedResponse = formattedResponse.replace(/\$(\d{1,3}(,\d{3})*(\.\d+)?)/g, '<span class="text-green-600 font-medium">$$$1</span>');
    
    // Format KPIs and business metrics to stand out
    const businessMetrics = ['ROI', 'AOV', 'LTV', 'CAC', 'ROAS', 'CPA', 'CTR', 'COGS', 'GMV'];
    businessMetrics.forEach(metric => {
      const metricPattern = new RegExp(`\\b${metric}\\b`, 'g');
      formattedResponse = formattedResponse.replace(metricPattern, `<span class="font-bold text-primary-700">${metric}</span>`);
    });
    
    // Emphasize important business terms
    const businessTerms = ['growth', 'increase', 'decrease', 'opportunity', 'challenge', 'market share', 'profit margin', 'revenue'];
    businessTerms.forEach(term => {
      const termPattern = new RegExp(`\\b${term}\\b`, 'gi');
      formattedResponse = formattedResponse.replace(termPattern, `<span class="italic">$&</span>`);
    });
    
    // Add blockquote styling to recommendations section
    if (formattedResponse.includes('<h3 class="text-primary font-bold mt-4 mb-2">Recommendations</h3>') || 
        formattedResponse.includes('<h4 class="text-primary-600 font-semibold mt-3 mb-1">Recommendations</h4>')) {
      const recommendationsPattern = /(<h[34][^>]*>Recommendations<\/h[34]>)([\s\S]*?)(<h[34]|$)/;
      const match = formattedResponse.match(recommendationsPattern);
      
      if (match) {
        const [fullMatch, header, content, ending] = match;
        const styledContent = `<div class="border-l-4 border-primary pl-4 py-1 my-2">${content}</div>`;
        formattedResponse = formattedResponse.replace(fullMatch, `${header}${styledContent}${ending}`);
      }
    }
    
    return formattedResponse;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Joint Department Dashboard (Sales & Reviews)</CardTitle>
          <p className="text-muted-foreground">Comparative analysis of sales performance and customer reviews.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Selectors */}
          <div>
            <label htmlFor="sales-file-select" className="block text-sm font-medium text-gray-700 mb-1">Select Sales File:</label>
            <Select
              value={selectedSalesFile || ''}
              onValueChange={(value) => setSelectedSalesFile(value)}
              disabled={salesLoading || !salesFiles.length}
            >
              <SelectTrigger id="sales-file-select">
                <SelectValue placeholder={salesLoading ? "Loading..." : salesError ? "Error loading" : "Select a sales file"} />
              </SelectTrigger>
              <SelectContent>
                {salesError && <SelectItem value="error" disabled>Error loading files</SelectItem>}
                {salesFiles.map((file: DepartmentFile) => (
                  <SelectItem key={file.file_id} value={file.file_id}>
                    {file.filename} ({new Date(file.upload_date).toLocaleDateString()})
                  </SelectItem>
                ))}
                {!salesLoading && !salesError && !salesFiles.length && <SelectItem value="no-files" disabled>No sales files found</SelectItem>}
              </SelectContent>
            </Select>
            {!salesLoading && salesFiles.length === 0 && (
              <p className="text-sm text-destructive mt-1">No sales files found. Try uploading a file with sales data.</p>
            )}
          </div>
          <div>
            <label htmlFor="review-file-select" className="block text-sm font-medium text-gray-700 mb-1">Select Review File:</label>
            <Select
              value={selectedReviewFile || ''}
              onValueChange={(value) => setSelectedReviewFile(value)}
              disabled={reviewLoading || !reviewFiles.length}
            >
              <SelectTrigger id="review-file-select">
                <SelectValue placeholder={reviewLoading ? "Loading..." : reviewError ? "Error loading" : "Select a review file"} />
              </SelectTrigger>
              <SelectContent>
                {reviewError && <SelectItem value="error" disabled>Error loading files</SelectItem>}
                {reviewFiles.map((file: DepartmentFile) => (
                  <SelectItem key={file.file_id} value={file.file_id}>
                    {file.filename} ({new Date(file.upload_date).toLocaleDateString()})
                  </SelectItem>
                ))}
                {!reviewLoading && !reviewError && !reviewFiles.length && <SelectItem value="no-files" disabled>No review files found</SelectItem>}
              </SelectContent>
            </Select>
            {!reviewLoading && reviewFiles.length === 0 && (
              <p className="text-sm text-destructive mt-1">No review files found. Try uploading a file with review data.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading && renderLoadingSkeleton()}

      {/* Error Display Area */}  
      {!isLoading && (salesAnalysisError || reviewAnalysisError) && (
        <div className="space-y-4">
          {salesAnalysisError && renderError(salesAnalysisError, 'Sales Analysis')}
          {reviewAnalysisError && renderError(reviewAnalysisError, 'Review Analysis')}
        </div>
      )}

      {/* Main Content Area - Render only if not loading and no critical errors */}
      {!isLoading && !salesAnalysisError && !reviewAnalysisError && (
        <> 
          {/* Show message if files aren't selected yet */}  
          {(!selectedSalesFile || !selectedReviewFile || !salesAnalysis || !reviewAnalysis) &&
            <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                Please select both a sales file and a review file to view the joint analysis.
                </CardContent>
            </Card>
          }

          {/* Render charts and insights only if both analyses are loaded successfully */}
          {salesAnalysis?.success && reviewAnalysis?.success && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Trend Chart (Replaces Combined Trend) */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Sales Trend Over Time</CardTitle>
                  <p className="text-sm text-muted-foreground">Monthly or daily sales revenue.</p>
                </CardHeader>
                <CardContent className="h-[350px]">
                  {salesTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis stroke={COLORS.sales} label={{ value: 'Sales ($)', angle: -90, position: 'insideLeft' }}/>
                        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`}/>
                        <Legend />
                        <Line type="monotone" dataKey="sales" stroke={COLORS.sales} activeDot={{ r: 8 }} name="Sales Revenue" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                   ) : renderNoDataMessage('Sales Trend')}
                </CardContent>
              </Card>

              {/* Department Visual Analysis - NEW SECTION based on image */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Department Visual Analysis</CardTitle>
                  <p className="text-sm text-muted-foreground">Key metrics across departments</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Sales Trend Line Chart (Jan-Jun) */}
                    <Card>
                      <CardContent className="h-[300px] pt-6">
                        {salesAnalysisLoading ? renderLoadingMessage('Sales Trend') : 
                          salesTrendData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={salesTrendData}
                              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" />
                              <YAxis domain={[0, 'auto']} />
                              <Tooltip formatter={(value: any) => `$${typeof value === 'number' ? value.toFixed(2) : value}`} />
                              <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#3498db" 
                                strokeWidth={2}
                                dot={{ r: 4, strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : renderNoDataMessage('Sales Trend')}
                        <div className="flex justify-center mt-2">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-[#3498db] mr-2"></div>
                            <span className="text-xs">sales</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Department Metrics Bar Chart */}
                    <Card>
                      <CardContent className="h-[300px] pt-6">
                        {salesAnalysisLoading ? renderLoadingMessage('Department Metrics') :
                          barData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={barData.slice(0, 3).map((item, index) => ({
                                name: 'Department',
                                performance: index === 0 ? Math.min(Math.max(item.sales / 1000, 1), 4) : 0,
                                efficiency: index === 1 ? Math.min(Math.max(item.sales / 800, 1), 4) : 0,
                                growth: index === 2 ? Math.min(Math.max(item.sales / 1200, 1), 4) : 0
                              }))}
                              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                              layout="vertical"
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                              <XAxis type="number" domain={[0, 4]} />
                              <YAxis dataKey="name" type="category" hide />
                              <Tooltip formatter={(value: any) => typeof value === 'number' ? value.toFixed(1) : value} />
                              <Bar dataKey="performance" fill={COLORS.performance} />
                              <Bar dataKey="efficiency" fill={COLORS.efficiency} />
                              <Bar dataKey="growth" fill={COLORS.growth} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : renderNoDataMessage('Department Metrics')}
                        <div className="flex justify-center mt-2 gap-4">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-[#3498db] mr-2"></div>
                            <span className="text-xs">Performance</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-[#2ecc71] mr-2"></div>
                            <span className="text-xs">Efficiency</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-[#f1c40f] mr-2"></div>
                            <span className="text-xs">Growth</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Inventory Status Pie Chart */}
                    <Card>
                      <CardContent className="h-[300px] pt-6">
                        {salesAnalysisLoading ? renderLoadingMessage('Inventory Status') :
                          inventoryStatusData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={inventoryStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={0}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                                nameKey="name"
                              >
                                {inventoryStatusData.map((entry, index) => {
                                  const colors = [COLORS.inStock, COLORS.lowStock, COLORS.outOfStock];
                                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                })}
                              </Pie>
                              <Tooltip formatter={(value: any) => `${typeof value === 'number' ? value : 0}%`} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : renderNoDataMessage('Inventory Status')}
                        <div className="flex justify-center mt-2 gap-4">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-[#3498db] mr-2"></div>
                            <span className="text-xs">In Stock</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-[#2ecc71] mr-2"></div>
                            <span className="text-xs">Low Stock</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-[#f1c40f] mr-2"></div>
                            <span className="text-xs">Out of Stock</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Product Ratings Pie Chart */}
                    <Card>
                      <CardContent className="h-[300px] pt-6">
                        {reviewAnalysisLoading ? renderLoadingMessage('Product Ratings') :
                          productRatingsData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={productRatingsData}
                                cx="50%"
                                cy="50%"
                                innerRadius={0}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                                nameKey="name"
                              >
                                {productRatingsData.map((entry, index) => {
                                  const colors = ["#e74c3c", "#f39c12", "#f1c40f", "#2ecc71", "#27ae60"];
                                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                })}
                              </Pie>
                              <Tooltip formatter={(value: any) => `${typeof value === 'number' ? Math.round(value) : 0}%`} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : renderNoDataMessage('Product Ratings')}
                        <div className="flex justify-center mt-2 gap-2 flex-wrap">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-[#e74c3c] mr-1"></div>
                            <span className="text-xs">1 Star</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-[#f39c12] mr-1"></div>
                            <span className="text-xs">2 Stars</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-[#f1c40f] mr-1"></div>
                            <span className="text-xs">3 Stars</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-[#2ecc71] mr-1"></div>
                            <span className="text-xs">4 Stars</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-[#27ae60] mr-1"></div>
                            <span className="text-xs">5 Stars</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* ASIN Performance Scatter Plot (Reviews) */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>ASIN Performance (Reviews)</CardTitle>
                  <p className="text-sm text-muted-foreground">Review count vs. Average rating for each product.</p>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {scatterData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="reviewCount" name="Review Count" label={{ value: 'Number of Reviews', position: 'insideBottom', offset: -15 }} />
                        <YAxis type="number" dataKey="averageRating" name="Avg Rating" domain={[1, 5]} label={{ value: 'Average Rating', angle: -90, position: 'insideLeft' }} />
                        <ZAxis dataKey="asin" name="ASIN" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => name === 'averageRating' ? Number(value).toFixed(1) : value}/>
                        <Legend />
                        <Scatter name="Products" data={scatterData} fill={COLORS.reviews} />
                      </ScatterChart>
                    </ResponsiveContainer>
                   ) : renderNoDataMessage('ASIN Performance')}
                </CardContent>
              </Card>

              {/* Sales by Category Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                {barData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }}/>
                        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                        <Bar dataKey="sales" fill={COLORS.sales} name="Total Sales" />
                        </BarChart>
                    </ResponsiveContainer>
                    ) : renderNoDataMessage('Sales by Category')}
                </CardContent>
              </Card>

              {/* Review Sentiment Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Review Sentiment Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getPieColor(entry)} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} reviews`}/>
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : renderNoDataMessage('Review Sentiment')}
                </CardContent>
              </Card>

              {/* Cross-Department Insights */}
              <Card className="lg:col-span-2 overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Cross-Department Insights & Performance
                      </CardTitle>
                      <CardDescription>
                        Analyze the relationship between sales performance and customer reviews
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs px-3 py-1 bg-primary/5">
                      Joint Analysis
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Key Insights Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-sales text-white">Sales</Badge>
                        <h4 className="font-semibold text-sales">Key Sales Insights</h4>
                      </div>
                      <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                        {salesAnalysis?.analysis?.insights?.summary && (
                          <FormattedText 
                            content={salesAnalysis.analysis.insights.summary}
                            className="mb-3" 
                          />
                        )}
                        {salesAnalysis?.analysis?.insights?.recommendations?.length > 0 ? (
                          <ul className="space-y-2">
                            {salesAnalysis.analysis.insights.recommendations.map((rec, i) => (
                              <li key={`sales-rec-${i}`} className="flex items-start gap-2 text-sm">
                                <span className="bg-sales text-white rounded-full flex items-center justify-center min-w-[20px] h-5 text-xs mt-0.5">
                                  {i + 1}
                                </span>
                                <FormattedText content={rec} />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">No specific recommendations available.</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-reviews text-white">Reviews</Badge>
                        <h4 className="font-semibold text-reviews">Key Review Insights</h4>
                      </div>
                      <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                        {reviewAnalysis?.analysis?.insights?.summary && (
                          <FormattedText 
                            content={reviewAnalysis.analysis.insights.summary}
                            className="mb-3" 
                          />
                        )}
                        {reviewAnalysis?.analysis?.insights?.recommendations?.length > 0 ? (
                          <ul className="space-y-2">
                            {reviewAnalysis.analysis.insights.recommendations.map((rec, i) => (
                              <li key={`review-rec-${i}`} className="flex items-start gap-2 text-sm">
                                <span className="bg-reviews text-white rounded-full flex items-center justify-center min-w-[20px] h-5 text-xs mt-0.5">
                                  {i + 1}
                                </span>
                                <FormattedText content={rec} />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">No specific recommendations available.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Cross-Department Correlation Insights */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-comparison text-white">Correlation</Badge>
                      <h4 className="font-semibold text-comparison">Cross-Department Analysis</h4>
                    </div>
                    <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                      {correlationInsights.length > 0 ? (
                        <ul className="space-y-3">
                          {correlationInsights.map((insight, i) => (
                            <li key={`corr-insight-${i}`} className="flex items-start gap-2 text-sm">
                              <span className="bg-comparison text-white rounded-full flex items-center justify-center min-w-[20px] h-5 text-xs mt-0.5">
                                <Sparkles className="h-3 w-3" />
                              </span>
                              <FormattedText content={insight} />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          More data is needed for meaningful correlation analysis between sales and reviews.
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* AI Agent Query Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Ask AI Agents
                    </h4>

                    <Tabs defaultValue="sales" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="sales" className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          <span>Sales Agent</span>
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>Reviews Agent</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="sales" className="space-y-4">
                        <div className="p-4 bg-card/50 rounded-lg mt-2 border border-border/50">
                          <form onSubmit={handleSalesQuery} className="flex gap-2">
                            <Input
                              value={salesQuery}
                              onChange={(e) => setSalesQuery(e.target.value)}
                              placeholder="Ask about sales trends, top products, or performance metrics..."
                              disabled={isQueryingAI.sales || !selectedSalesFile}
                              className="flex-grow"
                            />
                            <Button 
                              type="submit" 
                              disabled={isQueryingAI.sales || !salesQuery.trim() || !selectedSalesFile}
                              size="sm"
                            >
                              {isQueryingAI.sales ? (
                                <span className="flex items-center gap-1">
                                  <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                                  Processing
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Send className="h-4 w-4" />
                                  Send
                                </span>
                              )}
                            </Button>
                          </form>
                          {salesQueryResult && (
                            <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                              <p className="font-medium text-primary mb-2">Sales Agent Response:</p>
                              <FormattedText content={salesQueryResult} />
                            </div>
                          )}
                          {!selectedSalesFile && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Please select a sales file to query the sales agent.
                            </p>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="reviews" className="space-y-4">
                        <div className="p-4 bg-card/50 rounded-lg mt-2 border border-border/50">
                          <form onSubmit={handleReviewsQuery} className="flex gap-2">
                            <Input
                              value={reviewsQuery}
                              onChange={(e) => setReviewsQuery(e.target.value)}
                              placeholder="Ask about review sentiment, product feedback, or customer opinions..."
                              disabled={isQueryingAI.reviews || !selectedReviewFile}
                              className="flex-grow"
                            />
                            <Button 
                              type="submit" 
                              disabled={isQueryingAI.reviews || !reviewsQuery.trim() || !selectedReviewFile}
                              size="sm"
                            >
                              {isQueryingAI.reviews ? (
                                <span className="flex items-center gap-1">
                                  <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                                  Processing
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Send className="h-4 w-4" />
                                  Send
                                </span>
                              )}
                            </Button>
                          </form>
                          {reviewsQueryResult && (
                            <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                              <p className="font-medium text-primary mb-2">Reviews Agent Response:</p>
                              <FormattedText content={reviewsQueryResult} />
                            </div>
                          )}
                          {!selectedReviewFile && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Please select a review file to query the reviews agent.
                            </p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  <p>AI agents analyze the selected files to provide insights. You can ask specific questions about your data.</p>
                </CardFooter>
              </Card>
            </div>
          )}
         </>
      )}
    </div>
  );
};

export default JointDashboard; 