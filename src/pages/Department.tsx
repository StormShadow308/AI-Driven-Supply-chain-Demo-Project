import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { toast } from '@/hooks/use-toast';
import { getDataStore } from '@/utils/dataStore';
import { amazonCategories } from '@/types/amazonData';
import { 
  DepartmentHeader, 
  DepartmentMetricCards, 
  DepartmentTabs 
} from '@/components/Department';
import axios from 'axios';

const Department = () => {
  const { departmentName } = useParams<{ departmentName: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [reviewData, setReviewData] = useState<any[]>([]);
  const [departmentMetrics, setDepartmentMetrics] = useState<any>(null);
  const [departmentFiles, setDepartmentFiles] = useState<any[]>([]);
  const [apiData, setApiData] = useState<any>(null);
  
  // Display name for the department
  const departmentDisplayName = useMemo(() => {
    const category = amazonCategories.find(cat => cat.name === departmentName);
    return category?.displayName || departmentName?.replace(/_/g, ' ') || 'Department';
  }, [departmentName]);

  useEffect(() => {
    if (!departmentName) return;
    
    const loadDepartmentData = async () => {
      setIsLoading(true);
      
      try {
        // First try to load data from API
        const apiUrl = `/api/department/${departmentName}`;
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.success) {
          console.log("API data loaded:", response.data);
          setApiData(response.data);
          
          // Store file information
          setDepartmentFiles(response.data.files || []);
          
          // Set metrics from API
          if (response.data.metrics) {
            setDepartmentMetrics({
              sales: response.data.metrics.total_sales || 0,
              inventory: response.data.metrics.total_inventory || 0,
              reviewCount: response.data.metrics.total_reviews || 0,
              performance: response.data.metrics.performance || 75,
              efficiency: response.data.metrics.efficiency || 80,
              growth: response.data.metrics.growth || 0,
              averageReview: response.data.metrics.avg_rating || 0,
              // Include any analysis summary if available
              analysis_summary: response.data.metrics.analysis_summary || "",
              // Keep the raw metrics to preserve all backend data
              rawMetrics: response.data.metrics
            });
          }
          
          // Generate proper data arrays from files
          if (departmentName === 'sales') {
            // Extract sales data from files
            const extractedSalesData = [];
            for (const file of response.data.files || []) {
              if (file.total_sales) {
                extractedSalesData.push({
                  filename: file.filename,
                  total_amount: file.total_sales,
                  date: file.upload_date,
                  row_count: file.row_count || 0
                });
              }
            }
            setSalesData(extractedSalesData);
          } 
          else if (departmentName === 'inventory') {
            // Extract inventory data from files  
            const extractedInventoryData = [];
            for (const file of response.data.files || []) {
              if (file.total_inventory) {
                extractedInventoryData.push({
                  filename: file.filename,
                  inventory_level: file.total_inventory,
                  date: file.upload_date,
                  row_count: file.row_count || 0
                });
              }
            }
            setInventoryData(extractedInventoryData);
          }
          else if (departmentName === 'reviews') {
            // Extract review data from files
            const extractedReviewData = [];
            for (const file of response.data.files || []) {
              if (file.row_count) {
                extractedReviewData.push({
                  filename: file.filename,
                  review_count: file.row_count || 0,
                  overall: file.avg_rating || 0,
                  date: file.upload_date
                });
              }
            }
            setReviewData(extractedReviewData);
          }
          
          // If API request succeeded but returned no data
          if (response.data.file_count === 0) {
            toast({
              title: "No files available",
              description: `No data files found for ${departmentDisplayName}. Please upload data files first.`,
              variant: "default"
            });
          }
        } else {
          // API error
          throw new Error("API returned unsuccessful response");
        }
      } catch (error) {
        console.error("Error loading department data from API:", error);
        
        // Fallback to data store
        try {
          const dataStore = getDataStore();
          const departmentData = dataStore[departmentName];
          
          if (departmentData) {
            setSalesData(departmentData.salesData || []);
            setInventoryData(departmentData.inventoryData || []);
            setReviewData(departmentData.reviewData || []);
            setDepartmentMetrics(departmentData.metrics || null);
          } else {
            // Department exists but no data
            toast({
              title: "No data available",
              description: `No data found for ${departmentDisplayName}. Please upload data files first.`,
              variant: "destructive"
            });
          }
        } catch (storeError) {
          console.error("Error loading from data store:", storeError);
          toast({
            title: "Error loading data",
            description: "Could not load department data. Please try again.",
            variant: "destructive"
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDepartmentData();
  }, [departmentName, departmentDisplayName]);

  // Generate sales data for visualization
  const salesChartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Check if we have time series data from API
    if (apiData?.metrics?.time_series) {
      const { labels, values } = apiData.metrics.time_series;
      
      // Convert API time series to chart format
      return labels.map((month: string, index: number) => ({
        month: month.substring(0, 3), // First 3 letters of month name
        sales: values[index]
      }));
    }
    
    // Group by month from file data
    const monthlyData: { [key: string]: number } = {};
    
    // If we have real sales data
    if (salesData.length > 0) {
      salesData.forEach(item => {
        if (item.date) {
          const date = new Date(item.date);
          const monthKey = monthNames[date.getMonth()];
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
          }
          
          monthlyData[monthKey] += item.total_amount || 0;
        }
      });
      
      // Convert to array format for chart
      const chartData = Object.keys(monthlyData).map(month => ({
        month,
        sales: monthlyData[month]
      }));
      
      // If we have data, return it
      if (chartData.length > 0) {
        return chartData;
      }
    }
    
    // If no data, generate minimal placeholder data
    return monthNames.slice(0, 6).map(month => ({
      month,
      sales: Math.floor(Math.random() * 5000)
    }));
  }, [salesData, apiData]);

  // Generate inventory data for visualization
  const inventoryChartData = useMemo(() => {
    // If we have star distribution from API for reviews department
    if (departmentName === 'reviews' && apiData?.metrics?.star_distribution) {
      const dist = apiData.metrics.star_distribution;
      return [
        { name: "1 Star", value: dist["1_star"] || 0 },
        { name: "2 Stars", value: dist["2_star"] || 0 },
        { name: "3 Stars", value: dist["3_star"] || 0 },
        { name: "4 Stars", value: dist["4_star"] || 0 },
        { name: "5 Stars", value: dist["5_star"] || 0 }
      ];
    }
    
    // If we have real inventory data
    if (inventoryData.length > 0) {
      // Group by category or product type
      const categoryData: { [key: string]: number } = {};
      
      inventoryData.forEach(item => {
        const category = item.filename || "Other";
        
        if (!categoryData[category]) {
          categoryData[category] = 0;
        }
        
        categoryData[category] += item.inventory_level || 0;
      });
      
      // Convert to array format for chart
      return Object.entries(categoryData).map(([name, value]) => ({
        name,
        value
      }));
    }
    
    // If no data but we have metrics
    if (departmentMetrics?.inventory) {
      return [
        { name: "Total Inventory", value: departmentMetrics.inventory }
      ];
    }
    
    // If no data, generate minimal placeholder
    return [
      { name: "In Stock", value: 1000 },
      { name: "Low Stock", value: 200 },
      { name: "Out of Stock", value: 50 }
    ];
  }, [inventoryData, departmentMetrics, departmentName, apiData]);

  // Generate review data for visualization
  const reviewChartData = useMemo(() => {
    // If we have star distribution from API
    if (apiData?.metrics?.star_distribution) {
      const dist = apiData.metrics.star_distribution;
      return [
        { name: "1 Star", value: dist["1_star"] || 0 },
        { name: "2 Stars", value: dist["2_star"] || 0 },
        { name: "3 Stars", value: dist["3_star"] || 0 },
        { name: "4 Stars", value: dist["4_star"] || 0 },
        { name: "5 Stars", value: dist["5_star"] || 0 }
      ];
    }
    
    // If we have real review data
    if (reviewData.length > 0) {
      // Group by rating
      const ratingData = [0, 0, 0, 0, 0]; // 1-5 stars
      
      reviewData.forEach(item => {
        const rating = Math.floor(item.overall) || 5;
        if (rating >= 1 && rating <= 5) {
          ratingData[rating - 1] += item.review_count || 1;
        }
      });
      
      // Convert to array format for chart
      return [
        { name: "1 Star", value: ratingData[0] },
        { name: "2 Stars", value: ratingData[1] },
        { name: "3 Stars", value: ratingData[2] },
        { name: "4 Stars", value: ratingData[3] },
        { name: "5 Stars", value: ratingData[4] }
      ];
    }
    
    // If we have just the average rating
    if (departmentMetrics?.averageReview) {
      // Create a distribution weighted toward the average
      const avg = departmentMetrics.averageReview;
      const totalReviews = departmentMetrics.reviewCount || 100;
      
      // Simple distribution based on average
      const distribution = [
        Math.max(0, 0.05 - (avg - 1) * 0.01) * totalReviews,
        Math.max(0, 0.10 - (avg - 2) * 0.02) * totalReviews,
        Math.max(0, 0.15 - Math.abs(avg - 3) * 0.03) * totalReviews,
        Math.max(0, 0.30 - (4 - avg) * 0.05) * totalReviews,
        Math.max(0, 0.40 - (5 - avg) * 0.08) * totalReviews
      ];
      
      return [
        { name: "1 Star", value: Math.round(distribution[0]) },
        { name: "2 Stars", value: Math.round(distribution[1]) },
        { name: "3 Stars", value: Math.round(distribution[2]) },
        { name: "4 Stars", value: Math.round(distribution[3]) },
        { name: "5 Stars", value: Math.round(distribution[4]) }
      ];
    }
    
    // Minimal placeholder
    return [
      { name: "1 Star", value: 5 },
      { name: "2 Stars", value: 8 },
      { name: "3 Stars", value: 12 },
      { name: "4 Stars", value: 25 },
      { name: "5 Stars", value: 50 }
    ];
  }, [reviewData, departmentMetrics, apiData]);

  // Performance metrics
  const performanceData = useMemo(() => {
    return [
      { 
        name: departmentDisplayName,
        Performance: departmentMetrics?.performance || 0,
        Efficiency: departmentMetrics?.efficiency || 0,
        Growth: departmentMetrics?.growth || 0
      }
    ];
  }, [departmentMetrics, departmentDisplayName]);

  const handleUploadClick = () => {
    navigate('/upload');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 space-y-6 container mx-auto max-w-7xl">
          <DepartmentHeader 
            departmentDisplayName={departmentDisplayName}
            reviewCount={departmentMetrics?.reviewCount}
            onUploadClick={handleUploadClick}
            isLoading={isLoading}
          />

          <DepartmentMetricCards 
            metrics={departmentMetrics || {}}
            counts={{
              salesCount: salesData.length,
              inventoryCount: inventoryData.length,
              reviewCount: reviewData.length
            }}
            isLoading={isLoading}
          />

          <DepartmentTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            salesChartData={salesChartData}
            performanceData={performanceData}
            inventoryChartData={inventoryChartData}
            reviewChartData={reviewChartData}
            salesData={salesData}
            inventoryData={inventoryData}
            reviewData={reviewData}
            departmentDisplayName={departmentDisplayName}
            onUploadClick={handleUploadClick}
            isLoading={isLoading}
            departmentFiles={departmentFiles}
            metrics={departmentMetrics}
            onTabSelected={(tab) => setActiveTab(tab)}
          />
        </main>
      </div>
    </div>
  );
};

export default Department;
