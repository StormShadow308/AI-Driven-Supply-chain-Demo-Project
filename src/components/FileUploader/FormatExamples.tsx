
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const FormatExamples: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="border rounded p-3">
          <img 
            src="/lovable-uploads/7c443840-1e9a-4f71-86d4-11b63099b7ea.png" 
            alt="Sales Data Format" 
            className="w-full h-auto rounded-md border mb-2"
          />
          <h4 className="text-sm font-medium">Sales Data Format</h4>
          <p className="text-xs text-muted-foreground">
            Transaction records with customer and product details
          </p>
        </div>
          
        <div className="border rounded p-3">
          <img 
            src="/lovable-uploads/523bf1ad-1295-45ea-b505-e2e842e2c3bf.png" 
            alt="Inventory Data Format" 
            className="w-full h-auto rounded-md border mb-2"
          />
          <h4 className="text-sm font-medium">Inventory Data Format</h4>
          <p className="text-xs text-muted-foreground">
            Stock levels and product inventory information
          </p>
        </div>
          
        <div className="border rounded p-3">
          <img 
            src="/lovable-uploads/28f882af-011b-4ac6-989d-f2849c62bc55.png" 
            alt="Review Data Format" 
            className="w-full h-auto rounded-md border mb-2"
          />
          <h4 className="text-sm font-medium">Review Data Format</h4>
          <p className="text-xs text-muted-foreground">
            Customer reviews and ratings for products
          </p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>CSV Format Requirements</AlertTitle>
        <AlertDescription>
          <p className="mb-2">Please ensure your CSV files match one of these formats shown in the images above:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Sales Data:</strong> Headers must include transaction_id, timestamp, customer_id, etc.</li>
            <li><strong>Inventory Data:</strong> Headers must include store_id, inventory_level, units_sold, etc.</li>
            <li><strong>Reviews Data:</strong> Headers must include asin, review_text, overall, etc.</li>
          </ul>
        </AlertDescription>
      </Alert>
    </>
  );
};

export default FormatExamples;
