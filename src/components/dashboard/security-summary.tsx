"use client";

import React, { useState, useEffect } from "react";
import { Bot, Loader, AlertTriangle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { summarizeAssetSecurity } from "@/ai/flows/summarize-asset-security";
import type { Asset } from "@/lib/types";

const SecuritySummary = ({ asset }: { asset: Asset }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    const generateSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await summarizeAssetSecurity({ asset });
        setSummary(result.summary);
      } catch (err) {
        console.error("Security summary generation failed:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    generateSummary();
  }, [asset]);

  return (
    <Card className="bg-primary/5">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Security Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center p-4 space-x-2 text-sm text-muted-foreground">
            <Loader className="h-4 w-4 animate-spin" />
            <span>Generating summary...</span>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {summary && (
          <div className="flex items-start gap-3">
             <FileText className="h-5 w-5 mt-1 text-primary/80 flex-shrink-0" />
            <p className="text-sm text-foreground/90">{summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecuritySummary;
