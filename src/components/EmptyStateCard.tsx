import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileX, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateCardProps {
  title?: string;
  description?: string;
  type?: "general" | "sales" | "inventory" | "reviews";
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title = "No Data Available",
  description = "Upload CSV files to see visualizations",
  type = "general"
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <FileX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
          {description}
        </p>
        <Button onClick={() => navigate('/upload')}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard; 