
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Upload } from 'lucide-react';

interface EmptyStateCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onUploadClick: () => void;
}

const EmptyStateCard = ({ title, description, icon: Icon, onUploadClick }: EmptyStateCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>No data available</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <Icon className="h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-xl font-medium">No data available</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
          {description}
        </p>
        <Button className="mt-6" onClick={onUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard;
