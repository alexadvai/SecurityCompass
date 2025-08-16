import { Skeleton } from "@/components/ui/skeleton";
import { CompassIcon } from "@/components/icons/logo";
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarInset,
    SidebarProvider
  } from "@/components/ui/sidebar";

const DashboardSkeleton = () => {
  return (
    <SidebarProvider>
        <div className="flex h-screen w-full flex-col bg-muted/20">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-3">
            <CompassIcon className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-xl font-semibold tracking-tight">
              Security Compass
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsible="icon" className="p-2">
            <SidebarHeader>
                <Skeleton className="h-10 w-full" />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <Skeleton className="h-10 w-full" />
                </SidebarGroup>
                <div className="px-2 space-y-4 mt-2">
                    <SidebarGroup>
                        <Skeleton className="h-8 mb-2 w-32" />
                        <div className="space-y-3 pl-2 pt-2">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    </SidebarGroup>
                     <SidebarGroup>
                        <Skeleton className="h-8 mb-2 w-24" />
                        <div className="space-y-3 pl-2 pt-2">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    </SidebarGroup>
                </div>
            </SidebarContent>
        </Sidebar>
          <SidebarInset>
            <main className="flex-1 relative bg-background p-4 rounded-lg shadow-inner">
                <Skeleton className="h-full w-full rounded-lg" />
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardSkeleton;
