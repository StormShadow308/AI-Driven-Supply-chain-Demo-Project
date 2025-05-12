// src/types/types.ts

// Type for individual file information within a department
export interface DepartmentFile {
  filename: string;
  session_id: string;
  relative_path: string;
  upload_date: string; // ISO format string
  file_id: string; // Often same as filename, used for analysis URL
  row_count?: number;
  column_count?: number;
  columns?: string[];
  read_error?: string;
  // Department-specific metrics (optional)
  total_sales?: number;
  total_quantity?: number;
  total_inventory?: number;
  avg_rating?: number;
}

// Type for the response from /api/department/<department>
export interface DepartmentData {
  success: boolean;
  department: string;
  file_count: number;
  files: DepartmentFile[];
  metrics?: {
    total_sales?: number;
    transaction_count?: number;
    performance?: number;
    efficiency?: number;
    growth?: number;
    analysis_summary?: string;
    time_series?: { labels: string[]; values: number[] };
    total_inventory?: number;
    item_count?: number;
    total_reviews?: number;
    avg_rating?: number;
    star_distribution?: { [key: string]: number }; // e.g., { "1_star": 10, ... }
    sentiment_summary?: string;
  };
  error?: string;
}

// Generic Chart Data Structure (adjust based on actual API responses)
export interface ChartData {
  labels: string[];
  values: number[];
  title?: string;
  description?: string;
  type?: 'line' | 'bar' | 'pie' | 'scatter' | 'doughnut'; // Add other types as needed
  // Optional: For more complex charts like Pie/Doughnut with specific colors
  datasets?: Array<{
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    // Add other chart.js dataset options if needed
  }>;
   // Adding potential structure for ASIN Scatter plot from reviews
  data?: Array<{ asin: string; reviewCount: number; averageRating: number }>; // For scatter plots
}

// Insights Structure
export interface InsightData {
  summary: string;
  recommendations?: string[];
}

// Type for the response from /api/analyze/<department>/<file_id>
export interface FileAnalysisData {
  success: boolean;
  department: string;
  file_id: string;
  format?: string;
  analysis?: {
    chart_data: { [key: string]: ChartData }; // e.g., { sales_over_time: ChartData, ... }
    insights: InsightData;
  };
  error?: string;
  debug_info?: any; // For potential debugging information
}

// Type for file upload response from /api/upload
export interface UploadResponse {
  success: boolean;
  file_count: number;
  uploaded_files: Array<{
    filename: string;
    original_filename: string;
    row_count: number;
    column_count: number;
    columns: string[];
    format: string;
    department: string;
    sample_data: any[][];
    categories: string[];
    session_id: string;
    timestamp: string; // ISO format string
    file_path: string;
  }>;
  failed_files: Array<{
    filename: string;
    original_filename?: string;
    error: string;
    detected_format: string;
  }>;
  invalid_department_files: any[]; // Adjust if structure is known
  message: string;
  department: string; // Can be 'multiple'
  error?: string;
} 