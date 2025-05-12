
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export interface DepartmentCardProps {
  title: string;
  value: string;
  change: number;
  timeframe: string;
  chartData?: number[];
  icon: LucideIcon;
  invertChange?: boolean;
}

const DepartmentCard = ({
  title,
  value,
  change,
  timeframe,
  chartData,
  icon: Icon,
  invertChange = false
}: DepartmentCardProps) => {
  const isPositive = invertChange ? change < 0 : change > 0;
  const isNeutral = change === 0;
  
  // Format change value for display
  const changeFormatted = `${isPositive ? '+' : ''}${change}%`;
  
  // Determine change color based on positive/negative and invert setting
  const changeColorClass = isNeutral
    ? "text-gray-500"
    : isPositive
    ? "text-green-500"
    : "text-red-500";

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center">
          <span className={changeColorClass}>{changeFormatted}</span>
          <span className="ml-1">{timeframe}</span>
        </p>
        {chartData && chartData.length > 0 ? (
          <div className="mt-3 h-12">
            <div className="flex h-8">
              {chartData.map((d, i) => (
                <div
                  key={i}
                  className="w-full rounded-sm flex-1 mx-0.5 transition-all hover:opacity-80"
                  style={{
                    height: `${Math.max(15, d)}%`,
                    backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 h-12 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentCard;
