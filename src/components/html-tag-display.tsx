
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
  const tagParts = html.match(/^<img\s+(.*?)\s*\/?>$/i);

  if (!tagParts || !tagParts[1]) {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(&lt;\/?)([a-zA-Z0-9]+)/g, '$1<span class="html-tag-name">$2</span>');
  }

  const attributesString = tagParts[1];

  const highlightedAttributes = attributesString.replace(
    /([a-zA-Z0-9\-]+)=(".*?")/g,
    (_match, name, valueWithQuotes) => {
      return `<span class="html-attr-name">${name}</span>=<span class="html-attr-value">${valueWithQuotes}</span>`;
    }
  );

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
    if (!htmlTag) return;
    try {
      await navigator.clipboard.writeText(htmlTag);
      setCopied(true);
      toast({
        title: "Copied to Clipboard!",
        description: "The HTML tag has been copied.",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Copy Failed",
        description: "Could not copy the HTML tag.",
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
        <code dangerouslySetInnerHTML={{ __html: highlightedDisplayHtml }} />
      </pre>
      <Button
        variant="ghost" // Ghost variant is used as a base, styles below will override/add background
        size="icon"
        className={cn(
            "absolute top-3 right-3 h-8 w-8 p-1.5 rounded-lg shadow-md transition-all duration-150 ease-in-out",
            "opacity-80 group-hover:opacity-100 focus:opacity-100 hover:scale-105",
            copied 
              ? "bg-accent hover:bg-accent/90 text-accent-foreground" 
              : "bg-card hover:bg-accent/10 text-card-foreground hover:text-accent-foreground"
        )}
        onClick={handleCopy}
        aria-label={copied ? "Copied!" : "Copy HTML tag"}
        disabled={!htmlTag}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default HtmlTagDisplay;
