
import { DepartmentDataStore, amazonCategories } from '@/types/amazonData';
import { getDataStore, initializeDataStore } from './index';

// Load saved data from localStorage
export const loadDataFromStorage = () => {
  try {
    // Initialize with empty structure
    initializeDataStore();
    const dataStore = getDataStore();
    
    // Try to load data for each department
    amazonCategories.forEach(category => {
      const storageKey = `amazonData_${category.name}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          dataStore[category.name] = parsedData;
          
          // Mark as having data if any data arrays have elements
          const hasAnyData = 
            (parsedData.salesData && parsedData.salesData.length > 0) || 
            (parsedData.inventoryData && parsedData.inventoryData.length > 0) || 
            (parsedData.reviewData && parsedData.reviewData.length > 0);
          
          if (hasAnyData) {
            // Update the category object too
            const categoryIndex = amazonCategories.findIndex(c => c.name === category.name);
            if (categoryIndex >= 0) {
              amazonCategories[categoryIndex].hasData = true;
              amazonCategories[categoryIndex].metrics = parsedData.metrics;
            }
          }
        } catch (e) {
          console.error(`Error parsing stored data for ${category.name}:`, e);
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error loading data from storage:', error);
    return false;
  }
};

// Clear all stored data
export const clearAllData = () => {
  try {
    // Clear localStorage
    amazonCategories.forEach(category => {
      localStorage.removeItem(`amazonData_${category.name}`);
    });
    
    // Reset global store
    const dataStore = getDataStore();
    Object.keys(dataStore).forEach(key => {
      delete dataStore[key];
    });
    
    initializeDataStore();
    
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

// Save data to localStorage
export const saveDataToStorage = (department: string, data: any) => {
  try {
    localStorage.setItem(
      `amazonData_${department}`, 
      JSON.stringify(data)
    );
    return true;
  } catch (e) {
    console.warn('Failed to store data in localStorage', e);
    return false;
  }
};
