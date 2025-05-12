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
import { Send, Lightbulb, RotateCw, Cpu, MessageSquare, Database, FileText, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { queryReviewAgent } from '@/services/api';

type Message = {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
};

interface ReviewAIAgentProps {
  fileId?: string;
  department?: string;
  onAnalyze?: (query: string) => void;
}

const EXAMPLE_QUERIES = [
  "Overall review sentiment?",
  "Common themes in negative reviews?",
  "Most praised product features?",
  "Analyze review ratings over time",
  "Summarize 1-star review complaints",
  "What aspects are mentioned most?",
  "Compare sentiment across categories"
];

const DEFAULT_WELCOME_MESSAGE = 'Hello! I\'m your Review AI Assistant. I analyze product reviews for sentiment, themes, and insights. How can I help with your review data today?';

const ReviewAIAgent = ({ fileId, department, onAnalyze }: ReviewAIAgentProps) => {
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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (fileId && department) {
      setDataInfo(`Analyzing ${fileId} from ${department}`);
      
      const initialQuery = "Give me a comprehensive overview of these reviews including key metrics, sentiment distribution, and notable insights";
      
      const userMessage: Message = { role: 'user', content: initialQuery, timestamp: new Date() };
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      
      queryReviewAgent(initialQuery, fileId, department)
        .then(response => {
          if (response.success && response.response) {
            setIsTyping(true);
            setTimeout(() => {
              const agentResponseContent = typeof response.response === 'string' ? response.response : (response.response as any)?.response || JSON.stringify(response.response);
              const agentMessage: Message = { role: 'agent', content: formatResponse(agentResponseContent), timestamp: new Date() };
              setMessages(prev => [...prev.filter(m => m.role !== 'agent' || m.content !== DEFAULT_WELCOME_MESSAGE), agentMessage]);
              setIsTyping(false);
            }, 800);
          } else {
            throw new Error(response.error || 'Failed to get a response from the review agent');
          }
        })
        .catch(error => {
          console.error("Error fetching initial review summary:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDataInfo('No data loaded. Please upload a file for analysis.');
    }
  }, [fileId, department]);

  const formatResponse = (response: string): string => {
    let formattedResponse = response;
    
    if (formattedResponse.includes('|') && formattedResponse.includes('\n') && formattedResponse.match(/\|.*\|/)) {
      const tablePattern = /(\|.+\|\n\|[-|]+\|\n(\|.+\|\n)+)/g;
      formattedResponse = formattedResponse.replace(tablePattern, '<div class="overflow-auto"><pre>$1</pre></div>');
    } else if (formattedResponse.includes('\n') && formattedResponse.match(/\s{2,}|\t/)) {
      formattedResponse = `<pre>${formattedResponse}</pre>`;
    }
    
    formattedResponse = formattedResponse.replace(/## (.*?)(?:\n|$)/g, '<h3 class="text-primary font-bold mt-4 mb-2">$1</h3>');
    formattedResponse = formattedResponse.replace(/### (.*?)(?:\n|$)/g, '<h4 class="text-primary-600 font-semibold mt-3 mb-1">$1</h4>');
    
    formattedResponse = formattedResponse.replace(/- (.*?)(?:\n|$)/g, '<li class="ml-4 list-disc mb-1">$1</li>');
    formattedResponse = formattedResponse.replace(/(\d+)\. (.*?)(?:\n|$)/g, '<li class="ml-4 list-decimal mb-1"><strong>$1.</strong> $2</li>');
    
    formattedResponse = formattedResponse.replace(/(\d+(\.\d+)?%)/g, '<span class="text-primary font-medium">$1</span>');
    formattedResponse = formattedResponse.replace(/(\d+(\.\d+)?) stars?/g, '<span class="text-amber-500 font-medium">$1★</span>');
    
    const sentimentTerms = {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-gray-600',
      mixed: 'text-amber-600'
    };
    
    Object.entries(sentimentTerms).forEach(([term, color]) => {
      const pattern = new RegExp(`\\b${term}\\b`, 'gi');
      formattedResponse = formattedResponse.replace(pattern, `<span class="${color} font-medium">$&</span>`);
    });
    
    const reviewTerms = ['reviews', 'rating', 'sentiment', 'customer', 'feedback', 'complaint', 'mentioned', 'frequently', 'theme', 'issue'];
    reviewTerms.forEach(term => {
      const termPattern = new RegExp(`\\b${term}\\b`, 'gi');
      formattedResponse = formattedResponse.replace(termPattern, `<span class="italic">$&</span>`);
    });
    
    if (formattedResponse.match(/<h[34][^>]*>(Themes|Issues|Complaints|Feedback Summary)<\/h[34]>/)) {
      const sectionPattern = /(<h[34][^>]*>(?:Themes|Issues|Complaints|Feedback Summary)<\/h[34]>)([\s\S]*?)(<h[34]|$)/;
      const match = formattedResponse.match(sectionPattern);
      
      if (match) {
        const [fullMatch, header, content, ending] = match;
        if (!content.trim().startsWith('<div') && content.trim()) {
           const styledContent = `<div class="border-l-4 border-primary pl-4 py-1 my-2">${content}</div>`;
           formattedResponse = formattedResponse.replace(fullMatch, `${header}${styledContent}${ending}`);
        }
      }
    }

    return formattedResponse;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const userQuery = query;
    setQuery('');
    const userMessage: Message = { role: 'user', content: userQuery, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const enhancedQuery = enhanceUserQuery(userQuery);
      const response = await queryReviewAgent(enhancedQuery, fileId, department);
      
      if (response.success && response.response) {
        setIsTyping(true);
        setTimeout(() => {
          const agentResponseContent = typeof response.response === 'string' ? response.response : (response.response as any)?.response || JSON.stringify(response.response);
          const agentMessage: Message = { role: 'agent', content: formatResponse(agentResponseContent), timestamp: new Date() };
          setMessages(prev => [...prev, agentMessage]);
          setIsTyping(false);
        }, 500 + Math.random() * 1000); 
      } else {
        throw new Error(response.error || 'Failed to get a response from the review agent');
      }
      if (onAnalyze) { onAnalyze(userMessage.content); }
    } catch (error: any) {
      console.error("Error from review agent query:", error);
      setIsTyping(true);
      setTimeout(() => {
        const errorMessage: Message = { role: 'agent', content: getFallbackResponse(userQuery, error), timestamp: new Date() };
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
        if (!error.message?.includes('Failed to fetch') && !error.message?.includes('Network Error')) {
          toast({ variant: "destructive", title: "Analysis error", description: "I've provided a general response instead. Please try again later." });
        }
      }, 800);
    } finally {
       setIsLoading(false);
    }
  };

  const enhanceUserQuery = (originalQuery: string): string => {
    if (originalQuery.length > 50) return originalQuery;

    const lowerQuery = originalQuery.toLowerCase();
    let enhancedQuery = originalQuery;
    if (lowerQuery.includes("analysis") || lowerQuery.includes("analyze") || lowerQuery.includes("overview") || lowerQuery.includes("summary")) {
      enhancedQuery = `${originalQuery}. Please provide a comprehensive analysis including sentiment breakdown, key themes in positive and negative reviews, rating distribution, and actionable insights.`;
    }
    if (lowerQuery.includes("sentiment")) {
      enhancedQuery = `${originalQuery}. Explain the methodology and highlight dominant positive/negative themes.`;
    }
    if (lowerQuery.includes("theme") || lowerQuery.includes("topic") || lowerQuery.includes("feature") || lowerQuery.includes("aspect")) {
       enhancedQuery = `${originalQuery}. List the most frequent themes/features and provide examples from the reviews.`;
    }
     if (lowerQuery.includes("complaint") || lowerQuery.includes("issue") || lowerQuery.includes("negative") || lowerQuery.includes("problem")) {
       enhancedQuery = `${originalQuery}. Detail the specific issues raised and suggest potential root causes if possible.`;
    }
     if (lowerQuery.includes("rating") || lowerQuery.includes("score")) {
       enhancedQuery = `${originalQuery}. Analyze the distribution and discuss factors influencing different rating levels.`;
    }
    if (enhancedQuery === originalQuery) { 
      enhancedQuery = `Regarding the review data: ${originalQuery}. Provide detailed insights and supporting examples where applicable.`;
    }
    return enhancedQuery;
  };

  const getFallbackResponse = (query: string, error: any): string => {
    const userQueryLower = query.toLowerCase();
    console.log("Generating fallback response for review agent error:", error);
    let errorInfo = "I'm currently unable to analyze the specific review data you requested due to a technical issue. ";
    if (error.message?.includes('Failed to fetch') || error.message?.includes('Network Error')) {
      errorInfo = "I'm having trouble connecting to the review analysis service. ";
    } else if (error.message?.includes('not found')) {
      errorInfo = "I couldn't find the review data file you're referencing. ";
    }

    let responseContent = "";
    if (userQueryLower.includes('sentiment')) {
       responseContent = `
         <h3 class="text-primary font-bold mt-4 mb-2">Sentiment Analysis</h3>
         ${errorInfo} General insights on sentiment:
         <li class="ml-4 list-disc mb-1">Positive sentiment often relates to product quality or customer service.</li>
         <li class="ml-4 list-disc mb-1">Negative sentiment frequently mentions usability issues or unmet expectations.</li>
         <li class="ml-4 list-disc mb-1">Look for shifts in sentiment over time.</li>
         <h3 class="text-primary font-bold mt-4 mb-2">Recommendations</h3>
         <div class="border-l-4 border-primary pl-4 py-1 my-2">
           <li class="ml-4 list-decimal mb-1"><strong>1.</strong> Address common negative themes proactively.</li>
           <li class="ml-4 list-decimal mb-1"><strong>2.</strong> Reinforce aspects driving positive feedback.</li>
         </div>`;
    } else if (userQueryLower.includes('theme') || userQueryLower.includes('topic') || userQueryLower.includes('feature')) {
       responseContent = `
         <h3 class="text-primary font-bold mt-4 mb-2">Common Themes</h3>
         ${errorInfo} Typical themes found in reviews:
         <li class="ml-4 list-disc mb-1">Product Performance & Reliability</li>
         <li class="ml-4 list-disc mb-1">Ease of Use / User Interface</li>
         <li class="ml-4 list-disc mb-1">Customer Support Experience</li>
         <li class="ml-4 list-disc mb-1">Value for Money / Pricing</li>
         <h3 class="text-primary font-bold mt-4 mb-2">Recommendations</h3>
         <div class="border-l-4 border-primary pl-4 py-1 my-2">
           <li class="ml-4 list-decimal mb-1"><strong>1.</strong> Prioritize fixes for frequently mentioned issues.</li>
           <li class="ml-4 list-decimal mb-1"><strong>2.</strong> Highlight popular features in marketing.</li>
         </div>`;
    } else if (userQueryLower.includes('rating') || userQueryLower.includes('score')) {
        responseContent = `
         <h3 class="text-primary font-bold mt-4 mb-2">Rating Analysis</h3>
         ${errorInfo} General points about ratings:
         <li class="ml-4 list-disc mb-1">Average ratings above 4.0 are generally considered good.</li>
         <li class="ml-4 list-disc mb-1">A high volume of 3-star reviews might indicate mixed experiences.</li>
         <li class="ml-4 list-disc mb-1">Analyze the text of 1-star and 5-star reviews for strong opinions.</li>
         <h3 class="text-primary font-bold mt-4 mb-2">Recommendations</h3>
         <div class="border-l-4 border-primary pl-4 py-1 my-2">
           <li class="ml-4 list-decimal mb-1"><strong>1.</strong> Investigate drivers behind low ratings.</li>
           <li class="ml-4 list-decimal mb-1"><strong>2.</strong> Encourage satisfied customers to leave reviews.</li>
         </div>`;
    } else {
      responseContent = `
         <h3 class="text-primary font-bold mt-4 mb-2">Review Analysis</h3>
         ${errorInfo} General advice for analyzing reviews:
         <li class="ml-4 list-disc mb-1">Identify recurring keywords and phrases.</li>
         <li class="ml-4 list-disc mb-1">Segment reviews by product, time period, or rating.</li>
         <li class="ml-4 list-disc mb-1">Quantify sentiment distribution (e.g., % positive, % negative).</li>
         <h3 class="text-primary font-bold mt-4 mb-2">Recommendations</h3>
         <div class="border-l-4 border-primary pl-4 py-1 my-2">
           <li class="ml-4 list-decimal mb-1"><strong>1.</strong> Use feedback to inform product development.</li>
           <li class="ml-4 list-decimal mb-1"><strong>2.</strong> Improve documentation or support based on issues raised.</li>
         </div>`;
    }
    return responseContent;
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  return (
    <Card className="overflow-hidden animate-fade-in transition-all duration-300 border-secondary/20">
      <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" /> 
          </div>
          <CardTitle className="text-primary-foreground dark:text-white">
            Review AI Assistant 
          </CardTitle>
          {dataInfo && (
            <Badge variant="outline" className="ml-2 border-secondary/40 text-secondary">
              {dataInfo}
            </Badge>
          )}
        </div>
        <CardDescription className="text-primary-foreground/70 dark:text-white/70">
           Analyze customer reviews for sentiment, themes, and key insights
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
                    <span>Review AI</span>
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
              <span>Analyzing review data...</span>
            </div>
          )}
          {isTyping && !isLoading && (
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
            placeholder="Ask about review sentiment, themes, ratings..."
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
          <span className="text-muted-foreground">AI Review Intelligence</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReviewAIAgent; 