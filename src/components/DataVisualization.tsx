import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import FormattedText from './ui/formatted-text';

interface DataVisualizationProps {
  title: string;
  description?: string;
  data: any[];
  type?: 'line' | 'area' | 'bar' | 'pie';
  dataKeys: string[];
  colors?: string[];
  xAxisKey?: string;
  nameKey?: string; // For pie charts
  stacked?: boolean;
}

interface DashboardHeadingProps {
  title: string;
  content: string;
  variant?: 'sales' | 'reviews' | 'default';
}

const DashboardHeading: React.FC<DashboardHeadingProps> = ({ 
  title, 
  content,
  variant = 'default' 
}) => {
  // Determine heading color based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'sales':
        return 'text-sales bg-sales/10';
      case 'reviews':
        return 'text-reviews bg-reviews/10';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  return (
    <div className="mb-6">
      <h2 className={`text-lg font-bold px-3 py-2 rounded-md inline-block mb-3 ${getVariantStyles()}`}>
        {title}
      </h2>
      <div className="pl-1">
        <FormattedText content={content} className="text-sm" />
      </div>
    </div>
  );
};

const DataVisualization = ({
  title,
  description,
  data,
  type = 'line',
  dataKeys,
  colors = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'],
  xAxisKey = 'name',
  nameKey = 'name',
  stacked = false
}: DataVisualizationProps) => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to?: Date;
  }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date()
  });

  // Helper function to render the appropriate chart based on type
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
            className="chart-animate"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              tickLine={false}
              stroke="rgba(148, 163, 184, 0.4)"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              stroke="rgba(148, 163, 184, 0.4)"
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              iconType="circle"
              iconSize={8}
            />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 0, fill: colors[index % colors.length] }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            ))}
          </LineChart>
        );
        
      case 'area':
        return (
          <AreaChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
            className="chart-animate"
          >
            <defs>
              {dataKeys.map((key, index) => (
                <linearGradient key={`gradient-${key}`} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.05}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              tickLine={false}
              stroke="rgba(148, 163, 184, 0.4)"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              stroke="rgba(148, 163, 184, 0.4)"
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              iconType="circle"
              iconSize={8}
            />
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2.5}
                fill={`url(#color-${key})`}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1000}
                animationEasing="ease-out"
                stackId={stacked ? "stack" : undefined}
              />
            ))}
          </AreaChart>
        );
        
      case 'bar':
        return (
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
            className="chart-animate"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              tickLine={false}
              stroke="rgba(148, 163, 184, 0.4)"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              stroke="rgba(148, 163, 184, 0.4)"
            />
            <Tooltip 
              cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              iconType="circle"
              iconSize={8}
            />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                stackId={stacked ? "stack" : undefined}
                animationDuration={1000}
                animationEasing="ease-out"
                radius={[4, 4, 0, 0]}
                barSize={dataKeys.length > 1 ? 16 : 24}
              />
            ))}
          </BarChart>
        );
        
      case 'pie':
        return (
          <PieChart 
            margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
            className="chart-animate"
          >
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              iconType="circle"
              iconSize={8}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              innerRadius={type === 'pie' ? 0 : 60}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKeys[0]}
              nameKey={nameKey}
              animationDuration={1000}
              animationEasing="ease-out"
              paddingAngle={4}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth={1}
                />
              ))}
            </Pie>
          </PieChart>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Calendar date picker (only shown if needed) */}
      <div className="hidden">
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={"w-[300px] justify-start text-left font-normal"}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Chart container */}
      <div className="w-full h-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DataVisualization;
