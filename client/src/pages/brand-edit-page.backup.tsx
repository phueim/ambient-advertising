import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useRoute, useLocation } from "wouter";
import { Loader2, ArrowLeft, Save, Play, Pause, UploadCloud, Radio, Music, Clock, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Brand, Playlist, TimeSlot } from "@shared/schema";
import { TimeSlotScheduler } from "@/components/playlist/time-slot-scheduler";

export default function BrandEditPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Get the locationId from the URL
  const [match, params] = useRoute("/brands/:locationId/edit");
  const locationId = match ? params.locationId : null;
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // Mock location data that would normally come from API
  const locationData = locationId ? {
    id: parseInt(locationId),
    name: `Location #${locationId}`,
    description: "FairPrice Finest",
    status: "online",
    playlist: "Contemporary Jazz",
    address: "290 Orchard Rd, #B1-01/02/03, Singapore 238859",
    masterfoxId: "MF-" + locationId.padStart(4, '0'),
    scheduledPlaylists: [
      { day: "Monday", time: "09:00 - 22:00", playlist: "Contemporary Jazz" },
      { day: "Tuesday", time: "09:00 - 22:00", playlist: "Contemporary Jazz" },
      { day: "Wednesday", time: "09:00 - 22:00", playlist: "Contemporary Jazz" },
      { day: "Thursday", time: "09:00 - 22:00", playlist: "Contemporary Jazz" },
      { day: "Friday", time: "09:00 - 22:00", playlist: "Contemporary Jazz" },
      { day: "Saturday", time: "09:00 - 22:00", playlist: "Contemporary Jazz" },
      { day: "Sunday", time: "09:00 - 22:00", playlist: "Pop Hits" }
    ],
    isLiveOn: true,
    volume: 65,
    mode: "auto"
  } : null;
  
  // Form states
  const [formData, setFormData] = useState({
    isLiveOn: true,
    volume: 65,
    mode: "auto",
    playlist: "Contemporary Jazz"
  });

  // Playlist tab states
  const [playlistType, setPlaylistType] = useState<"single" | "master" | "timeSlot">("single");
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("");
  const [secondaryGenre, setSecondaryGenre] = useState<string>("");
  const [masterBoxSource, setMasterBoxSource] = useState<string>("");
  const [timeSlotSelections, setTimeSlotSelections] = useState<Record<string, { playlist: string, selected: boolean }[]>>({});
  
  // Time slot scheduler modal state
  const [timeSlotSchedulerOpen, setTimeSlotSchedulerOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{id: number, playlistId: number, name: string} | null>(null);
  
  // Initialize form data when location data is loaded
  useEffect(() => {
    if (locationData) {
      setFormData({
        isLiveOn: locationData.isLiveOn,
        volume: locationData.volume,
        mode: locationData.mode,
        playlist: locationData.playlist
      });
    }
  }, [locationId]);
  
  // Mock available playlists
  const playlists = [
    "Contemporary Jazz",
    "Pop Hits",
    "Lofi Beats",
    "Classical Piano",
    "Ambient Sounds",
    "Jazz Classics",
    "90s Hits",
    "Lo-Fi Hip Hop",
    "Soul & Funk",
    "Instrumental Covers"
  ];

  // Load data for playlist tab
  const { data: brands, isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
    enabled: !!user,
  });

  const { data: playlistsData, isLoading: playlistsLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
    enabled: !!user,
  });

  const { data: timeSlots, isLoading: timeSlotsLoading } = useQuery<TimeSlot[]>({
    queryKey: ["/api/timeslots"],
    enabled: !!user,
  });

  // Set first brand as selected if none selected yet
  if (!selectedBrand && brands && brands.length > 0) {
    setSelectedBrand(brands[0].id);
  }

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

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Settings updated",
        description: "Your playlist settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem updating your settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle save changes
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Changes saved",
        description: "Your brand settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your changes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle back button
  const handleBack = () => {
    setLocation("/brands");
  };
  
  // If no location ID is provided, show error
  if (!locationId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold">No location selected</h2>
          <p className="text-muted-foreground mb-4">Please select a location from the brands page.</p>
          <Button onClick={() => setLocation("/brands")}>
            Go to Brands Page
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Brand Settings</h1>
              <p className="text-muted-foreground">
                Manage settings for {locationData?.name} ({locationData?.description})
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
        
        <div className={`grid grid-cols-1 gap-6 ${activeTab === "edit-playlist" ? "md:grid-cols-1" : "md:grid-cols-3"}`}>
          {/* Main controls column */}
          <div className={activeTab === "edit-playlist" ? "col-span-1" : "md:col-span-2"}>
            <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="playlist">Playlist</TabsTrigger>
                <TabsTrigger value="edit-playlist">Edit Playlist</TabsTrigger>
              </TabsList>
              
              {/* General Tab */}
              <TabsContent value="general" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Configure the basic settings for this location</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="location-name">Location Name</Label>
                      <Input
                        id="location-name"
                        value={locationData?.name}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={locationData?.description}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={locationData?.address}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Radio className="h-5 w-5" />
                      Live Streaming
                    </CardTitle>
                    <CardDescription>Control the live streaming settings for this location</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="live-status">Live Status</Label>
                        <p className="text-sm text-muted-foreground">
                          Turn streaming on or off for this location
                        </p>
                      </div>
                      <Switch
                        id="live-status"
                        checked={formData.isLiveOn}
                        onCheckedChange={(checked) => setFormData({...formData, isLiveOn: checked})}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="playlist">Current Playlist</Label>
                      <Select
                        value={formData.playlist}
                        onValueChange={(value) => setFormData({...formData, playlist: value})}
                      >
                        <SelectTrigger id="playlist">
                          <SelectValue placeholder="Select a playlist" />
                        </SelectTrigger>
                        <SelectContent>
                          {playlists.map((playlist) => (
                            <SelectItem key={playlist} value={playlist}>
                              {playlist}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="volume">Volume ({formData.volume}%)</Label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.volume}
                        onChange={(e) => setFormData({...formData, volume: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="mode">Playback Mode</Label>
                      <Select 
                        value={formData.mode}
                        onValueChange={(value) => setFormData({...formData, mode: value})}
                      >
                        <SelectTrigger id="mode">
                          <SelectValue placeholder="Select a mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto (Scheduled)</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Playlist Schedule</CardTitle>
                    <CardDescription>Set up automated playlist changes based on day and time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {locationData?.scheduledPlaylists.map((schedule, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium">{schedule.day}</p>
                            <p className="text-sm text-muted-foreground">{schedule.time}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-4">{schedule.playlist}</span>
                            <Button size="sm" variant="ghost">Edit</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Configuration</CardTitle>
                    <CardDescription>Advanced settings for the MasterFox player at this location</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Device ID</Label>
                      <div className="flex">
                        <Input value={locationData?.masterfoxId} readOnly className="bg-muted" />
                        <Button className="ml-2" variant="outline">Copy</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Firmware</Label>
                      <div className="flex items-center">
                        <span className="text-sm">v2.1.4</span>
                        <Badge className="ml-2 bg-green-500">Up to date</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Network Status</Label>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-green-500">Connected</span>
                        <p className="text-xs text-muted-foreground ml-2">Last checkin: 2 minutes ago</p>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Update Firmware
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Playlist Tab - Live Streaming for Select a brand */}
              <TabsContent value="playlist" className="space-y-4 pt-4">
                <div className="bg-gradient-to-r from-primary/90 to-primary/70 text-white p-6 rounded-xl mb-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-2">Live Streaming for Select a brand</h2>
                  <p className="text-white/90 mb-2">
                    Select your ideal choice of music
                    <span className="ml-2 bg-secondary/90 text-white px-3 py-1 rounded-full text-xs font-medium">USEA Music</span>
                  </p>
                  <p className="text-xs text-white/80">
                    Tip: Search for new music with Pick N Play mode!
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Single Playlist Section */}
                  <Card className="border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-primary/80 via-secondary/60 to-primary/80"></div>
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
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-primary bg-primary/5 px-3 py-1.5 rounded-md inline-flex items-center">
                          Make quick changes here.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="block mb-2 font-medium">Select Playlist</Label>
                          <Select>
                            <SelectTrigger className="bg-primary text-white border-primary">
                              <SelectValue placeholder="Select Playlist" />
                            </SelectTrigger>
                            <SelectContent>
                              {playlists.map((playlist) => (
                                <SelectItem key={playlist} value={playlist}>
                                  {playlist}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="block mb-2 font-medium">Select Genre</Label>
                          <Select>
                            <SelectTrigger className="bg-primary text-white border-primary">
                              <SelectValue placeholder="Select Genre" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="jazz">Jazz</SelectItem>
                              <SelectItem value="pop">Pop</SelectItem>
                              <SelectItem value="classical">Classical</SelectItem>
                              <SelectItem value="ambient">Ambient</SelectItem>
                              <SelectItem value="lofi">Lo-Fi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Master Box Section */}
                  <Card className="border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-secondary/80 via-primary/60 to-secondary/80"></div>
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
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-secondary bg-secondary/5 px-3 py-1.5 rounded-md inline-flex items-center">
                          Duplicate another location Playlist.
                        </p>
                      </div>
                      
                      <div>
                        <Label className="block mb-2 font-medium">Source Location</Label>
                        <Select 
                          value={masterBoxSource}
                          onValueChange={setMasterBoxSource}
                        >
                          <SelectTrigger className="bg-secondary text-white border-secondary">
                            <SelectValue placeholder="Select source location" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands?.filter(b => b.id !== parseInt(locationId!)).map(brand => (
                              <SelectItem key={brand.id} value={brand.id.toString()}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

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
                        Select playlist to play at different times of day.
                      </p>
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
                                    setSelectedTimeSlot({
                                      id: 1,
                                      playlistId: 1,
                                      name: "Instrumental"
                                    });
                                    setTimeSlotSchedulerOpen(true);
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
                                    setSelectedTimeSlot({
                                      id: 2,
                                      playlistId: 2,
                                      name: "English Pop"
                                    });
                                    setTimeSlotSchedulerOpen(true);
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
                                    value={timeSlotSelections["active"]?.[0]?.selected ? "active" : ""}
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
                                    setSelectedTimeSlot({
                                      id: 3,
                                      playlistId: 3,
                                      name: "English Pop"
                                    });
                                    setTimeSlotSchedulerOpen(true);
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

                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={handleUpdate}
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? "Updating..." : "Update"}
                  </Button>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Common playlist management actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="w-full">
                        Create Playlist
                      </Button>
                      <Button variant="outline" className="w-full">
                        Edit Playlist
                      </Button>
                      <Button variant="outline" className="w-full">
                        Duplicate Playlist
                      </Button>
                      <Button variant="outline" className="w-full">
                        Schedule Playlist
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Edit Playlist Tab */}
              <TabsContent value="edit-playlist" className="space-y-4 pt-4">
                {/* Playlist to Edit Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="bg-black text-white px-3 py-2 rounded-md inline-block">
                      <CardTitle className="text-sm font-medium">Playlist to edit</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-[30%]">
                        <Select defaultValue="custom">
                          <SelectTrigger className="bg-[#b91c1c] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="custom">Custom Playlist</SelectItem>
                            <SelectItem value="system">System Playlist</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-[70%]">
                        <Select defaultValue="christmas">
                          <SelectTrigger className="bg-[#b91c1c] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="christmas">(SS) 2021 Christmas (1/1)</SelectItem>
                            <SelectItem value="summer">Summer Hits 2021</SelectItem>
                            <SelectItem value="chill">Chill Vibes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Playlist Order</Label>
                        <RadioGroup defaultValue="sequence" className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sequence" id="sequence" />
                            <Label htmlFor="sequence">Sequence</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="shuffle" id="shuffle" />
                            <Label htmlFor="shuffle">Shuffle</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Auto-Insert V/O?</Label>
                        <RadioGroup defaultValue="yes" className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="auto-yes" />
                            <Label htmlFor="auto-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="auto-no" />
                            <Label htmlFor="auto-no">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" className="bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs px-3 py-1">
                        Save Playlist Sequence
                      </Button>
                      <Button size="sm" className="bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs px-3 py-1">
                        Copy Selected to Playlist
                      </Button>
                      <Button size="sm" className="bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs px-3 py-1">
                        Remove Selected Songs
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      * Click & hold on song entry to change song sequence
                    </p>
                  </CardContent>
                </Card>

                {/* Split-Panel Design */}
                <div className="grid grid-cols-3 gap-6 h-[800px]">
                  {/* Left Panel - Search & Available Songs Combined */}
                  <div className="col-span-2">
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-gray-800">Song Library</CardTitle>
                        <CardDescription>Search and select songs for your playlist</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-hidden space-y-4">
                        {/* Search Filters */}
                        <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-600">SONG TITLE</Label>
                            <Input placeholder="Search..." className="h-8" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-600">GENRE</Label>
                            <Select defaultValue="all">
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Genres</SelectItem>
                                <SelectItem value="pop">Pop</SelectItem>
                                <SelectItem value="rock">Rock</SelectItem>
                                <SelectItem value="jazz">Jazz</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-600">LANGUAGE</Label>
                            <Select defaultValue="all">
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Languages</SelectItem>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="chinese">Chinese</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-600">TYPE</Label>
                            <Select defaultValue="both">
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="both">Both</SelectItem>
                                <SelectItem value="vocal">Vocal</SelectItem>
                                <SelectItem value="instrumental">Instrumental</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-[#b91c1c] hover:bg-[#991b1b] text-white">
                              Search
                            </Button>
                            <Button size="sm" variant="outline">Reset</Button>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Showing 1-10 of 247</span>
                            <Button size="sm" className="bg-[#b91c1c] hover:bg-[#991b1b] text-white">
                              Add Selected
                            </Button>
                          </div>
                        </div>

                        {/* Available Songs Table */}
                        <div className="flex-1 overflow-hidden">
                          <div className="h-full overflow-y-auto">
                            <table className="w-full">
                              <thead className="sticky top-0 bg-gray-50 border-b">
                                <tr className="text-left">
                                  <th className="w-12 p-2">
                                    <Checkbox />
                                  </th>
                                  <th className="w-12 p-2"></th>
                                  <th className="p-2 text-xs font-medium text-gray-600 uppercase">Code</th>
                                  <th className="p-2 text-xs font-medium text-gray-600 uppercase">Title & Genre</th>
                                  <th className="w-20 p-2 text-xs font-medium text-gray-600 uppercase">Duration</th>
                                  <th className="w-16 p-2"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  { id: "I-2933030", title: "Ambient Relaxation", genre: "Ambient, Chillout", duration: "3:24", badge: "New" },
                                  { id: "I-2933031", title: "Jazz Lounge Mix", genre: "Jazz, Rock", duration: "4:12", badge: "New" },
                                  { id: "I-2933032", title: "Folk Hip Hop", genre: "Folk, Hip Hop", duration: "2:58", badge: "New" },
                                  { id: "I-2933033", title: "Eastern Electronica", genre: "Electronic, World", duration: "5:03", badge: "New" },
                                  { id: "I-2933034", title: "Chill Jazz Vibes", genre: "Jazz, Lo-fi", duration: "3:47", badge: "New" },
                                  { id: "I-2933036", title: "Chinese Chill", genre: "Oriental, Lo-fi", duration: "4:21", badge: "New" },
                                  { id: "I-2933040", title: "Alternative Hip Hop", genre: "Alternative, Hip Hop", duration: "3:33", badge: "New" },
                                  { id: "I-2933041", title: "Electronic Folk", genre: "Electronic, Folk", duration: "4:08", badge: "New" },
                                  { id: "I-2933044", title: "Folk Electronic Mix", genre: "Folk, Electronic", duration: "3:52", badge: "New" },
                                  { id: "I-2933048", title: "Hip Hop Electronics", genre: "Hip Hop, Electronic", duration: "4:15", badge: "New" }
                                ].map((song, index) => (
                                  <tr key={song.id} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-25' : 'bg-white'}`}>
                                    <td className="p-2">
                                      <Checkbox />
                                    </td>
                                    <td className="p-2">
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white">
                                        <Play className="h-4 w-4" />
                                      </Button>
                                    </td>
                                    <td className="p-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-gray-600">{song.id}</span>
                                        {song.badge && (
                                          <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                                            {song.badge}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-2">
                                      <div>
                                        <div className="font-medium text-sm text-gray-900">{song.title}</div>
                                        <div className="text-xs text-gray-500">{song.genre}</div>
                                      </div>
                                    </td>
                                    <td className="p-2 text-sm text-gray-600 font-mono">{song.duration}</td>
                                    <td className="p-2">
                                      <Button size="sm" variant="outline" className="h-7 text-xs border-[#b91c1c] text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white">
                                        Add
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm">
                            <span>Rows per page:</span>
                            <Select defaultValue="10">
                              <SelectTrigger className="w-16 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8">Previous</Button>
                            <span className="text-sm">Page 1 of 25</span>
                            <Button variant="outline" size="sm" className="h-8">Next</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Panel - Selected Songs Playlist */}
                  <div className="col-span-1">
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold text-gray-800">Playlist</CardTitle>
                          <div className="text-sm text-gray-600">12 songs</div>
                        </div>
                        <CardDescription>Drag to reorder songs</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-hidden">
                        <div className="h-full overflow-y-auto">
                          <div className="space-y-1">
                            {[
                              { id: "EN-1007203", title: "Christmas Jazz Big Band", sequence: 1 },
                              { id: "EN-535601", title: "Christmas Pop R&B", sequence: 2 },
                              { id: "EN-243733", title: "Pop Classic", sequence: 3 },
                              { id: "EN-1007207", title: "Christmas Jazz", sequence: 4 },
                              { id: "EN-535496", title: "Electronic Christmas", sequence: 5 },
                              { id: "CH-73494", title: "Dance Fashion Pop", sequence: 6 },
                              { id: "EN-535612", title: "Christmas Soul", sequence: 7 },
                              { id: "EN-482549", title: "Christmas R&B", sequence: 8 },
                              { id: "I-189062", title: "Acoustic Tropical", sequence: 10 },
                              { id: "EN-457395", title: "Christmas Pop", sequence: 12 },
                              { id: "EN-228046", title: "Acoustic Pop", sequence: 13 },
                              { id: "EN-958375", title: "Festive Christmas", sequence: 14 }
                            ].map((song, index) => (
                              <div key={song.id} className={`group flex items-center gap-2 p-2 rounded hover:bg-gray-50 border-l-4 ${index % 2 === 0 ? 'border-l-[#b91c1c]' : 'border-l-gray-300'}`}>
                                <div className="w-6 h-6 bg-gray-100 rounded text-xs flex items-center justify-center font-mono text-gray-600">
                                  {song.sequence}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">{song.title}</div>
                                  <div className="text-xs text-gray-500 font-mono">{song.id}</div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-[#b91c1c]">
                                    <Play className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600">
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                            Clear All Songs
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Status column - Hide for Edit Playlist tab */}
          {activeTab !== "edit-playlist" && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Now Playing</CardTitle>
                <CardDescription>Current streaming status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                  <div className="text-center">
                    {formData.isLiveOn ? (
                      <>
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                          <Pause className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-medium">Now Playing</h3>
                        <p className="text-sm text-muted-foreground">From "{formData.playlist}"</p>
                      </>
                    ) : (
                      <>
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted-foreground/20 mb-4">
                          <Play className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium">Streaming Paused</h3>
                        <p className="text-sm text-muted-foreground">Click to resume</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">STATUS</Label>
                    <p className={cn(
                      "font-medium flex items-center",
                      formData.isLiveOn ? "text-green-500" : "text-amber-500"
                    )}>
                      <span className={cn(
                        "h-2 w-2 rounded-full mr-2", 
                        formData.isLiveOn ? "bg-green-500" : "bg-amber-500",
                        formData.isLiveOn ? "animate-pulse" : ""
                      )} />
                      {formData.isLiveOn ? "Streaming" : "Paused"}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">LOCATION</Label>
                    <p className="font-medium">{locationData?.description}</p>
                    <p className="text-xs text-muted-foreground">{locationData?.address}</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">DEVICE</Label>
                    <p className="font-medium">{locationData?.masterfoxId}</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">VOLUME</Label>
                    <p className="font-medium">{formData.volume}%</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  variant={formData.isLiveOn ? "destructive" : "default"}
                  onClick={() => setFormData({...formData, isLiveOn: !formData.isLiveOn})}
                >
                  {formData.isLiveOn ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Streaming
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Streaming
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
          )}
        </div>

        {/* Time Slot Scheduler Modal */}
        {timeSlotSchedulerOpen && selectedTimeSlot && (
          <TimeSlotScheduler
            open={timeSlotSchedulerOpen}
            onClose={() => setTimeSlotSchedulerOpen(false)}
            brandId={parseInt(locationId!)}
            playlistId={selectedTimeSlot.playlistId}
            playlistName={selectedTimeSlot.name}
            timeSlotId={selectedTimeSlot.id}
          />
        )}
      </div>
    </DashboardLayout>
  );
}