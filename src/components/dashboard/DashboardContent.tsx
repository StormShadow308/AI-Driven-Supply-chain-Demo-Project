import React from 'react';
import { Card, CardContent } from '../ui/card';
import FormattedText from '../ui/formatted-text';

interface DashboardSectionProps {
  title: string;
  content: string;
  variant?: 'sales' | 'reviews' | 'default';
  className?: string;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  content,
  variant = 'default',
  className = ''
}) => {
  // Define variant styles
  const headerVariants = {
    sales: 'text-sales border-b-sales bg-sales/5',
    reviews: 'text-reviews border-b-reviews bg-reviews/5',
    default: 'text-primary border-b-primary bg-primary/5'
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className={`px-4 py-3 border-b-2 ${headerVariants[variant]}`}>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <CardContent className="p-4">
        <FormattedText content={content} />
      </CardContent>
    </Card>
  );
};

interface DashboardContentProps {
  salesData?: string;
  reviewData?: string;
  className?: string;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  salesData,
  reviewData,
  className = ''
}) => {
  return (
    <div className={`grid gap-6 ${className}`}>
      {salesData && (
        <DashboardSection
          title="Sales Data Overview"
          content={salesData}
          variant="sales"
        />
      )}
      
      {reviewData && (
        <DashboardSection
          title="Review Data Analysis"
          content={reviewData}
          variant="reviews"
        />
      )}
    </div>
  );
};

export { DashboardContent, DashboardSection };
export default DashboardContent; 