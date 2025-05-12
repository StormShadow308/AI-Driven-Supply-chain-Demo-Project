
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DataVisualization from '@/components/DataVisualization';
import ComparisonView from '@/components/ComparisonView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, XCircle, ArrowDownUp, Download } from 'lucide-react';
import { 
  amazonCategories, 
  mockDepartments 
} from '@/types/amazonData';
import { 
  getAggregatedSalesData, 
  getPerformanceData, 
  getComparisonData 
} from '@/utils/dataUtils';

// Helper function to generate random colors
const getRandomColor = (index: number) => {
  const colors = [
    '#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#10B981',
    '#6366F1', '#EC4899', '#F59E0B', '#06B6D4', '#22C55E'
  ];
  return colors[index % colors.length];
};

const Compare = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadData = () => {
      // Format category names for display
      const formatted = amazonCategories.map(cat => cat.name.replace(/_/g, ' '));
      setAvailableCategories(formatted);
      
      // Select first two categories by default
      if (formatted.length >= 2 && selectedCategories.length === 0) {
        setSelectedCategories([formatted[0], formatted[1]]);
      }
      
      setIsLoading(false);
    };
    
    const timer = setTimeout(loadData, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter categories based on search term
  const filteredCategories = availableCategories.filter(
    cat => cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add a category to comparison
  const addCategory = (category: string) => {
    if (!selectedCategories.includes(category) && selectedCategories.length < 5) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Remove a category from comparison
  const removeCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter(cat => cat !== category));
  };

  // Get metrics for selected categories
  const getCategoryMetrics = (category: string) => {
    const catInfo = amazonCategories.find(c => c.name.replace(/_/g, ' ') === category);
    
    if (catInfo) {
      return {
        reviews: catInfo.reviewCount,
        rating: parseFloat((3.5 + Math.random()).toFixed(1)),
        helpfulness: parseInt((60 + Math.random() * 20).toFixed(0)),
        verified: parseInt((50 + Math.random() * 40).toFixed(0)),
      };
    }
    
    return {
      reviews: 0,
      rating: 0,
      helpfulness: 0,
      verified: 0
    };
  };

  // Transform data for ComparisonView
  const transformForComparisonView = (data: any[], metricKey: string) => {
    return data.map((item, index) => ({
      department: item.name,
      value: item[metricKey],
      color: getRandomColor(index)
    }));
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <Navbar />
        <main className="flex-1 p-2 sm:p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
              Category Comparison
            </h1>
            <p className="text-muted-foreground mt-1 animate-fade-in">
              Compare review metrics across different Amazon product categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Select Categories</CardTitle>
                <CardDescription>
                  Choose up to 5 categories to compare
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                        onClick={() => setSearchTerm('')}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="border rounded-md h-60 overflow-y-auto">
                    <ul className="divide-y">
                      {filteredCategories.map(category => (
                        <li key={category} className="p-2 hover:bg-muted flex justify-between items-center">
                          <span className="text-sm">{category}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={selectedCategories.includes(category) || selectedCategories.length >= 5}
                            onClick={() => addCategory(category)}
                          >
                            Add
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Selected Categories</h4>
                    {selectedCategories.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No categories selected</p>
                    ) : (
                      <ul className="space-y-2">
                        {selectedCategories.map(category => (
                          <li 
                            key={category} 
                            className="bg-primary/10 text-sm rounded-md p-2 flex justify-between items-center"
                          >
                            <span>{category}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeCategory(category)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance Comparison</CardTitle>
                  <CardDescription>
                    Review metrics for selected categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedCategories.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Category</th>
                            <th className="text-right p-2">
                              <div className="flex items-center justify-end gap-1">
                                Total Reviews
                                <ArrowDownUp className="h-3 w-3" />
                              </div>
                            </th>
                            <th className="text-right p-2">
                              <div className="flex items-center justify-end gap-1">
                                Avg Rating
                                <ArrowDownUp className="h-3 w-3" />
                              </div>
                            </th>
                            <th className="text-right p-2">
                              <div className="flex items-center justify-end gap-1">
                                Helpfulness %
                                <ArrowDownUp className="h-3 w-3" />
                              </div>
                            </th>
                            <th className="text-right p-2">
                              <div className="flex items-center justify-end gap-1">
                                Verified %
                                <ArrowDownUp className="h-3 w-3" />
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCategories.map(category => {
                            const metrics = getCategoryMetrics(category);
                            return (
                              <tr key={category} className="border-b hover:bg-muted/30">
                                <td className="p-2 font-medium">{category}</td>
                                <td className="p-2 text-right">{metrics.reviews.toLocaleString()}</td>
                                <td className="p-2 text-right">{metrics.rating}/5</td>
                                <td className="p-2 text-right">{metrics.helpfulness}%</td>
                                <td className="p-2 text-right">{metrics.verified}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p>Select categories to compare their metrics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {selectedCategories.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DataVisualization
                  title="Review Volume Comparison"
                  description="Total reviews by category"
                  data={selectedCategories.map(cat => {
                    const catInfo = amazonCategories.find(c => c.name.replace(/_/g, ' ') === cat);
                    return {
                      name: cat,
                      reviews: catInfo ? catInfo.reviewCount : 0
                    };
                  })}
                  type="line"
                  dataKeys={['reviews']}
                  xAxisKey="name"
                />
                <DataVisualization
                  title="Rating Distribution"
                  description="Distribution of ratings across categories"
                  data={selectedCategories.map(cat => {
                    const metrics = getCategoryMetrics(cat);
                    return {
                      name: cat,
                      "5 Star": Math.floor(Math.random() * 50) + 20,
                      "4 Star": Math.floor(Math.random() * 30) + 20,
                      "3 Star": Math.floor(Math.random() * 15) + 5,
                      "2 Star": Math.floor(Math.random() * 10) + 3,
                      "1 Star": Math.floor(Math.random() * 10) + 2,
                    };
                  })}
                  type="line"
                  dataKeys={['5 Star', '4 Star', '3 Star', '2 Star', '1 Star']}
                  xAxisKey="name"
                  stacked
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ComparisonView
                  title="Review Quality Metrics"
                  data={selectedCategories.map((cat, index) => {
                    const metrics = getCategoryMetrics(cat);
                    return {
                      department: cat,
                      value: metrics.rating,
                      color: getRandomColor(index),
                      Rating: metrics.rating,
                      Helpfulness: metrics.helpfulness,
                      Verified: metrics.verified
                    };
                  })}
                  metrics={['Rating', 'Helpfulness', 'Verified']}
                />
                <ComparisonView
                  title="Sentiment Analysis"
                  data={selectedCategories.map((cat, index) => {
                    const positive = Math.floor(Math.random() * 30) + 60;
                    return {
                      department: cat,
                      value: positive,
                      color: getRandomColor(index),
                      Positive: positive,
                      Neutral: Math.floor(Math.random() * 20) + 20,
                      Negative: Math.floor(Math.random() * 15) + 5
                    };
                  })}
                  metrics={['Positive', 'Neutral', 'Negative']}
                />
              </div>
              
              <div className="text-right">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Comparison Data
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Compare;
