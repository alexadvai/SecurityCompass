"use client";

import React, { useState } from "react";
import { Wand2, Loader, AlertTriangle, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { inferPotentialRisk } from "@/ai/flows/infer-potential-risk";
import type { Asset, AIInsight } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const AIRiskAnalyzer = ({ asset }: { asset: Asset }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setInsights([]);
    try {
      const result = await inferPotentialRisk({
        assetId: asset.id,
        assetMetadata: asset.metadata,
      });

      if (result && result.length > 0) {
        setInsights(result);
        toast({
          title: "AI Analysis Complete",
          description: `Found ${result.length} potential risk(s).`,
        });
      } else {
        toast({
          title: "AI Analysis Complete",
          description: "No new potential risks found.",
        });
      }
    } catch (err) {
      console.error("AI analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "AI Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-headline text-lg flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-accent" />
            AI Risk Analysis
          </CardTitle>
          <Button onClick={handleAnalyze} disabled={isLoading} size="sm">
            {isLoading ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Analyze
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="flex items-center justify-center p-4">
                <Loader className="mr-2 h-5 w-5 animate-spin text-primary" />
                <p className="text-muted-foreground">AI is analyzing potential risks...</p>
            </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!isLoading && !error && insights.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
                Click "Analyze" to find potential new relationships and risks.
            </p>
        )}
        {insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Suggested Connections:</h4>
            {insights.map((insight, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-primary" />
                      {insight.relationshipType.replace(/_/g, ' ')}
                      <span className="font-normal text-muted-foreground">to</span>
                      <span className="font-mono text-xs bg-background px-2 py-0.5 rounded">{insight.toAssetId}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{insight.reason}</p>
                  </div>
                  <Badge variant={insight.riskScore > 0.7 ? "destructive" : "secondary"}>
                    Risk: {insight.riskScore.toFixed(2)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRiskAnalyzer;
