
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File, FileX } from 'lucide-react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import ClearDataDialog from './ClearDataDialog';

interface HistoryItem {
  id: number;
  filename: string;
  date: string;
  department: string;
  status: 'success' | 'error';
}

interface HistoryTabProps {
  uploadHistory: HistoryItem[];
  isClearing: boolean;
  clearConfirmOpen: boolean;
  setClearConfirmOpen: (open: boolean) => void;
  handleClearAllData: () => Promise<void>;
  navigateToDepartment: (department: string) => void;
  setActiveTab: (tab: string) => void;
}

const HistoryTab = ({ 
  uploadHistory, 
  isClearing, 
  clearConfirmOpen, 
  setClearConfirmOpen, 
  handleClearAllData, 
  navigateToDepartment,
  setActiveTab 
}: HistoryTabProps) => {
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center">
              <File className="mr-2 h-5 w-5" />
              Upload History
            </CardTitle>
            <CardDescription>
              Recently imported data files for Amazon departments
            </CardDescription>
          </div>
          <ClearDataDialog
            isClearing={isClearing}
            clearConfirmOpen={clearConfirmOpen}
            setClearConfirmOpen={setClearConfirmOpen}
            handleClearAllData={handleClearAllData}
          />
        </CardHeader>
        <CardContent>
          {uploadHistory.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 font-medium text-sm bg-muted/50 p-3">
                <div className="col-span-1">Status</div>
                <div className="col-span-5">Filename</div>
                <div className="col-span-3">Department</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Action</div>
              </div>
              <div className="divide-y">
                {uploadHistory.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 p-3 text-sm items-center">
                    <div className="col-span-1">
                      {item.status === 'success' ? (
                        <span className="inline-flex items-center text-green-500">
                          <CheckCircle className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-500">
                          <AlertCircle className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                    <div className="col-span-5 truncate">
                      {item.filename}
                    </div>
                    <div className="col-span-3 truncate">
                      {item.department.replace(/_/g, ' ')}
                    </div>
                    <div className="col-span-2">
                      {item.date}
                    </div>
                    <div className="col-span-1">
                      {item.status === 'success' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2"
                          onClick={() => navigateToDepartment(item.department)}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileX className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No files uploaded yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload some CSV files to get started
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setActiveTab('upload')}
              >
                Upload Files
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryTab;
