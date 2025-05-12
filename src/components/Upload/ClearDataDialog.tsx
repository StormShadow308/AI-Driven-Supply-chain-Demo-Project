
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, RefreshCw } from 'lucide-react';

interface ClearDataDialogProps {
  isClearing: boolean;
  clearConfirmOpen: boolean;
  setClearConfirmOpen: (open: boolean) => void;
  handleClearAllData: () => Promise<void>;
}

const ClearDataDialog = ({ 
  isClearing, 
  clearConfirmOpen, 
  setClearConfirmOpen, 
  handleClearAllData 
}: ClearDataDialogProps) => {
  return (
    <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          disabled={isClearing}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear All Data</DialogTitle>
          <DialogDescription>
            This will permanently delete all uploaded data from all departments. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setClearConfirmOpen(false)}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={handleClearAllData}
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClearDataDialog;
