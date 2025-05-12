import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie, Sector } from 'recharts';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComparisonData {
  department: string;
  value: number;
  color: string;
}

interface FlexibleComparisonData {
  [key: string]: string | number;
  department?: string;
  value?: number;
  color?: string;
}

interface ComparisonViewProps {
  title: string;
  description?: string;
  data: ComparisonData[] | FlexibleComparisonData[];
  metrics: string[];
}

const getColorByIndex = (index: number): string => {
  const colors = [
    '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
    '#8B5CF6', '#A855F7', '#F97316', '#14B8A6', '#0EA5E9',
    '#6E59A5', '#9b87f5', '#7E69AB', '#D6BCFA', '#CBD5E1'
  ];
  return colors[index % colors.length];
};

const transformDataForChart = (data: FlexibleComparisonData[], selectedMetric: string): ComparisonData[] => {
  return data.map((item, index) => {
    if (item.department && (item.value !== undefined) && item.color) {
      return item as ComparisonData;
    }
    
    const value = typeof item[selectedMetric] === 'number' 
      ? item[selectedMetric] as number 
      : 0;
    
    return {
      department: item.name as string || `Item ${index}`,
      value: value,
      color: item.color as string || getColorByIndex(index),
    };
  });
};

const ComparisonView = ({ title, description, data, metrics }: ComparisonViewProps) => {
  const [selectedMetric, setSelectedMetric] = useState(metrics[0]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  const transformedData = transformDataForChart(data as FlexibleComparisonData[], selectedMetric);

  const sortedData = [...transformedData].sort((a, b) => b.value - a.value);

  const onPieEnter = (_, index: number) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
    return (
      <g>
        <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill={fill} className="text-sm font-medium">
          {payload.department}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fill="#94a3b8" className="text-xs">
          {`${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <Card className="overflow-hidden shadow-md transition-all duration-300 h-full border border-muted/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          {description && <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>}
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              variant={chartType === 'bar' ? 'default' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-none"
              onClick={() => setChartType('bar')}
            >
              <BarChartIcon size={16} />
            </Button>
            <Button 
              variant={chartType === 'pie' ? 'default' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-none"
              onClick={() => setChartType('pie')}
            >
              <PieChartIcon size={16} />
            </Button>
          </div>
          <div className="w-[140px]">
            <Select
              value={selectedMetric}
              onValueChange={setSelectedMetric}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {metrics.map((metric) => (
                  <SelectItem key={metric} value={metric}>
                    {metric}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart
                data={sortedData}
                margin={{ top: 20, right: 30, left: 5, bottom: 60 }}
                className="chart-animate"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                <XAxis 
                  dataKey="department" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  stroke="rgba(148, 163, 184, 0.4)"
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    background: 'rgba(15, 23, 42, 0.95)',
                    color: '#fff'
                  }}
                  formatter={(value: number) => [value.toLocaleString(), selectedMetric]}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '16px' }} 
                  iconType="circle"
                  iconSize={8}
                />
                <Bar 
                  dataKey="value" 
                  name={selectedMetric} 
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                  barSize={32}
                >
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <PieChart margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={sortedData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="department"
                  onMouseEnter={onPieEnter}
                  animationDuration={800}
                >
                  {sortedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    background: 'rgba(15, 23, 42, 0.95)',
                    color: '#fff'
                  }}
                  formatter={(value: number) => [value.toLocaleString(), selectedMetric]}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonView;
