import React from 'react';
import FormattedText from '../ui/formatted-text';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface InsightItem {
  content: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
}

interface InsightPanelProps {
  title: string;
  insights: InsightItem[];
  className?: string;
}

const InsightPanel: React.FC<InsightPanelProps> = ({ 
  title, 
  insights, 
  className = '' 
}) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="border-b border-border/30 pb-4 last:border-0 last:pb-0">
              {insight.badge && (
                <Badge 
                  className={`mb-2 ${insight.badgeColor || 'bg-primary'}`}
                >
                  {insight.icon && <span className="mr-1">{insight.icon}</span>}
                  {insight.badge}
                </Badge>
              )}
              
              <FormattedText content={insight.content} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightPanel; 