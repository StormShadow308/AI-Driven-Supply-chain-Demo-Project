
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Send, Lightbulb, Bot, Sparkles, RotateCw, PieChart, BarChart3, Cpu, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { LangChainService } from '@/services/langchainService';

type Message = {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
};

interface DepartmentData {
  name: string;
  metrics?: {
    sales?: number;
    inventory?: number;
    performance?: number;
  };
  reviews?: number;
}

interface LangChainAgentProps {
  departments: string[];
  departmentData?: DepartmentData[];
  activeDepartment?: string;
  onAnalyze?: (query: string, department?: string) => void;
}

const EXAMPLE_QUERIES = [
  "Compare Electronics and Grocery department performance",
  "Which department has the highest growth rate?",
  "Analyze sales trends across all departments",
  "What correlations exist between inventory levels and sales?",
  "Which products have the most positive reviews?"
];

const DEPARTMENT_SPECIFIC_QUERIES = {
  "Electronics": [
    "What are the top-selling products in Electronics?",
    "How do Electronics sales compare to last quarter?",
    "What's the current inventory level for Electronics?",
    "What's the sentiment of customer reviews for Electronics?"
  ],
  "Grocery": [
    "What food categories have the highest turnover rate?",
    "What's the average shelf life of Grocery products?",
    "Identify seasonal trends in Grocery sales",
    "Which Grocery items have stock level warnings?"
  ],
  "Books": [
    "Which book genres are most popular?",
    "What's the review sentiment for new book releases?",
    "Compare sales of e-books versus physical books",
    "Which authors drive the most sales?"
  ],
  "Clothing": [
    "What's the size distribution of returned items?",
    "Which clothing categories have the highest margin?",
    "What's the seasonal trend for outerwear?",
    "Compare men's vs women's apparel sales"
  ],
  "Home Goods": [
    "What home appliances have the highest return rate?",
    "Which furniture items need more inventory?",
    "Compare kitchen vs bathroom product sales",
    "What's the average delivery time for large items?"
  ]
};

const LangChainAgent = ({ departments, departmentData, activeDepartment, onAnalyze }: LangChainAgentProps) => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      content: activeDepartment 
        ? `Hello, I am J.A.R.V.I.S., your ${activeDepartment} department analysis assistant. I can help you analyze data and provide insights about ${activeDepartment}. What would you like to know?`
        : 'Hello, I am J.A.R.V.I.S., your supply chain analysis assistant. I can help you analyze data across departments and provide insights. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Call LangChain service instead of using setTimeout
      const responseContent = await LangChainService.sendMessage(query, activeDepartment);
      
      const agentMessage: Message = {
        role: 'agent',
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentMessage]);
      setIsLoading(false);
      setQuery('');
      
      // Trigger the analysis if provided
      if (onAnalyze) {
        onAnalyze(userMessage.content, activeDepartment);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "There was a problem analyzing your query.",
      });
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  // Get relevant examples based on active department
  const getRelevantExamples = () => {
    if (activeDepartment && DEPARTMENT_SPECIFIC_QUERIES[activeDepartment as keyof typeof DEPARTMENT_SPECIFIC_QUERIES]) {
      return DEPARTMENT_SPECIFIC_QUERIES[activeDepartment as keyof typeof DEPARTMENT_SPECIFIC_QUERIES];
    }
    return EXAMPLE_QUERIES;
  };

  return (
    <Card className="ironman-panel overflow-hidden animate-fade-in transition-all duration-300 border-secondary/20">
      <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center reactor-glow">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-white">
            {activeDepartment ? `${activeDepartment} Analysis J.A.R.V.I.S.` : 'Supervising J.A.R.V.I.S.'}
          </CardTitle>
          {activeDepartment && (
            <Badge variant="outline" className="ml-2 border-secondary/40 text-secondary">
              {activeDepartment}
            </Badge>
          )}
        </div>
        <CardDescription className="text-white/70">
          {activeDepartment 
            ? `Analyze ${activeDepartment} data with AI-powered insights`
            : 'Cross-analyze department data with AI-powered insights'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="mb-4 space-y-1">
          <h4 className="text-sm font-medium flex items-center gap-1 text-secondary">
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Example queries</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {getRelevantExamples().map((example, idx) => (
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
        
        <div className="bg-card/50 border border-accent/10 rounded-md p-3 mb-4 h-[220px] overflow-y-auto flex flex-col">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`mb-3 max-w-[85%] ${
                message.role === 'agent' 
                  ? 'self-start bg-accent/10 text-accent-foreground border border-accent/20' 
                  : 'self-end bg-primary/10 text-primary-foreground border border-primary/20'
              } rounded-md p-2 text-sm`}
            >
              <div className="flex items-center gap-1 mb-1 text-xs opacity-70">
                {message.role === 'agent' ? (
                  <>
                    <Cpu className="h-3 w-3 text-accent" />
                    <span>J.A.R.V.I.S.</span>
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
              <p>{message.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="self-start bg-accent/10 text-accent-foreground rounded-md p-2 text-sm mb-3 flex items-center gap-2 border border-accent/20">
              <RotateCw className="h-3 w-3 animate-spin text-accent" />
              <span>
                {activeDepartment 
                  ? `Analyzing ${activeDepartment} data...` 
                  : 'Analyzing departments...'}
              </span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={activeDepartment 
              ? `Ask about ${activeDepartment} data...` 
              : "Ask about department data..."}
            className="flex-1 border-accent/20 bg-card/30 focus:border-accent/50"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !query.trim()}
            className="bg-accent hover:bg-accent/80"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
      <CardFooter className="pt-0 px-4 pb-4">
        <div className="w-full flex justify-center">
          <div className="text-xs text-center text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-secondary" />
            <span>Powered by LangChain and open source models</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LangChainAgent;
