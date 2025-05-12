import { useState, useEffect } from 'react';
import { FileAnalysisData } from '../types/types'; // Assuming types.ts is in src/types

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useFetchFileAnalysis = (
  department: string | null,
  fileId: string | null,
  enabled: boolean = true // Only fetch if enabled is true
) => {
  const [data, setData] = useState<FileAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Start as false, only true when fetching
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Only proceed if enabled, department, and fileId are valid
      if (!enabled || !department || !fileId) {
        // Reset state if dependencies are invalid or fetching is disabled
        setData(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setData(null); // Clear previous data before fetching new

      try {
        const encodedFileId = encodeURIComponent(fileId);
        const url = `${API_BASE_URL}/api/analyze/${department}/${encodedFileId}`;
        console.log(`Fetching analysis from: ${url}`); // Log URL for debugging

        const response = await fetch(url);

        if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
            const errBody = await response.json();
            errorMsg = errBody.error || errBody.message || errorMsg;
            console.error("Analysis fetch error body:", errBody); // Log error details
          } catch (e) {
            errorMsg = `${errorMsg} - Could not parse error response.`;
            console.error("Could not parse error response body");
           }
          throw new Error(errorMsg);
        }

        const result: FileAnalysisData = await response.json();
        console.log("Analysis fetch result:", result); // Log successful result

        if (result.success) {
          setData(result);
        } else {
          throw new Error(result.error || 'Analysis request failed but API returned success=false.');
        }
      } catch (err) {
        console.error(`Error fetching analysis for ${department}/${fileId}:`, err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred during analysis fetch'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Cleanup function (optional)
    // return () => {
    //   // Abort fetch if needed
    // };
  }, [department, fileId, enabled]); // Re-run effect if these change

  return { data, isLoading, error };
}; 