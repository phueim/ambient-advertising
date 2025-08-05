import { useState } from "react";
import { Play } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Song {
  id: string;
  title: string;
  isPlaying?: boolean;
}

interface SongListProps {
  songs?: Song[];
}

export default function SongList({ songs: propSongs }: SongListProps) {
  const { toast } = useToast();
  // Default songs if none provided from props
  const defaultSongs: Song[] = [
    { id: "1", title: "Rain thoughts" },
    { id: "2", title: "Four poster boys" },
    { id: "3", title: "Single" },
    { id: "4", title: "Turn Pike" },
    { id: "5", title: "Gold Cardio" },
    { id: "6", title: "Five vs Five" },
  ];
  
  const songs = propSongs || defaultSongs;
  
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  
  const toggleSongSelection = (songId: string) => {
    setSelectedSongs(prev => 
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };
  
  const playSong = (songId: string) => {
    if (currentlyPlaying === songId) {
      setCurrentlyPlaying(null);
      toast({
        title: "Playback stopped",
        description: `Stopped playing: ${songs.find(s => s.id === songId)?.title}`,
      });
    } else {
      setCurrentlyPlaying(songId);
      toast({
        title: "Now playing",
        description: `Now playing: ${songs.find(s => s.id === songId)?.title}`,
      });
    }
  };

  return (
    <>
      <div className="bg-gray-100 p-2 rounded-md">
        <div className="text-sm font-medium">Available songs</div>
      </div>
      
      <div className="mt-2 space-y-2">
        {songs.map((song) => (
          <div key={song.id} className="flex items-center border-b pb-2">
            <Checkbox 
              className="h-4 w-4 mr-2"
              checked={selectedSongs.includes(song.id)}
              onCheckedChange={() => toggleSongSelection(song.id)}
            />
            <button 
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white mr-2 ${currentlyPlaying === song.id ? 'bg-green-500' : 'bg-primary'}`}
              onClick={() => playSong(song.id)}
            >
              <Play className="h-4 w-4" />
            </button>
            <span>{song.title}</span>
          </div>
        ))}
        
        {songs.length === 0 && (
          <div className="py-4 text-center text-gray-500">
            No songs available
          </div>
        )}
      </div>
    </>
  );
}
