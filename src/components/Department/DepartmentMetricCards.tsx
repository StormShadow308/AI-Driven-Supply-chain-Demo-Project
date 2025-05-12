import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Boxes, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DepartmentMetricsProps {
  metrics: {
    sales?: number;
    inventory?: number;
    performance?: number;
    reviewCount?: number;
    averageReview?: number;
  };
  counts: {
    salesCount: number;
    inventoryCount: number;
    reviewCount?: number;
  };
  isLoading?: boolean;
}

const DepartmentMetricCards = ({ metrics, counts, isLoading = false }: DepartmentMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </div>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                ${metrics?.sales?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {counts.salesCount} transactions recorded
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0">
            <CardTitle className="text-sm font-medium">Inventory Level</CardTitle>
          </div>
          <Boxes className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {metrics?.inventory?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {counts.inventoryCount} inventory records
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0">
            <CardTitle className="text-sm font-medium">Review Score</CardTitle>
          </div>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {metrics?.averageReview ? metrics.averageReview.toFixed(1) : "0"}/5
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {metrics?.reviewCount?.toLocaleString() || counts.reviewCount?.toLocaleString() || "0"} reviews
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentMetricCards;
