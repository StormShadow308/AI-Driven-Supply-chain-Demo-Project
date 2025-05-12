
import { DepartmentDataStore, amazonCategories } from '@/types/amazonData';
import { loadDataFromStorage } from './storage';
import { processCsvFile } from './csvProcessor';
import { getAggregatedData } from './aggregators';
import { clearAllData } from './storage';

// Global state to store parsed data
const globalDataStore: DepartmentDataStore = {};

// Initialize with empty data for all departments
export const initializeDataStore = () => {
  // Create empty entries for all Amazon categories
  amazonCategories.forEach(category => {
    globalDataStore[category.name] = {
      salesData: [],
      reviewData: [],
      inventoryData: [],
      metrics: {
        sales: 0,
        inventory: 0,
        performance: 0,
        efficiency: 0,
        growth: 0,
        reviewCount: 0
      }
    };
  });
  
  // Also update hasData flag on the categories
  amazonCategories.forEach(category => {
    category.hasData = false;
    category.metrics = {
      sales: 0,
      inventory: 0,
      performance: 0,
      efficiency: 0,
      growth: 0,
      reviewCount: 0
    };
  });
  
  return globalDataStore;
};

// Get the global data store
export const getDataStore = (): DepartmentDataStore => {
  // Initialize if empty
  if (Object.keys(globalDataStore).length === 0) {
    initializeDataStore();
  }
  
  return globalDataStore;
};

// Export all the functionality
export { 
  processCsvFile,
  loadDataFromStorage,
  clearAllData,
  getAggregatedData
};

// Initialize on first import
initializeDataStore();
loadDataFromStorage();
