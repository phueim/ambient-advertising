import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ArrowLeft, Play, Plus, Check, ChevronRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Song, Playlist } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useRoute, useLocation } from "wouter";

type BusinessType = "F&B" | "Retail" | "Hotel" | "Others";
type FnBOutlet = "Café" | "Casual Restaurant" | "Chinese Restaurant" | "Fast Food Chain" | "Foodcourt" | "French Restaurant" | "Italian Restaurant" | "Japanese Restaurant" | "Korean Restaurant" | "Western Restaurant" | "Bakery / Bake Shop";
type PlaylistCategory = {
  id: string;
  title: string;
  language: string;
  image: string;
};

export default function PickNPlayPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [fnbOutlet, setFnbOutlet] = useState<FnBOutlet | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [selectedPlaylistDetails, setSelectedPlaylistDetails] = useState<PlaylistCategory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [, setLocation] = useLocation();
  
  // Get the locationId from the URL if it exists
  const [match, params] = useRoute("/brands/:locationId/edit");
  const locationId = match ? params.locationId : null;
  
  // Mock location data that would normally come from API
  const locationData = locationId ? {
    id: parseInt(locationId),
    name: `Location #${locationId}`,
    description: "FairPrice Finest",
    status: "online" as const,
    businessType: "F&B" as BusinessType,
    fnbOutlet: "Café" as FnBOutlet
  } : null;
  
  // If we have location data, we should jump to step 3 (playlist selection)
  useEffect(() => {
    if (locationData) {
      setBusinessType(locationData.businessType);
      setFnbOutlet(locationData.fnbOutlet);
      setCurrentStep(3);
    }
  }, [locationData]);
  
  // Load songs
  const { data: songs, isLoading } = useQuery<Song[]>({
    queryKey: ["/api/songs", "search", { genre: selectedPlaylistDetails?.title }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (selectedPlaylistDetails?.title) {
        queryParams.append("genre", selectedPlaylistDetails.title);
      }
      const response = await fetch(`/api/songs/search?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch songs");
      return response.json();
    },
    enabled: !!selectedPlaylistDetails,
  });
  
  // Load playlists for storing selections
  const { data: playlists } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
    enabled: !!user,
  });
  
  // Add song to playlist mutation
  const addPlaylistMutation = useMutation({
    mutationFn: async (data: { songs: number[] }) => {
      if (!selectedPlaylist || !data.songs.length) return null;
      
      // Create new playlist if needed
      let playlistId: number;
      
      if (selectedPlaylist === "new") {
        // Create new playlist
        const createResponse = await apiRequest(
          "POST",
          "/api/playlists",
          { 
            name: `${selectedPlaylistDetails?.language || ""} - ${selectedPlaylistDetails?.title || "Custom"} Playlist`,
            brandId: 1, // Default brand ID, should be dynamic in production
            isActive: true,
            shuffle: false
          }
        );
        const newPlaylist = await createResponse.json();
        playlistId = newPlaylist.id;
      } else {
        playlistId = parseInt(selectedPlaylist);
      }
      
      // Add songs to playlist
      const promises = data.songs.map(songId => 
        apiRequest(
          "POST", 
          `/api/playlists/${playlistId}/songs`, 
          { songId }
        )
      );
      
      await Promise.all(promises);
      return playlistId;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Playlist has been created successfully",
      });
      
      // Invalidate playlists query
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create playlist",
        variant: "destructive",
      });
    }
  });
  
  // Pagination
  const totalPages = songs ? Math.ceil(songs.length / itemsPerPage) : 0;
  const paginatedSongs = songs ? songs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) : [];

  // Dummy data for playlist categories
  const playlistCategories: PlaylistCategory[] = [
    { id: "pop-vocal", title: "Pop Vocal", language: "Chinese", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: "chill-latin-jazz", title: "Chill Latin Jazz", language: "English", image: "https://images.unsplash.com/photo-1513267048331-5611cad62e41?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: "classic-children", title: "Classic Children", language: "English", image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: "classic-jazz", title: "Classic Jazz", language: "English", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: "indie-band", title: "Indie Band", language: "English", image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: "indie-disco", title: "Indie Disco", language: "English", image: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: "pop-ballad", title: "Pop Ballad", language: "English", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: "pop-mellow", title: "Pop Mellow", language: "English", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: "pop-mix", title: "Pop Mix", language: "English", image: "https://images.unsplash.com/photo-1481886756534-97af88ccb438?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: "pop-rnb", title: "Pop R&B", language: "English", image: "https://images.unsplash.com/photo-1618609377864-68609b857e90?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
  ];
  
  const handleGoBack = () => {
    if (currentStep === 3) {
      setSelectedPlaylistDetails(null);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setFnbOutlet(null);
      setCurrentStep(1);
    }
  };
  
  const handleUsePlaylist = () => {
    if (!selectedPlaylist) {
      toast({
        title: "No option selected",
        description: "Please select where to save this playlist",
        variant: "destructive",
      });
      return;
    }
    
    if (!songs || songs.length === 0) {
      toast({
        title: "No songs available",
        description: "There are no songs to add to the playlist",
        variant: "destructive",
      });
      return;
    }
    
    addPlaylistMutation.mutate({
      songs: songs.map(song => song.id)
    });
  };
  
  const handleBusinessTypeSelect = (type: BusinessType) => {
    setBusinessType(type);
    if (type === "F&B") {
      setCurrentStep(2);
    } else {
      // For other business types, skip to recommendation
      setCurrentStep(3);
    }
  };
  
  const handleFnBOutletSelect = (outlet: FnBOutlet) => {
    setFnbOutlet(outlet);
    setCurrentStep(3);
  };
  
  const handlePlaylistSelect = (playlist: PlaylistCategory) => {
    setSelectedPlaylistDetails(playlist);
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Pick 'N' Play</h1>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Discover the Right Music For Your Business</h2>
        </div>
        
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-full p-1 w-8 h-8 flex items-center justify-center text-white">
                <Check className="h-5 w-5" />
              </div>
              <div className="font-semibold text-lg">Select your nature of business</div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-32 relative group",
                  businessType === "F&B" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleBusinessTypeSelect("F&B")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1556742393-d75f468bfcb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="F&B" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">F&B</span>
                </div>
                {businessType === "F&B" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-32 relative group",
                  businessType === "Retail" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleBusinessTypeSelect("Retail")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1555529771-7888783a18d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Retail" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">Retail</span>
                </div>
                {businessType === "Retail" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-32 relative group",
                  businessType === "Hotel" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleBusinessTypeSelect("Hotel")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Hotel" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">Hotel</span>
                </div>
                {businessType === "Hotel" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-32 relative group",
                  businessType === "Others" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleBusinessTypeSelect("Others")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Others" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">Others</span>
                </div>
                {businessType === "Others" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="mr-4 p-2 hover:bg-transparent"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="bg-primary rounded-full p-1 w-8 h-8 flex items-center justify-center text-white">
                  <Check className="h-5 w-5" />
                </div>
                <div className="font-semibold text-lg">Select your F&B outlet type</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-24 relative group",
                  fnbOutlet === "Café" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleFnBOutletSelect("Café")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1511920170033-f8396924c348?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Café" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold">Café</span>
                </div>
                {fnbOutlet === "Café" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-24 relative group",
                  fnbOutlet === "Casual Restaurant" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleFnBOutletSelect("Casual Restaurant")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1555992336-fb0d29498b13?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Casual Restaurant" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center px-2">
                  <span className="text-white font-semibold">Casual Restaurant</span>
                </div>
                {fnbOutlet === "Casual Restaurant" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-24 relative group",
                  fnbOutlet === "Chinese Restaurant" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleFnBOutletSelect("Chinese Restaurant")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1548943487-a2e4e43b4853?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Chinese Restaurant" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center px-2">
                  <span className="text-white font-semibold">Chinese Restaurant</span>
                </div>
                {fnbOutlet === "Chinese Restaurant" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-24 relative group",
                  fnbOutlet === "Fast Food Chain" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleFnBOutletSelect("Fast Food Chain")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Fast Food Chain" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center px-2">
                  <span className="text-white font-semibold">Fast Food Chain</span>
                </div>
                {fnbOutlet === "Fast Food Chain" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-24 relative group",
                  fnbOutlet === "Foodcourt" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleFnBOutletSelect("Foodcourt")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Foodcourt" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold">Foodcourt</span>
                </div>
                {fnbOutlet === "Foodcourt" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-24 relative group",
                  fnbOutlet === "French Restaurant" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleFnBOutletSelect("French Restaurant")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1522336572468-97b06e8ef143?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="French Restaurant" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center px-2">
                  <span className="text-white font-semibold">French Restaurant</span>
                </div>
                {fnbOutlet === "French Restaurant" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-24 relative group",
                  fnbOutlet === "Italian Restaurant" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleFnBOutletSelect("Italian Restaurant")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Italian Restaurant" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center px-2">
                  <span className="text-white font-semibold">Italian Restaurant</span>
                </div>
                {fnbOutlet === "Italian Restaurant" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-24 relative group",
                  fnbOutlet === "Japanese Restaurant" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleFnBOutletSelect("Japanese Restaurant")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1617196701537-7329482cc9fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Japanese Restaurant" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center px-2">
                  <span className="text-white font-semibold">Japanese Restaurant</span>
                </div>
                {fnbOutlet === "Japanese Restaurant" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-24 relative group",
                  fnbOutlet === "Korean Restaurant" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleFnBOutletSelect("Korean Restaurant")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1532347231146-80afc9e3df2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Korean Restaurant" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center px-2">
                  <span className="text-white font-semibold">Korean Restaurant</span>
                </div>
                {fnbOutlet === "Korean Restaurant" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-24 relative group",
                  fnbOutlet === "Western Restaurant" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleFnBOutletSelect("Western Restaurant")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Western Restaurant" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center px-2">
                  <span className="text-white font-semibold">Western Restaurant</span>
                </div>
                {fnbOutlet === "Western Restaurant" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div 
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-24 relative group",
                  fnbOutlet === "Bakery / Bake Shop" ? "ring-2 ring-primary" : ""
                )}
                onClick={() => handleFnBOutletSelect("Bakery / Bake Shop")}
              >
                <img 
                  src="https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Bakery / Bake Shop" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center px-2">
                  <span className="text-white font-semibold">Bakery / Bake Shop</span>
                </div>
                {fnbOutlet === "Bakery / Bake Shop" && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1 w-6 h-6 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 3 && !selectedPlaylistDetails && (
          <div className="space-y-8">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="mr-4 p-2 hover:bg-transparent"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="bg-primary rounded-full p-1 w-8 h-8 flex items-center justify-center text-white">
                  <Check className="h-5 w-5" />
                </div>
                <div className="font-semibold text-lg">Discover recommended playlist</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {playlistCategories.map(category => (
                <div 
                  key={category.id}
                  className="rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handlePlaylistSelect(category)}
                >
                  <div className="relative h-40">
                    <img 
                      src={category.image} 
                      alt={category.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/70 flex flex-col items-center justify-end p-4">
                      <span className="text-white text-xs px-2 py-1 bg-white/20 rounded mb-2">
                        {category.language}
                      </span>
                      <h3 className="text-white font-bold text-center">{category.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {currentStep === 3 && selectedPlaylistDetails && (
          <div className="space-y-8">
            <div className="flex items-start md:items-center gap-6 flex-col md:flex-row">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setSelectedPlaylistDetails(null)}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-md overflow-hidden">
                  <img 
                    src={selectedPlaylistDetails.image} 
                    alt={selectedPlaylistDetails.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedPlaylistDetails.language} - {selectedPlaylistDetails.title}
                  </h2>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <Button 
                variant="outline" 
                className="text-primary border-primary hover:bg-primary hover:text-white"
                onClick={() => setSelectedPlaylist("new")}
              >
                <Plus className="h-4 w-4 mr-2" /> Create New Playlist
              </Button>
              
              {playlists && playlists.length > 0 && (
                <div className="flex gap-4 items-center">
                  <Label className="whitespace-nowrap">Add to existing:</Label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedPlaylist || ""}
                    onChange={e => setSelectedPlaylist(e.target.value)}
                  >
                    <option value="">Select a playlist...</option>
                    {playlists.map(playlist => (
                      <option key={playlist.id} value={playlist.id.toString()}>
                        {playlist.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <Button 
                className="ml-auto" 
                onClick={handleUsePlaylist}
                disabled={addPlaylistMutation.isPending}
              >
                {addPlaylistMutation.isPending ? "Creating..." : "Use This Playlist"}
              </Button>
            </div>
            
            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <CardTitle className="text-xl font-bold">Songs in this playlist</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/40">
                        <TableHead className="w-[60px]"></TableHead>
                        <TableHead className="font-semibold">Song ID</TableHead>
                        <TableHead className="font-semibold">Language</TableHead>
                        <TableHead className="font-semibold">Genre</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12">
                            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                              <div className="animate-spin h-8 w-8 border-4 border-primary border-r-transparent rounded-full mb-4"></div>
                              <p>Loading songs...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : paginatedSongs.length > 0 ? (
                        paginatedSongs.map(song => (
                          <TableRow key={song.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                            <TableCell>
                              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-primary hover:text-white hover:bg-primary">
                                <Play className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">
                              {song.title || `EN-${song.id}`}
                            </TableCell>
                            <TableCell>
                              {song.language || selectedPlaylistDetails.language}
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                                {song.genre || selectedPlaylistDetails.title}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-16">
                            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                              <p className="text-lg font-semibold">No songs found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {totalPages > 1 && (
                  <div className="p-6 border-t">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => setCurrentPage(i + 1)}
                              isActive={currentPage === i + 1}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <PaginationItem>
                            <span className="px-2">...</span>
                          </PaginationItem>
                        )}
                        
                        {totalPages > 5 && (
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setCurrentPage(totalPages)}
                              isActive={currentPage === totalPages}
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
