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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useRoute, useLocation } from "wouter";
import { Loader2, ArrowLeft, Save, Play, Pause, UploadCloud, Radio, Music, Clock, ChevronDown, X, Plus, Search, Filter, Shuffle, Trash2, ChevronLeft, ChevronRight, ListMusic, GripVertical, Edit, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Brand, Playlist, TimeSlot } from "@shared/schema";
import { TimeSlotScheduler } from "@/components/playlist/time-slot-scheduler";

export default function BrandEditPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Get the locationId from the URL - handle both URL patterns
  const [match1, params1] = useRoute("/brands/edit/:locationId");
  const [match2, params2] = useRoute("/brands/:locationId/edit");
  
  const locationId = match1 ? params1.locationId : 
                    match2 ? params2.locationId : null;

  // Edit Playlist state management
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [editPlaylistType, setEditPlaylistType] = useState<"custom" | "system">("custom");
  const [selectedPlaylistName, setSelectedPlaylistName] = useState("christmas");
  const [currentPlaylist, setCurrentPlaylist] = useState([
    { id: "EN-1007203", title: "Christmas Jazz Big Band", sequence: 1, duration: "4:23" },
    { id: "EN-535601", title: "Christmas Pop R&B", sequence: 2, duration: "3:45" },
    { id: "EN-243733", title: "Pop Classic", sequence: 3, duration: "3:12" },
    { id: "EN-1007207", title: "Christmas Jazz", sequence: 4, duration: "4:08" },
    { id: "EN-535496", title: "Electronic Christmas", sequence: 5, duration: "3:33" },
    { id: "CH-73494", title: "Dance Fashion Pop", sequence: 6, duration: "2:58" },
    { id: "EN-535612", title: "Christmas Soul", sequence: 7, duration: "4:15" },
    { id: "EN-482549", title: "Christmas R&B", sequence: 8, duration: "3:27" },
    { id: "I-189062", title: "Acoustic Tropical", sequence: 9, duration: "4:42" },
    { id: "EN-457395", title: "Christmas Pop", sequence: 10, duration: "3:18" },
    { id: "EN-228046", title: "Acoustic Pop", sequence: 11, duration: "3:56" },
    { id: "EN-958375", title: "Festive Christmas", sequence: 12, duration: "4:01" }
  ]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all-genres");
  const [selectedLanguage, setSelectedLanguage] = useState("all-languages");
  const [selectedType, setSelectedType] = useState("all-types");
  const [playbackOrder, setPlaybackOrder] = useState("sequence");
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  // System playlists (read-only, curated)
  const systemPlaylists = {
    "chill-vibes": {
      name: "System Playlist - Chill Vibes",
      songs: [
        { id: "SYS-001", title: "Chill Ambient Morning", sequence: 1, duration: "4:15", isSystem: true },
        { id: "SYS-002", title: "Relaxing Jazz Afternoon", sequence: 2, duration: "3:42", isSystem: true },
        { id: "SYS-003", title: "Smooth Electronic Vibes", sequence: 3, duration: "5:12", isSystem: true },
        { id: "SYS-004", title: "Acoustic Sunset", sequence: 4, duration: "4:33", isSystem: true },
        { id: "SYS-005", title: "Gentle Piano Melodies", sequence: 5, duration: "3:58", isSystem: true },
        { id: "SYS-006", title: "Lo-fi Study Session", sequence: 6, duration: "4:21", isSystem: true },
        { id: "SYS-007", title: "Ambient Workspace", sequence: 7, duration: "3:47", isSystem: true },
        { id: "SYS-008", title: "Nature Sounds Mix", sequence: 8, duration: "6:15", isSystem: true }
      ]
    },
    "energetic-mix": {
      name: "System Playlist - Energetic Mix",
      songs: [
        { id: "SYS-101", title: "High Energy Pop", sequence: 1, duration: "3:22", isSystem: true },
        { id: "SYS-102", title: "Upbeat Electronic", sequence: 2, duration: "4:05", isSystem: true },
        { id: "SYS-103", title: "Dance Floor Anthem", sequence: 3, duration: "3:48", isSystem: true },
        { id: "SYS-104", title: "Rock Revival", sequence: 4, duration: "4:12", isSystem: true },
        { id: "SYS-105", title: "Hip Hop Energy", sequence: 5, duration: "3:55", isSystem: true }
      ]
    }
  };
  
  // Quick Actions state
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [copyToPlaylistOpen, setCopyToPlaylistOpen] = useState(false);
  const [selectedTargetPlaylist, setSelectedTargetPlaylist] = useState("");

  // Demo song library
  const allSongs = [
    { id: "I-2933030", title: "Ambient Relaxation", genre: "Ambient, Chillout", duration: "3:24", isNew: true, language: "instrumental", type: "instrumental" },
    { id: "I-2933031", title: "Jazz Lounge Mix", genre: "Jazz, Rock", duration: "4:12", isNew: true, language: "instrumental", type: "instrumental" },
    { id: "I-2933032", title: "Folk Hip Hop", genre: "Folk, Hip Hop", duration: "2:58", isNew: false, language: "english", type: "vocal" },
    { id: "I-2933033", title: "Eastern Electronica", genre: "Electronic, World", duration: "5:03", isNew: true, language: "instrumental", type: "instrumental" },
    { id: "I-2933034", title: "Chill Jazz Vibes", genre: "Jazz, Lo-fi", duration: "3:47", isNew: false, language: "instrumental", type: "instrumental" },
    { id: "I-2933036", title: "Chinese Chill", genre: "Oriental, Lo-fi", duration: "4:21", isNew: true, language: "chinese", type: "vocal" },
    { id: "I-2933040", title: "Alternative Hip Hop", genre: "Alternative, Hip Hop", duration: "3:33", isNew: false, language: "english", type: "vocal" },
    { id: "I-2933041", title: "Electronic Folk", genre: "Electronic, Folk", duration: "4:08", isNew: true, language: "english", type: "vocal" },
    { id: "I-2933044", title: "Folk Electronic Mix", genre: "Folk, Electronic", duration: "3:52", isNew: false, language: "instrumental", type: "instrumental" },
    { id: "I-2933048", title: "Hip Hop Electronics", genre: "Hip Hop, Electronic", duration: "4:15", isNew: true, language: "english", type: "vocal" },
    { id: "I-2933050", title: "Classical Crossover", genre: "Classical, Modern", duration: "6:12", isNew: false, language: "instrumental", type: "instrumental" },
    { id: "I-2933052", title: "Ambient World", genre: "Ambient, World", duration: "4:33", isNew: true, language: "instrumental", type: "instrumental" },
    { id: "EN-892345", title: "Summer Breeze", genre: "Pop, Acoustic", duration: "3:28", isNew: false, language: "english", type: "vocal" },
    { id: "CH-445566", title: "Morning Tea", genre: "Traditional, Chinese", duration: "2:45", isNew: true, language: "chinese", type: "vocal" },
    { id: "I-773421", title: "Midnight Drive", genre: "Electronic, Synthwave", duration: "5:22", isNew: false, language: "instrumental", type: "instrumental" }
  ];

  // Filter songs based on search and filters
  const filteredSongs = allSongs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "all-genres" || song.genre.toLowerCase().includes(selectedGenre);
    const matchesLanguage = selectedLanguage === "all-languages" || song.language === selectedLanguage;
    const matchesType = selectedType === "all-types" || song.type === selectedType;
    
    return matchesSearch && matchesGenre && matchesLanguage && matchesType;
  });

  // Song management functions
  const toggleSongSelection = (songId: string) => {
    const newSelected = new Set(selectedSongs);
    if (newSelected.has(songId)) {
      newSelected.delete(songId);
    } else {
      newSelected.add(songId);
    }
    setSelectedSongs(newSelected);
  };

  const addSongToPlaylist = (song: any) => {
    const isAlreadyInPlaylist = currentPlaylist.some(p => p.id === song.id);
    if (!isAlreadyInPlaylist) {
      const newSong = {
        ...song,
        sequence: Math.max(...currentPlaylist.map(p => p.sequence), 0) + 1
      };
      setCurrentPlaylist([...currentPlaylist, newSong]);
      toast({
        title: "Song Added",
        description: `"${song.title}" added to playlist`,
      });
    } else {
      toast({
        title: "Already in Playlist",
        description: `"${song.title}" is already in the playlist`,
        variant: "destructive",
      });
    }
  };

  const removeSongFromPlaylist = (songId: string) => {
    const updatedPlaylist = currentPlaylist
      .filter(song => song.id !== songId)
      .map((song, index) => ({ ...song, sequence: index + 1 }));
    setCurrentPlaylist(updatedPlaylist);
    toast({
      title: "Song Removed",
      description: "Song removed from playlist",
    });
  };

  const addSelectedSongs = () => {
    const songsToAdd = allSongs.filter(song => selectedSongs.has(song.id));
    let addedCount = 0;
    
    songsToAdd.forEach(song => {
      const isAlreadyInPlaylist = currentPlaylist.some(p => p.id === song.id);
      if (!isAlreadyInPlaylist) {
        addedCount++;
      }
    });

    if (addedCount > 0) {
      const newPlaylist = [...currentPlaylist];
      songsToAdd.forEach(song => {
        const isAlreadyInPlaylist = newPlaylist.some(p => p.id === song.id);
        if (!isAlreadyInPlaylist) {
          newPlaylist.push({
            ...song,
            sequence: Math.max(...newPlaylist.map(p => p.sequence), 0) + 1
          });
        }
      });
      setCurrentPlaylist(newPlaylist);
      setSelectedSongs(new Set());
      toast({
        title: "Songs Added",
        description: `${addedCount} song(s) added to playlist`,
      });
    } else {
      toast({
        title: "No New Songs",
        description: "Selected songs are already in the playlist",
        variant: "destructive",
      });
    }
  };

  const clearPlaylist = () => {
    setCurrentPlaylist([]);
    toast({
      title: "Playlist Cleared",
      description: "All songs removed from playlist",
    });
  };

  const playPreview = (songId: string) => {
    if (currentlyPlaying === songId) {
      setCurrentlyPlaying(null);
      toast({
        title: "Preview Stopped",
        description: "Song preview stopped",
      });
    } else {
      setCurrentlyPlaying(songId);
      toast({
        title: "Playing Preview",
        description: "30-second preview started",
      });
      // Auto-stop after 30 seconds
      setTimeout(() => {
        setCurrentlyPlaying(null);
      }, 30000);
    }
  };

  const selectAllSongs = () => {
    if (selectedSongs.size === filteredSongs.length) {
      setSelectedSongs(new Set());
    } else {
      setSelectedSongs(new Set(filteredSongs.map(song => song.id)));
    }
  };

  const calculateTotalDuration = () => {
    const totalSeconds = currentPlaylist.reduce((total, song) => {
      const [minutes, seconds] = song.duration.split(':').map(Number);
      return total + (minutes * 60) + seconds;
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
    }
  };

  const calculateAverageDuration = () => {
    if (currentPlaylist.length === 0) return "0:00";
    
    const totalSeconds = currentPlaylist.reduce((total, song) => {
      const [minutes, seconds] = song.duration.split(':').map(Number);
      return total + (minutes * 60) + seconds;
    }, 0);
    
    const avgSeconds = Math.floor(totalSeconds / currentPlaylist.length);
    const minutes = Math.floor(avgSeconds / 60);
    const seconds = avgSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Drag and drop functions
  const handleDragStart = (e: React.DragEvent, songId: string) => {
    setDraggedItem(songId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSongId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetSongId) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = currentPlaylist.findIndex(song => song.id === draggedItem);
    const targetIndex = currentPlaylist.findIndex(song => song.id === targetSongId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    const newPlaylist = [...currentPlaylist];
    const [draggedSong] = newPlaylist.splice(draggedIndex, 1);
    newPlaylist.splice(targetIndex, 0, draggedSong);
    
    // Resequence all songs
    const resequencedPlaylist = newPlaylist.map((song, index) => ({
      ...song,
      sequence: index + 1
    }));
    
    setCurrentPlaylist(resequencedPlaylist);
    setDraggedItem(null);
    
    toast({
      title: "Song Reordered",
      description: `"${draggedSong.title}" moved to position ${targetIndex + 1}`,
    });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Quick Actions functions
  const handleCreateNewPlaylist = () => {
    if (newPlaylistName.trim()) {
      // In a real app, this would call an API to create the playlist
      toast({
        title: "Playlist Created",
        description: `"${newPlaylistName}" playlist created successfully`,
      });
      setNewPlaylistName("");
      setCreatePlaylistOpen(false);
      // Switch to Edit Playlist tab to start adding songs
      setActiveTab('edit-playlist');
    }
  };

  const handleDuplicatePlaylist = () => {
    if (currentPlaylist.length > 0) {
      // Create a copy of the current playlist with new IDs
      const duplicatedPlaylist = currentPlaylist.map((song, index) => ({
        ...song,
        sequence: index + 1
      }));
      
      // In a real app, this would save the duplicated playlist
      toast({
        title: "Playlist Duplicated",
        description: `Playlist duplicated with ${duplicatedPlaylist.length} songs`,
      });
    } else {
      toast({
        title: "No Playlist to Duplicate",
        description: "Please create a playlist first before duplicating",
        variant: "destructive",
      });
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  
  // Get tab from URL parameters and set initial tab
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || "general";
  const [activeTab, setActiveTab] = useState(initialTab);
  
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="h-10 w-10 sm:h-8 sm:w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Brand Settings</h1>
              <p className="text-muted-foreground text-sm">
                Manage settings for {locationData?.name} ({locationData?.description})
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleSave} disabled={isLoading} className="border-[#b91c1c] text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white w-fit">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
        
        <div className={`${activeTab === "playlist" || activeTab === "edit-playlist" ? "w-full" : "grid grid-cols-1 gap-4 md:grid-cols-3"}`}>
          {/* Main controls column */}
          <div className={activeTab === "edit-playlist" ? "col-span-1" : activeTab === "playlist" ? "w-full" : "md:col-span-2"}>
            <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
              <div className="mb-2 flex justify-start">
                <TabsList className="h-auto p-1 bg-muted rounded-lg flex justify-start overflow-x-auto scrollbar-hide w-fit min-w-0">
                  <TabsTrigger value="general" className="flex-shrink-0 min-w-fit px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">General</TabsTrigger>
                  <TabsTrigger value="schedule" className="flex-shrink-0 min-w-fit px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">Schedule</TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-shrink-0 min-w-fit px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">Advanced</TabsTrigger>
                  <TabsTrigger value="playlist" className="flex-shrink-0 min-w-fit px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">Play Mode</TabsTrigger>
                  <TabsTrigger value="edit-playlist" className="flex-shrink-0 min-w-fit px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">Edit Playlist</TabsTrigger>
                </TabsList>
              </div>
              
              {/* General Tab */}
              <TabsContent value="general" className="space-y-3 pt-2">
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

                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-3 pt-2">
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
                            <div className="text-sm">
                              <div className="font-medium">
                                {schedule.playlist === "Contemporary Jazz" ? "Custom Playlist" : "System Playlist"}
                              </div>
                              <div className="text-muted-foreground">
                                {schedule.playlist === "Contemporary Jazz" ? "(SS) Contemporary Jazz Collection (1/1)" : schedule.playlist}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-3 pt-2">
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
              <TabsContent value="playlist" className="space-y-4 pt-2">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Single Playlist Section */}
                  <Card className="border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-primary/80 via-secondary/60 to-primary/80"></div>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center mb-3">
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
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-primary bg-primary/5 px-2 py-1 rounded-md inline-flex items-center">
                          Make quick changes here.
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label className="block mb-1 font-medium text-sm">Playlist Type</Label>
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
                          <Label className="block mb-1 font-medium text-sm">Select Playlist</Label>
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
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center mb-3">
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
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-secondary bg-secondary/5 px-2 py-1 rounded-md inline-flex items-center">
                          Duplicate another location Playlist.
                        </p>
                      </div>
                      
                      <div>
                        <Label className="block mb-1 font-medium text-sm">Source Location</Label>
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
                <Card className="md:col-span-2 border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary/80 via-secondary/60 to-primary/80"></div>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center mb-3">
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
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-primary bg-primary/5 px-2 py-1 rounded-md inline-flex items-center">
                        Select playlist to play at different times of day.
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-primary/5">
                            <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase tracking-wider w-[30%]">Playlist Type</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase tracking-wider w-[60%]">Select Playlist</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-primary uppercase tracking-wider w-[10%]">Schedule</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2">
                              <div className="w-full">
                                <Select
                                  value={timeSlotSelections.instrumental?.[0]?.selected ? "instrumental" : "custom-playlist"}
                                  onValueChange={(value) => 
                                    handleTimeSlotCheckboxChange("instrumental", value, value === "instrumental")
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Custom Playlist" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="custom-playlist">Custom Playlist</SelectItem>
                                    <SelectItem value="instrumental">Instrumental</SelectItem>
                                    <SelectItem value="english-pop-1">English Pop</SelectItem>
                                    <SelectItem value="english-pop-2">English Pop</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="w-full">
                                <Select
                                  value={timeSlotSelections["pop-vocal"]?.[0]?.selected ? "pop-vocal" : ""}
                                  onValueChange={(value) => 
                                    handleTimeSlotCheckboxChange("pop-vocal", value, value === "pop-vocal")
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Playlist" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pop-vocal">Pop Vocal</SelectItem>
                                    <SelectItem value="hip-hop">Hip Hop</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
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
                                className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                              >
                                <Clock className="text-primary h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2">
                              <div className="w-full">
                                <Select
                                  value={timeSlotSelections["english-pop-1"]?.[0]?.selected ? "english-pop-1" : "custom-playlist"}
                                  onValueChange={(value) => 
                                    handleTimeSlotCheckboxChange("english-pop-1", value, value === "english-pop-1")
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Custom Playlist" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="custom-playlist">Custom Playlist</SelectItem>
                                    <SelectItem value="instrumental">Instrumental</SelectItem>
                                    <SelectItem value="english-pop-1">English Pop</SelectItem>
                                    <SelectItem value="english-pop-2">English Pop</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="w-full">
                                <Select
                                  value={timeSlotSelections["hip-hop"]?.[0]?.selected ? "hip-hop" : ""}
                                  onValueChange={(value) => 
                                    handleTimeSlotCheckboxChange("hip-hop", value, value === "hip-hop")
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Playlist" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pop-vocal">Pop Vocal</SelectItem>
                                    <SelectItem value="hip-hop">Hip Hop</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
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
                                className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                              >
                                <Clock className="text-primary h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2">
                              <div className="w-full">
                                <Select
                                  value={timeSlotSelections["english-pop-2"]?.[0]?.selected ? "english-pop-2" : "custom-playlist"}
                                  onValueChange={(value) => 
                                    handleTimeSlotCheckboxChange("english-pop-2", value, value === "english-pop-2")
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Custom Playlist" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="custom-playlist">Custom Playlist</SelectItem>
                                    <SelectItem value="instrumental">Instrumental</SelectItem>
                                    <SelectItem value="english-pop-1">English Pop</SelectItem>
                                    <SelectItem value="english-pop-2">English Pop</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="w-full">
                                <Select
                                  value={timeSlotSelections["active"]?.[0]?.selected ? "active" : ""}
                                  onValueChange={(value) => 
                                    handleTimeSlotCheckboxChange("active", value, value === "active")
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Playlist" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pop-vocal">Pop Vocal</SelectItem>
                                    <SelectItem value="hip-hop">Hip Hop</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
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
                                className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                              >
                                <Clock className="text-primary h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2">
                              <div className="w-full">
                                <Select
                                  value=""
                                  onValueChange={(value) => 
                                    handleTimeSlotCheckboxChange("slot-4", value, value !== "")
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Custom Playlist" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="custom-playlist">Custom Playlist</SelectItem>
                                    <SelectItem value="instrumental">Instrumental</SelectItem>
                                    <SelectItem value="english-pop-1">English Pop</SelectItem>
                                    <SelectItem value="english-pop-2">English Pop</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="w-full">
                                <Select
                                  value=""
                                  onValueChange={(value) => 
                                    handleTimeSlotCheckboxChange("slot-4-time", value, value !== "")
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Playlist" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pop-vocal">Pop Vocal</SelectItem>
                                    <SelectItem value="hip-hop">Hip Hop</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedTimeSlot({
                                    id: 4,
                                    playlistId: 4,
                                    name: "Time Slot 4"
                                  });
                                  setTimeSlotSchedulerOpen(true);
                                }}
                                className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                              >
                                <Clock className="text-primary h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2">
                              <div className="w-full">
                                <Select
                                  value=""
                                  onValueChange={(value) => 
                                    handleTimeSlotCheckboxChange("slot-5", value, value !== "")
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Custom Playlist" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="custom-playlist">Custom Playlist</SelectItem>
                                    <SelectItem value="instrumental">Instrumental</SelectItem>
                                    <SelectItem value="english-pop-1">English Pop</SelectItem>
                                    <SelectItem value="english-pop-2">English Pop</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="w-full">
                                <Select
                                  value=""
                                  onValueChange={(value) => 
                                    handleTimeSlotCheckboxChange("slot-5-time", value, value !== "")
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Playlist" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pop-vocal">Pop Vocal</SelectItem>
                                    <SelectItem value="hip-hop">Hip Hop</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedTimeSlot({
                                    id: 5,
                                    playlistId: 5,
                                    name: "Time Slot 5"
                                  });
                                  setTimeSlotSchedulerOpen(true);
                                }}
                                className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                              >
                                <Clock className="text-primary h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

              </TabsContent>

              {/* Edit Playlist Tab */}
              <TabsContent value="edit-playlist" className="space-y-4 pt-2">
                {/* Compact Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Edit Playlist</h2>
                    <p className="text-gray-600 text-sm">Manage your playlist content and settings</p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={createPlaylistOpen} onOpenChange={setCreatePlaylistOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-[#b91c1c] hover:bg-[#991b1b] text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom Playlist
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Create New Playlist</DialogTitle>
                          <DialogDescription>
                            Enter a name for your new playlist. You can add songs after creation.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="playlist-name" className="text-right">
                              Name
                            </Label>
                            <Input
                              id="playlist-name"
                              value={newPlaylistName}
                              onChange={(e) => setNewPlaylistName(e.target.value)}
                              className="col-span-3"
                              placeholder="Enter playlist name..."
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleCreateNewPlaylist();
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setCreatePlaylistOpen(false);
                              setNewPlaylistName("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleCreateNewPlaylist}
                            disabled={!newPlaylistName.trim()}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Create Playlist
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Copy to Playlist Dialog */}
                    <Dialog open={copyToPlaylistOpen} onOpenChange={setCopyToPlaylistOpen}>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Copy to Custom Playlist</DialogTitle>
                          <DialogDescription>
                            Select which custom playlist to copy the {selectedSongs.size} selected songs to.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="target-playlist" className="text-right">
                              Playlist
                            </Label>
                            <Select value={selectedTargetPlaylist} onValueChange={setSelectedTargetPlaylist}>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select custom playlist..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="christmas">(SS) 2021 Christmas (1/1)</SelectItem>
                                <SelectItem value="summer">Summer Hits 2021</SelectItem>
                                <SelectItem value="jazz">Jazz Collection</SelectItem>
                                <SelectItem value="pop">Pop Favorites</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setCopyToPlaylistOpen(false);
                              setSelectedTargetPlaylist("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => {
                              if (selectedTargetPlaylist) {
                                const selectedSystemSongs = systemPlaylists[selectedPlaylistName as keyof typeof systemPlaylists]?.songs.filter(song => selectedSongs.has(song.id));
                                if (selectedSystemSongs && selectedSystemSongs.length > 0) {
                                  toast({
                                    title: "Songs Copied",
                                    description: `${selectedSystemSongs.length} songs copied to ${selectedTargetPlaylist}`,
                                  });
                                  setSelectedSongs(new Set());
                                  setCopyToPlaylistOpen(false);
                                  setSelectedTargetPlaylist("");
                                }
                              }
                            }}
                            disabled={!selectedTargetPlaylist}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Copy Songs
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Compact Playlist Configuration */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Playlist Configuration</CardTitle>
                    <CardDescription className="text-sm">Select and configure your playlist settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Playlist Selection */}
                    <div className="flex gap-6">
                      <div className="w-[30%] space-y-3">
                        <Label className="text-sm font-medium">Playlist Type</Label>
                        <Select 
                          value={editPlaylistType} 
                          onValueChange={(value: "custom" | "system") => {
                            setEditPlaylistType(value);
                            if (value === "system") {
                              setSelectedPlaylistName("chill-vibes");
                            } else {
                              setSelectedPlaylistName("christmas");
                            }
                          }}
                        >
                          <SelectTrigger className="bg-[#b91c1c] text-white border-[#b91c1c]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="custom">Custom Playlist</SelectItem>
                            <SelectItem value="system">System Playlist</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-[70%] space-y-3">
                        <Label className="text-sm font-medium">Select Playlist</Label>
                        <Select 
                          value={selectedPlaylistName} 
                          onValueChange={setSelectedPlaylistName}
                        >
                          <SelectTrigger className="bg-[#b91c1c] text-white border-[#b91c1c]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {editPlaylistType === "custom" ? (
                              <>
                                <SelectItem value="christmas">(SS) 2021 Christmas (1/1)</SelectItem>
                                <SelectItem value="summer">Summer Hits 2021</SelectItem>
                                <SelectItem value="jazz">Jazz Collection</SelectItem>
                                <SelectItem value="pop">Pop Favorites</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="chill-vibes">Chill Vibes</SelectItem>
                                <SelectItem value="energetic-mix">Energetic Mix</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Playlist Settings - Compact Layout */}
                    <div className="flex gap-8 items-center">
                      <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium">Playlist Order:</Label>
                        <RadioGroup value={playbackOrder} onValueChange={setPlaybackOrder} className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sequence" id="sequence" />
                            <Label htmlFor="sequence" className="cursor-pointer text-sm">Sequence</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="shuffle" id="shuffle" />
                            <Label htmlFor="shuffle" className="cursor-pointer text-sm">Shuffle</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium">Auto Insert V/O?:</Label>
                        <RadioGroup defaultValue="yes" className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="vo-yes" />
                            <Label htmlFor="vo-yes" className="cursor-pointer text-sm">Enabled</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="vo-no" />
                            <Label htmlFor="vo-no" className="cursor-pointer text-sm">Disabled</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </CardContent>
                </Card>


                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-3 lg:gap-4 min-h-[400px] lg:min-h-[600px]">
                  {/* Song Library - 6 columns (60%) on large screens, full width on mobile */}
                  <div className="lg:col-span-6">
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Song Library</CardTitle>
                            <CardDescription className="text-sm">Browse and add songs to your playlist</CardDescription>
                          </div>
                          <div className="text-sm text-gray-500">
                            {allSongs.length} songs available
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Compact Search Bar */}
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="Search by title, artist, or code..." 
                            className="pl-10 h-9 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>

                        {/* Compact Filter Controls */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg">
                          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Genre" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all-genres">All Genres</SelectItem>
                              <SelectItem value="pop">Pop</SelectItem>
                              <SelectItem value="rock">Rock</SelectItem>
                              <SelectItem value="jazz">Jazz</SelectItem>
                              <SelectItem value="electronic">Electronic</SelectItem>
                              <SelectItem value="folk">Folk</SelectItem>
                              <SelectItem value="hip hop">Hip Hop</SelectItem>
                              <SelectItem value="ambient">Ambient</SelectItem>
                              <SelectItem value="classical">Classical</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all-languages">All Languages</SelectItem>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="chinese">Chinese</SelectItem>
                              <SelectItem value="instrumental">Instrumental</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all-types">All Types</SelectItem>
                              <SelectItem value="vocal">Vocal</SelectItem>
                              <SelectItem value="instrumental">Instrumental</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button 
                            size="sm"
                            className="h-7 bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs px-2"
                            onClick={() => {
                              setSearchTerm("");
                              setSelectedGenre("all-genres");
                              setSelectedLanguage("all-languages");
                              setSelectedType("all-types");
                              toast({
                                title: "Filters Reset",
                                description: "All filters have been cleared",
                              });
                            }}
                          >
                            <Filter className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                        </div>

                        {/* Compact Action Bar */}
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              id="select-all" 
                              checked={selectedSongs.size === filteredSongs.length && filteredSongs.length > 0}
                              onCheckedChange={selectAllSongs}
                            />
                            <Label htmlFor="select-all" className="text-xs cursor-pointer">Select All</Label>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-[#b91c1c] border-[#b91c1c] hover:bg-[#b91c1c] hover:text-white h-7 text-xs"
                              onClick={addSelectedSongs}
                              disabled={selectedSongs.size === 0}
                            >
                              Add Selected ({selectedSongs.size})
                            </Button>
                          </div>
                          <div className="text-xs text-gray-600">
                            Showing {filteredSongs.length} of {allSongs.length}
                          </div>
                        </div>

                        {/* Compact Songs Grid */}
                        <div className="space-y-1 max-h-[380px] overflow-y-auto">
                          {filteredSongs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                              <Music className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg font-medium">No songs found</p>
                              <p className="text-sm">Try adjusting your search or filters</p>
                            </div>
                          ) : (
                            filteredSongs.map((song, index) => (
                              <div key={song.id} className="group flex items-center gap-3 p-2 rounded border hover:bg-blue-50 hover:border-blue-200 transition-all">
                                <Checkbox 
                                  checked={selectedSongs.has(song.id)}
                                  onCheckedChange={() => toggleSongSelection(song.id)}
                                />
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className={cn(
                                    "h-7 w-7 p-0 transition-all",
                                    currentlyPlaying === song.id 
                                      ? "bg-[#b91c1c] text-white" 
                                      : "text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white"
                                  )}
                                  onClick={() => playPreview(song.id)}
                                >
                                  {currentlyPlaying === song.id ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                </Button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 mb-1">
                                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                      {song.id}
                                    </span>
                                    {song.isNew && (
                                      <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                        New
                                      </span>
                                    )}
                                    {currentlyPlaying === song.id && (
                                      <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse">
                                        Playing
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-medium text-sm text-gray-900">{song.title}</h4>
                                  <p className="text-xs text-gray-500">{song.genre}</p>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono text-xs text-gray-600">{song.duration}</div>
                                  <Button 
                                    size="sm" 
                                    className="mt-1 h-6 text-xs bg-[#b91c1c] hover:bg-[#991b1b] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => addSongToPlaylist(song)}
                                    disabled={currentPlaylist.some(p => p.id === song.id)}
                                  >
                                    {currentPlaylist.some(p => p.id === song.id) ? "Added" : "Add"}
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Compact Pagination */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2 text-xs">
                            <span>Show:</span>
                            <Select defaultValue="20">
                              <SelectTrigger className="w-16 h-6 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                              <ChevronLeft className="h-3 w-3" />
                            </Button>
                            <span className="text-xs px-2">1 of 21</span>
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Current Playlist - 4 columns (40%) on large screens, full width on mobile */}
                  <div className="lg:col-span-4">
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {editPlaylistType === "system" ? 
                              (systemPlaylists[selectedPlaylistName as keyof typeof systemPlaylists]?.name || "System Playlist") :
                              "Current Playlist"
                            }
                          </CardTitle>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {editPlaylistType === "system" ? 
                              50 :
                              currentPlaylist.length
                            } songs
                          </span>
                        </div>
                        <CardDescription className="text-sm">
                          {editPlaylistType === "system" ? 
                            "Read-only system playlist • Check songs to copy to custom playlist" :
                            "Drag to reorder • Click to remove"
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Compact Playlist Actions */}
                        <div className="flex justify-center">
                          {editPlaylistType === "custom" ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs"
                              onClick={clearPlaylist}
                              disabled={currentPlaylist.length === 0}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Clear All
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 h-7 text-xs"
                              onClick={() => setCopyToPlaylistOpen(true)}
                              disabled={selectedSongs.size === 0}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Selected ({selectedSongs.size})
                            </Button>
                          )}
                        </div>

                        {/* Compact Playlist Songs */}
                        <div className="space-y-1 max-h-[420px] overflow-y-auto">
                          {editPlaylistType === "system" ? (
                            // System Playlist Display (Read-only with checkboxes)
                            systemPlaylists[selectedPlaylistName as keyof typeof systemPlaylists]?.songs.length === 0 ? (
                              <div className="text-center py-12 text-gray-500">
                                <ListMusic className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">System playlist not found</p>
                                <p className="text-sm">Please select a valid system playlist</p>
                              </div>
                            ) : (
                              systemPlaylists[selectedPlaylistName as keyof typeof systemPlaylists]?.songs.map((song, index) => (
                                <div 
                                  key={song.id} 
                                  className="group flex items-center gap-2 p-2 rounded border-l-4 border-l-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                  <Checkbox 
                                    checked={selectedSongs.has(song.id)}
                                    onCheckedChange={() => toggleSongSelection(song.id)}
                                  />
                                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                    {song.sequence}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm text-gray-900 truncate">{song.title}</h4>
                                    <div className="flex items-center gap-1">
                                      <p className="text-xs text-gray-500 font-mono">{song.id}</p>
                                      <span className="text-xs text-gray-400">•</span>
                                      <p className="text-xs text-gray-500">{song.duration}</p>
                                      <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full ml-2">System</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className={cn(
                                        "h-6 w-6 p-0 transition-all",
                                        currentlyPlaying === song.id 
                                          ? "bg-blue-500 text-white" 
                                          : "text-blue-500 hover:bg-blue-500 hover:text-white"
                                      )}
                                      onClick={() => playPreview(song.id)}
                                    >
                                      {currentlyPlaying === song.id ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
                                    </Button>
                                  </div>
                                </div>
                              )) || []
                            )
                          ) : (
                            // Custom Playlist Display (Editable with drag/drop)
                            currentPlaylist.length === 0 ? (
                              <div className="text-center py-12 text-gray-500">
                                <ListMusic className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">Playlist is empty</p>
                                <p className="text-sm">Add songs from the library to get started</p>
                              </div>
                            ) : (
                              currentPlaylist.map((song, index) => (
                                <div 
                                  key={song.id} 
                                  className={cn(
                                    "group flex items-center gap-2 p-2 rounded border-l-4 border-l-[#b91c1c] bg-gray-50 hover:bg-white transition-colors",
                                    playbackOrder === "sequence" ? "cursor-move" : "cursor-default",
                                    draggedItem === song.id ? "opacity-50 scale-105" : ""
                                  )}
                                  draggable={playbackOrder === "sequence"}
                                  onDragStart={(e) => playbackOrder === "sequence" && handleDragStart(e, song.id)}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, song.id)}
                                  onDragEnd={handleDragEnd}
                                >
                                  {playbackOrder === "sequence" && (
                                    <div className="flex items-center opacity-50 group-hover:opacity-100 transition-opacity">
                                      <GripVertical className="h-3 w-3 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="w-6 h-6 bg-[#b91c1c] text-white rounded-full flex items-center justify-center text-xs font-medium">
                                    {song.sequence}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm text-gray-900 truncate">{song.title}</h4>
                                    <div className="flex items-center gap-1">
                                      <p className="text-xs text-gray-500 font-mono">{song.id}</p>
                                      <span className="text-xs text-gray-400">•</span>
                                      <p className="text-xs text-gray-500">{song.duration}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className={cn(
                                        "h-6 w-6 p-0 transition-all",
                                        currentlyPlaying === song.id 
                                          ? "bg-[#b91c1c] text-white" 
                                          : "text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white"
                                      )}
                                      onClick={() => playPreview(song.id)}
                                    >
                                      {currentlyPlaying === song.id ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0 text-red-600 hover:bg-red-100"
                                      onClick={() => removeSongFromPlaylist(song.id)}
                                    >
                                      <X className="h-2.5 w-2.5" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )
                          )}
                        </div>

                        {/* Playlist Summary */}
                        {(editPlaylistType === "custom" ? currentPlaylist.length > 0 : 
                          systemPlaylists[selectedPlaylistName as keyof typeof systemPlaylists]?.songs.length > 0) && (
                          <div className="pt-4 border-t space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Total Duration:</span>
                              <span className="font-medium">{calculateTotalDuration()}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Now Playing Section - Only show for General, Schedule, and Advanced tabs */}
          {activeTab !== "playlist" && activeTab !== "edit-playlist" && (
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