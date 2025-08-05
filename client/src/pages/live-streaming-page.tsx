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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useRoute, useLocation } from "wouter";
import { Loader2, ArrowLeft, Save, Play, Pause, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LiveStreamingPage() {
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
  
  // Handle save changes
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Changes saved",
        description: "Your streaming settings have been updated.",
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
              <h1 className="text-2xl font-bold tracking-tight">Streaming Controls</h1>
              <p className="text-muted-foreground">
                Manage live streaming for {locationData?.name} ({locationData?.description})
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main controls column */}
          <div className="md:col-span-2">
            <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              {/* General Tab */}
              <TabsContent value="general" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Streaming</CardTitle>
                    <CardDescription>Control the basic streaming settings for this location</CardDescription>
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
            </Tabs>
          </div>
          
          {/* Status column */}
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
                      Resume Streaming
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Badge component for status indicators
const Badge = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};