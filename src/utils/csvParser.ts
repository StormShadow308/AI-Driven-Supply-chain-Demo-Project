/**
 * CSV Parser Utility for handling different CSV formats
 */

import Papa from 'papaparse';

// Interfaces for different CSV formats - must match the provided spreadsheets exactly
export interface SalesDataRow {
  transaction_id: string;
  timestamp: string;
  customer_id: string;
  product_id: string;
  product_category: string;
  quantity: string;
  price: string;
  discount: string;
  payment_method: string;
  customer_age: string;
  customer_gender: string;
  customer_location: string;
  total_amount: string;
}

export interface InventoryDataRow {
  date: string;
  store_id: string;
  product_id: string;
  category: string;
  region: string;
  inventory_level: string;
  units_sold: string;
  units_ordered: string;
  demand_forecast: string;
  price: string;
  discount: string;
  weather_condition: string;
  holiday: string;
  competitor_price: string;
  seasonality: string;
}

export interface ReviewDataRow {
  asin: string;
  review_text: string;
  overall: string;
  category: string;
  summary: string;
}

// Required headers for each CSV format
const SALES_REQUIRED_HEADERS = [
  'transaction_id', 'timestamp', 'customer_id', 'product_id', 'product_category',
  'quantity', 'price', 'discount', 'payment_method', 'customer_age', 
  'customer_gender', 'customer_location', 'total_amount'
];

const INVENTORY_REQUIRED_HEADERS = [
  'date', 'store_id', 'product_id', 'category', 'region', 'inventory_level',
  'units_sold', 'units_ordered', 'demand_forecast', 'price', 'discount',
  'weather_condition', 'holiday', 'competitor_price', 'seasonality'
];

const REVIEW_REQUIRED_HEADERS = [
  'asin', 'review_text', 'overall', 'category', 'summary'
];

// Detect the format of a CSV by checking its headers
export function detectCsvFormat(
  headers: string[]
): 'sales' | 'inventory' | 'reviews' | 'unknown' {
  // Normalize headers to lowercase for case-insensitive comparison
  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
  
  // Check for sales data format
  if (
    SALES_REQUIRED_HEADERS.every(h => normalizedHeaders.includes(h.toLowerCase())) &&
    normalizedHeaders.length === SALES_REQUIRED_HEADERS.length
  ) {
    return 'sales';
  }
  
  // Check for inventory data format
  if (
    INVENTORY_REQUIRED_HEADERS.every(h => normalizedHeaders.includes(h.toLowerCase())) &&
    normalizedHeaders.length === INVENTORY_REQUIRED_HEADERS.length
  ) {
    return 'inventory';
  }
  
  // Check for reviews data format
  if (
    REVIEW_REQUIRED_HEADERS.every(h => normalizedHeaders.includes(h.toLowerCase())) &&
    normalizedHeaders.length === REVIEW_REQUIRED_HEADERS.length
  ) {
    return 'reviews';
  }
  
  // No match found
  return 'unknown';
}

// Validate a CSV file against its expected format
export function validateCsvFormat(
  csvString: string,
  expectedFormat: 'sales' | 'inventory' | 'reviews'
): { isValid: boolean; error?: string } {
  try {
    // Parse the first line to get headers
    const firstLine = csvString.split('\n')[0];
    const parsedHeaders = Papa.parse(firstLine).data[0] as string[];
    
    const detectedFormat = detectCsvFormat(parsedHeaders);
    
    if (detectedFormat === 'unknown') {
      return {
        isValid: false,
        error: `Invalid CSV format. The file must contain exactly the required headers for ${expectedFormat} data.`
      };
    }
    
    if (detectedFormat !== expectedFormat) {
      return {
        isValid: false,
        error: `CSV format mismatch. Expected ${expectedFormat} but detected ${detectedFormat}.`
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to validate CSV: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Parse a sales CSV string to typed data
export function parseSalesCsv(csvString: string): SalesDataRow[] {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true
  });
  
  // Validate format
  const headers = Object.keys(result.data[0] || {});
  const format = detectCsvFormat(headers);
  
  if (format !== 'sales') {
    throw new Error('Invalid sales CSV format. The file must contain exactly the required headers.');
  }
  
  return result.data as SalesDataRow[];
}

// Parse an inventory CSV string to typed data
export function parseInventoryCsv(csvString: string): InventoryDataRow[] {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true
  });
  
  // Validate format
  const headers = Object.keys(result.data[0] || {});
  const format = detectCsvFormat(headers);
  
  if (format !== 'inventory') {
    throw new Error('Invalid inventory CSV format. The file must contain exactly the required headers.');
  }
  
  return result.data as InventoryDataRow[];
}

// Parse a reviews CSV string to typed data
export function parseReviewsCsv(csvString: string): ReviewDataRow[] {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true
  });
  
  // Validate format
  const headers = Object.keys(result.data[0] || {});
  const format = detectCsvFormat(headers);
  
  if (format !== 'reviews') {
    throw new Error('Invalid reviews CSV format. The file must contain exactly the required headers.');
  }
  
  return result.data as ReviewDataRow[];
}

// Generic function to parse any supported CSV format
export function parseCsv<T>(
  csvString: string,
  expectedFormat: 'sales' | 'inventory' | 'reviews'
): T[] {
  const { isValid, error } = validateCsvFormat(csvString, expectedFormat);
  
  if (!isValid) {
    throw new Error(error);
  }
  
  if (expectedFormat === 'sales') {
    return parseSalesCsv(csvString) as unknown as T[];
  } else if (expectedFormat === 'inventory') {
    return parseInventoryCsv(csvString) as unknown as T[];
  } else if (expectedFormat === 'reviews') {
    return parseReviewsCsv(csvString) as unknown as T[];
  }
  
  throw new Error(`Unsupported format: ${expectedFormat}`);
}

export default {
  detectCsvFormat,
  validateCsvFormat,
  parseSalesCsv,
  parseInventoryCsv,
  parseReviewsCsv,
  parseCsv
};
