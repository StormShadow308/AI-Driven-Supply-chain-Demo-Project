import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart4, ShoppingCart, Boxes, Star } from 'lucide-react';
import OverviewTabContent from './TabContent/OverviewTabContent';
import SalesTabContent from './TabContent/SalesTabContent';
import InventoryTabContent from './TabContent/InventoryTabContent';
import ReviewsTabContent from './TabContent/ReviewsTabContent';

export interface DepartmentTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  salesChartData: any[];
  performanceData: any[];
  inventoryChartData: any[];
  reviewChartData: any[];
  salesData: any[];
  inventoryData: any[];
  reviewData: any[];
  departmentDisplayName: string;
  onUploadClick: () => void;
  onTabSelected?: (tab: string) => void;
  metrics?: any;
  isLoading?: boolean;
  departmentFiles?: any[];
}

const DepartmentTabs = ({
  activeTab,
  setActiveTab,
  salesChartData,
  performanceData,
  inventoryChartData,
  reviewChartData,
  salesData,
  inventoryData,
  reviewData,
  departmentDisplayName,
  onUploadClick,
  onTabSelected = () => {},
  isLoading = false,
  departmentFiles = [],
  metrics
}: DepartmentTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={(value) => {
      setActiveTab(value);
      onTabSelected(value);
    }} className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">
          <BarChart4 className="h-4 w-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="sales">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Sales
        </TabsTrigger>
        <TabsTrigger value="inventory">
          <Boxes className="h-4 w-4 mr-2" />
          Inventory
        </TabsTrigger>
        <TabsTrigger value="reviews">
          <Star className="h-4 w-4 mr-2" />
          Reviews
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        <OverviewTabContent 
          salesChartData={salesChartData}
          performanceData={performanceData}
          inventoryChartData={inventoryChartData}
          reviewChartData={reviewChartData}
        />
      </TabsContent>
      
      <TabsContent value="sales" className="space-y-6">
        <SalesTabContent 
          salesChartData={salesChartData}
          salesData={salesData}
          departmentDisplayName={departmentDisplayName}
          onUploadClick={onUploadClick}
          metrics={metrics}
        />
      </TabsContent>
      
      <TabsContent value="inventory" className="space-y-6">
        <InventoryTabContent 
          inventoryChartData={inventoryChartData}
          inventoryData={inventoryData}
          departmentDisplayName={departmentDisplayName}
          onUploadClick={onUploadClick}
        />
      </TabsContent>
      
      <TabsContent value="reviews" className="space-y-6">
        <ReviewsTabContent 
          reviewChartData={reviewChartData}
          reviewData={reviewData}
          departmentDisplayName={departmentDisplayName}
          onUploadClick={onUploadClick}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DepartmentTabs;
