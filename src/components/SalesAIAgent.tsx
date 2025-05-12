import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Send, Lightbulb, RotateCw, Cpu, BarChart3, Database, FileText, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { querySalesAgent } from '@/services/api';

type Message = {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
};

interface SalesAIAgentProps {
  fileId?: string;
  department?: string;
  onAnalyze?: (query: string) => void;
}

const EXAMPLE_QUERIES = [
  "What are the top-selling product categories and why?",
  "Provide a complete analysis of our sales performance",
  "What customer demographics are driving most of our revenue?",
  "Analyze sales trends and forecast next quarter performance",
  "What actionable recommendations will improve our profit margins?",
  "How do discounts affect our conversion rates and overall revenue?",
  "Which customer segments have the highest lifetime value?",
  "What's the sales performance across different regions and locations?"
];

const DEFAULT_WELCOME_MESSAGE = 'Hello! I\'m your Sales AI Assistant powered by advanced business analytics. I can provide comprehensive insights about your sales data including category performance, customer segmentation, trend forecasting, and strategic recommendations. What business question would you like to analyze today?';

const SalesAIAgent = ({ fileId, department, onAnalyze }: SalesAIAgentProps) => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      content: DEFAULT_WELCOME_MESSAGE,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataInfo, setDataInfo] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Add effect to show what data we're working with and send initial greeting
  useEffect(() => {
    if (fileId && department) {
      setDataInfo(`Analyzing ${fileId} from ${department}`);
      
      // Auto-send a greeting message that includes file info
      const initialQuery = "Give me a comprehensive overview of this sales data including key metrics, trends, and any notable insights";
      
      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: initialQuery,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      
      // Call the AI agent service for file info
      querySalesAgent(initialQuery, fileId, department)
        .then(response => {
          if (response.success && response.response) {
            // Simulate typing effect
            setIsTyping(true);
            setTimeout(() => {
              // Extract the string content from the response
              const agentResponseContent = typeof response.response === 'string' ? response.response : (response.response as any)?.response || JSON.stringify(response.response);
              const agentMessage: Message = {
                role: 'agent',
                content: formatResponse(agentResponseContent), // Use extracted content
                timestamp: new Date()
              };
              
              setMessages(prev => [...prev.filter(m => m.role !== 'agent' || m.content !== DEFAULT_WELCOME_MESSAGE), agentMessage]);
              setIsTyping(false);
            }, 800);
          } else {
            throw new Error(response.error || 'Failed to get a response from the agent');
          }
        })
        .catch(error => {
          console.error("Error fetching initial data summary:", error);
          // Keep the default welcome message if we can't get file info
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDataInfo('No data loaded. Please upload a file for analysis.');
    }
  }, [fileId, department]);

  // Format response for better readability
  const formatResponse = (response: string): string => {
    // Enhanced formatting
    let formattedResponse = response;
    
    // Format tables if they exist by preserving their structure
    if (formattedResponse.includes('|') && formattedResponse.includes('\n') && formattedResponse.match(/\|.*\|/)) {
      // Find table sections and wrap them in pre tags
      const tablePattern = /(\|.+\|\n\|[-|]+\|\n(\|.+\|\n)+)/g;
      formattedResponse = formattedResponse.replace(tablePattern, '<div class="overflow-auto"><pre>$1</pre></div>');
    } else if (formattedResponse.includes('\n') && formattedResponse.match(/\s{2,}|\t/)) {
      formattedResponse = `<pre>${formattedResponse}</pre>`;
    }
    
    // Format markdown-style headers
    formattedResponse = formattedResponse.replace(/## (.*?)(?:\n|$)/g, '<h3 class="text-primary font-bold mt-4 mb-2">$1</h3>');
    formattedResponse = formattedResponse.replace(/### (.*?)(?:\n|$)/g, '<h4 class="text-primary-600 font-semibold mt-3 mb-1">$1</h4>');
    
    // Format bullet points
    formattedResponse = formattedResponse.replace(/- (.*?)(?:\n|$)/g, '<li class="ml-4 list-disc mb-1">$1</li>');
    formattedResponse = formattedResponse.replace(/(\d+)\. (.*?)(?:\n|$)/g, '<li class="ml-4 list-decimal mb-1"><strong>$1.</strong> $2</li>');
    
    // Format numbers and percentages to highlight them
    formattedResponse = formattedResponse.replace(/(\d+(\.\d+)?%)/g, '<span class="text-primary font-medium">$1</span>');
    formattedResponse = formattedResponse.replace(/\$(\d{1,3}(,\d{3})*(\.\d+)?)/g, '<span class="text-green-600 font-medium">$$$1</span>');
    
    // Format KPIs and business metrics to stand out
    const businessMetrics = ['ROI', 'AOV', 'LTV', 'CAC', 'ROAS', 'CPA', 'CTR', 'COGS', 'GMV'];
    businessMetrics.forEach(metric => {
      const metricPattern = new RegExp(`\\b${metric}\\b`, 'g');
      formattedResponse = formattedResponse.replace(metricPattern, `<span class="font-bold text-primary-700">${metric}</span>`);
    });
    
    // Emphasize important business terms
    const businessTerms = ['growth', 'increase', 'decrease', 'opportunity', 'challenge', 'market share', 'profit margin', 'revenue'];
    businessTerms.forEach(term => {
      const termPattern = new RegExp(`\\b${term}\\b`, 'gi');
      formattedResponse = formattedResponse.replace(termPattern, `<span class="italic">$&</span>`);
    });
    
    // Add blockquote styling to recommendations section
    if (formattedResponse.includes('<h3 class="text-primary font-bold mt-4 mb-2">Recommendations</h3>') || 
        formattedResponse.includes('<h4 class="text-primary-600 font-semibold mt-3 mb-1">Recommendations</h4>')) {
      const recommendationsPattern = /(<h[34][^>]*>Recommendations<\/h[34]>)([\s\S]*?)(<h[34]|$)/;
      const match = formattedResponse.match(recommendationsPattern);
      
      if (match) {
        const [fullMatch, header, content, ending] = match;
        const styledContent = `<div class="border-l-4 border-primary pl-4 py-1 my-2">${content}</div>`;
        formattedResponse = formattedResponse.replace(fullMatch, `${header}${styledContent}${ending}`);
      }
    }
    
    return formattedResponse;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    const userQuery = query;
    setQuery('');
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: userQuery,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Enhance the user's query to get more complete responses
      const enhancedQuery = enhanceUserQuery(userQuery);
      
      // Call the AI agent service
      const response = await querySalesAgent(enhancedQuery, fileId, department);
      
      if (response.success && response.response) {
        // Simulate typing effect for more natural conversation
        setIsTyping(true);
        setTimeout(() => {
          // Extract the string content from the response
          const agentResponseContent = typeof response.response === 'string' ? response.response : (response.response as any)?.response || JSON.stringify(response.response);
          const agentMessage: Message = {
            role: 'agent',
            content: formatResponse(agentResponseContent), // Use extracted content
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, agentMessage]);
          setIsTyping(false);
        }, 500 + Math.random() * 1000); // Random delay for natural feel
      } else {
        throw new Error(response.error || 'Failed to get a response from the agent');
      }
      
      setIsLoading(false);
      
      // Trigger the analysis if provided
      if (onAnalyze) {
        onAnalyze(userMessage.content);
      }
    } catch (error: any) {
      console.error("Error from sales agent query:", error);
      
      // Provide a helpful fallback response
      setIsTyping(true);
      setTimeout(() => {
        const errorMessage: Message = {
          role: 'agent',
          content: getFallbackResponse(userQuery, error),
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
        setIsLoading(false);
        
        // Only show toast for non-connection errors
        if (!error.message?.includes('Failed to fetch') && !error.message?.includes('Network Error')) {
          toast({
            variant: "destructive",
            title: "Analysis error",
            description: "I've provided a general response instead. Please try again later.",
          });
        }
      }, 800);
    }
  };

  // Function to enhance user queries to get more comprehensive responses
  const enhanceUserQuery = (originalQuery: string): string => {
    // If query is already detailed, leave it as is
    if (originalQuery.length > 50) return originalQuery;
    
    // Check if query is asking for specific business analysis
    if (originalQuery.toLowerCase().includes("analysis") || 
        originalQuery.toLowerCase().includes("analyze")) {
      return `${originalQuery}. Please provide a comprehensive business analysis with key metrics, trends, and actionable recommendations.`;
    }
    
    // Check if query is about categories or products
    if (originalQuery.toLowerCase().includes("category") || 
        originalQuery.toLowerCase().includes("product") ||
        originalQuery.toLowerCase().includes("selling")) {
      return `${originalQuery}. Include revenue breakdown, growth rates, and market share analysis.`;
    }
    
    // Check if query is about customers or demographics
    if (originalQuery.toLowerCase().includes("customer") || 
        originalQuery.toLowerCase().includes("demographic") ||
        originalQuery.toLowerCase().includes("segment")) {
      return `${originalQuery}. Include segment analysis, purchasing patterns, and customer lifetime value.`;
    }
    
    // Check if query is about trends or forecasts
    if (originalQuery.toLowerCase().includes("trend") || 
        originalQuery.toLowerCase().includes("forecast") ||
        originalQuery.toLowerCase().includes("predict")) {
      return `${originalQuery}. Include historical trend analysis, seasonality patterns, and future projections.`;
    }
    
    // Check if query is asking for recommendations
    if (originalQuery.toLowerCase().includes("recommend") || 
        originalQuery.toLowerCase().includes("suggest") ||
        originalQuery.toLowerCase().includes("improve") ||
        originalQuery.toLowerCase().includes("strategy")) {
      return `${originalQuery}. Provide specific, actionable recommendations with expected impact and implementation steps.`;
    }
    
    // For shorter or general queries, expand to request comprehensive analysis
    return `Please provide a comprehensive business analysis regarding: ${originalQuery}. Include key metrics, trends, and actionable recommendations.`;
  };

  // Function to generate fallback responses when API fails
  const getFallbackResponse = (query: string, error: any): string => {
    const userQueryLower = query.toLowerCase();
    
    // Log the error for debugging
    console.log("Generating fallback response for error:", error);
    
    // Generic message about the error
    let errorInfo = "I'm currently unable to analyze the specific data you requested due to a technical issue. ";
    
    if (error.message?.includes('Failed to fetch') || error.message?.includes('Network Error')) {
      errorInfo = "I'm having trouble connecting to the data analysis service. ";
    } else if (error.message?.includes('not found')) {
      errorInfo = "I couldn't find the data file you're referencing. ";
    } else if (error.message?.includes('list') && error.message?.includes('negative')) {
      errorInfo = "There was an issue with the data generation process. ";
    }
    
    // Create appropriate response based on query type
    if (userQueryLower.includes('category') || userQueryLower.includes('product') || userQueryLower.includes('sell')) {
      return `<h3 class="text-primary font-bold mt-4 mb-2">Product Category Analysis</h3>
      
${errorInfo}Here's some general information about product categories:

<li class="ml-4 list-disc mb-1">Electronics typically have high profit margins but may require more customer support</li>
<li class="ml-4 list-disc mb-1">Clothing often shows strong seasonal trends with higher sales during holidays</li>
<li class="ml-4 list-disc mb-1">Home goods tend to have more stable demand throughout the year</li>

<h3 class="text-primary font-bold mt-4 mb-2">Recommendations</h3>

<div class="border-l-4 border-primary pl-4 py-1 my-2">
<li class="ml-4 list-decimal mb-1"><strong>1.</strong> Analyze your top-selling products to identify common features</li>
<li class="ml-4 list-decimal mb-1"><strong>2.</strong> Consider bundling complementary products to increase average order value</li>
<li class="ml-4 list-decimal mb-1"><strong>3.</strong> Review underperforming categories for potential optimization</li>
</div>`;
    }
    else if (userQueryLower.includes('trend') || userQueryLower.includes('forecast')) {
      return `<h3 class="text-primary font-bold mt-4 mb-2">Sales Trend Analysis</h3>
      
${errorInfo}Here are some insights about typical sales trends:

<li class="ml-4 list-disc mb-1">Q4 typically sees <span class="text-primary font-medium">25-40%</span> higher sales due to holiday shopping</li>
<li class="ml-4 list-disc mb-1">Weekend sales often outperform weekdays by <span class="text-primary font-medium">15-20%</span></li>
<li class="ml-4 list-disc mb-1">Promotional periods can increase sales by <span class="text-primary font-medium">30-50%</span> but may affect margins</li>

<h3 class="text-primary font-bold mt-4 mb-2">Recommendations</h3>

<div class="border-l-4 border-primary pl-4 py-1 my-2">
<li class="ml-4 list-decimal mb-1"><strong>1.</strong> Plan inventory increases before historically high-volume periods</li>
<li class="ml-4 list-decimal mb-1"><strong>2.</strong> Optimize staffing and marketing for peak sales days</li>
<li class="ml-4 list-decimal mb-1"><strong>3.</strong> Create special promotions for traditionally slower periods</li>
</div>`;
    }
    else if (userQueryLower.includes('customer') || userQueryLower.includes('demographic')) {
      return `<h3 class="text-primary font-bold mt-4 mb-2">Customer Demographics Analysis</h3>
      
${errorInfo}Here's some general information about customer segments:

<li class="ml-4 list-disc mb-1">The 25-34 age group typically has the highest purchase frequency</li>
<li class="ml-4 list-disc mb-1">Older demographics (55+) often have higher average order values</li>
<li class="ml-4 list-disc mb-1">Urban customers may show different product preferences than suburban or rural</li>

<h3 class="text-primary font-bold mt-4 mb-2">Recommendations</h3>

<div class="border-l-4 border-primary pl-4 py-1 my-2">
<li class="ml-4 list-decimal mb-1"><strong>1.</strong> Develop targeted marketing campaigns for your highest-value segments</li>
<li class="ml-4 list-decimal mb-1"><strong>2.</strong> Consider location-based promotions to address regional differences</li>
<li class="ml-4 list-decimal mb-1"><strong>3.</strong> Create loyalty programs to improve customer retention</li>
</div>`;
    }
    else if (userQueryLower.includes('discount') || userQueryLower.includes('promotion')) {
      return `<h3 class="text-primary font-bold mt-4 mb-2">Discount Impact Analysis</h3>
      
${errorInfo}Here's some general information about discounts:

<li class="ml-4 list-disc mb-1">Discounts of <span class="text-primary font-medium">10-15%</span> typically provide the best balance of conversion and margin</li>
<li class="ml-4 list-disc mb-1">Limited-time offers often drive higher conversion rates than always-on discounts</li>
<li class="ml-4 list-disc mb-1">Bundled discounts can increase average order value while preserving margins</li>

<h3 class="text-primary font-bold mt-4 mb-2">Recommendations</h3>

<div class="border-l-4 border-primary pl-4 py-1 my-2">
<li class="ml-4 list-decimal mb-1"><strong>1.</strong> Test different discount levels to find your optimal balance</li>
<li class="ml-4 list-decimal mb-1"><strong>2.</strong> Consider tiered discounts that increase with purchase amount</li>
<li class="ml-4 list-decimal mb-1"><strong>3.</strong> Use targeted discounts for customer retention and reactivation</li>
</div>`;
    }
    else {
      // Generic response for other queries
      return `<h3 class="text-primary font-bold mt-4 mb-2">Sales Analysis</h3>
      
${errorInfo}I can still provide some general business insights:

<li class="ml-4 list-disc mb-1">Focus on understanding your key performance indicators (KPIs)</li>
<li class="ml-4 list-disc mb-1">Regularly analyze customer behavior and purchasing patterns</li>
<li class="ml-4 list-disc mb-1">Track conversion rates across different marketing channels</li>
<li class="ml-4 list-disc mb-1">Monitor your product mix and inventory turnover rates</li>

<h3 class="text-primary font-bold mt-4 mb-2">Recommendations</h3>

<div class="border-l-4 border-primary pl-4 py-1 my-2">
<li class="ml-4 list-decimal mb-1"><strong>1.</strong> Implement regular data analysis reviews</li>
<li class="ml-4 list-decimal mb-1"><strong>2.</strong> Test and measure the impact of business changes</li>
<li class="ml-4 list-decimal mb-1"><strong>3.</strong> Prioritize customer experience to drive retention</li>
</div>

When the data service is available, I'll be able to provide more specific insights based on your actual sales data.`;
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  return (
    <Card className="overflow-hidden animate-fade-in transition-all duration-300 border-secondary/20">
      <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-primary-foreground dark:text-white">
            Sales AI Assistant
          </CardTitle>
          {dataInfo && (
            <Badge variant="outline" className="ml-2 border-secondary/40 text-secondary">
              {dataInfo}
            </Badge>
          )}
        </div>
        <CardDescription className="text-primary-foreground/70 dark:text-white/70">
          Ask anything about your sales data for detailed AI-powered insights
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="mb-4 space-y-1">
          <h4 className="text-sm font-medium flex items-center gap-1 text-secondary">
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Try asking about:</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs border-accent/30 hover:border-accent/50 hover:bg-accent/10"
                onClick={() => handleExampleClick(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="bg-card/50 border border-accent/10 rounded-md p-3 mb-4 h-[320px] overflow-y-auto flex flex-col">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`mb-3 max-w-[90%] ${
                message.role === 'agent' 
                  ? 'self-start bg-accent/10 text-accent-foreground border border-accent/20' 
                  : 'self-end bg-primary/10 text-primary-foreground border border-primary/20'
              } rounded-md p-2 text-sm`}
            >
              <div className="flex items-center gap-1 mb-1 text-xs opacity-70">
                {message.role === 'agent' ? (
                  <>
                    <Cpu className="h-3 w-3 text-accent" />
                    <span>Sales AI</span>
                  </>
                ) : (
                  <>
                    <span>You</span>
                  </>
                )}
                <span className="text-xs opacity-50 ml-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {message.role === 'agent' && isTyping && idx === messages.length - 1 ? (
                <span className="typing-indicator">Typing...</span>
              ) : (
                <div 
                  className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200" 
                  dangerouslySetInnerHTML={{ __html: message.content }} 
                />
              )}
            </div>
          ))}
          {isLoading && !isTyping && (
            <div className="self-start bg-accent/10 text-accent-foreground rounded-md p-2 text-sm mb-3 flex items-center gap-2 border border-accent/20">
              <RotateCw className="h-3 w-3 animate-spin text-accent" />
              <span>
                Analyzing sales data...
              </span>
            </div>
          )}
          {isTyping && (
            <div className="self-start bg-accent/10 text-accent-foreground rounded-md p-2 text-sm mb-3 flex items-center gap-2 border border-accent/20">
              <span className="flex">
                <span className="animate-bounce mx-0.5">.</span>
                <span className="animate-bounce animation-delay-200 mx-0.5">.</span>
                <span className="animate-bounce animation-delay-400 mx-0.5">.</span>
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask any question about the sales data..."
            className="flex-1 border-accent/20 bg-card/30 focus:border-accent/50"
            disabled={isLoading || isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || isTyping || !query.trim()}
            className="bg-accent hover:bg-accent/80"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        {messages.length > 4 && (
          <div className="flex justify-center mt-2">
            <Button
              variant="ghost" 
              size="sm"
              className="text-xs flex items-center"
              onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              <ArrowDown className="h-3 w-3 mr-1" />
              Scroll to latest
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t border-accent/10 px-4 py-2 bg-card/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Database className="h-3 w-3" />
          {fileId ? (
            <span>Full data analysis enabled</span>
          ) : (
            <span>Using sample data</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <FileText className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">AI Sales Intelligence</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SalesAIAgent; 