"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  Upload,
  ChevronDown,
  Server,
  Users,
  Network,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import GraphView from "@/components/dashboard/graph-view";
import AssetDetailPanel from "@/components/dashboard/asset-detail-panel";
import ScanUploader from "@/components/dashboard/scan-uploader";
import { CompassIcon } from "@/components/icons/logo";
import { mockAssets, mockRelationships } from "@/lib/mock-data";
import type { Asset, Relationship } from "@/lib/types";

const assetIcons: { [key: string]: React.ElementType } = {
  EC2Instance: Server,
  IAMUser: Users,
  VPC: Network,
  SecurityGroup: Shield,
  default: Server,
};

export default function DashboardPage() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [relationships, setRelationships] =
    useState<Relationship[]>(mockRelationships);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScanUploaderOpen, setScanUploaderOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assetTypeFilters, setAssetTypeFilters] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSelectAsset = useCallback((assetId: string | null) => {
    setSelectedAssetId(assetId);
    setIsSheetOpen(!!assetId);
  }, []);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      handleSelectAsset(null);
    }
  }, [handleSelectAsset]);

  const handleFilterChange = (type: string) => {
    setAssetTypeFilters((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        assetTypeFilters.length === 0 || assetTypeFilters.includes(asset.type);
      return matchesSearch && matchesType;
    });
  }, [assets, searchTerm, assetTypeFilters]);

  const filteredAssetIds = useMemo(
    () => new Set(filteredAssets.map((a) => a.id)),
    [filteredAssets]
  );

  const filteredRelationships = useMemo(() => {
    return relationships.filter(
      (rel) =>
        filteredAssetIds.has(rel.from) && filteredAssetIds.has(rel.to)
    );
  }, [relationships, filteredAssetIds]);

  const selectedAsset = useMemo(() => {
    return assets.find((asset) => asset.id === selectedAssetId) || null;
  }, [assets, selectedAssetId]);
  
  const assetTypes = useMemo(() => [...new Set(mockAssets.map(a => a.type))], []);

  const handleScanUpload = (newAssets: Asset[]) => {
    const newAssetIds = new Set(newAssets.map(a => a.id));
    const uniqueNewAssets = newAssets.filter(a => !assets.some(existing => existing.id === a.id));
    setAssets(prev => [...prev.filter(a => !newAssetIds.has(a.id)), ...newAssets]);
    setScanUploaderOpen(false);
  };

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-3">
          <CompassIcon className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-xl font-semibold tracking-tight">
            Security Compass
          </h1>
        </div>
        <div>
          {/* User menu or other actions can go here */}
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-80 flex-col border-r bg-card p-4 md:flex">
          <div className="flex flex-col gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setScanUploaderOpen(true)} >
              <Upload className="mr-2 h-4 w-4" />
              Ingest Scan Data
            </Button>
          </div>
          <ScrollArea className="flex-1 -mx-4 mt-4">
            <div className="px-4">
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-lg font-semibold">
                  <h3 className="font-headline">Asset Types</h3>
                  <ChevronDown className="h-5 w-5 transition-transform [&[data-state=open]]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pl-2 pt-2">
                  {assetTypes.map((type) => {
                    const Icon = assetIcons[type] || assetIcons.default;
                    return (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={assetTypeFilters.includes(type)}
                          onCheckedChange={() => handleFilterChange(type)}
                        />
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor={type} className="flex-1 cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
        </aside>
        <main className="flex-1 relative">
          <GraphView
            assets={filteredAssets}
            relationships={filteredRelationships}
            onSelectNode={handleSelectAsset}
            selectedNodeId={selectedAssetId}
          />
        </main>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl p-0" >
          <SheetHeader>
             <SheetTitle className="sr-only">Asset Details</SheetTitle>
          </SheetHeader>
          {selectedAsset && (
            <AssetDetailPanel
              asset={selectedAsset}
              relationships={relationships.filter(r => r.from === selectedAsset.id || r.to === selectedAsset.id)}
              allAssets={assets}
              onClose={() => handleSelectAsset(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      <ScanUploader
        isOpen={isScanUploaderOpen}
        onOpenChange={setScanUploaderOpen}
        onUpload={handleScanUpload}
      />
    </div>
  );
}
