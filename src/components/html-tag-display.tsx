
"use client";

import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
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
            "absolute top-2 right-2 h-8 w-8 opacity-50 group-hover:opacity-100 focus:opacity-100 hover:scale-110 transform transition-all duration-150 ease-in-out",
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
