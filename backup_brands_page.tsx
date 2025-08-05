import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Edit, 
  Info, 
  ArrowUpDown, 
  ChevronDown,
  Store,
  CircleDot,
  Wifi,
  WifiOff,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Brand } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const createBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  activeStartDate: z.date({
    required_error: "Please select a start date",
  }),
  isActive: z.boolean().default(true),
});

type CreateBrandFormValues = z.infer<typeof createBrandSchema>;

// Mock data to match the screenshot
interface LocationData {
  id: number;
  name: string;
  description: string;
  status: "online" | "offline" | "partial";
  playlist: string;
  masterfoxId?: string;
}

export default function BrandsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline" | "partial">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Load brands
  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
    enabled: !!user,
  });
  
  // Mock data for the table view
  const mockLocations: LocationData[] = [
    { 
      id: 1, 
      name: "Masterbox 01 - BUKIT PANJANG PLAZA (A0954642)", 
      description: "FairPrice Finest", 
      status: "online", 
      playlist: "Daily English - Uptempo Acoustics",
      masterfoxId: "A0954642"
    },
    { 
      id: 2, 
      name: "Masterbox 03 - HOUGANG STREET 21 (A1172757)", 
      description: "FairPrice Finest", 
      status: "online", 
      playlist: "Daily English - Uptempo Acoustics",
      masterfoxId: "A1172757"
    },
    { 
      id: 3, 
      name: "Masterbox 04 - CHANGI AIRPORT T3 (A0964091)", 
      description: "FairPrice Finest", 
      status: "online", 
      playlist: "Daily English - Uptempo Acoustics",
      masterfoxId: "A0964091"
    },
    { 
      id: 4, 
      name: "Masterbox 08 - CLEMENTI MALL (A0964819)", 
      description: "FairPrice Finest", 
      status: "partial", 
      playlist: "Daily English - Uptempo Acoustics",
      masterfoxId: "A0964819"
    },
    { 
      id: 5, 
      name: "Masterbox 10 - Centrepoint (A2137564)", 
      description: "FairPrice Finest", 
      status: "online", 
      playlist: "Daily English - Uptempo Acoustics",
      masterfoxId: "A2137564"
    },
    { 
      id: 6, 
      name: "111 SOMERSET (A0965986)", 
      description: "FairPrice Finest", 
      status: "offline", 
      playlist: "FairPrice Finest (Masterbox 01 - BUKIT PANJANG PLAZA)",
    },
    { 
      id: 7, 
      name: "Ang Mo Kio Ave 6 (AMK712) (A2006974)", 
      description: "NTUC FairPrice Finest", 
      status: "online", 
      playlist: "FairPrice Finest (Masterbox 01 - BUKIT PANJANG PLAZA)",
    },
    { 
      id: 8, 
      name: "ARTRA (A0997543)", 
      description: "FairPrice Finest", 
      status: "online", 
      playlist: "FairPrice Finest (Masterbox 01 - BUKIT PANJANG PLAZA)",
    },
    { 
      id: 9, 
      name: "BEDOK MALL (A4973111)", 
      description: "FairPrice Finest", 
      status: "partial", 
      playlist: "FairPrice Finest (Masterbox 01 - BUKIT PANJANG PLAZA)",
    },
    { 
      id: 10, 
      name: "BUKIT TIMAH PLAZA (A0964789)", 
      description: "FairPrice Finest", 
      status: "online", 
      playlist: "FairPrice Finest (Masterbox 03 - HOUGANG STREET 21)",
    },
  ];
  
  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: async (data: CreateBrandFormValues) => {
      const response = await apiRequest("POST", "/api/brands", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Brand created successfully",
      });
      
      // Close dialog and invalidate brands query
      setCreateDialogOpen(false);
      form.reset({
        name: "",
        activeStartDate: new Date(),
        isActive: true,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create brand",
        variant: "destructive",
      });
    }
  });
  
  // Form for creating a new brand
  const form = useForm<CreateBrandFormValues>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: {
      name: "",
      activeStartDate: new Date(),
      isActive: true,
    },
  });
  
  // Submit handler for the create form
  const onSubmit = (data: CreateBrandFormValues) => {
    createBrandMutation.mutate(data);
  };
  
  // Sort and filter locations based on search query, status filter, and sort order
  const handleLocationSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredLocations = mockLocations
    .filter(location => {
      const matchesSearch = searchQuery ? 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.description.toLowerCase().includes(searchQuery.toLowerCase()) :
        true;
        
      const matchesStatus = statusFilter === "all" ? 
        true : 
        location.status === statusFilter;
        
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  
  // Render status icon (simplified for table)
  const renderStatusIcon = (status: "online" | "offline" | "partial") => {
    switch (status) {
      case "online":
        return <div title="Online"><CircleDot className="h-3 w-3 text-green-500" /></div>;
      case "offline":
        return <div title="Offline"><CircleDot className="h-3 w-3 text-red-500" /></div>;
      case "partial":
        return <div title="Partial Download"><CircleDot className="h-3 w-3 text-amber-500" /></div>;
    }
  };

  // Render status badge (full version for other uses)
  const renderStatusBadge = (status: "online" | "offline" | "partial") => {
    switch (status) {
      case "online":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1.5">
            <Wifi className="h-3 w-3" /> Online
          </Badge>
        );
      case "offline":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1.5">
            <WifiOff className="h-3 w-3" /> Offline
          </Badge>
        );
      case "partial":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1.5">
            <Download className="h-3 w-3" /> Partial Download
          </Badge>
        );
    }
  };

  // Calculate statistics
  const totalLocations = mockLocations.length;
  const onlineCount = mockLocations.filter(loc => loc.status === "online").length;
  const offlineCount = mockLocations.filter(loc => loc.status === "offline").length;
  const partialCount = mockLocations.filter(loc => loc.status === "partial").length;
  
  return (
    <DashboardLayout>
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold">My Brands</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Overview of what your current locations are playing. Make quick changes or search for playlist(s).
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex gap-1.5 items-center">
                <CircleDot className="h-2.5 w-2.5 text-green-500" />
                <span>Online</span>
                <span className="font-semibold text-green-600">({onlineCount})</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <CircleDot className="h-2.5 w-2.5 text-red-500" />
                <span>Offline</span>
                <span className="font-semibold text-red-600">({offlineCount})</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <CircleDot className="h-2.5 w-2.5 text-amber-500" />
                <span>Partial</span>
                <span className="font-semibold text-amber-600">({partialCount})</span>
              </div>
              <div className="flex gap-1.5 items-center border-l border-gray-200 pl-3">
                <Store className="h-2.5 w-2.5 text-blue-500" />
                <span>Total</span>
                <span className="font-semibold text-blue-600">({totalLocations})</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search locations or playlists..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setStatusFilter(value as any)}>
                <TabsList className="bg-gray-100 border">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="online" className="text-xs">Online</TabsTrigger>
                  <TabsTrigger value="offline" className="text-xs">Offline</TabsTrigger>
                  <TabsTrigger value="partial" className="text-xs">Partial</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-4 py-3 font-medium text-left">
                    <div className="flex items-center gap-1">
                      Location
                      <button 
                        className="ml-1 rounded p-1 hover:bg-white/10"
                        onClick={handleLocationSort}
                      >
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium text-left">Description</th>
                  <th className="px-4 py-3 font-medium text-left">Active Playlist</th>
                  <th className="px-4 py-3 font-medium text-center w-24">Select</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.map((location, index) => (
                  <tr key={location.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 border-b">
                      <div className="flex items-start gap-1">
                        <div className="flex-1 font-medium">
                          {location.name}
                          {location.masterfoxId && (
                            <div className="mr-1 inline-block cursor-help ml-1" title={`Masterbox ID: ${location.masterfoxId}`}>
                              <Info className="inline h-3.5 w-3.5 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b">{location.description}</td>
                    <td className="px-4 py-3 border-b">
                      <div className="flex items-center gap-2">
                        {renderStatusIcon(location.status)}
                        <span className="text-sm">{location.playlist}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b text-center">
                      <Link to={`/brands/${location.id}/edit`}>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                
                {filteredLocations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                      <Store className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>No locations found matching your search criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Create Brand Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brand name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="activeStartDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Active Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              disabled={createBrandMutation.isPending}
            >
              {createBrandMutation.isPending ? "Creating..." : "Create Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
