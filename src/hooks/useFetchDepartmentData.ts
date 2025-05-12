import { useState, useEffect } from 'react';
import { DepartmentData } from '../types/types'; // Assuming types.ts is in src/types

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useFetchDepartmentData = (department: string) => {
  const [data, setData] = useState<DepartmentData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!department) {
        setIsLoading(false);
        return; // Don't fetch if department is not provided
      }

      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/department/${department}`);
        if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
            const errBody = await response.json();
            errorMsg = errBody.error || errBody.message || errorMsg;
          } catch (e) { /* Ignore parsing error */ }
          throw new Error(errorMsg);
        }
        const result: DepartmentData = await response.json();
        if (result.success) {
          setData(result);
        } else {
          throw new Error(result.error || 'Failed to fetch department data.');
        }
      } catch (err) {
        console.error(`Error fetching data for department ${department}:`, err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Cleanup function (optional, depends on use case)
    // return () => {
    //   // Abort fetch or other cleanup if needed
    // };
  }, [department]); // Re-run effect if department changes

  return { data, isLoading, error };
}; 