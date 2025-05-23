
"use client";

import React, { useState, useCallback, DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Assuming Alert component exists

export interface ImageDetails {
  dataUrl: string;
  width: number;
  height: number;
  name: string;
  file: File;
}

interface ImageUploaderProps {
  onImageUpload: (details: ImageDetails) => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!file) {
      setError("No file selected.");
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError("Invalid file type. Please upload an image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        const dataUrl = e.target.result;
        const img = new window.Image();
        img.onload = () => {
          onImageUpload({ dataUrl, width: img.naturalWidth, height: img.naturalHeight, name: file.name, file });
        };
        img.onerror = () => {
          setError("Could not load image. The file might be corrupted or in an unsupported format.");
        };
        img.src = dataUrl;
      } else {
        setError("Error reading file. Please try again.");
      }
    };
    reader.onerror = () => {
      setError("Error reading file. Please try again.");
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing && !isDragging) setIsDragging(true); // Ensure dragging state is true if hovering
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleClick = () => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
       // Reset file input to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "w-full p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200 ease-in-out",
          isProcessing ? "bg-muted cursor-not-allowed border-muted" : 
          isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/70 hover:bg-secondary/50"
        )}
        role="button"
        tabIndex={0}
        aria-label="Image upload dropzone"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="image/*"
          className="hidden"
          disabled={isProcessing}
        />
        <UploadCloud className={cn("mx-auto h-12 w-12 mb-3", isProcessing ? "text-muted-foreground" : "text-primary")} />
        <p className={cn("font-semibold text-lg", isProcessing ? "text-muted-foreground" : "text-foreground")}>
          {isProcessing ? "Processing..." : "Drag & drop an image here"}
        </p>
        <p className={cn("text-sm", isProcessing ? "text-muted-foreground" : "text-muted-foreground")}>
          {isProcessing ? "Please wait." : "or click to select a file"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, WEBP up to 10MB</p>
      </div>
      {error && (
        <Alert variant="destructive" className="w-full">
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ImageUploader;
