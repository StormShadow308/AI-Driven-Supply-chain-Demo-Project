import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AmazonReviewsAgent, 
  AmazonReviewAnalysisRequest,
  AmazonReviewInsight
} from '@/services/amazonReviewsAgent';
import DataVisualization from '@/components/DataVisualization';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AmazonReviewsAnalyzerProps {
  reviewData?: any[];
  productCategory?: string;
}

export const AmazonReviewsAnalyzer = ({ 
  reviewData = [], 
  productCategory 
}: AmazonReviewsAnalyzerProps) => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState('insights');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);

  const handleAnalysis = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a query to analyze the reviews.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const request: AmazonReviewAnalysisRequest = {
        query,
        reviewData,
        productCategory,
        filters: {
          verifiedOnly: false
        }
      };

      const result = await AmazonReviewsAgent.analyzeReviews(request);
      setAnalysisResult(result);
      setSelectedTab('insights');
    } catch (error) {
      console.error('Error analyzing reviews:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze the Amazon reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter a question about the reviews.",
        variant: "destructive",
      });
      return;
    }

    setIsAskingQuestion(true);
    try {
      const response = await AmazonReviewsAgent.askQuestion(question, reviewData);
      setAnswer(response);
    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: "Error",
        description: "Failed to process your question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const getBadgeVariantForInsightType = (type: string) => {
    switch (type) {
      case 'positive': return 'secondary';
      case 'negative': return 'destructive';
      case 'trend': return 'outline';
      case 'suggestion': return 'secondary';
      default: return 'default';
    }
  };

  const renderInsightBadge = (type: string) => {
    return (
      <Badge variant={getBadgeVariantForInsightType(type) as any} className="ml-2">
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="w-full glass-card overflow-hidden animate-fade-in hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Amazon Reviews AI Analyzer</CardTitle>
        <CardDescription>
          Leverage AI to extract insights from Amazon product reviews
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="What insights would you like to discover from these reviews?" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleAnalysis} 
              disabled={isAnalyzing}
              className="bg-gray-900 hover:bg-gray-800"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>

          {analysisResult && (
            <div className="mt-6 space-y-4">
              <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{analysisResult.summary}</p>
                </CardContent>
              </Card>

              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="insights" className="flex-1">Insights</TabsTrigger>
                  <TabsTrigger value="topics" className="flex-1">Topics</TabsTrigger>
                  <TabsTrigger value="recommendations" className="flex-1">Recommendations</TabsTrigger>
                  <TabsTrigger value="ask" className="flex-1">Ask AI</TabsTrigger>
                </TabsList>
                
                <TabsContent value="insights" className="space-y-4 mt-4">
                  {analysisResult.insights.map((insight: AmazonReviewInsight, index: number) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="py-3 px-4 bg-gray-50 dark:bg-gray-900">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="font-medium text-sm">{insight.text}</span>
                            {renderInsightBadge(insight.type)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                        </div>
                      </CardHeader>
                      {insight.relatedKeywords && (
                        <CardContent className="py-2 px-4 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {insight.relatedKeywords.map((keyword, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}

                  {analysisResult.charts && analysisResult.charts.length > 0 && (
                    <div className="mt-6">
                      <DataVisualization
                        title="Sentiment Trend Over Time"
                        data={analysisResult.charts[0].data}
                        type="area"
                        dataKeys={['Positive', 'Neutral', 'Negative']}
                        colors={['#10b981', '#6b7280', '#ef4444']}
                        stacked={true}
                      />
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="topics" className="space-y-4 mt-4">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {analysisResult.commonTopics.map((topic, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="py-3 px-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{topic.topic}</span>
                            <Badge variant={topic.sentiment > 0.7 ? 'secondary' : topic.sentiment > 0.4 ? 'outline' : 'destructive'}>
                              {Math.round(topic.sentiment * 100)}% positive
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3 pt-0 px-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Mentioned in {topic.frequency}% of reviews</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {analysisResult.charts && analysisResult.charts.length > 1 && (
                    <div className="mt-6">
                      <DataVisualization
                        title="Topics by Sentiment & Frequency"
                        data={analysisResult.charts[1].data}
                        type="line"
                        dataKeys={['sentiment', 'frequency']}
                        xAxisKey="name"
                      />
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    {analysisResult.recommendedActions.map((action, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                        <div className="flex-shrink-0 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm">{action}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="ask" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Select 
                        onValueChange={(value) => setQuestion(value)}
                        value={question}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a question or ask your own..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="What are the most common complaints in these reviews?">Most common complaints?</SelectItem>
                          <SelectItem value="What do customers like most about this product?">What do customers like most?</SelectItem>
                          <SelectItem value="How has customer sentiment changed over time?">How has sentiment changed over time?</SelectItem>
                          <SelectItem value="What are the main areas for improvement?">Main areas for improvement?</SelectItem>
                          <SelectItem value="How does this product compare to competitors?">Compare to competitors?</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleAskQuestion} 
                        disabled={isAskingQuestion || !question.trim()}
                        className="whitespace-nowrap"
                      >
                        {isAskingQuestion ? "Thinking..." : "Ask"}
                      </Button>
                    </div>
                    
                    <Textarea 
                      placeholder="Type your own question here..." 
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                    
                    {answer && (
                      <Card className="mt-4">
                        <CardContent className="pt-4">
                          <p className="text-sm whitespace-pre-line">{answer}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AmazonReviewsAnalyzer;
