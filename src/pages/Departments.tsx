import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EmptyDashboard from '@/components/EmptyDashboard';
import { getDepartments } from '@/services/api';
import { RefreshCw } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
}

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getDepartments();
        
        if (response && response.success) {
          // Map departments to a more usable format
          const mappedDepartments = response.departments.map((dept: string) => ({
            id: dept,
            name: dept.charAt(0).toUpperCase() + dept.slice(1),
            description: getDepartmentDescription(dept)
          }));
          
          setDepartments(mappedDepartments);
        } else {
          setError('Failed to load departments');
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setError('An error occurred while loading departments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Get description based on department type
  const getDepartmentDescription = (dept: string): string => {
    switch (dept.toLowerCase()) {
      case 'sales':
        return 'View sales performance, revenue metrics, and customer insights';
      case 'inventory':
        return 'Track stock levels, inventory turnover, and supply chain metrics';
      case 'reviews':
        return 'Analyze customer feedback, sentiment trends, and product ratings';
      default:
        return 'View department data and analytics';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
          </div>
          
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg font-medium">Loading departments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (departments.length === 0 || error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 p-8 pt-6">
          <EmptyDashboard 
            title="No Departments Available"
            description={error || "Upload data to view department analytics"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground mt-1">
            View your data organized by department
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <Card key={department.id} className="hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>{department.name}</CardTitle>
                <CardDescription>
                  {department.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button asChild className="w-full">
                  <Link to={`/${department.id.toLowerCase()}`}>
                    View {department.name} Data
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Departments;
