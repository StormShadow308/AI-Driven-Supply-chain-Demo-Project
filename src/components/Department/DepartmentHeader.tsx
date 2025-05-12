import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export interface DepartmentHeaderProps {
  departmentDisplayName: string;
  reviewCount?: number;
  onUploadClick: () => void;
  isLoading?: boolean;
}

const DepartmentHeader = ({ 
  departmentDisplayName, 
  reviewCount = 0,
  onUploadClick 
}: DepartmentHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => navigate('/departments')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{departmentDisplayName}</h1>
            <Badge variant="outline" className="ml-2">
              {reviewCount?.toLocaleString() || "0"} Reviews
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Detailed analytics and data for the {departmentDisplayName} department
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={onUploadClick}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Data
          </Button>
        </div>
      </div>

      <Separator />
    </>
  );
};

export default DepartmentHeader;
