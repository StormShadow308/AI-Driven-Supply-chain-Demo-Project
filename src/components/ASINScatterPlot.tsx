import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { useMemo } from 'react';

interface ASINData {
  asin: string;
  reviewCount: number;
  averageRating: number;
}

interface ASINScatterPlotProps {
  title: string;
  description?: string;
  data: ASINData[];
}

// Helper to determine dot color based on rating (e.g., red for low, green for high)
const getRatingColor = (rating: number): string => {
  if (rating < 3) return '#ef4444'; // red-500
  if (rating < 4) return '#f59e0b'; // amber-500
  return '#22c55e'; // green-500
};

const ASINScatterPlot = ({ title, description, data }: ASINScatterPlotProps) => {
  
  // Memoize processed data to avoid recalculations on re-render
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      color: getRatingColor(item.averageRating),
      // Optionally add size based on review count, requires ZAxis
      // size: Math.max(10, Math.min(100, Math.sqrt(item.reviewCount))) 
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
          <div className="font-bold mb-1">ASIN: {dataPoint.asin}</div>
          <div>Avg. Rating: {dataPoint.averageRating.toFixed(2)} ★</div>
          <div>Review Count: {dataPoint.reviewCount.toLocaleString()}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden shadow-md transition-all duration-300 h-full border border-muted/30">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {description && <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] w-full"> {/* Adjust height as needed */}
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
              className="chart-animate"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis 
                type="number" 
                dataKey="reviewCount" 
                name="Review Count" 
                // Consider logarithmic scale if counts vary widely
                // scale="log" 
                // domain={['auto', 'auto']} 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                label={{ value: 'Number of Reviews', position: 'insideBottom', offset: -15, fontSize: 12, fill: '#94a3b8' }}
              />
              <YAxis 
                type="number" 
                dataKey="averageRating" 
                name="Average Rating" 
                domain={[1, 5]} // Standard rating scale
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                stroke="rgba(148, 163, 184, 0.4)"
                label={{ value: 'Avg. Rating', angle: -90, position: 'insideLeft', offset: 0, fontSize: 12, fill: '#94a3b8' }}
              />
              {/* Uncomment ZAxis if using size */}
              {/* <ZAxis type="number" dataKey="size" range={[10, 100]} /> */}
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                content={<CustomTooltip />}
              />
              {/* <Legend /> */} {/* Legend might be noisy with many ASINs */}
              <Scatter 
                name="ASINs" 
                data={processedData} 
                fill="#8884d8" // Default fill, overridden by Cell
                shape="circle" // or triangle, square, etc.
                animationDuration={800}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ASINScatterPlot; 