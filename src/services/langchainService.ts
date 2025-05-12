
import { toast } from '@/hooks/use-toast';

// Base URL for the LangChain API server
const BASE_URL = 'http://localhost:3000/api';

/**
 * Interface for AI Analysis Request
 */
export interface AIAnalysisRequest {
  query: string;
  department?: string;
  data?: {
    sales?: any[];
    inventory?: any[];
    reviews?: any[];
  };
}

/**
 * Interface for AI Analysis Response
 */
export interface AIAnalysisResponse {
  analysis: string;
  insights: string[];
  recommendations: string[];
  charts?: any[];
}

/**
 * Service for interacting with the LangChain backend API
 */
export const LangChainService = {
  /**
   * Analyze data with the LangChain model
   */
  analyzeData: async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
    try {
      // If we're in development or testing mode and the server isn't running,
      // return mock data instead of making an actual API call
      if (process.env.NODE_ENV !== 'production' && !window.location.hostname.includes('lovableproject.com')) {
        return getMockResponse(request);
      }

      const response = await fetch(`${BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing data with LangChain:', error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Failed to connect to LangChain AI service. Using simulated response.",
      });
      
      // Fallback to mock data if the API call fails
      return getMockResponse(request);
    }
  },

  /**
   * Send a direct message to the agent for conversation
   */
  sendMessage: async (message: string, department?: string): Promise<string> => {
    try {
      // If we're in development or testing mode and the server isn't running,
      // return mock response instead of making an actual API call
      if (process.env.NODE_ENV !== 'production' && !window.location.hostname.includes('lovableproject.com')) {
        return getMockMessageResponse(message, department);
      }

      const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, department }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error sending message to LangChain:', error);
      
      // Fallback to mock response if the API call fails
      return getMockMessageResponse(message, department);
    }
  }
};

/**
 * Generate a mock response for development/testing
 */
function getMockResponse(request: AIAnalysisRequest): AIAnalysisResponse {
  const { query, department } = request;
  
  // Different insights based on department
  const departmentSpecificInsights: Record<string, string[]> = {
    'Electronics': [
      'Customer reviews indicate a 15% increase in satisfaction with new products',
      'The average inventory turnover rate is 3.5x faster than industry average',
      'Sales peak during product release cycles and holiday seasons',
      'Smart home devices show the strongest growth trajectory at 24% YoY'
    ],
    'Clothing': [
      'Seasonal collections drive 35% of annual revenue',
      'Return rates have decreased by 8% following size guide improvements',
      'Online sales conversion rate is 2.3x higher for items with multiple images',
      'Customer retention is highest among 25-34 age demographic'
    ],
    'Grocery': [
      'Fresh produce category has the highest margin at 42%',
      'Local suppliers reduce logistics costs by 18% compared to national brands',
      'Tuesday and Wednesday show highest inventory turnover rates',
      'Organic products show 28% higher customer loyalty metrics'
    ],
    'Default': [
      'Performance metrics indicate a 12% improvement in efficiency',
      'Customer satisfaction scores have increased across all departments',
      'Inventory management improvements have reduced stockouts by 23%',
      'Cross-department promotions show 34% higher conversion rates'
    ]
  };
  
  const insights = department && departmentSpecificInsights[department] 
    ? departmentSpecificInsights[department] 
    : departmentSpecificInsights['Default'];
  
  // Generate recommendations based on keywords in the query
  const recommendations = [];
  
  if (query.toLowerCase().includes('inventory') || query.toLowerCase().includes('stock')) {
    recommendations.push('Implement just-in-time inventory management to reduce holding costs');
  }
  
  if (query.toLowerCase().includes('sales') || query.toLowerCase().includes('revenue')) {
    recommendations.push('Focus marketing efforts on high-margin product categories');
  }
  
  if (query.toLowerCase().includes('customer') || query.toLowerCase().includes('review')) {
    recommendations.push('Enhance product documentation to address common customer pain points');
  }
  
  // Add some default recommendations if we don't have enough
  if (recommendations.length < 3) {
    recommendations.push(
      'Optimize supply chain logistics to reduce delivery timeframes',
      'Implement cross-departmental data sharing to identify complementary product opportunities',
      'Develop predictive analytics models to anticipate seasonal demand fluctuations'
    );
  }
  
  // Generate an analysis based on the query and department
  let analysis = '';
  
  if (department) {
    analysis = `Analysis of the ${department} department shows interesting patterns in the data. ${
      department === 'Electronics' ? 'High-tech products are driving significant revenue growth.' :
      department === 'Clothing' ? 'Seasonal trends significantly impact inventory requirements.' :
      department === 'Grocery' ? 'Perishable goods management is critical to maintaining profitability.' :
      'Department data shows room for optimization in several key areas.'
    } The performance metrics indicate that ${
      query.toLowerCase().includes('performance') ? 'efficiency has improved by 15% over the last quarter' :
      query.toLowerCase().includes('sales') ? 'sales have increased consistently month-over-month' :
      query.toLowerCase().includes('inventory') ? 'inventory turnover rates are optimal for most products' :
      'there are several opportunities for cross-selling with other departments'
    }. Based on the available data, I recommend focusing on ${
      Math.random() > 0.5 ? 'optimizing the supply chain' : 'improving customer engagement strategies'
    } to maximize department performance.`;
  } else {
    analysis = `Cross-department analysis reveals several insights across the organization. The data shows ${
      query.toLowerCase().includes('performance') ? 'varying performance levels between departments' :
      query.toLowerCase().includes('sales') ? 'sales patterns that could benefit from coordinated promotions' :
      query.toLowerCase().includes('inventory') ? 'opportunities for shared inventory management' :
      'potential for improved operational efficiency through better coordination'
    }. When examining the metrics across departments, it's clear that ${
      Math.random() > 0.5 ? 'some departments could benefit from adopting best practices from others' : 
      'coordinated marketing initiatives could drive significant growth'
    }. I recommend implementing a cross-functional task force to address these opportunities.`;
  }
  
  return {
    analysis,
    insights: insights.slice(0, 4),
    recommendations: recommendations.slice(0, 3)
  };
}

/**
 * Generate a mock message response for development/testing
 */
function getMockMessageResponse(message: string, department?: string): string {
  // Generate responses based on the message content and department
  if (message.toLowerCase().includes('help')) {
    return "I can help you analyze department data, compare metrics across departments, identify trends, and provide recommendations for improvement. Just ask me a specific question about your data!";
  }
  
  if (message.toLowerCase().includes('compare')) {
    return `Comparing ${department || 'department'} data shows interesting patterns. There's a strong correlation between inventory levels and sales performance. When inventory is maintained at optimal levels, sales typically increase by 18-22%. The data also suggests that promotional activities have varying effectiveness depending on the day of the week.`;
  }
  
  if (message.toLowerCase().includes('recommend') || message.toLowerCase().includes('suggest')) {
    return `Based on the ${department || 'department'} data, I recommend: 1) Optimizing inventory levels based on seasonal patterns, 2) Targeting marketing efforts during peak customer engagement periods, and 3) Exploring complementary product offerings that have shown strong correlation in purchase patterns.`;
  }
  
  if (message.toLowerCase().includes('trend') || message.toLowerCase().includes('pattern')) {
    return `The most significant trend in the ${department || 'department'} data is the cyclical nature of demand. There's a clear pattern showing increased activity every 4-6 weeks, suggesting an opportunity for timed promotional activities. Additionally, customer engagement metrics peak during specific times which should inform your staffing and inventory decisions.`;
  }
  
  // Default response if no specific keywords are matched
  return `I've analyzed the ${department || 'department'} data based on your query. The metrics show healthy performance with some opportunities for optimization. Key indicators suggest that focusing on inventory management and customer engagement would yield the highest impact on overall performance metrics. Would you like me to explore any specific aspect in more detail?`;
}
