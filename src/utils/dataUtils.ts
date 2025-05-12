import { 
  amazonCategories, 
  mockDepartments
} from "@/types/amazonData";

// Function to generate aggregated sales data for visualization
export const getAggregatedSalesData = () => {
  return [];
};

// Function to generate performance data for visualization
export const getPerformanceData = () => {
  return [];
};

// Helper function to generate colors for charts
export const getChartColorByIndex = (index: number): string => {
  const colors = [
    '#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#10B981',
    '#6366F1', '#EC4899', '#F59E0B', '#06B6D4', '#22C55E',
    '#8E9196', '#9b87f5', '#7E69AB', '#6E59A5', '#D6BCFA'
  ];
  return colors[index % colors.length];
};

// Generate properly formatted comparison data
export const formatComparisonData = (data: any[], metricKey: string) => {
  return data.map((item, index) => ({
    department: item.name || `Item ${index}`,
    value: item[metricKey] || 0,
    color: getChartColorByIndex(index),
    // Keep the original metrics too
    ...item
  }));
};

// Update the getComparisonData function to include proper structure
export const getComparisonData = (type = 'sales') => {
  return [];
};

// Function to process uploaded files
export const processUploadedFiles = async (files: File[]) => {
  return {
    salesData: [],
    reviewData: [],
    inventoryData: []
  };
};

// Function to analyze departments
export const analyzeDepartments = async (query: string, department?: string) => {
  return {
    analysis: "",
    insights: [],
    recommendations: []
  };
};

// Function to enhance mock departments with additional data for UI display
export const getEnhancedMockDepartments = () => {
  return [];
};
