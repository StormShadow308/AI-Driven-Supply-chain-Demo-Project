/**
 * API service for connecting to the Python backend
 */

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create an axios instance with extended timeout for large file uploads
const uploadAxios = axios.create({
  timeout: 3600000, // 1 hour timeout for large file uploads
});

// Types for API responses
interface ApiResponse {
  success: boolean;
  error?: string;
}

interface DepartmentsResponse extends ApiResponse {
  departments: string[];
}

interface FileInfo {
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

interface UploadResponse extends ApiResponse {
  department: string;
  format?: string;
  message?: string;
  file_info?: FileInfo;
  file_count?: number;
  uploaded_files?: FileInfo[];
  failed_files?: FailedFileInfo[];
  invalid_department_files?: FailedFileInfo[];
  detected_format?: string;
  expected_department?: string;
  results?: Array<{
    filename: string;
    department: string;
    detected_format: string;
    status: string;
  }>;
}

interface AnalysisResponse extends ApiResponse {
  department: string;
  file_id: string;
  format: string;
  analysis: {
    chart_data: any;
    insights: {
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
      holidays?: string;
      ratings?: string;
      recommendations: string[];
      [key: string]: any;
    };
  };
}

// Helper Interfaces for Chart Data Structures
interface ChartDataBase {
    labels: string[];
    values: (number | string)[]; // Allow string values too, e.g., for ratings
    title?: string;
    description?: string;
    type?: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
    // Add other potential common properties if known
}

interface ScatterDataPoint {
  x: number;
  y: number;
  z?: number; // Optional size dimension
  [key: string]: any; // Allow other properties like ASIN
}

interface ASINScatterChartData {
  title?: string;
  description?: string;
  data: ScatterDataPoint[];
  type: 'scatter'; // Type hint for specific rendering
}

// GenericChartInfo combines base structure with possibility of specific known structures
// Using 'any' for chartInfo is still necessary due to Object.entries, but we check structure
type ChartInfo = ChartDataBase | ASINScatterChartData | { [key: string]: any };

/**
 * Upload a single CSV file for analysis
 */
export const uploadFile = async (
  file: File, 
  department: string
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('department', department);
    
    const response = await uploadAxios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data as UploadResponse;
  } catch (error: any) {
    console.error('File upload failed:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Upload failed',
      department
    };
  }
};

/**
 * Upload multiple CSV files for combined analysis
 */
export const uploadMultipleFiles = async (
  files: File[],
  department: string
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('department', department);
    
    const response = await uploadAxios.post(`${API_URL}/analyze/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data as UploadResponse;
  } catch (error: any) {
    console.error('Multiple files upload failed:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Upload failed',
      department
    };
  }
};

/**
 * Upload multiple files with different departments
 */
export const uploadMultiFilesWithDepartments = async (
  filesWithDepts: Array<{file: File, department: string}>
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    
    filesWithDepts.forEach(({file, department}) => {
      formData.append('files', file);
      formData.append('departments', department);
    });
    
    const response = await uploadAxios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data as UploadResponse;
  } catch (error: any) {
    console.error('Multi-department files upload failed:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Upload failed',
      department: 'multiple'
    };
  }
};

/**
 * Get list of departments with data
 */
export const getDepartments = async (): Promise<DepartmentsResponse> => {
  try {
    const response = await axios.get(`${API_URL}/departments`);
    return response.data as DepartmentsResponse;
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return { success: false, departments: [] };
  }
};

/**
 * Check API health status
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

/**
 * Get department data
 */
export const getDepartmentData = async (department: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/department/${department}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch data for department ${department}:`, error);
    throw error;
  }
};

/**
 * Get AI analysis for a specific file
 * Returns both numerical data for charts and textual insights for descriptions
 */
export const getFileAnalysis = async (department: string, fileId: string): Promise<AnalysisResponse> => {
  try {
    console.log(`Requesting analysis for file ${fileId} in department ${department}`);
    const response = await axios.get(`${API_URL}/analyze/${department}/${fileId}`);
    console.log(`Analysis response received successfully: ${response.data.success}`);
    return response.data as AnalysisResponse;
  } catch (error: any) {
    console.error(`Failed to get analysis for file ${fileId} in department ${department}:`, error);
    
    // Extract the specific error message from the backend if available
    const backendError = error.response?.data?.error || 'Analysis failed';
    console.error(`Backend error details: ${backendError}`);
    
    // Return a structured error response
    return {
      success: false,
      error: backendError,
      department,
      file_id: fileId,
      format: '',
      analysis: {
        chart_data: {},
        insights: {
          summary: `Analysis failed: ${backendError}`,
          recommendations: [
            "Check if the file contains all required data columns",
            "Make sure the file is not corrupted",
            "Try uploading a different file with the correct format"
          ]
        }
      }
    };
  }
};

/**
 * Process analysis results to get numerical data for charts
 */
export const extractChartData = (analysis: AnalysisResponse): any => {
  if (!analysis.success || !analysis.analysis) {
    return {};
  }
  
  return analysis.analysis.chart_data;
};

/**
 * Process analysis results to get textual insights for descriptions
 */
export const extractInsights = (analysis: AnalysisResponse): any => {
  if (!analysis.success || !analysis.analysis) {
    return {
      summary: 'No insights available',
      recommendations: []
    };
  }
  
  return analysis.analysis.insights;
};

/**
 * Transform chart data for different visualization types
 */
export const transformChartData = (chartData: any, format: string): any => {
  if (!chartData) return [];
  
  // Helper function to convert label/value arrays to objects
  const convertToObjects = (data: any, labelKey: string, valueKey: string) => {
    if (data && data.labels && data.values && Array.isArray(data.labels) && Array.isArray(data.values)) {
      // This is the new format with labels and values arrays
      const result = [];
      const length = Math.min(data.labels.length, data.values.length);
      
      for (let i = 0; i < length; i++) {
        const obj: any = {};
        obj[labelKey] = data.labels[i];
        obj[valueKey] = data.values[i];
        result.push(obj);
      }
      
      return result;
    } else if (Array.isArray(data)) {
      // This is the old format with array of objects
      return data;
    }
    
    return [];
  };
  
  // Helper to convert to pie chart format
  const toPieFormat = (data: any, labelField: string, valueField: string) => {
    if (data && data.labels && data.values) {
      return data.labels.map((label: string, i: number) => ({
        name: label,
        value: data.values[i] || 0
      }));
    } else if (Array.isArray(data)) {
      return data.map((item: any) => ({
        name: item[labelField],
        value: item[valueField]
      }));
    }
    return [];
  };
  
  switch (format) {
    case 'sales':
      // Process sales data
      const salesResult = [];
      
      // Sales by category for pie chart
      if (chartData.sales_by_category) {
        const categoryData = toPieFormat(chartData.sales_by_category, 'product_category', 'total_amount');
        
        salesResult.push({
          key: 'salesByCategory',
          title: chartData.sales_by_category.title || 'Sales by Category',
          description: chartData.sales_by_category.description || 'Distribution of sales across product categories',
          data: categoryData,
          type: 'pie'
        });
      }
      
      // Sales over time for area chart
      if (chartData.sales_over_time) {
        const timeSeriesData = convertToObjects(chartData.sales_over_time, 'date', 'total_amount');
        
        salesResult.push({
          key: 'salesOverTime',
          title: chartData.sales_over_time.title || 'Sales Trend',
          description: chartData.sales_over_time.description || 'Sales trend over time',
          data: timeSeriesData,
          type: 'area',
          xKey: 'date',
          yKey: 'total_amount'
        });
      }
      
      // Age distribution for bar chart
      if (chartData.age_distribution) {
        const ageData = convertToObjects(chartData.age_distribution, 'age_group', 'count');
        
        salesResult.push({
          key: 'ageDistribution',
          title: chartData.age_distribution.title || 'Customer Age Distribution',
          description: chartData.age_distribution.description || 'Breakdown of customers by age group',
          data: ageData,
          type: 'bar',
          xKey: 'age_group',
          yKey: 'count'
        });
      }
      
      // Gender distribution for pie chart
      if (chartData.gender_distribution) {
        const genderData = toPieFormat(chartData.gender_distribution, 'gender', 'count');
        
        salesResult.push({
          key: 'genderDistribution',
          title: chartData.gender_distribution.title || 'Customer Gender Distribution',
          description: chartData.gender_distribution.description || 'Breakdown of customers by gender',
          data: genderData,
          type: 'pie'
        });
      }
      
      // Payment methods for bar chart
      if (chartData.payment_methods) {
        const paymentData = convertToObjects(chartData.payment_methods, 'payment_method', 'count');
        
        salesResult.push({
          key: 'paymentMethods',
          title: chartData.payment_methods.title || 'Payment Methods',
          description: chartData.payment_methods.description || 'Breakdown of transactions by payment method',
          data: paymentData,
          type: 'bar',
          xKey: 'payment_method',
          yKey: 'count'
        });
      }
      
      // Regions for bar chart
      if (chartData.regions) {
        const regionData = convertToObjects(chartData.regions, 'region', 'total_amount');
        
        salesResult.push({
          key: 'regionPerformance',
          title: chartData.regions.title || 'Regional Sales Performance',
          description: chartData.regions.description || 'Sales performance by geographical region',
          data: regionData,
          type: 'bar',
          xKey: 'region',
          yKey: 'total_amount'
        });
      }
      
      // Return sample data if no charts were created
      if (salesResult.length === 0) {
        // Instead of generating dummy data, return an empty array to indicate no real data is available
        console.error('No sales data available for visualization');
        return [];
      }
      
      return salesResult;
      
    case 'inventory':
      // Process inventory data
      const inventoryResult = [];
      
      // Inventory by product category
      if (chartData.inventory_by_category) {
        const categoryData = toPieFormat(chartData.inventory_by_category, 'category', 'stock_count');
        
        inventoryResult.push({
          key: 'inventoryByCategory',
          title: chartData.inventory_by_category.title || 'Inventory by Category',
          description: chartData.inventory_by_category.description || 'Stock levels across product categories',
          data: categoryData,
          type: 'pie'
        });
      }
      
      // Inventory changes over time
      if (chartData.inventory_over_time) {
        const timeSeriesData = convertToObjects(chartData.inventory_over_time, 'date', 'stock_level');
        
        inventoryResult.push({
          key: 'inventoryOverTime',
          title: chartData.inventory_over_time.title || 'Inventory Levels Over Time',
          description: chartData.inventory_over_time.description || 'Stock level changes over time',
          data: timeSeriesData,
          type: 'line',
          xKey: 'date',
          yKey: 'stock_level'
        });
      }
      
      // Low stock items
      if (chartData.low_stock_items) {
        const lowStockData = convertToObjects(chartData.low_stock_items, 'product_name', 'stock_count');
        
        inventoryResult.push({
          key: 'lowStockItems',
          title: chartData.low_stock_items.title || 'Low Stock Items',
          description: chartData.low_stock_items.description || 'Products with critically low inventory levels',
          data: lowStockData,
          type: 'bar',
          xKey: 'product_name',
          yKey: 'stock_count'
        });
      }
      
      // Return sample data if no charts were created
      if (inventoryResult.length === 0) {
        inventoryResult.push({
          key: 'inventorySample',
          title: 'Sample Inventory Data',
          description: 'Sample inventory data for demonstration',
          data: [
            { category: 'Electronics', count: 320 },
            { category: 'Clothing', count: 450 },
            { category: 'Home Goods', count: 280 },
            { category: 'Books', count: 190 }
          ],
          type: 'bar',
          xKey: 'category',
          yKey: 'count'
        });
      }
      
      return inventoryResult;
      
    case 'reviews':
      // Process review data
      const reviewsResult = [];
      
      // Rating distribution (Bar chart)
      if (chartData.rating_distribution && chartData.rating_distribution.labels && chartData.rating_distribution.values) {
        reviewsResult.push({
          key: 'ratingDistribution',
          title: chartData.rating_distribution.title || 'Rating Distribution',
          description: chartData.rating_distribution.description || 'Distribution of customer ratings',
          data: convertToObjects(chartData.rating_distribution, 'rating', 'count'), // Use helper
          type: 'bar',
          xKey: 'rating',
          yKey: 'count'
        });
      }
      
      // Average rating over time (Line chart)
      if (chartData.rating_over_time && chartData.rating_over_time.labels && chartData.rating_over_time.values) {
        reviewsResult.push({
          key: 'ratingOverTime',
          title: chartData.rating_over_time.title || 'Average Rating Over Time',
          description: chartData.rating_over_time.description || 'Trend of average customer ratings',
          data: convertToObjects(chartData.rating_over_time, 'date', 'average_rating'), // Use helper
          type: 'line',
          xKey: 'date',
          yKey: 'average_rating'
        });
      }

      // Sentiment distribution (Pie chart)
      if (chartData.sentiment_distribution && chartData.sentiment_distribution.labels && chartData.sentiment_distribution.values) {
         reviewsResult.push({
           key: 'sentimentDistribution',
           title: chartData.sentiment_distribution.title || 'Sentiment Distribution',
           description: chartData.sentiment_distribution.description || 'Overall sentiment breakdown',
           data: toPieFormat(chartData.sentiment_distribution, 'sentiment', 'count'), // Use helper
           type: 'pie',
           nameKey: 'name', // Key for pie chart labels
           dataKey: 'value' // Key for pie chart values
         });
       }

       // Topic distribution (Bar chart)
       if (chartData.topic_distribution && chartData.topic_distribution.labels && chartData.topic_distribution.values) {
          reviewsResult.push({
            key: 'topicDistribution',
            title: chartData.topic_distribution.title || 'Topic Distribution',
            description: chartData.topic_distribution.description || 'Frequency of discussed topics',
            data: convertToObjects(chartData.topic_distribution, 'topic', 'frequency'), // Use helper
            type: 'bar',
            xKey: 'topic',
            yKey: 'frequency'
          });
        }

       // Sentiment by category (Grouped Bar potentially - requires more complex handling in DataVisualization or specific component)
       // For now, let's add basic bar chart support if data exists
       if (chartData.sentiment_by_category && chartData.sentiment_by_category.categories && chartData.sentiment_by_category.sentiments) {
         // This data structure might be more complex (e.g., nested). 
         // Simple transformation for now - assuming direct categories and maybe average sentiment?
         // This might need refinement based on actual backend output structure.
         console.warn("Sentiment by Category chart transformation might be basic.");
         // Example: transform if it's a simple structure like { categories: ['A', 'B'], values: [positive_count_A, positive_count_B] }
         // We need to know the exact structure from the backend to transform accurately.
         // Let's assume for now it has 'labels' and 'values' directly like other charts for basic display.
          if(chartData.sentiment_by_category.labels && chartData.sentiment_by_category.values) {
             reviewsResult.push({
               key: 'sentimentByCategory',
               title: chartData.sentiment_by_category.title || 'Sentiment by Category',
               description: chartData.sentiment_by_category.description || 'Sentiment breakdown across categories',
               data: convertToObjects(chartData.sentiment_by_category, 'category', 'sentiment_score'), // Adjust keys as needed
               type: 'bar',
               xKey: 'category',
               yKey: 'sentiment_score' 
             });
         }
       }

       // ASIN Sentiment Distribution (Scatter Plot - handled specifically in component)
       // We still need to pass its data through if it exists
       if (chartData.asin_sentiment_distribution && chartData.asin_sentiment_distribution.data) {
           reviewsResult.push({
              key: 'asinSentimentDistribution', // Keep the key for component check
              title: chartData.asin_sentiment_distribution.title || 'ASIN Sentiment Distribution',
              description: chartData.asin_sentiment_distribution.description || 'Rating vs Sentiment per ASIN',
              data: chartData.asin_sentiment_distribution.data, // Pass raw data for scatter plot component
              type: 'scatter' // Indicate type for potential filtering, though component handles rendering
           });
       }

      // --- Add other review chart transformations here as needed --- 
      
      // If no specific charts were generated, check for generic chart data
      if (reviewsResult.length === 0) {
          Object.entries(chartData).forEach(([key, chartInfoUntyped]) => {
            // Assert the type after basic checks for more specific access
            const chartInfo = chartInfoUntyped as ChartInfo; 

            // Avoid re-adding already processed charts if backend sends duplicates
            if (!reviewsResult.some(c => c.key === key) && 
                chartInfo && 
                typeof chartInfo === 'object' && 
                'labels' in chartInfo && Array.isArray(chartInfo.labels) && // Check base properties
                'values' in chartInfo && Array.isArray(chartInfo.values)) 
            {
                 console.log(`Adding generic review chart for key: ${key}`);
                 reviewsResult.push({
                     key: key,
                     // Access properties safely now that base structure is confirmed
                     title: chartInfo.title || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                     description: chartInfo.description || '' ,
                     data: convertToObjects(chartInfo, 'label', 'value'), // Generic keys for conversion
                     type: chartInfo.type || 'bar', // Default type
                     xKey: 'label',
                     yKey: 'value'
                 });
            }
          });
      }
      
      // Return sample data if still no charts were created after all checks
      if (reviewsResult.length === 0) {
        console.log("No specific review charts found, returning sample.");
        reviewsResult.push({
          key: 'reviewsSample',
          title: 'Sample Review Data',
          description: 'Sample review data for demonstration',
          data: [
            { rating: '5 Stars', count: 45 },
            { rating: '4 Stars', count: 32 },
            { rating: '3 Stars', count: 18 },
            { rating: '2 Stars', count: 7 },
            { rating: '1 Star', count: 5 }
          ],
          type: 'bar',
          xKey: 'rating',
          yKey: 'count'
        });
      }
      
      return reviewsResult;
      
    default:
      return [];
  }
};

/**
 * Query the sales AI agent with a specific question
 */
export const querySalesAgent = async (
  query: string,
  fileId?: string,
  department?: string
): Promise<{
  success: boolean;
  response?: string;
  error?: string;
}> => {
  try {
    const payload = {
      query,
      fileId,
      department
    };
    
    const response = await axios.post(`${API_URL}/sales-agent/query`, payload);
    return response.data;
  } catch (error: any) {
    console.error('Error querying sales agent:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to query the sales agent'
    };
  }
};

/**
 * Query the Review AI Agent with a natural language question
 */
export const queryReviewAgent = async (
  query: string,
  fileId?: string,
  department: string = 'reviews'
): Promise<{
  success: boolean;
  response?: string;
  error?: string;
}> => {
  try {
    const payload = {
      query,
      fileId,
      department
    };
    
    const response = await axios.post(`${API_URL}/review-agent/query`, payload);
    return response.data;
  } catch (error: any) {
    console.error('Error querying review agent:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to query the review agent'
    };
  }
};

/**
 * Upload a file directly for immediate analysis
 */
export const uploadDirectFile = async (
  file: File,
  department: string = 'sales'
): Promise<{
  success: boolean;
  filename?: string;
  analysis_url?: string;
  error?: string;
}> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('department', department);
    
    const response = await uploadAxios.post(`${API_URL}/upload-direct`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Direct file upload failed:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Upload failed. Please check your CSV file format.'
    };
  }
};

/**
 * Debug the analysis of a CSV file to ensure we're getting real data
 */
export const debugFileAnalysis = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await uploadAxios.post(`${API_URL}/debug-analysis`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Analysis debugging failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to debug file analysis',
      file_info: null,
      analysis_result: null,
      chart_result: null
    };
  }
}; 