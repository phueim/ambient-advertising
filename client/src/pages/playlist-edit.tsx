import { useState, useEffect } from "react";
import {
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Clock } from "lucide-react";
import { TimeSlotModal } from "@/components/modals/time-slot-modal";
import { Playlist, Song } from "@shared/schema";

export default function PlaylistEdit() {
  const [playlistType, setPlaylistType] = useState<"single" | "master" | "timeSlot">("single");
  const [playlistOrder, setPlaylistOrder] = useState<"shuffle" | "sequence">("shuffle");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
  
  const { toast } = useToast();

  // Fetch playlists
  const { data: playlists, isLoading: isLoadingPlaylists } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  // Fetch songs
  const { data: songs, isLoading: isLoadingSongs } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
  });

  // Fetch selected playlist songs
  const { data: playlistSongs, isLoading: isLoadingPlaylistSongs } = useQuery<Song[]>({
    queryKey: ["/api/playlists", selectedPlaylistId, "songs"],
    enabled: !!selectedPlaylistId,
  });

  // Create/update playlist mutation
  const playlistMutation = useMutation({
    mutationFn: async (data: { playlistId?: number, type: string, order: string }) => {
      if (data.playlistId) {
        return apiRequest("PUT", `/api/playlists/${data.playlistId}`, {
          type: data.type,
          order: data.order,
        });
      } else {
        return apiRequest("POST", "/api/playlists", {
          name: "Custom Playlist",
          type: data.type,
          order: data.order,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({
        title: "Success",
        description: "Playlist has been saved",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save playlist",
        variant: "destructive",
      });
    },
  });

  // Add song to playlist mutation
  const addSongMutation = useMutation({
    mutationFn: async ({ playlistId, songId }: { playlistId: number, songId: number }) => {
      return apiRequest("POST", `/api/playlists/${playlistId}/songs`, { songId });
    },
    onSuccess: () => {
      if (selectedPlaylistId) {
        queryClient.invalidateQueries({ queryKey: ["/api/playlists", selectedPlaylistId, "songs"] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add song to playlist",
        variant: "destructive",
      });
    },
  });

  // Remove song from playlist mutation
  const removeSongMutation = useMutation({
    mutationFn: async ({ playlistId, songId }: { playlistId: number, songId: number }) => {
      return apiRequest("DELETE", `/api/playlists/${playlistId}/songs/${songId}`);
    },
    onSuccess: () => {
      if (selectedPlaylistId) {
        queryClient.invalidateQueries({ queryKey: ["/api/playlists", selectedPlaylistId, "songs"] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove song from playlist",
        variant: "destructive",
      });
    },
  });

  // Handle playlist update
  const handleUpdate = () => {
    playlistMutation.mutate({
      playlistId: selectedPlaylistId || undefined,
      type: playlistType,
      order: playlistOrder,
    });
  };

  // Handle adding selected songs to playlist
  const handleAddSelectedSongs = () => {
    if (!selectedPlaylistId) {
      toast({
        title: "No playlist selected",
        description: "Please select a playlist first",
        variant: "destructive",
      });
      return;
    }

    if (selectedSongs.length === 0) {
      toast({
        title: "No songs selected",
        description: "Please select at least one song",
        variant: "destructive",
      });
      return;
    }

    selectedSongs.forEach(songId => {
      addSongMutation.mutate({ playlistId: selectedPlaylistId, songId });
    });

    setSelectedSongs([]);
    toast({
      title: "Success",
      description: `${selectedSongs.length} song(s) added to playlist`,
    });
  };

  // Handle removing selected songs from playlist
  const handleRemoveSelectedSongs = () => {
    if (!selectedPlaylistId || !playlistSongs) {
      return;
    }

    selectedSongs.forEach(songId => {
      removeSongMutation.mutate({ playlistId: selectedPlaylistId, songId });
    });

    setSelectedSongs([]);
    toast({
      title: "Success",
      description: `${selectedSongs.length} song(s) removed from playlist`,
    });
  };

  // Filter songs based on search query
  const filteredSongs = songs?.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (song.artist && song.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (song.genre && song.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle opening time slot modal
  const handleOpenTimeSlotModal = () => {
    if (!selectedPlaylistId) {
      toast({
        title: "No playlist selected",
        description: "Please select a playlist first",
        variant: "destructive",
      });
      return;
    }
    setIsTimeSlotModalOpen(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Live Streaming for USEA</h1>
        <p className="text-gray-600">Select your ideal choice of music</p>
        <p className="text-gray-600 text-sm italic">Tip: search for new music with pick N play mode.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <RadioGroup 
                value={playlistType} 
                onValueChange={(value) => setPlaylistType(value as "single" | "master" | "timeSlot")}
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <RadioGroupItem value="single" id="singlePlaylist" />
                      <Label htmlFor="singlePlaylist" className="ml-2 text-lg font-medium">Single Playlist</Label>
                    </div>
                    <p className="text-sm text-blue-500 ml-6">Make quick changes here.</p>
                    
                    {playlistType === "single" && (
                      <div className="space-y-3 ml-6">
                        <Select>
                          <SelectTrigger className="bg-primary text-white">
                            <SelectValue placeholder="Select genre" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chinese-pop">Chinese Pop</SelectItem>
                            <SelectItem value="rock">Rock</SelectItem>
                            <SelectItem value="jazz">Jazz</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select>
                          <SelectTrigger className="bg-primary text-white">
                            <SelectValue placeholder="Select genre" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dance">Dance</SelectItem>
                            <SelectItem value="hip-hop">Hip Hop</SelectItem>
                            <SelectItem value="classical">Classical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <RadioGroupItem value="master" id="masterBox" />
                      <Label htmlFor="masterBox" className="ml-2 text-lg font-medium">Master Box</Label>
                    </div>
                    <p className="text-sm text-blue-500 ml-6">Replicate another location Playlist.</p>
                    
                    {playlistType === "master" && (
                      <div className="ml-6">
                        <Select>
                          <SelectTrigger className="bg-primary text-white">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="location1">Location 1</SelectItem>
                            <SelectItem value="location2">Location 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <RadioGroupItem value="timeSlot" id="timeSlot" />
                      <Label htmlFor="timeSlot" className="ml-2 text-lg font-medium">Time Slot</Label>
                    </div>
                    <p className="text-sm text-blue-500 ml-6">Select playlist to play at different times of day.</p>
                    
                    {playlistType === "timeSlot" && (
                      <div className="ml-6 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Playlists</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-100">Time</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">Instrumental</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <Checkbox />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleOpenTimeSlotModal}
                                >
                                  <Clock className="h-4 w-4 text-gray-500" />
                                </Button>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">English pop</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <Checkbox />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleOpenTimeSlotModal}
                                >
                                  <Clock className="h-4 w-4 text-gray-500" />
                                </Button>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">Pop Vocal</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <Checkbox />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleOpenTimeSlotModal}
                                >
                                  <Clock className="h-4 w-4 text-gray-500" />
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <Card className="bg-secondary text-white">
            <CardHeader className="py-3 px-6">
              <CardTitle className="text-lg font-semibold text-center">Playlist to Edit</CardTitle>
            </CardHeader>
          </Card>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select>
              <SelectTrigger className="bg-primary text-white">
                <SelectValue placeholder="Custom Playlist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom Playlist</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={selectedPlaylistId?.toString() || ""}
              onValueChange={(value) => setSelectedPlaylistId(Number(value))}
            >
              <SelectTrigger className="bg-primary text-white">
                <SelectValue placeholder="Select Playlist" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingPlaylists ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  playlists?.map(playlist => (
                    <SelectItem key={playlist.id} value={playlist.id.toString()}>
                      {playlist.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <RadioGroup 
                value={playlistOrder} 
                onValueChange={(value) => setPlaylistOrder(value as "shuffle" | "sequence")}
                className="flex items-center space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="shuffle" id="shuffleOption" />
                  <Label htmlFor="shuffleOption">Shuffle</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sequence" id="sequenceOption" />
                  <Label htmlFor="sequenceOption">Sequence</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-grow"
              onClick={handleAddSelectedSongs}
              disabled={!selectedPlaylistId || selectedSongs.length === 0}
            >
              Copy selected to playlist
            </Button>
            <Button 
              className="flex-grow"
              onClick={handleRemoveSelectedSongs}
              disabled={!selectedPlaylistId || selectedSongs.length === 0}
            >
              Remove selected songs
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">
                  Selected Songs ({playlistSongs?.length || 0})
                </span>
                <Checkbox />
              </div>
              
              {isLoadingPlaylistSongs ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Loading songs...</span>
                </div>
              ) : playlistSongs && playlistSongs.length > 0 ? (
                <div className="max-h-40 overflow-y-auto">
                  {playlistSongs.map(song => (
                    <div key={song.id} className="flex items-center py-2 px-3 hover:bg-gray-50 rounded">
                      <Checkbox 
                        className="mr-3"
                        checked={selectedSongs.includes(song.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSongs([...selectedSongs, song.id]);
                          } else {
                            setSelectedSongs(selectedSongs.filter(id => id !== song.id));
                          }
                        }}
                      />
                      <span>{song.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No songs in this playlist
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-secondary text-white">
            <CardHeader className="py-3 px-6">
              <CardTitle className="text-lg font-semibold text-center">Search Available Songs</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="songTitle" className="mb-1 block">Song title:</Label>
                  <Input 
                    id="songTitle" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="genre" className="mb-1 block">Genre:</Label>
                  <Input id="genre" />
                </div>
                <div>
                  <Label htmlFor="language" className="mb-1 block">Language:</Label>
                  <Input id="language" />
                </div>
                <div>
                  <Label htmlFor="songType" className="mb-1 block">Song type:</Label>
                  <div className="flex space-x-2">
                    <Button size="sm">Search</Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSearchQuery("")}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex items-center space-x-2">
                  <span>Show:</span>
                  <Select defaultValue="6">
                    <SelectTrigger className="h-8 w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center">
                  <Button variant="outline" size="sm" onClick={handleAddSelectedSongs}>
                    Add Selected
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Available songs</h3>
                {isLoadingSongs ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Loading songs...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredSongs?.map(song => (
                      <div key={song.id} className="flex items-center py-2 px-3 hover:bg-gray-50 rounded">
                        <Checkbox 
                          className="mr-3"
                          checked={selectedSongs.includes(song.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSongs([...selectedSongs, song.id]);
                            } else {
                              setSelectedSongs(selectedSongs.filter(id => id !== song.id));
                            }
                          }}
                        />
                        <Button variant="ghost" size="sm" className="p-0 h-auto">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="text-primary mr-2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="10 8 16 12 10 16 10 8" />
                          </svg>
                        </Button>
                        <span>{song.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline">Back</Button>
        <Button onClick={handleUpdate} disabled={playlistMutation.isPending}>
          {playlistMutation.isPending ? "Updating..." : "Update"}
        </Button>
      </div>
      
      {/* Time Slot Modal */}
      {selectedPlaylistId && (
        <TimeSlotModal
          isOpen={isTimeSlotModalOpen}
          onClose={() => setIsTimeSlotModalOpen(false)}
          playlistId={selectedPlaylistId}
          playlistName={playlists?.find(p => p.id === selectedPlaylistId)?.name || ""}
        />
      )}
    </div>
  );
}
