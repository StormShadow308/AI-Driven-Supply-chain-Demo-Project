import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { amazonCategories } from '@/types/amazonData';

export interface DepartmentSelectorProps {
  department: string;
  setDepartment: (department: string) => void;
  label?: string;
  small?: boolean;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ 
  department, 
  setDepartment,
  label = "Select Department",
  small = false
}) => {
  return (
    <div>
      {!small && <Label htmlFor="department">{label}</Label>}
      <Select value={department} onValueChange={setDepartment}>
        <SelectTrigger 
          id="department" 
          className={small ? "h-8 text-xs" : undefined}
        >
          <SelectValue placeholder="Select a department" />
        </SelectTrigger>
        <SelectContent>
          {amazonCategories.map(cat => {
            const displayName = cat.displayName || cat.name.replace(/_/g, ' ');
            return (
              <SelectItem key={cat.name} value={cat.name}>{displayName}</SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DepartmentSelector;
