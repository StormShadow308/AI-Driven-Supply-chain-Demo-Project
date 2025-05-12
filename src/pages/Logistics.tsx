import React from 'react';
import { Truck, Package, Clock, BarChart3, MapPin, Calendar } from 'lucide-react';
import DataVisualization from '@/components/DataVisualization';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable from '@/components/DataTable';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const LogisticsPage = () => {
  // Empty data arrays instead of mock data
  const deliveryPerformanceData = [];
  const warehouseUtilizationData = [];
  const transportationData = [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Logistics Dashboard</h1>
            <div className="flex space-x-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground">No data available</p>
                <Progress className="mt-2" value={0} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Warehouse Utilization</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground">No data available</p>
                <Progress className="mt-2" value={0} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Lead Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 days</div>
                <p className="text-xs text-muted-foreground">No data available</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Transportation Modes</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">No data</div>
                <p className="text-xs text-muted-foreground">Upload files to see data</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="delivery">
            <TabsList className="mb-4">
              <TabsTrigger value="delivery">Delivery Performance</TabsTrigger>
              <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
              <TabsTrigger value="transportation">Transportation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="delivery" className="space-y-4">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Delivery Performance</CardTitle>
                  <CardDescription>
                    Upload data to see on-time vs. delayed deliveries
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <DataVisualization
                    title=""
                    description=""
                    data={deliveryPerformanceData}
                    type="bar"
                    dataKeys={["OnTime", "Delayed"]}
                    colors={["#10B981", "#EF4444"]}
                    xAxisKey="name"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="warehouse" className="space-y-4">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Warehouse Utilization</CardTitle>
                  <CardDescription>
                    Upload data to see warehouse capacity utilization
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <DataVisualization
                    title=""
                    description=""
                    data={warehouseUtilizationData}
                    type="bar"
                    dataKeys={["Capacity"]}
                    colors={["#0EA5E9"]}
                    xAxisKey="name"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="transportation" className="space-y-4">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Transportation Modes</CardTitle>
                  <CardDescription>
                    Upload data to see distribution of transportation modes
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <DataVisualization
                    title=""
                    description=""
                    data={transportationData}
                    type="pie"
                    dataKeys={["Value"]}
                    colors={["#F97316", "#8B5CF6", "#06B6D4"]}
                    nameKey="name"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LogisticsPage;
