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

export default function BrandsPageBackup() {
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
      name: "Masterbox 05 - MARINA SQUARE (A2345678)", 
      description: "FairPrice Finest", 
      status: "offline", 
      playlist: "No playlist assigned",
      masterfoxId: "A2345678"
    },
    { 
      id: 4, 
      name: "Masterbox 07 - ORCHARD CENTRAL (A3456789)", 
      description: "FairPrice Finest", 
      status: "partial", 
      playlist: "Daily English - Chill Vibes",
      masterfoxId: "A3456789"
    },
    { 
      id: 5, 
      name: "Masterbox 09 - TAMPINES MALL (A4567890)", 
      description: "FairPrice Finest", 
      status: "online", 
      playlist: "Daily English - Uptempo Acoustics",
      masterfoxId: "A4567890"
    },
    { 
      id: 6, 
      name: "Masterbox 11 - VIVOCITY (A5678901)", 
      description: "FairPrice Finest", 
      status: "online", 
      playlist: "Daily English - Background Mix",
      masterfoxId: "A5678901"
    },
    { 
      id: 7, 
      name: "Masterbox 13 - ION ORCHARD (A6789012)", 
      description: "FairPrice Finest", 
      status: "offline", 
      playlist: "No playlist assigned",
      masterfoxId: "A6789012"
    },
    { 
      id: 8, 
      name: "Masterbox 15 - BUGIS JUNCTION (A7890123)", 
      description: "FairPrice Finest", 
      status: "online", 
      playlist: "Daily English - Smooth Jazz",
      masterfoxId: "A7890123"
    },
    { 
      id: 9, 
      name: "Masterbox 17 - WESTGATE (A8901234)", 
      description: "FairPrice Finest", 
      status: "partial", 
      playlist: "Daily English - Chill Vibes",
      masterfoxId: "A8901234"
    },
    { 
      id: 10, 
      name: "Masterbox 19 - CAUSEWAY POINT (A9012345)", 
      description: "FairPrice Finest", 
      status: "online", 
      playlist: "Daily English - Uptempo Acoustics",
      masterfoxId: "A9012345"
    }
  ];
  
  // Mutation for creating a new brand
  const createBrandMutation = useMutation({
    mutationFn: async (data: CreateBrandFormValues) => {
      const response = await apiRequest("/api/brands", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          activeStartDate: data.activeStartDate.toISOString(),
          isActive: data.isActive,
        }),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Brand created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create brand",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateBrandFormValues>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: {
      name: "",
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
  
  return (
    <DashboardLayout>
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">My Brands</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Overview of what your current locations are playing. Make quick changes or search for playlist(s).
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2 items-center">
                <CircleDot className="h-3 w-3 text-green-500" />
                <span className="text-sm">Online</span>
              </div>
              <div className="flex gap-2 items-center">
                <CircleDot className="h-3 w-3 text-red-500" />
                <span className="text-sm">Offline</span>
              </div>
              <div className="flex gap-2 items-center">
                <CircleDot className="h-3 w-3 text-amber-500" />
                <span className="text-sm">Partial Download</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="locations" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="locations">All Locations</TabsTrigger>
                <TabsTrigger value="brands">Brands</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      Status: {statusFilter === "all" ? "All" : statusFilter}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-0">
                    <div className="grid">
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => setStatusFilter("all")}
                      >
                        All
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => setStatusFilter("online")}
                      >
                        Online
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => setStatusFilter("offline")}
                      >
                        Offline
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => setStatusFilter("partial")}
                      >
                        Partial Download
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="outline" 
                  onClick={handleLocationSort}
                  className="flex items-center gap-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Sort {sortOrder === "asc" ? "A-Z" : "Z-A"}
                </Button>
              </div>
            </div>

            <TabsContent value="locations" className="mt-0">
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Location Name
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Description
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Current Playlist
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLocations.map((location) => (
                        <tr key={location.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">
                            {renderStatusIcon(location.status)}
                          </td>
                          <td className="p-4 align-middle">
                            <div className="font-medium">{location.name}</div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="text-sm text-muted-foreground">{location.description}</div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="text-sm">{location.playlist}</div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/brands/edit/${location.id}`}>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline">
                                <Info className="h-4 w-4 mr-1" />
                                Info
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredLocations.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-muted-foreground">
                        No locations found matching your criteria.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="brands" className="mt-0">
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Manage your brand settings and configurations.
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Brand
                </Button>
              </div>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">Loading brands...</div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {brands?.map((brand) => (
                    <Card key={brand.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Store className="h-8 w-8 text-primary" />
                            <div>
                              <h3 className="font-semibold text-lg">{brand.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Active since {format(new Date(brand.activeStartDate), "PPP")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={brand.isActive ? "default" : "secondary"}>
                              {brand.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/brands/edit/${brand.id}`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {brands?.length === 0 && (
                    <div className="text-center py-12">
                      <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No brands yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first brand to get started with managing your locations.
                      </p>
                      <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Brand
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Brand Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
                  <FormItem>
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
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBrandMutation.isPending}
                >
                  {createBrandMutation.isPending ? "Creating..." : "Create Brand"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}