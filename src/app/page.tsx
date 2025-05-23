
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AlertCircle, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button'; // For potential future use e.g. retry
import ImageUploader, { type ImageDetails } from '@/components/image-uploader';
import HtmlTagDisplay from '@/components/html-tag-display';
import { generateAltText, type GenerateAltTextInput } from '@/ai/flows/generate-alt-text';

export default function Home() {
  const [imageDetails, setImageDetails] = useState<ImageDetails | null>(null);
  const [altText, setAltText] = useState<string>('');
  const [isGeneratingAltText, setIsGeneratingAltText] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');

  const handleImageUpload = useCallback((details: ImageDetails) => {
    setImageDetails(details);
    setAltText(''); // Reset alt text
    setGeneratedHtml(''); // Reset HTML
    setError(null); // Clear previous errors
    setIsGeneratingAltText(true);

    const aiInput: GenerateAltTextInput = { photoDataUri: details.dataUrl };
    generateAltText(aiInput)
      .then(response => {
        setAltText(response.altText);
      })
      .catch(err => {
        console.error("Error generating alt text:", err);
        setError("Failed to generate alt text. Please try another image or write it manually.");
        setAltText(''); // Ensure alt text is empty on error
      })
      .finally(() => {
        setIsGeneratingAltText(false);
      });
  }, []);

  useEffect(() => {
    if (imageDetails && (altText || !isGeneratingAltText)) { // Update HTML if altText is ready or generation finished (even if empty)
      const html = `<img src="${imageDetails.name}" alt="${altText.replace(/"/g, '&quot;')}" width="${imageDetails.width}" height="${imageDetails.height}" />`;
      setGeneratedHtml(html);
    } else if (!imageDetails) {
      setGeneratedHtml(''); // Clear HTML if no image
    }
  }, [imageDetails, altText, isGeneratingAltText]);

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-3xl min-h-screen flex flex-col items-center justify-center">
      <div className="w-full">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Image Tag Generator</h1>
          <p className="text-muted-foreground mt-2">
            Upload an image, and we&apos;ll generate the HTML tag with AI-powered alt text.
          </p>
        </header>

        <Card className="shadow-xl rounded-xl">
          <CardContent className="p-6 md:p-8">
            <ImageUploader onImageUpload={handleImageUpload} isProcessing={isGeneratingAltText} />

            {error && !isGeneratingAltText && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {imageDetails && (
              <div className="mt-8 space-y-8">
                <section aria-labelledby="image-preview-heading">
                  <h2 id="image-preview-heading" className="text-2xl font-semibold mb-3 text-foreground">Image Preview</h2>
                  <div className="border rounded-lg overflow-hidden p-2 bg-muted/30 flex justify-center items-center">
                    <Image 
                      src={imageDetails.dataUrl} 
                      alt="Uploaded preview" 
                      width={imageDetails.width} 
                      height={imageDetails.height} 
                      className="rounded-md object-contain max-w-full"
                      style={{ maxHeight: '300px', width: 'auto' }}
                    />
                  </div>
                </section>

                <section aria-labelledby="alt-text-heading">
                  <h2 id="alt-text-heading" className="text-2xl font-semibold mb-3 text-foreground">Alt Text</h2>
                  {isGeneratingAltText ? (
                    <div className="flex items-center space-x-2 text-muted-foreground p-3 border rounded-md bg-muted/30">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span>Generating alt text... This may take a moment.</span>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="AI-generated alt text will appear here. You can edit it."
                        rows={4}
                        className="mb-2 focus:ring-primary focus:border-primary"
                        aria-label="Generated or editable alt text"
                      />
                      <p className="text-sm text-muted-foreground">
                        {altText ? "Review and edit the AI-generated alt text above." : "Alt text generation failed or returned empty. Please write one manually."}
                      </p>
                    </>
                  )}
                </section>

                {(generatedHtml && (!isGeneratingAltText || altText)) && (
                  <section aria-labelledby="html-tag-heading">
                    <h2 id="html-tag-heading" className="text-2xl font-semibold mb-3 text-foreground">Generated HTML Tag</h2>
                    <HtmlTagDisplay htmlTag={generatedHtml} />
                  </section>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <footer className="text-center mt-8 mb-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Image Tag Generator. Powered by AI.</p>
        </footer>
      </div>
    </main>
  );
}
