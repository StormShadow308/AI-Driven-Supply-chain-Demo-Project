
import { toast } from '@/hooks/use-toast';
import { DepartmentDataStore, amazonCategories } from '@/types/amazonData';
import { 
  parseSalesCsv, 
  parseInventoryCsv, 
  parseReviewsCsv, 
  detectCsvFormat,
  SalesDataRow,
  InventoryDataRow,
  ReviewDataRow
} from '../csvParser';
import { getDataStore } from './index';
import { saveDataToStorage } from './storage';
import { 
  calculateSalesMetrics, 
  calculateInventoryMetrics, 
  calculateReviewMetrics 
} from './metrics';

// Process a CSV file and store its data
export const processCsvFile = async (file: File, department: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const dataStore = getDataStore();
    
    reader.onload = (event) => {
      try {
        if (!event.target || typeof event.target.result !== 'string') {
          throw new Error('Failed to read file');
        }
        
        const csvContent = event.target.result;
        const csvFormat = detectCsvFormat(csvContent.split('\n')[0]);
        
        if (!csvFormat) {
          toast({
            title: "Invalid CSV format",
            description: "The file doesn't match any of the expected formats (sales, inventory, reviews).",
            variant: "destructive"
          });
          resolve(false);
          return;
        }
        
        // Ensure department exists in store
        if (!dataStore[department]) {
          dataStore[department] = {
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
        }
        
        // Find and update the associated category
        const categoryIndex = amazonCategories.findIndex(c => c.name === department);
        if (categoryIndex >= 0) {
          amazonCategories[categoryIndex].hasData = true;
          
          // Initialize metrics if needed
          if (!amazonCategories[categoryIndex].metrics) {
            amazonCategories[categoryIndex].metrics = {
              sales: 0,
              inventory: 0,
              performance: 0,
              efficiency: 0,
              growth: 0,
              reviewCount: 0
            };
          }
        }
        
        // Parse based on detected format
        switch (csvFormat) {
          case 'sales':
            const salesData = parseSalesCsv(csvContent);
            dataStore[department].salesData = salesData;
            calculateSalesMetrics(department, salesData);
            toast({
              title: "Sales data processed",
              description: `Loaded ${salesData.length} sales records for ${department.replace(/_/g, ' ')}`,
            });
            break;
            
          case 'inventory':
            const inventoryData = parseInventoryCsv(csvContent);
            dataStore[department].inventoryData = inventoryData;
            calculateInventoryMetrics(department, inventoryData);
            toast({
              title: "Inventory data processed",
              description: `Loaded ${inventoryData.length} inventory records for ${department.replace(/_/g, ' ')}`,
            });
            break;
            
          case 'reviews':
            const reviewData = parseReviewsCsv(csvContent);
            dataStore[department].reviewData = reviewData;
            calculateReviewMetrics(department, reviewData);
            toast({
              title: "Review data processed",
              description: `Loaded ${reviewData.length} review records for ${department.replace(/_/g, ' ')}`,
            });
            break;
        }
        
        // Store data in localStorage for persistence
        saveDataToStorage(department, dataStore[department]);
        
        resolve(true);
      } catch (error) {
        console.error('Error processing CSV file:', error);
        toast({
          title: "Error processing file",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
        resolve(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Failed to read the file content",
        variant: "destructive"
      });
      resolve(false);
    };
    
    reader.readAsText(file);
  });
};
