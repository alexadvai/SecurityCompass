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
  PlusCircle,
  Container,
  FunctionSquare,
  UserCheck,
  Cloud,
  PanelLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetHeader,
  SheetDescription,
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
import type { Asset, Relationship, AIInsight } from "@/lib/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
} from "@/components/ui/sidebar";

const assetIcons: { [key: string]: React.ElementType } = {
  EC2Instance: Server,
  IAMUser: Users,
  VPC: Network,
  SecurityGroup: Shield,
  S3Bucket: Container,
  LambdaFunction: FunctionSquare,
  IAMRole: UserCheck,
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
  const [cloudFilters, setCloudFilters] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

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

  const handleAssetTypeFilterChange = (type: string) => {
    setAssetTypeFilters((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };
  
  const handleCloudFilterChange = (cloud: string) => {
    setCloudFilters((prev) =>
      prev.includes(cloud)
        ? prev.filter((c) => c !== cloud)
        : [...prev, c]
    );
  }

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        assetTypeFilters.length === 0 || assetTypeFilters.includes(asset.type);
      const matchesCloud =
        cloudFilters.length === 0 || (asset.cloud && cloudFilters.includes(asset.cloud));
      return matchesSearch && matchesType && matchesCloud;
    });
  }, [assets, searchTerm, assetTypeFilters, cloudFilters]);

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
  
  const assetTypes = useMemo(() => [...new Set(mockAssets.map(a => a.type))].sort(), []);
  const cloudProviders = useMemo(() => [...new Set(mockAssets.map(a => a.cloud).filter(Boolean) as string[])].sort(), []);

  const handleScanUpload = (newAssets: Asset[]) => {
    const newAssetIds = new Set(newAssets.map(a => a.id));
    const uniqueNewAssets = newAssets.filter(a => !assets.some(existing => existing.id === a.id));
    setAssets(prev => [...prev.filter(a => !newAssetIds.has(a.id)), ...newAssets]);
    setScanUploaderOpen(false);
  };
  
  const handleAddRelationship = useCallback((fromAssetId: string, insight: AIInsight) => {
    const newRelationship: Relationship = {
      id: `rel-ai-${Date.now()}`,
      from: fromAssetId,
      to: insight.toAssetId,
      type: insight.relationshipType,
      discoveredBy: 'ai',
      createdAt: new Date().toISOString(),
    };

    setRelationships(prev => [...prev, newRelationship]);
    toast({
      title: "Relationship Added",
      description: `Added a '${insight.relationshipType}' link to ${insight.toAssetId}.`,
      action: <PlusCircle className="text-green-500" />,
    })
  }, [toast]);

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col bg-muted/20">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-3">
             <SidebarTrigger className="md:hidden" />
            <CompassIcon className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-xl font-semibold tracking-tight">
              Security Compass
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar collapsible="icon" className="p-2">
            <SidebarHeader>
              <Button onClick={() => setScanUploaderOpen(true)} className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Ingest Scan Data
              </Button>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </SidebarGroup>
              <ScrollArea className="flex-1 -mx-2 mt-2">
                <div className="px-2 space-y-4">
                  <SidebarGroup>
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-lg font-semibold">
                        <h3 className="font-headline">Cloud Providers</h3>
                        <ChevronDown className="h-5 w-5 transition-transform [&[data-state=open]]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3 pl-2 pt-2">
                        {cloudProviders.map((provider) => (
                          <div key={provider} className="flex items-center space-x-2">
                            <Checkbox
                              id={provider}
                              checked={cloudFilters.includes(provider)}
                              onCheckedChange={() => handleCloudFilterChange(provider)}
                            />
                            <Cloud className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor={provider} className="flex-1 cursor-pointer">
                              {provider}
                            </Label>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarGroup>
                  <SidebarGroup>
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
                                onCheckedChange={() => handleAssetTypeFilterChange(type)}
                              />
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor={type} className="flex-1 cursor-pointer">
                                {type.replace(/([A-Z])/g, ' $1').trim()}
                              </Label>
                            </div>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarGroup>
                </div>
              </ScrollArea>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <main className="flex-1 relative bg-background p-4 rounded-lg shadow-inner">
              <GraphView
                assets={filteredAssets}
                relationships={filteredRelationships}
                onSelectNode={handleSelectAsset}
                selectedNodeId={selectedAssetId}
              />
            </main>
          </SidebarInset>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetContent className="w-full sm:max-w-xl md:max-w-2xl p-0" >
            <SheetHeader className="p-6">
               <SheetTitle>Asset Details</SheetTitle>
               <SheetDescription>Detailed information about the selected cloud asset.</SheetDescription>
            </SheetHeader>
            {selectedAsset && (
              <AssetDetailPanel
                asset={selectedAsset}
                relationships={relationships.filter(r => r.from === selectedAsset.id || r.to === selectedAsset.id)}
                allAssets={assets}
                onAddRelationship={(insight) => handleAddRelationship(selectedAsset.id, insight)}
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
    </SidebarProvider>
  );
}
