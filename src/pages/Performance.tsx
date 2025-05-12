import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import DataVisualization from '@/components/DataVisualization';
import { getDepartmentData } from '@/services/api';
import EmptyStateCard from '@/components/EmptyStateCard';
import DashboardContent from '@/components/dashboard/DashboardContent';
import JointDashboard from '@/components/dashboard/JointDashboard';

const Performance = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');
  const [reviewsData, setReviewsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviewsData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getDepartmentData('reviews');
        
        if (response && response.success) {
          setReviewsData(response.results?.reviews || null);
        } else {
          setError('Failed to load reviews data');
        }
      } catch (error) {
        console.error('Error loading reviews data:', error);
        setError('An error occurred while loading data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReviewsData();
  }, [timeframe]);

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Reviews Analytics</h2>
          </div>
          
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg font-medium">Loading data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!reviewsData || error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Reviews Analytics</h2>
          </div>
          
          <EmptyStateCard 
            title="No Reviews Data Available" 
            description={error || "Upload reviews data to view analytics"} 
          />
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const sentimentTrendData = reviewsData.sentiment_trend ? 
    reviewsData.sentiment_trend.labels.map((label: string, index: number) => ({
      date: label,
      positive: reviewsData.sentiment_trend.positive[index],
      neutral: reviewsData.sentiment_trend.neutral[index],
      negative: reviewsData.sentiment_trend.negative[index]
    })) : [];

  const ratingDistributionData = reviewsData.rating_distribution ?
    reviewsData.rating_distribution.labels.map((label: string, index: number) => ({
      rating: label,
      count: reviewsData.rating_distribution.values[index]
    })) : [];

  const topKeywordsData = reviewsData.top_keywords ?
    reviewsData.top_keywords.map((keyword: any) => ({
      keyword: keyword.word,
      count: keyword.count
    })) : [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Cross-Department Performance</h1>
      <JointDashboard />
    </div>
  );
};

export default Performance;
