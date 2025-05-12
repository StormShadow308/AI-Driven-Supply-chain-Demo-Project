import React from 'react';

// Format and style the text content for professional display
const formatText = (text: string): string => {
  if (!text) return '';
  
  let formattedText = text;

  // Format markdown-style headers
  formattedText = formattedText.replace(/^## (.*?)(?:\n|$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2 text-primary">$1</h2>');
  formattedText = formattedText.replace(/^### (.*?)(?:\n|$)/gm, '<h3 class="text-lg font-medium mt-3 mb-1 text-primary-600">$1</h3>');
  formattedText = formattedText.replace(/^#### (.*?)(?:\n|$)/gm, '<h4 class="text-base font-medium mt-2 mb-1 text-primary-700">$1</h4>');
  formattedText = formattedText.replace(/^# (.*?)(?:\n|$)/gm, '<h1 class="text-2xl font-bold mt-5 mb-3 text-primary">$1</h1>');
  
  // Format bullet points
  formattedText = formattedText.replace(/^[*-] (.*?)(?:\n|$)/gm, '<li class="ml-5 pl-1 mb-1 list-disc">$1</li>');
  
  // Wrap consecutive list items in ul tags
  formattedText = formattedText.replace(/(<li.*?>.*?<\/li>\n*)+/gs, '<ul class="my-2">$&</ul>');
  
  // Format numbered lists
  formattedText = formattedText.replace(/^(\d+)\. (.*?)(?:\n|$)/gm, '<li class="ml-5 pl-1 mb-1 list-decimal"><strong>$1.</strong> $2</li>');
  
  // Format bold text
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Format italic text
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Format code blocks
  formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md overflow-x-auto my-3"><code>$1</code></pre>');
  
  // Format inline code
  formattedText = formattedText.replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
  
  // Format tables if they exist
  if (formattedText.includes('|') && formattedText.match(/\|.*\|/)) {
    const tablePattern = /(\|.+\|\n\|[-|]+\|\n(\|.+\|\n)+)/g;
    formattedText = formattedText.replace(tablePattern, '<div class="overflow-auto my-4"><table class="w-full border-collapse">$1</table></div>');
    
    // Format table headers
    formattedText = formattedText.replace(/\|(.*?)\|(?=\n\|[-|]+\|)/g, (match, p1) => {
      const cells = p1.split('|').map((cell: string) => {
        return `<th class="border px-4 py-2 bg-muted font-medium">${cell.trim()}</th>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    });
    
    // Format table dividers
    formattedText = formattedText.replace(/\|[-|]+\|\n/g, '');
    
    // Format table rows
    formattedText = formattedText.replace(/\|(.*?)\|\n/g, (match, p1) => {
      const cells = p1.split('|').map((cell: string) => {
        return `<td class="border px-4 py-2">${cell.trim()}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    });
  }
  
  // Format numbers and percentages for professional display
  formattedText = formattedText.replace(/(\d+(\.\d+)?%)/g, '<span class="text-primary font-medium">$1</span>');
  formattedText = formattedText.replace(/\$(\d{1,3}(,\d{3})*(\.\d+)?)/g, '<span class="text-green-600 font-medium">$$$1</span>');
  
  // Format business metrics for professional display
  const businessMetrics = ['ROI', 'AOV', 'LTV', 'CAC', 'ROAS', 'CPA', 'CTR', 'COGS', 'GMV'];
  businessMetrics.forEach(metric => {
    const metricPattern = new RegExp(`\\b${metric}\\b`, 'g');
    formattedText = formattedText.replace(metricPattern, `<span class="font-bold text-primary-700">${metric}</span>`);
  });
  
  // Format business terms for emphasis
  const businessTerms = ['growth', 'increase', 'decrease', 'opportunity', 'challenge', 'market share', 'profit margin', 'revenue'];
  businessTerms.forEach(term => {
    const termPattern = new RegExp(`\\b${term}\\b`, 'gi');
    formattedText = formattedText.replace(termPattern, `<span class="italic">$&</span>`);
  });
  
  // Format paragraphs - replace double line breaks with paragraph tags
  formattedText = formattedText.replace(/\n\n/g, '</p><p class="mb-3">');
  
  // Wrap the content in a paragraph tag if it doesn't start with a formatted element
  if (!formattedText.startsWith('<h') && !formattedText.startsWith('<ul') && !formattedText.startsWith('<p')) {
    formattedText = `<p class="mb-3">${formattedText}</p>`;
  }
  
  return formattedText;
};

interface FormattedTextProps {
  content: string;
  className?: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ content, className = '' }) => {
  const formattedContent = formatText(content);
  
  return (
    <div 
      className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
};

export default FormattedText; 