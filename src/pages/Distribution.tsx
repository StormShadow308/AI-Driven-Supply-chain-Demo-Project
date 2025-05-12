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

const Distribution = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInventoryData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getDepartmentData('inventory');
        
        if (response && response.success) {
          setInventoryData(response.results?.inventory || null);
        } else {
          setError('Failed to load inventory data');
        }
      } catch (error) {
        console.error('Error loading inventory data:', error);
        setError('An error occurred while loading data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInventoryData();
  }, [timeframe]);

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Inventory Analytics</h2>
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
  
  if (!inventoryData || error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Inventory Analytics</h2>
          </div>
          
          <EmptyStateCard 
            title="No Inventory Data Available" 
            description={error || "Upload inventory data to view analytics"} 
          />
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const stockLevelData = inventoryData.stock_levels ? 
    inventoryData.stock_levels.map((item: any) => ({
      name: item.product_name,
      value: item.quantity,
      status: item.status
    })) : [];

  const stockTrendData = inventoryData.stock_trend ? 
    inventoryData.stock_trend.labels.map((label: string, index: number) => ({
      date: label,
      value: inventoryData.stock_trend.values[index]
    })) : [];

  const categoryDistributionData = inventoryData.category_distribution ?
    inventoryData.category_distribution.labels.map((label: string, index: number) => ({
      name: label,
      value: inventoryData.category_distribution.values[index]
    })) : [];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Inventory Analytics</h2>
            <p className="text-muted-foreground mt-1">
              View stock levels, turnover rates, and inventory distribution
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Select 
              value={timeframe} 
              onValueChange={handleTimeframeChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="day">Last 24 Hours</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full mb-6">
          <TabsList className="w-full max-w-md grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Stock Trend</CardTitle>
                  <CardDescription>Inventory levels over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {stockTrendData.length > 0 ? (
                    <DataVisualization
                      title="Stock Trend"
                      data={stockTrendData}
                      type="line"
                      dataKeys={['value']}
                      xAxisKey="date"
                      colors={['#3498DB']}
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full text-muted-foreground">
                      No stock trend data available
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>Key inventory metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                      <p className="text-2xl font-bold">
                        {inventoryData.summary?.total_items?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Turnover Rate</p>
                      <p className="text-2xl font-bold">
                        {inventoryData.summary?.turnover_rate?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Out of Stock Items</p>
                      <p className="text-2xl font-bold">
                        {inventoryData.summary?.out_of_stock || '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Products by Stock</CardTitle>
                  <CardDescription>Products with highest stock levels</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {stockLevelData.length > 0 ? (
                    <DataVisualization
                      title="Stock Levels"
                      data={stockLevelData.slice(0, 10)}
                      type="bar"
                      dataKeys={['value']}
                      xAxisKey="name"
                      colors={['#3498DB']}
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full text-muted-foreground">
                      No stock level data available
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Stock distribution by product category</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {categoryDistributionData.length > 0 ? (
                    <DataVisualization
                      title="Categories"
                      data={categoryDistributionData}
                      type="pie"
                      dataKeys={['value']}
                      nameKey="name"
                      colors={['#3498DB', '#E74C3C', '#F39C12', '#27AE60']}
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full text-muted-foreground">
                      No category distribution data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Stock Levels</CardTitle>
                <CardDescription>Detailed view of inventory by product</CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                {stockLevelData.length > 0 ? (
                  <DataVisualization
                    title="Product Stock"
                    data={stockLevelData}
                    type="bar"
                    dataKeys={['value']}
                    xAxisKey="name"
                    colors={['#3498DB']}
                  />
                ) : (
                  <div className="flex justify-center items-center h-full text-muted-foreground">
                    No product stock data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Analysis</CardTitle>
                <CardDescription>Stock distribution by product category</CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                {categoryDistributionData.length > 0 ? (
                  <DataVisualization
                    title="Category Distribution"
                    data={categoryDistributionData}
                    type="pie"
                    dataKeys={['value']}
                    nameKey="name"
                    colors={['#3498DB', '#E74C3C', '#F39C12', '#27AE60']}
                  />
                ) : (
                  <div className="flex justify-center items-center h-full text-muted-foreground">
                    No category analysis data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Distribution;
