
import React from 'react';
import DataVisualization from '@/components/DataVisualization';

interface OverviewTabContentProps {
  salesChartData: any[];
  performanceData: any[];
  inventoryChartData: any[];
  reviewChartData: any[];
}

const OverviewTabContent = ({ 
  salesChartData, 
  performanceData, 
  inventoryChartData, 
  reviewChartData 
}: OverviewTabContentProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DataVisualization
        title="Monthly Sales Trend"
        description="Sales performance over the past year"
        data={salesChartData}
        type="line"
        dataKeys={["sales"]}
        colors={["#3498DB"]}
        xAxisKey="month"
      />
      
      <DataVisualization
        title="Department Performance"
        description="Key performance indicators"
        data={performanceData}
        type="bar"
        dataKeys={["Performance", "Efficiency", "Growth"]}
        colors={["#3498DB", "#2ECC71", "#F1C40F"]}
        xAxisKey="name"
      />
      
      <DataVisualization
        title="Inventory Distribution"
        description="Current inventory levels by category"
        data={inventoryChartData}
        type="pie"
        dataKeys={["value"]}
        colors={["#3498DB", "#2ECC71", "#F1C40F", "#E74C3C", "#9B59B6"]}
        nameKey="name"
      />
      
      <DataVisualization
        title="Review Distribution"
        description="Customer ratings breakdown"
        data={reviewChartData}
        type="pie"
        dataKeys={["value"]}
        colors={["#E74C3C", "#F39C12", "#F1C40F", "#2ECC71", "#27AE60"]}
        nameKey="name"
      />
    </div>
  );
};

export default OverviewTabContent;
