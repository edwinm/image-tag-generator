
"use client";

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface HtmlTagDisplayProps {
  htmlTag: string;
}

const HtmlTagDisplay: React.FC<HtmlTagDisplayProps> = ({ htmlTag }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!htmlTag) return;
    try {
      await navigator.clipboard.writeText(htmlTag);
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "The HTML tag is now in your clipboard.",
        // Consider adding custom styling for success using accent color if desired
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Copy failed",
        description: "Could not copy the HTML tag to your clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative group">
      <pre 
        className="bg-muted p-4 rounded-md overflow-x-auto text-sm text-muted-foreground border"
        aria-live="polite"
        aria-atomic="true"
      >
        <code>{htmlTag}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
            "absolute top-2 right-2 h-8 w-8 transition-opacity opacity-50 group-hover:opacity-100 focus:opacity-100",
            copied ? "text-accent-foreground bg-accent/20 hover:bg-accent/30" : "text-muted-foreground hover:text-foreground"
        )}
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy HTML tag"}
        disabled={!htmlTag}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default HtmlTagDisplay;
