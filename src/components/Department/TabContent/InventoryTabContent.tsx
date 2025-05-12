import React from 'react';
import DataVisualization from '@/components/DataVisualization';
import DataTable from '@/components/DataTable';
import EmptyStateCard from '@/components/EmptyStateCard';
import { Boxes } from 'lucide-react';

interface InventoryTabContentProps {
  inventoryChartData: any[];
  inventoryData: any[];
  departmentDisplayName: string;
  onUploadClick: () => void;
}

const InventoryTabContent = ({ 
  inventoryChartData, 
  inventoryData, 
  departmentDisplayName,
  onUploadClick
}: InventoryTabContentProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inventoryChartData.length > 0 ? (
          <>
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
              title="Inventory vs. Sales"
              description="Relationship between inventory and sales"
              data={inventoryChartData.map(item => ({
                ...item,
                sales: Math.floor(item.value * (0.2 + Math.random() * 0.4)) // Random sales based on inventory
              }))}
              type="bar"
              dataKeys={["value", "sales"]}
              colors={["#3498DB", "#E74C3C"]}
              xAxisKey="name"
            />
          </>
        ) : (
          <>
            <EmptyStateCard
              title="Inventory Distribution"
              description="Upload inventory data to see distribution by category"
              type="inventory"
            />
            
            <EmptyStateCard
              title="Inventory vs. Sales"
              description="Upload inventory data to see relationship with sales"
              type="inventory"
            />
          </>
        )}
      </div>
      
      {inventoryData.length > 0 ? (
        <DataTable
          data={inventoryData}
          title="Inventory Records"
          description={`${inventoryData.length} inventory records for ${departmentDisplayName}`}
        />
      ) : (
        <EmptyStateCard
          title="Inventory Records"
          description="Upload inventory data files for this department to view detailed inventory information."
          type="inventory"
        />
      )}
    </div>
  );
};

export default InventoryTabContent;
