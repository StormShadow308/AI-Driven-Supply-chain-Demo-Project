import React from 'react';
import DataVisualization from '@/components/DataVisualization';
import DataTable from '@/components/DataTable';
import EmptyStateCard from '../EmptyStateCard';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalesTabContentProps {
  salesChartData: any[];
  salesData: any[];
  departmentDisplayName: string;
  onUploadClick: () => void;
  metrics?: any; // Add metrics prop to access analysis_summary
}

const SalesTabContent = ({ 
  salesChartData, 
  salesData, 
  departmentDisplayName,
  onUploadClick,
  metrics
}: SalesTabContentProps) => {
  // Check if analysis summary is available
  const hasAnalysisSummary = metrics?.analysis_summary || metrics?.rawMetrics?.analysis_summary;
  const analysisSummary = metrics?.analysis_summary || metrics?.rawMetrics?.analysis_summary || "";
  
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Show analysis summary if available */}
      {hasAnalysisSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Sales Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysisSummary}</p>
          </CardContent>
        </Card>
      )}
      
      <DataVisualization
        title="Monthly Sales Trend"
        description="Sales performance over the past year"
        data={salesChartData}
        type="area"
        dataKeys={["sales"]}
        colors={["#3498DB"]}
        xAxisKey="month"
      />
      
      {salesData.length > 0 ? (
        <DataTable
          data={salesData}
          title="Sales Transactions"
          description={`${salesData.length} transactions for ${departmentDisplayName}`}
        />
      ) : (
        <EmptyStateCard
          title="Sales Transactions"
          description="Upload sales data files for this department to view detailed transaction information."
          icon={ShoppingCart}
          onUploadClick={onUploadClick}
        />
      )}
    </div>
  );
};

export default SalesTabContent;
