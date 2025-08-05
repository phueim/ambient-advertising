import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { type Song } from "@shared/schema";
import { Play } from "lucide-react";

interface SongListProps {
  songs: Song[];
  selectedSongs: number[];
  onSelectSong: (songId: number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function SongList({
  songs,
  selectedSongs,
  onSelectSong,
  onSelectAll,
  isLoading = false,
  emptyMessage = "No songs available"
}: SongListProps) {
  const [isPlaying, setIsPlaying] = useState<number | null>(null);

  // Simulate playing a song
  const handlePlay = (songId: number) => {
    if (isPlaying === songId) {
      setIsPlaying(null);
    } else {
      setIsPlaying(songId);
    }
  };

  // Check if all songs are selected
  const allSelected = songs.length > 0 && selectedSongs.length === songs.length;

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (onSelectAll) {
      onSelectAll(checked);
    } else {
      songs.forEach(song => {
        onSelectSong(song.id, checked);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>Loading songs...</span>
      </div>
    );
  }

  if (songs.length === 0) {
    return <div className="text-center py-8 text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center mb-2 px-3 py-2 border-b border-gray-200">
        <Checkbox
          checked={allSelected}
          onCheckedChange={handleSelectAll}
          className="mr-3"
        />
        <span className="font-semibold">Select All</span>
      </div>
      
      <div className="max-h-48 overflow-y-auto">
        {songs.map(song => (
          <div
            key={song.id}
            className="flex items-center px-3 py-2 hover:bg-gray-50 rounded"
          >
            <Checkbox
              checked={selectedSongs.includes(song.id)}
              onCheckedChange={(checked) => onSelectSong(song.id, !!checked)}
              className="mr-3"
            />
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto mr-2"
              onClick={() => handlePlay(song.id)}
            >
              <Play
                size={18}
                className={isPlaying === song.id ? "text-primary animate-pulse" : "text-primary"}
              />
            </Button>
            <div className="flex-1">
              <span className="block">{song.title}</span>
              {song.artist && (
                <span className="text-xs text-gray-500">{song.artist}</span>
              )}
            </div>
            {song.genre && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {song.genre}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
