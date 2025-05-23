
"use client";

import React, { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Helper function for syntax highlighting
function highlightHtml(html: string): string {
  if (!html) return '';

  // Match the img tag and its attributes part
  // Example: <img src="foo" alt="bar" />
  // tagParts[0] = <img src="foo" alt="bar" />
  // tagParts[1] = src="foo" alt="bar"
  const tagParts = html.match(/^<img\s+(.*?)\s*\/?>$/i);

  if (!tagParts || !tagParts[1]) {
    // Fallback for simple cases or if the regex doesn't match as expected
    // Escape HTML and highlight just the tag name if possible
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(&lt;\/?)([a-zA-Z0-9]+)/g, '$1<span class="html-tag-name">$2</span>');
  }

  const attributesString = tagParts[1];

  // Highlight attribute names and their values
  const highlightedAttributes = attributesString.replace(
    /([a-zA-Z0-9\-]+)=(".*?")/g, // Matches name="value"
    (_match, name, valueWithQuotes) => {
      // Sanitize attribute name and value before embedding if necessary, though here they are from controlled input
      return `<span class="html-attr-name">${name}</span>=<span class="html-attr-value">${valueWithQuotes}</span>`;
    }
  );

  // Reconstruct the tag with highlighting for tag name and brackets
  // Using &lt; &gt; for literal display of brackets in HTML
  return `&lt;<span class="html-tag-name">img</span> ${highlightedAttributes} /&gt;`;
}


interface HtmlTagDisplayProps {
  htmlTag: string; // Raw HTML string
}

const HtmlTagDisplay: React.FC<HtmlTagDisplayProps> = ({ htmlTag }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const highlightedDisplayHtml = useMemo(() => highlightHtml(htmlTag), [htmlTag]);

  const handleCopy = async () => {
    if (!htmlTag) return; // Use raw htmlTag for copying
    try {
      await navigator.clipboard.writeText(htmlTag); // Copy raw HTML
      setCopied(true);
      toast({
        title: "Copied to Clipboard!",
        description: "The HTML tag has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Copy Failed",
        description: "Could not copy the HTML tag. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative group">
      <pre
        className="bg-muted p-4 pr-12 rounded-md overflow-x-auto text-sm text-muted-foreground border"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Use dangerouslySetInnerHTML for the highlighted version */}
        <code dangerouslySetInnerHTML={{ __html: highlightedDisplayHtml }} />
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
            "absolute top-2 right-2 h-8 w-8 opacity-60 group-hover:opacity-100 focus:opacity-100 hover:scale-110 transform transition-all duration-150 ease-in-out", // Updated opacity
            copied ? "text-accent-foreground bg-accent/30 hover:bg-accent/40" : "text-muted-foreground hover:text-foreground"
        )}
        onClick={handleCopy}
        aria-label={copied ? "Copied!" : "Copy HTML tag"}
        disabled={!htmlTag}
      >
        {copied ? <Check className="h-4 w-4 text-accent-foreground" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default HtmlTagDisplay;
