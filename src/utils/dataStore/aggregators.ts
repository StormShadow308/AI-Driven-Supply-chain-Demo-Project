
import { getDataStore } from './index';
import { amazonCategories } from '@/types/amazonData';

// Get aggregated data by type
export const getAggregatedData = (type: 'sales' | 'inventory' | 'reviews') => {
  const dataStore = getDataStore();
  const departments = Object.keys(dataStore);
  const result = [];
  
  switch (type) {
    case 'sales':
      // Aggregate by category
      for (const dept of departments) {
        if (dataStore[dept].salesData.length > 0) {
          const displayName = amazonCategories.find(c => c.name === dept)?.displayName || dept.replace(/_/g, ' ');
          result.push({
            name: displayName,
            value: dataStore[dept].metrics?.sales || 0,
            count: dataStore[dept].salesData.length
          });
        }
      }
      break;
      
    case 'inventory':
      for (const dept of departments) {
        if (dataStore[dept].inventoryData.length > 0) {
          const displayName = amazonCategories.find(c => c.name === dept)?.displayName || dept.replace(/_/g, ' ');
          result.push({
            name: displayName,
            value: dataStore[dept].metrics?.inventory || 0,
            count: dataStore[dept].inventoryData.length
          });
        }
      }
      break;
      
    case 'reviews':
      for (const dept of departments) {
        if (dataStore[dept].reviewData.length > 0) {
          const displayName = amazonCategories.find(c => c.name === dept)?.displayName || dept.replace(/_/g, ' ');
          result.push({
            name: displayName,
            value: dataStore[dept].metrics?.reviewCount || 0,
            count: dataStore[dept].reviewData.length
          });
        }
      }
      break;
  }
  
  // Sort by value
  return result.sort((a, b) => b.value - a.value);
};
