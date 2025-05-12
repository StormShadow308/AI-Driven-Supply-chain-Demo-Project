
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DepartmentQuickAccessProps {
  navigateToDepartment: (department: string) => void;
  navigateToAllDepartments: () => void;
}

const DepartmentQuickAccess = ({ 
  navigateToDepartment,
  navigateToAllDepartments
}: DepartmentQuickAccessProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Available Amazon Departments</CardTitle>
        <CardDescription>
          Review and analyze data for any of the 29 Amazon departments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {/* Only showing top 8 departments with highest review counts */}
          {[
            "Books", "Clothing_Shoes_and_Jewelry", "Home_and_Kitchen", 
            "Electronics", "Sports_and_Outdoors", "Cell_Phones_and_Accessories",
            "Movies_and_TV", "Automotive"
          ].map((dept) => (
            <Button 
              key={dept} 
              variant="outline" 
              className="justify-start"
              onClick={() => navigateToDepartment(dept)}
            >
              {dept.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={navigateToAllDepartments}
        >
          View All Departments
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DepartmentQuickAccess;
