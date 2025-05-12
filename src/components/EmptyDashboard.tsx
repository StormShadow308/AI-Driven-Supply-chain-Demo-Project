import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileX, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmptyDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <FileX size={64} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-muted-foreground mb-6">
            Upload CSV files to start analyzing your supply chain data
          </p>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium">Getting Started:</h3>
          <ol className="space-y-2 list-decimal list-inside">
            <li>Prepare your CSV files with sales, inventory, or review data</li>
            <li>Use the Upload page to import your data files</li>
            <li>Explore insights through interactive visualizations</li>
          </ol>
          
          <Button 
            className="w-full mt-4" 
            onClick={() => navigate('/upload')}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Data Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyDashboard; 