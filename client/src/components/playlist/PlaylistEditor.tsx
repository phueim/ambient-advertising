import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function PlaylistEditor() {
  const { toast } = useToast();
  const [playlistOrder, setPlaylistOrder] = useState<"shuffle" | "sequence">("shuffle");
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  
  const handleCopyToPlaylist = () => {
    if (selectedSongs.length === 0) {
      toast({
        title: "No songs selected",
        description: "Please select songs to copy",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Songs copied",
      description: `${selectedSongs.length} songs copied to playlist`,
    });
  };
  
  const handleRemoveSelected = () => {
    if (selectedSongs.length === 0) {
      toast({
        title: "No songs selected",
        description: "Please select songs to remove",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedSongs([]);
    toast({
      title: "Songs removed",
      description: `${selectedSongs.length} songs removed from selection`,
    });
  };

  return (
    <Card className="p-6">
      <div className="bg-sidebar text-white p-3 rounded-md mb-4">
        <h2 className="font-medium">Playlist to Edit</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Select defaultValue="custom">
            <SelectTrigger className="w-1/2 p-2 bg-primary text-white">
              <SelectValue placeholder="Select playlist type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom Playlist</SelectItem>
              <SelectItem value="classics">Classic Hits</SelectItem>
              <SelectItem value="top40">Top 40</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="playlist1">
            <SelectTrigger className="w-1/2 p-2 bg-primary text-white">
              <SelectValue placeholder="Select playlist" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="playlist1">Playlist 1</SelectItem>
              <SelectItem value="playlist2">Playlist 2</SelectItem>
              <SelectItem value="playlist3">Playlist 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-8">
          <RadioGroup value={playlistOrder} onValueChange={(value) => setPlaylistOrder(value as "shuffle" | "sequence")}>
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
        
        <div className="flex space-x-4">
          <Button 
            className="w-1/2"
            onClick={handleCopyToPlaylist}
          >
            Copy selected to playlist
          </Button>
          <Button 
            className="w-1/2"
            onClick={handleRemoveSelected}
          >
            Remove selected songs
          </Button>
        </div>
        
        <div className="border border-gray-300 rounded-md p-2">
          <div className="flex justify-between items-center">
            <span>Selected Songs ({selectedSongs.length})</span>
            <Checkbox 
              checked={selectedSongs.length > 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  // This would typically populate with actual song IDs from an API
                  setSelectedSongs(["song1", "song2", "song3"]);
                } else {
                  setSelectedSongs([]);
                }
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
