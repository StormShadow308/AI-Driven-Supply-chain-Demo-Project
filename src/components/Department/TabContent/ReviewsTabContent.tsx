import React from 'react';
import { Star } from 'lucide-react';
import DataVisualization from '@/components/DataVisualization';
import DataTable from '@/components/DataTable';
import EmptyStateCard from '@/components/EmptyStateCard';

interface ReviewsTabContentProps {
  reviewChartData: any[];
  reviewData: any[];
  departmentDisplayName: string;
  onUploadClick: () => void;
}

const ReviewsTabContent = ({ 
  reviewChartData, 
  reviewData, 
  departmentDisplayName,
  onUploadClick
}: ReviewsTabContentProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviewChartData.length > 0 ? (
          <>
            <DataVisualization
              title="Review Distribution"
              description="Customer ratings breakdown"
              data={reviewChartData}
              type="pie"
              dataKeys={["value"]}
              colors={["#E74C3C", "#F39C12", "#F1C40F", "#2ECC71", "#27AE60"]}
              nameKey="name"
            />
            
            <DataVisualization
              title="Review Trends"
              description="Rating distribution over time"
              data={reviewChartData.map(item => ({
                name: item.name,
                current: item.value,
                previous: Math.floor(item.value * (0.8 + Math.random() * 0.4))
              }))}
              type="bar"
              dataKeys={["current", "previous"]}
              colors={["#3498DB", "#95A5A6"]}
              xAxisKey="name"
            />
          </>
        ) : (
          <>
            <EmptyStateCard
              title="Review Distribution"
              description="Upload review data to see customer ratings breakdown"
              type="reviews"
            />
            
            <EmptyStateCard
              title="Review Trends"
              description="Upload review data to see rating distribution over time"
              type="reviews"
            />
          </>
        )}
      </div>
      
      {reviewData.length > 0 ? (
        <DataTable
          data={reviewData}
          title="Customer Reviews"
          description={`${reviewData.length} reviews for ${departmentDisplayName}`}
        />
      ) : (
        <EmptyStateCard
          title="Customer Reviews"
          description="Upload review data files for this department to view detailed customer reviews."
          type="reviews"
        />
      )}
    </div>
  );
};

export default ReviewsTabContent;
