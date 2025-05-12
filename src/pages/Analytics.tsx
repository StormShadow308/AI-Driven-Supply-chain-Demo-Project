import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EmptyStateCard from '@/components/EmptyStateCard';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2, Package, MessageSquare } from 'lucide-react';
import DashboardContent from '@/components/dashboard/DashboardContent';
import JointDashboard from '@/components/dashboard/JointDashboard';

const Analytics = () => {
  return (
    <div className="flex flex-col space-y-8">
      {/* Header section */}
      <div className="flex flex-col space-y-3">
        <h1 className="section-title text-3xl md:text-4xl font-bold">
          Analytics Dashboard
        </h1>
        <p className="section-subtitle text-lg text-white/70">
          Explore data insights across your supply chain
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-3 bg-card/50 p-1 border border-primary/10">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="reports"
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Reports
          </TabsTrigger>
          <TabsTrigger 
            value="insights"
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Insights
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass-card glow-blue hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-white">Sales Analytics</CardTitle>
                    <CardDescription className="text-white/70">
                      Revenue trends and performance
                    </CardDescription>
                  </div>
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <BarChart2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70 mb-4">
                  Track sales performance, revenue metrics, and discover key product insights
                </p>
                <Link 
                  to="/analytics/sales" 
                  className="primary-button inline-flex items-center justify-center w-full"
                >
                  View Sales Analytics <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
            
            <Card className="glass-card glow-effect hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-white">Inventory Analysis</CardTitle>
                    <CardDescription className="text-white/70">
                      Stock levels and turnover rates
                    </CardDescription>
                  </div>
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Package className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70 mb-4">
                  Monitor inventory health, identify slow-moving items, and optimize stock levels
                </p>
                <Link 
                  to="/analytics/distribution" 
                  className="primary-button inline-flex items-center justify-center w-full"
                >
                  View Inventory Analysis <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
            
            <Card className="glass-card glow-purple hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-white">Customer Reviews</CardTitle>
                    <CardDescription className="text-white/70">
                      Sentiment analysis and feedback
                    </CardDescription>
                  </div>
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70 mb-4">
                  Analyze customer feedback, track sentiment over time, and identify improvement areas
                </p>
                <Link 
                  to="/analytics/reviews" 
                  className="primary-button inline-flex items-center justify-center w-full"
                >
                  View Reviews Analytics <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="pt-6">
          <EmptyStateCard 
            title="No Reports Available" 
            description="Upload your data first to generate custom reports" 
          />
        </TabsContent>
        
        <TabsContent value="insights" className="pt-6">
          <EmptyStateCard 
            title="No Insights Available" 
            description="Upload your data first to view AI-generated insights" 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
