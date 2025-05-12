import React from 'react';
import DashboardContent from '@/components/dashboard/DashboardContent';
import FormattedText from '@/components/ui/formatted-text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SAMPLE_SALES_DATA = `
## Sales Data Overview
The dataset contains **200,000** transactions with a total sales value of **$189,768,735.69**. The average order value is **$948.84**.

## Product Category Analysis

### Top Categories by Revenue
- **Sports & Outdoors**: $31,863,748.15 (16.9% of total revenue) from 33,434 transactions
- **Beauty & Personal Care**: $31,682,933.94 (16.8% of total revenue) from 33,396 transactions
- **Books**: $31,676,438.83 (16.8% of total revenue) from 33,541 transactions

## Sales Trends
Month-over-month sales have **decreased by 37.2%** ($25,756,945.07 vs $41,046,356.55).
Best performing day is **Monday** ($27,426,797.02), while **Saturday** ($26,091,745.08) has the lowest sales.

## Customer Demographics
The **50-64** age group drives the most revenue ($54,819,834.22).

### Gender Distribution
- **Female**: $62,944,521.67 (33.2%)
- **Male**: $63,634,430.93 (33.5%)
- **Other**: $63,189,783.09 (33.3%)

## Recommendations
Based on the analysis, consider implementing the following strategies:
1. **Focus on Sports & Outdoors**: Invest more marketing budget in your top-performing category
2. **Bundle products**: Create product bundles with items from Sports & Outdoors to increase average order value
3. **Target 50-64 demographic**: This is your highest-value customer segment
4. **Optimize for Monday**: Schedule promotions and email campaigns for your highest-performing day
5. **Increase average order value**: Current AOV is $948.84 - implement cross-selling strategies to grow this metric
`;

const SAMPLE_REVIEW_DATA = `
# Review Data Analysis
Total number of reviews: 2,932
Number of unique products: 148
Average overall rating: 4.88/5

## Rating Distribution
- 1.0 stars: 22 reviews (0.8%)
- 2.0 stars: 11 reviews (0.4%)
- 3.0 stars: 33 reviews (1.1%)
- 4.0 stars: 154 reviews (5.3%)
- 5.0 stars: 2,712 reviews (92.5%)

The products in this dataset have very positive reviews overall, indicating high customer satisfaction.

### Top 5 Categories by Number of Reviews
- Gift_Cards_5: 2,932 reviews (100.0%)

### Key Topics in Reviews
- **Product B00PGOMSU0**: One Star (Rating: 1.0)
- **Product B00BXLSGHO**: Just like getting free money!!! (Rating: 5.0)
- **Product B00FTGTIOE**: Five Stars (Rating: 5.0)

## Recommendations
- Investigate quality issues in the Gift_Cards_5 categories
- Highlight the positive aspects of B00BXLSGHO in marketing materials
- Address the issues with B00PGOMSU0 to improve customer satisfaction
`;

const TestView: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard Formatting Test</h1>
      
      <Tabs defaultValue="combined" className="w-full">
        <TabsList>
          <TabsTrigger value="combined">Combined View</TabsTrigger>
          <TabsTrigger value="components">Individual Components</TabsTrigger>
        </TabsList>
        
        <TabsContent value="combined" className="mt-4">
          <DashboardContent 
            salesData={SAMPLE_SALES_DATA}
            reviewData={SAMPLE_REVIEW_DATA}
          />
        </TabsContent>
        
        <TabsContent value="components" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FormattedText Component</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-medium mb-2">Sales Data:</h3>
              <FormattedText content={SAMPLE_SALES_DATA} />
              
              <div className="border-t my-4"></div>
              
              <h3 className="font-medium mb-2">Review Data:</h3>
              <FormattedText content={SAMPLE_REVIEW_DATA} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestView; 