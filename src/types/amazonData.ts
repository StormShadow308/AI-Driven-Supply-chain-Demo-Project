export type AmazonCategory = {
  name: string;
  reviewCount: number;
  displayName?: string;
  hasData?: boolean;
  metrics?: DepartmentMetrics;
};

export type DepartmentMetrics = {
  sales: number;
  inventory: number;
  performance: number;
  efficiency: number;
  growth: number;
  reviewCount?: number;
};

export interface DepartmentDataStore {
  [key: string]: {
    salesData: any[];
    reviewData: any[];
    inventoryData: any[];
    metrics?: DepartmentMetrics;
  };
}

export interface DepartmentData {
  id: string;
  name: string;
  metrics: DepartmentMetrics;
  salesHistory?: Array<{
    month: string;
    sales: number;
  }>;
  inventoryHistory?: Array<{
    month: string;
    count: number;
  }>;
}

// Amazon categories - empty array by default, will be populated from API
export const amazonCategories: AmazonCategory[] = [];

// Empty sample data - will be populated from real data
export const sampleSalesData: any[] = [];
export const sampleInventoryData: any[] = [];
export const sampleReviewData: any[] = [];

// Empty mock departments data
export const mockDepartments: any[] = [];
