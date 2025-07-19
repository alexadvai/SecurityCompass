"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Asset } from "@/lib/types";

interface ScanUploaderProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpload: (assets: Asset[]) => void;
}

export default function ScanUploader({ isOpen, onOpenChange, onUpload }: ScanUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = useCallback(async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a JSON file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('File could not be read');
        }
        const data = JSON.parse(text);
        
        // Basic validation
        if (!Array.isArray(data) || data.some(item => !item.id || !item.type || !item.name)) {
            throw new Error('Invalid JSON format. Expected an array of assets.');
        }

        onUpload(data as Asset[]);
        toast({
          title: "Upload successful",
          description: `${data.length} assets have been ingested.`,
        });
        onOpenChange(false);
        setFile(null);
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "An unknown error occurred.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
        toast({
            title: "File reading error",
            description: "Could not read the selected file.",
            variant: "destructive",
        });
        setIsUploading(false);
    }

    reader.readAsText(file);
  }, [file, onUpload, toast, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ingest Scan Data</DialogTitle>
          <DialogDescription>
            Upload a JSON file containing an array of assets to add them to the
            graph.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input type="file" accept=".json" onChange={handleFileChange} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? "Uploading..." : "Upload and Process"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
