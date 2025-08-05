import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Clock, 
  Radio, 
  Search, 
  Wifi,
  WifiOff,
  CircleDot,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Brand } from "@shared/schema";

export default function TimeSlotsDashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");

  // Load brands data
  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  // Mock status data for display (this would come from real API in production)
  const locationStatus = {
    1: { status: "online", playlist: "Daily English - Uptempo Acoustics" },
    2: { status: "online", playlist: "Daily English - Uptempo Acoustics" },
    3: { status: "online", playlist: "Daily English - Uptempo Acoustics" },
    4: { status: "partial", playlist: "Daily English - Uptempo Acoustics" },
    5: { status: "online", playlist: "Daily English - Uptempo Acoustics" },
    6: { status: "offline", playlist: "FairPrice Finest (Masterbox 01)" },
    7: { status: "online", playlist: "FairPrice Finest (Masterbox 01)" },
    8: { status: "online", playlist: "FairPrice Finest (Masterbox 01)" },
    9: { status: "partial", playlist: "FairPrice Finest (Masterbox 01)" },
    10: { status: "online", playlist: "FairPrice Finest (Masterbox 03)" }
  };

  const filteredBrands = brands?.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    const status = locationStatus[brand.id as keyof typeof locationStatus]?.status || "offline";
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return <Wifi className="h-4 w-4 text-green-500" />;
      case "partial": return <CircleDot className="h-4 w-4 text-yellow-500" />;
      default: return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      online: "bg-green-100 text-green-800 hover:bg-green-200",
      partial: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      offline: "bg-red-100 text-red-800 hover:bg-red-200"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.offline}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <div className="text-center">Loading locations...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/")}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Time Slots & Live Streaming</h1>
            <p className="text-muted-foreground">
              Manage scheduling and streaming for all your locations
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {["all", "online", "offline"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status as any)}
                className="capitalize"
              >
                {status === "all" ? "All Status" : status}
              </Button>
            ))}
          </div>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBrands.map((brand) => {
            const status = locationStatus[brand.id as keyof typeof locationStatus];
            
            return (
              <Card key={brand.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium leading-tight">
                      {brand.name}
                    </CardTitle>
                    {getStatusBadge(status?.status || "offline")}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                      Current: {status?.playlist || "No playlist"}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setLocation(`/brands/edit/${brand.id}?tab=edit-playlist`)}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Time Slots
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setLocation(`/brands/edit/${brand.id}?tab=edit-playlist`)}
                      >
                        <Radio className="h-4 w-4 mr-2" />
                        Live Streaming
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredBrands.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              No locations found matching your criteria.
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}