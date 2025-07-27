"use client";

import React from "react";
import { X, Server, Users, Network, Shield, ArrowRight, LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import AIRiskAnalyzer from "./ai-risk-analyzer";
import SecuritySummary from "./security-summary";
import type { Asset, Relationship, AIInsight } from "@/lib/types";

const assetIcons: { [key: string]: React.ElementType } = {
  EC2Instance: Server,
  IAMUser: Users,
  VPC: Network,
  SecurityGroup: Shield,
  default: Server,
};

const getRiskColor = (score: number) => {
  if (score > 0.75) return "bg-red-500";
  if (score > 0.5) return "bg-orange-500";
  if (score > 0.25) return "bg-yellow-500";
  return "bg-green-500";
};

const AssetDetailPanel = ({
  asset,
  relationships,
  allAssets,
  onAddRelationship,
  onClose,
}: {
  asset: Asset;
  relationships: Relationship[];
  allAssets: Asset[];
  onAddRelationship: (insight: AIInsight) => void;
  onClose: () => void;
}) => {
  const AssetIcon = assetIcons[asset.type] || assetIcons.default;
  const relatedAssets = relationships.map(rel => {
    const isOutgoing = rel.from === asset.id;
    const otherAssetId = isOutgoing ? rel.to : rel.from;
    const otherAsset = allAssets.find(a => a.id === otherAssetId);
    return {
        relationship: rel,
        otherAsset,
        direction: isOutgoing ? 'outgoing' : 'incoming'
    }
  }).filter(item => item.otherAsset);

  return (
    <ScrollArea className="h-full">
      <div className="p-6 pt-0">
        <div className="flex items-start justify-between mb-6 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-4 -mx-6 px-6 border-b">
          <div className="flex items-center gap-4">
            <AssetIcon className="h-10 w-10 text-primary" />
            <div>
              <h2 className="font-headline text-2xl font-bold">{asset.name}</h2>
              <p className="text-sm text-muted-foreground">{asset.type}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <SecuritySummary asset={asset} />

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">ID</span>
                    <span className="font-mono text-xs">{asset.id}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Risk Score</span>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getRiskColor(asset.riskScore)}`}></div>
                        <span>{asset.riskScore.toFixed(2)}</span>
                    </div>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{new Date(asset.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-start justify-between">
                    <span className="text-muted-foreground pt-1">Tags</span>
                    <div className="flex flex-wrap gap-2 justify-end max-w-[70%]">
                        {asset.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                {JSON.stringify(asset.metadata, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Relationships
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {relatedAssets.length > 0 ? relatedAssets.map(({relationship, otherAsset, direction}) => (
                    <div key={relationship.id} className="text-sm flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                        {direction === 'outgoing' ? (
                            <>
                                <span className="font-medium text-primary">{asset.name}</span>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs text-muted-foreground">{relationship.type.replace(/_/g, ' ')}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                                <span>{otherAsset?.name}</span>
                            </>
                        ) : (
                             <>
                                <span>{otherAsset?.name}</span>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs text-muted-foreground">{relationship.type.replace(/_/g, ' ')}</span>
                                    <ArrowRight className="w-4 h-4 rotate-180" />
                                </div>
                                <span className="font-medium text-primary">{asset.name}</span>
                            </>
                        )}
                    </div>
                )) : <p className="text-sm text-muted-foreground">No relationships found.</p>}
            </CardContent>
          </Card>
          
          <AIRiskAnalyzer asset={asset} onAddRelationship={onAddRelationship} />
        </div>
      </div>
    </ScrollArea>
  );
};

export default AssetDetailPanel;
