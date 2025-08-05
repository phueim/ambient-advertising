import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Song, Playlist } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Music } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface PlaylistEditorProps {
  open: boolean;
  onClose: () => void;
  brandId: number;
  selectedPlaylist?: Playlist;
}

export function PlaylistEditor({
  open,
  onClose,
  brandId,
  selectedPlaylist
}: PlaylistEditorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [playlistOrder, setPlaylistOrder] = useState<"shuffle" | "sequence">("shuffle");
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState({
    title: "",
    genre: "",
    language: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  
  const songsPerPage = 6;
  
  // Load playlists
  const { data: playlists } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
    enabled: open && !!user
  });
  
  // Load playlist songs if a playlist is selected
  const { data: playlistSongs } = useQuery<Song[]>({
    queryKey: ["/api/playlists", selectedPlaylistId, "songs"],
    enabled: open && !!selectedPlaylistId && selectedPlaylistId !== "new",
  });
  
  // Load all available songs
  const { data: allSongs, isLoading: songsLoading } = useQuery<Song[]>({
    queryKey: ["/api/songs", "search", searchQuery],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (searchQuery.title) queryParams.append("title", searchQuery.title);
      if (searchQuery.genre) queryParams.append("genre", searchQuery.genre);
      if (searchQuery.language) queryParams.append("language", searchQuery.language);
      
      const response = await fetch(`/api/songs/search?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch songs");
      return response.json();
    },
    enabled: open
  });
  
  // Add songs to playlist mutation
  const addSongsMutation = useMutation({
    mutationFn: async (data: { playlistId: number, songIds: number[] }) => {
      const promises = data.songIds.map(songId => 
        apiRequest("POST", `/api/playlists/${data.playlistId}/songs`, { songId })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Songs added to playlist successfully",
      });
      
      // Invalidate playlists and songs queries
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/playlists", selectedPlaylistId, "songs"] });
      
      // Clear selected songs
      setSelectedSongs([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add songs to playlist",
        variant: "destructive",
      });
    }
  });
  
  // Remove song from playlist mutation
  const removeSongMutation = useMutation({
    mutationFn: async (data: { playlistId: number, songId: number }) => {
      await apiRequest("DELETE", `/api/playlists/${data.playlistId}/songs/${data.songId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Song removed from playlist",
      });
      
      // Invalidate the playlist songs query
      queryClient.invalidateQueries({ queryKey: ["/api/playlists", selectedPlaylistId, "songs"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove song from playlist",
        variant: "destructive",
      });
    }
  });
  
  // Create playlist mutation
  const createPlaylistMutation = useMutation({
    mutationFn: async (data: { name: string, brandId: number, shuffle: boolean }) => {
      const res = await apiRequest("POST", "/api/playlists", data);
      return await res.json();
    },
    onSuccess: (newPlaylist) => {
      toast({
        title: "Success",
        description: "Playlist created successfully",
      });
      
      // Update selected playlist ID to the new playlist
      setSelectedPlaylistId(newPlaylist.id.toString());
      
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
  
  // Update playlist shuffle setting mutation
  const updatePlaylistMutation = useMutation({
    mutationFn: async (data: { playlistId: number, shuffle: boolean }) => {
      const res = await apiRequest("PUT", `/api/playlists/${data.playlistId}`, { shuffle: data.shuffle });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Playlist updated successfully",
      });
      
      // Invalidate playlists query
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update playlist",
        variant: "destructive",
      });
    }
  });
  
  // Set initial values when a selected playlist is provided
  useEffect(() => {
    if (selectedPlaylist) {
      setSelectedPlaylistId(selectedPlaylist.id.toString());
      setPlaylistOrder(selectedPlaylist.shuffle ? "shuffle" : "sequence");
    } else {
      // Reset values for new playlist
      setSelectedPlaylistId("");
      setPlaylistOrder("shuffle");
      setSelectedSongs([]);
    }
  }, [selectedPlaylist, open]);
  
  // Set playlist songs to selected songs when they're loaded
  useEffect(() => {
    if (playlistSongs) {
      setSelectedSongs(playlistSongs);
    }
  }, [playlistSongs]);
  
  const filteredSongs = allSongs || [];
  const totalPages = Math.ceil(filteredSongs.length / songsPerPage);
  const paginatedSongs = filteredSongs.slice(
    (currentPage - 1) * songsPerPage,
    currentPage * songsPerPage
  );
  
  const handleToggleSongSelection = (song: Song) => {
    if (selectedSongs.some(s => s.id === song.id)) {
      setSelectedSongs(selectedSongs.filter(s => s.id !== song.id));
    } else {
      setSelectedSongs([...selectedSongs, song]);
    }
  };
  
  const handleSavePlaylist = () => {
    // If no playlist is selected, create a new one
    if (!selectedPlaylistId || selectedPlaylistId === "new") {
      createPlaylistMutation.mutate({
        name: "Custom Playlist",
        brandId,
        shuffle: playlistOrder === "shuffle"
      });
      return;
    }
    
    // Update existing playlist
    const playlistId = parseInt(selectedPlaylistId);
    
    // Update shuffle setting if it's changed
    const currentPlaylist = playlists?.find(p => p.id === playlistId);
    if (currentPlaylist && currentPlaylist.shuffle !== (playlistOrder === "shuffle")) {
      updatePlaylistMutation.mutate({
        playlistId,
        shuffle: playlistOrder === "shuffle"
      });
    }
    
    // Add selected songs to playlist
    if (selectedSongs.length > 0) {
      addSongsMutation.mutate({
        playlistId,
        songIds: selectedSongs.map(s => s.id)
      });
    }
    
    onClose();
  };
  
  const handleRemoveSelectedSongs = () => {
    if (!selectedPlaylistId || selectedPlaylistId === "new" || !selectedSongs.length) return;
    
    const playlistId = parseInt(selectedPlaylistId);
    
    // Remove each selected song
    selectedSongs.forEach(song => {
      removeSongMutation.mutate({
        playlistId,
        songId: song.id
      });
    });
    
    setSelectedSongs([]);
  };
  
  const handleSearch = () => {
    // Trigger the search by refetching with the current search query
    queryClient.invalidateQueries({ queryKey: ["/api/songs", "search"] });
    setCurrentPage(1);
  };
  
  const handleResetSearch = () => {
    setSearchQuery({
      title: "",
      genre: "",
      language: ""
    });
    queryClient.invalidateQueries({ queryKey: ["/api/songs", "search"] });
    setCurrentPage(1);
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Playlist to Edit</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="playlist-select">Custom Playlist</Label>
            <Select 
              value={selectedPlaylistId} 
              onValueChange={setSelectedPlaylistId}
            >
              <SelectTrigger id="playlist-select" className="bg-primary text-white">
                <SelectValue placeholder="Select a playlist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Create New Playlist</SelectItem>
                {playlists?.map(playlist => (
                  <SelectItem key={playlist.id} value={playlist.id.toString()}>
                    {playlist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Additional dropdown for playlist selection on another brand */}
          <div>
            <Label htmlFor="playlist-preset">Playlist Preset</Label>
            <Select>
              <SelectTrigger id="playlist-preset" className="bg-primary text-white">
                <SelectValue placeholder="Select preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preset1">Playlist 1</SelectItem>
                <SelectItem value="preset2">Playlist 2</SelectItem>
                <SelectItem value="preset3">Playlist 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mb-6">
          <Label className="block mb-2">Playlist order:</Label>
          <RadioGroup
            value={playlistOrder}
            onValueChange={(value) => setPlaylistOrder(value as "shuffle" | "sequence")}
            className="flex space-x-8"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="shuffle" id="shuffle" />
              <Label htmlFor="shuffle">Shuffle</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sequence" id="sequence" />
              <Label htmlFor="sequence">Sequence</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <Button 
            variant="default" 
            onClick={() => {
              if (selectedPlaylistId && selectedPlaylistId !== "new") {
                // Add selected songs to playlist
                addSongsMutation.mutate({
                  playlistId: parseInt(selectedPlaylistId),
                  songIds: selectedSongs.map(s => s.id)
                });
              } else {
                toast({
                  title: "Error",
                  description: "Please select or create a playlist first",
                  variant: "destructive",
                });
              }
            }}
            disabled={!selectedSongs.length || !selectedPlaylistId || selectedPlaylistId === "new"}
          >
            Copy selected to playlist
          </Button>
          
          <Button 
            variant="default" 
            onClick={handleRemoveSelectedSongs}
            disabled={!selectedSongs.length || !selectedPlaylistId || selectedPlaylistId === "new"}
          >
            Remove selected songs
          </Button>
        </div>
        
        <div className="mb-6">
          <Label className="block mb-2">Selected Songs ({selectedSongs.length})</Label>
          <div className="border border-gray-300 rounded-md h-16 bg-gray-50 p-2 overflow-y-auto">
            {selectedSongs.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedSongs.map(song => (
                  <div 
                    key={song.id} 
                    className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    <Music className="h-3 w-3 mr-1" />
                    {song.title}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm flex items-center justify-center h-full">
                No songs selected
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-sidebar text-white py-2 px-4 rounded-md mb-4">
          <h3 className="text-center">Search Available Songs</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="song-title">Song title:</Label>
            <Input 
              id="song-title" 
              value={searchQuery.title}
              onChange={(e) => setSearchQuery({...searchQuery, title: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="song-genre">Genre:</Label>
            <Input 
              id="song-genre" 
              value={searchQuery.genre}
              onChange={(e) => setSearchQuery({...searchQuery, genre: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="song-language">Language:</Label>
            <Input 
              id="song-language" 
              value={searchQuery.language}
              onChange={(e) => setSearchQuery({...searchQuery, language: e.target.value})}
            />
          </div>
        </div>
        
        <div className="mb-6 flex space-x-4">
          <Button onClick={handleSearch}>
            Search
          </Button>
          <Button variant="outline" onClick={handleResetSearch}>
            Reset
          </Button>
        </div>
        
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Label>Show:</Label>
            <Select defaultValue="6">
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label>Pages:</Label>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                className="h-8 w-8"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            
            {totalPages > 3 && currentPage <= 3 && (
              <>
                <span>...</span>
                <Button
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                addSongsMutation.mutate({
                  playlistId: parseInt(selectedPlaylistId),
                  songIds: selectedSongs.map(s => s.id)
                });
              }}
              disabled={!selectedSongs.length || !selectedPlaylistId || selectedPlaylistId === "new"}
            >
              Add Selected
            </Button>
          </div>
        </div>
        
        <div className="border border-gray-300 rounded-md mb-6">
          <div className="p-2 bg-gray-50 font-medium">
            Available songs
          </div>
          <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
            {songsLoading ? (
              <li className="p-4 text-center">Loading songs...</li>
            ) : paginatedSongs.length > 0 ? (
              paginatedSongs.map(song => (
                <li 
                  key={song.id} 
                  className="px-4 py-3 flex items-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleToggleSongSelection(song)}
                >
                  <Music className="text-primary mr-3 h-4 w-4" />
                  <span className="flex-1">{song.title}</span>
                  <span className="text-xs text-gray-500">
                    {song.genre} • {song.duration}
                  </span>
                  <input 
                    type="checkbox" 
                    className="ml-2 h-4 w-4"
                    checked={selectedSongs.some(s => s.id === song.id)}
                    onChange={() => {}}
                  />
                </li>
              ))
            ) : (
              <li className="p-4 text-center">No songs found</li>
            )}
          </ul>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose}>
            Back
          </Button>
          <Button onClick={handleSavePlaylist}>
            Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { ChevronLeft, ChevronRight } from "lucide-react";
