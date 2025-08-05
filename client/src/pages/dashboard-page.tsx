import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/App";
import { PlaylistEditor } from "@/components/playlist/playlist-editor";
import { TimeSlotScheduler } from "@/components/playlist/time-slot-scheduler";
import { Loader2, Clock, ChevronDown } from "lucide-react";
import { Brand, Playlist, TimeSlot } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [playlistType, setPlaylistType] = useState<"single" | "master" | "timeSlot">("single");
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("");
  const [secondaryGenre, setSecondaryGenre] = useState<string>("");
  const [masterBoxSource, setMasterBoxSource] = useState<string>("");
  const [timeSlotSelections, setTimeSlotSelections] = useState<Record<string, { playlist: string, selected: boolean }[]>>({});
  
  // States for modals
  const [playlistEditorOpen, setPlaylistEditorOpen] = useState(false);
  const [timeSlotSchedulerOpen, setTimeSlotSchedulerOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{id: number, playlistId: number, name: string} | null>(null);
  
  // Load brands
  const { data: brands, isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
    enabled: !!user,
  });
  
  // Load playlists for the selected brand
  const { data: playlists, isLoading: playlistsLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
    enabled: !!user,
  });
  
  // Load time slots
  const { data: timeSlots, isLoading: timeSlotsLoading } = useQuery<TimeSlot[]>({
    queryKey: ["/api/timeslots"],
    enabled: !!user,
  });
  
  // Set first brand as selected if none selected yet
  if (!selectedBrand && brands && brands.length > 0) {
    setSelectedBrand(brands[0].id);
  }
  
  // Update playlist settings mutation
  const updatePlaylistSettingsMutation = useMutation({
    mutationFn: async (data: {
      playlistType: "single" | "master" | "timeSlot";
      brandId: number;
      settings: any;
    }) => {
      // Different endpoints based on playlist type
      let endpoint = "/api/playlists/settings";
      if (data.playlistType === "master") {
        endpoint = "/api/playlists/master";
      } else if (data.playlistType === "timeSlot") {
        endpoint = "/api/timeslots";
      }
      
      const response = await apiRequest("POST", endpoint, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Playlist settings updated successfully",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timeslots"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update playlist settings",
        variant: "destructive",
      });
    }
  });
  
  // Handle the update button click
  const handleUpdate = () => {
    // Let's skip the check for demo mode to make the Update button work
    // In production, we'd ensure a brand is selected
    if (!selectedBrand && playlistType !== "timeSlot") {
      toast({
        title: "Error",
        description: "Please select a brand",
        variant: "destructive",
      });
      return;
    }
    
    let settings = {};
    
    if (playlistType === "single") {
      settings = {
        playlistId: selectedPlaylist,
        secondaryGenre,
      };
    } else if (playlistType === "master") {
      settings = {
        sourceBrandId: masterBoxSource,
      };
    } else if (playlistType === "timeSlot") {
      settings = {
        timeSlots: timeSlotSelections,
      };
    }
    
    updatePlaylistSettingsMutation.mutate({
      playlistType,
      brandId: selectedBrand,
      settings,
    });
  };
  
  // Open time slot scheduler with selected playlist
  const handleTimeSlotClick = (timeSlotId: number) => {
    const timeSlot = timeSlots?.find(ts => ts.id === timeSlotId);
    if (timeSlot) {
      const playlist = playlists?.find(p => p.id === timeSlot.playlistId);
      if (playlist) {
        setSelectedTimeSlot({
          id: timeSlot.id,
          playlistId: playlist.id,
          name: playlist.name,
        });
        setTimeSlotSchedulerOpen(true);
      }
    } else {
      // If no existing time slot, open with default values
      const defaultPlaylist = playlists && playlists.length > 0 ? playlists[0] : null;
      if (defaultPlaylist) {
        setSelectedTimeSlot({
          id: 0, // New time slot
          playlistId: defaultPlaylist.id,
          name: defaultPlaylist.name,
        });
      }
      setTimeSlotSchedulerOpen(true);
    }
  };
  
  // Handle checkbox changes for time slots
  const handleTimeSlotCheckboxChange = (category: string, playlistId: string, checked: boolean) => {
    setTimeSlotSelections(prev => {
      const updatedCategory = prev[category] ? [...prev[category]] : [];
      const existingIndex = updatedCategory.findIndex(item => item.playlist === playlistId);
      
      if (existingIndex !== -1) {
        updatedCategory[existingIndex] = { ...updatedCategory[existingIndex], selected: checked };
      } else {
        updatedCategory.push({ playlist: playlistId, selected: checked });
      }
      
      return {
        ...prev,
        [category]: updatedCategory,
      };
    });
  };
  
  if (brandsLoading || playlistsLoading || timeSlotsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  // Get brand name
  const brandName = selectedBrand && brands 
    ? brands.find(b => b.id === selectedBrand)?.name || "Unknown Brand"
    : "Select a brand";
  
  return (
    <DashboardLayout>
      <div className="bg-gradient-to-r from-primary/90 to-primary/70 text-white p-6 rounded-xl mb-6 shadow-md">
        <h1 className="text-2xl font-semibold mb-2">Live Streaming for {brandName}</h1>
        <p className="text-white/90">
          Select your ideal choice of music
          <span className="ml-2 bg-secondary/90 text-white px-3 py-1 rounded-full text-xs font-medium">USEA Music</span>
        </p>
        <p className="text-sm mt-2 bg-white/10 inline-block px-3 py-1 rounded-full">
          Tip: search for new music with Pick N Play mode
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Playlist Section */}
        <Card className="border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-primary/80"></div>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <RadioGroup
                value={playlistType}
                onValueChange={(value) => setPlaylistType(value as "single" | "master" | "timeSlot")}
                className="flex items-center"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single-playlist" className="text-primary" />
                  <Label htmlFor="single-playlist" className="text-lg font-medium">Single Playlist</Label>
                </div>
              </RadioGroup>
            </div>
            <p className="text-sm text-primary mb-4 bg-primary/5 p-2 rounded-md inline-flex items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
              Make quick changes here.
            </p>
            
            <div className="space-y-4">
              <div className="relative">
                <Select
                  value={selectedPlaylist}
                  onValueChange={setSelectedPlaylist}
                  disabled={playlistType !== "single"}
                >
                  <SelectTrigger className="bg-primary text-white">
                    <SelectValue placeholder="Select playlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {playlists?.map(playlist => (
                      <SelectItem key={playlist.id} value={playlist.id.toString()}>
                        {playlist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Select
                  value={secondaryGenre}
                  onValueChange={setSecondaryGenre}
                  disabled={playlistType !== "single"}
                >
                  <SelectTrigger className="bg-primary text-white">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dance">Dance</SelectItem>
                    <SelectItem value="chill">Chill</SelectItem>
                    <SelectItem value="upbeat">Upbeat</SelectItem>
                    <SelectItem value="relaxing">Relaxing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Master Box Section */}
        <Card className="border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-secondary to-secondary/80"></div>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <RadioGroup
                value={playlistType}
                onValueChange={(value) => setPlaylistType(value as "single" | "master" | "timeSlot")}
                className="flex items-center"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="master" id="master-box" className="text-secondary" />
                  <Label htmlFor="master-box" className="text-lg font-medium">Master Box</Label>
                </div>
              </RadioGroup>
            </div>
            <p className="text-sm text-secondary mb-4 bg-secondary/5 p-2 rounded-md inline-flex items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary mr-2"></span>
              Replicate another location Playlist.
            </p>
            
            <div className="relative">
              <Select
                value={masterBoxSource}
                onValueChange={setMasterBoxSource}
                disabled={playlistType !== "master"}
              >
                <SelectTrigger className="bg-secondary text-white">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {brands?.filter(b => b.id !== selectedBrand).map(brand => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Time Slot Section */}
        <Card className="lg:col-span-2 border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary/80 via-secondary/60 to-primary/80"></div>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <RadioGroup
                value={playlistType}
                onValueChange={(value) => setPlaylistType(value as "single" | "master" | "timeSlot")}
                className="flex items-center"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="timeSlot" id="time-slot" className="text-primary" />
                  <Label htmlFor="time-slot" className="text-lg font-medium">Time Slot</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-primary bg-primary/5 px-3 py-1.5 rounded-md inline-flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                Select playlist to play at different times of day.
              </p>
              <span className="bg-secondary/10 text-secondary text-xs font-medium px-3 py-1 rounded-full">Time-based scheduling</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-primary/5">
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Playlists</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-full">
                        <Select
                          value={timeSlotSelections.instrumental?.[0]?.selected ? "instrumental" : ""}
                          onValueChange={(value) => 
                            handleTimeSlotCheckboxChange("instrumental", value, value === "instrumental")
                          }
                          disabled={playlistType !== "timeSlot"}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Playlist" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instrumental">Instrumental</SelectItem>
                            <SelectItem value="english-pop-1">English Pop</SelectItem>
                            <SelectItem value="english-pop-2">English Pop</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="w-full">
                          <Select
                            value={timeSlotSelections["pop-vocal"]?.[0]?.selected ? "pop-vocal" : ""}
                            onValueChange={(value) => 
                              handleTimeSlotCheckboxChange("pop-vocal", value, value === "pop-vocal")
                            }
                            disabled={playlistType !== "timeSlot"}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pop-vocal">Pop Vocal</SelectItem>
                              <SelectItem value="hip-hop">Hip Hop</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            // Auto-select the time slot option
                            setPlaylistType("timeSlot");
                            if (timeSlots && timeSlots.length > 0) {
                              handleTimeSlotClick(timeSlots[0].id);
                            } else {
                              setTimeSlotSchedulerOpen(true);
                            }
                          }}
                          className="ml-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
                        >
                          <Clock className="text-primary h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-full">
                        <Select
                          value={timeSlotSelections["english-pop-1"]?.[0]?.selected ? "english-pop-1" : ""}
                          onValueChange={(value) => 
                            handleTimeSlotCheckboxChange("english-pop-1", value, value === "english-pop-1")
                          }
                          disabled={playlistType !== "timeSlot"}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Playlist" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instrumental">Instrumental</SelectItem>
                            <SelectItem value="english-pop-1">English Pop</SelectItem>
                            <SelectItem value="english-pop-2">English Pop</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="w-full">
                          <Select
                            value={timeSlotSelections["hip-hop"]?.[0]?.selected ? "hip-hop" : ""}
                            onValueChange={(value) => 
                              handleTimeSlotCheckboxChange("hip-hop", value, value === "hip-hop")
                            }
                            disabled={playlistType !== "timeSlot"}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pop-vocal">Pop Vocal</SelectItem>
                              <SelectItem value="hip-hop">Hip Hop</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Auto-select the time slot option
                            setPlaylistType("timeSlot");
                            if (timeSlots && timeSlots.length > 1) {
                              handleTimeSlotClick(timeSlots[1].id);
                            } else {
                              setTimeSlotSchedulerOpen(true);
                            }
                          }}
                          className="ml-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
                        >
                          <Clock className="text-primary h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-full">
                        <Select
                          value={timeSlotSelections["english-pop-2"]?.[0]?.selected ? "english-pop-2" : ""}
                          onValueChange={(value) => 
                            handleTimeSlotCheckboxChange("english-pop-2", value, value === "english-pop-2")
                          }
                          disabled={playlistType !== "timeSlot"}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Playlist" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instrumental">Instrumental</SelectItem>
                            <SelectItem value="english-pop-1">English Pop</SelectItem>
                            <SelectItem value="english-pop-2">English Pop</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="w-full">
                          <Select
                            value={timeSlotSelections.active?.[0]?.selected ? "active" : ""}
                            onValueChange={(value) => 
                              handleTimeSlotCheckboxChange("active", value, value === "active")
                            }
                            disabled={playlistType !== "timeSlot"}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pop-vocal">Pop Vocal</SelectItem>
                              <SelectItem value="hip-hop">Hip Hop</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Auto-select the time slot option
                            setPlaylistType("timeSlot");
                            if (timeSlots && timeSlots.length > 2) {
                              handleTimeSlotClick(timeSlots[2].id);
                            } else {
                              setTimeSlotSchedulerOpen(true);
                            }
                          }}
                          className="ml-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
                        >
                          <Clock className="text-primary h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button 
          onClick={handleUpdate}
          disabled={updatePlaylistSettingsMutation.isPending}
          className="bg-primary hover:bg-primary/90"
        >
          {updatePlaylistSettingsMutation.isPending ? "Updating..." : "Update"}
        </Button>
      </div>
      
      {/* Playlist Editor Modal */}
      {selectedBrand && (
        <PlaylistEditor
          open={playlistEditorOpen}
          onClose={() => setPlaylistEditorOpen(false)}
          brandId={selectedBrand}
          selectedPlaylist={playlists?.find(p => p.id.toString() === selectedPlaylist)}
        />
      )}
      
      {/* Time Slot Scheduler Modal */}
      {timeSlotSchedulerOpen && (
        <TimeSlotScheduler
          open={timeSlotSchedulerOpen}
          onClose={() => setTimeSlotSchedulerOpen(false)}
          brandId={selectedBrand || 1}
          playlistId={selectedTimeSlot?.playlistId || 1}
          playlistName={selectedTimeSlot?.name || "Playlist"}
          timeSlotId={selectedTimeSlot?.id}
        />
      )}
    </DashboardLayout>
  );
}