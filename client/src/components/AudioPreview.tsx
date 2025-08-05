import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Volume2, Download, Clock, FileAudio, ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface Audio {
  id: number;
  text: string;
  variables?: any;
  audioUrl: string;
  voiceType: string;
  duration?: number;
  status: string;
  generatedAt: string;
  synthesizedAt?: string;
}

interface AudioResponse {
  data: Audio[];
  total: number;
  totalPages: number;
}

export function AudioPreview() {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [availableFiles, setAvailableFiles] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [voiceTypeFilter, setVoiceTypeFilter] = useState<string>("all");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: audioResponse, isLoading } = useQuery<AudioResponse>({
    queryKey: ["/api/v1/audio", currentPage, itemsPerPage, statusFilter, voiceTypeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: itemsPerPage.toString(),
      });
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (voiceTypeFilter !== "all") {
        params.append("voiceType", voiceTypeFilter);
      }
      
      const response = await fetch(`/api/v1/audio?${params}`);
      return response.json();
    },
    refetchInterval: 60000, // 1 minute
  });

  // Query to get all audio data for filter options
  const { data: allAudioResponse } = useQuery<AudioResponse>({
    queryKey: ["/api/v1/audio/all"],
    queryFn: async () => {
      const response = await fetch('/api/v1/audio?getAll=true');
      return response.json();
    },
    refetchInterval: 60000, // 1 minute
  });

  const audioFiles = audioResponse?.data || [];
  const totalPages = audioResponse?.totalPages || 1;
  const total = audioResponse?.total || 0;
  const allAudioFiles = Array.isArray(allAudioResponse) ? allAudioResponse : [];

  // Pagination calculations for display
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, total);

  // Analyze available filter options
  const availableStatuses = useMemo(() => {
    if (!Array.isArray(allAudioFiles) || allAudioFiles.length === 0) return [];
    const statusSet = new Set(allAudioFiles.map(audio => audio.status));
    return Array.from(statusSet);
  }, [allAudioFiles]);

  const availableVoiceTypes = useMemo(() => {
    if (!Array.isArray(allAudioFiles) || allAudioFiles.length === 0) return [];
    const voiceTypeSet = new Set(allAudioFiles.map(audio => audio.voiceType));
    return Array.from(voiceTypeSet);
  }, [allAudioFiles]);

  // Reset to page 1 when filters or items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, voiceTypeFilter, itemsPerPage]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current = null;
      }
    };
  }, []);

  // Check for local audio files availability
  useEffect(() => {
    const checkLocalFiles = async () => {
      if (!audioFiles) return;
      
      const files: { [key: string]: string } = {};
      
      for (const audio of audioFiles) {
        if (audio.audioUrl) {
          if (audio.audioUrl.startsWith('/audio/')) {
            // Local file - test availability
            try {
              const response = await fetch(audio.audioUrl, { method: 'HEAD' });
              if (response.ok) {
                files[audio.id.toString()] = audio.audioUrl;
              }
            } catch (error) {
              // File doesn't exist yet
            }
          } else {
            // External URL - mark as available for demo
            files[audio.id.toString()] = audio.audioUrl;
          }
        }
      }
      
      setAvailableFiles(files);
    };

    checkLocalFiles();
  }, [audioFiles]);

  const togglePlay = (id: number, audioUrl: string) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', handleAudioEnded);
      audioRef.current = null;
    }

    if (playingId === id) {
      // If clicking the same audio, just stop it
      setPlayingId(null);
      return;
    }

    // Start playing new audio
    setPlayingId(id);
    
    if (audioUrl && (audioUrl.startsWith('/audio/') || audioUrl.startsWith('http'))) {
      try {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        // Handle audio ending
        const handleAudioEnded = () => {
          setPlayingId(null);
          audioRef.current = null;
        };
        
        audio.addEventListener('ended', handleAudioEnded);
        
        // Handle errors
        audio.addEventListener('error', (error) => {
          console.error('Error playing audio:', error);
          setPlayingId(null);
          audioRef.current = null;
        });
        
        // Play the audio
        audio.play().then(() => {
          console.log(`Playing audio: ${audioUrl}`);
        }).catch(error => {
          console.error('Error playing audio:', error);
          setPlayingId(null);
          audioRef.current = null;
        });
      } catch (error) {
        console.error('Error creating audio element:', error);
        setPlayingId(null);
      }
    } else {
      console.log(`External audio URL (demo): ${audioUrl}`);
      // For external URLs or demo, simulate playback
      setTimeout(() => {
        setPlayingId(null);
      }, 3000);
    }
  };

  const handleAudioEnded = () => {
    setPlayingId(null);
    audioRef.current = null;
  };

  const handleDownload = async (audioUrl: string, audioId: number) => {
    try {
      if (audioUrl.startsWith('/audio/')) {
        // Local file - create download link
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = `audio-${audioId}.${audioUrl.split('.').pop() || 'mp3'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // External URL - fetch and download
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error('Failed to fetch audio file');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audio-${audioId}.${audioUrl.split('.').pop() || 'mp3'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading audio:', error);
      // Fallback to opening in new tab
      window.open(audioUrl, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (audio: Audio) => {
    if (audio.duration) {
      return `${audio.duration}s`;
    }
    const words = audio.text.split(' ').length;
    const estimatedSeconds = Math.ceil((words / 150) * 60); // 150 words per minute
    return `~${estimatedSeconds}s`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="w-5 h-5" />
            Audio Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading audio content...</div>
        </CardContent>
      </Card>
    );
  }

  if (!audioFiles || audioFiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="w-5 h-5" />
            Audio Preview
          </CardTitle>
          <CardDescription>
            Generated audio advertisements will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No audio content generated yet. The system will create audio files when triggered.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="w-5 h-5" />
          Audio Preview ({total} files)
        </CardTitle>
        <CardDescription>
          Listen to generated audio advertisements
        </CardDescription>
        
        {/* Filter Controls */}
        {(availableStatuses.length > 1 || availableVoiceTypes.length > 1) && (
          <div className="flex items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
          
          {availableStatuses.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {availableStatuses.includes("pending") && (
                    <SelectItem value="pending">Pending</SelectItem>
                  )}
                  {availableStatuses.includes("completed") && (
                    <SelectItem value="completed">Completed</SelectItem>
                  )}
                  {availableStatuses.includes("failed") && (
                    <SelectItem value="failed">Failed</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {availableVoiceTypes.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Voice:</span>
              <Select value={voiceTypeFilter} onValueChange={setVoiceTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Voices</SelectItem>
                  {availableVoiceTypes.includes("male") && (
                    <SelectItem value="male">Male</SelectItem>
                  )}
                  {availableVoiceTypes.includes("female") && (
                    <SelectItem value="female">Female</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          
            {(statusFilter !== "all" || voiceTypeFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setVoiceTypeFilter("all");
                }}
                className="text-sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {audioFiles.map((audio, index) => (
          <div key={audio.id}>
            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Audio #{audio.id}
                  </Badge>
                  <Badge className={getStatusColor(audio.status)}>
                    {audio.status}
                  </Badge>
                  <Badge variant="secondary">
                    {audio.voiceType} voice
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 max-w-2xl">
                  <strong>Content:</strong> {audio.text}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(audio)}
                  </span>
                  <span>Generated: {new Date(audio.generatedAt).toLocaleString()}</span>
                  {audio.synthesizedAt && (
                    <span>Synthesized: {new Date(audio.synthesizedAt).toLocaleString()}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {audio.status === 'completed' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePlay(audio.id, audio.audioUrl)}
                      className="flex items-center gap-1"
                    >
                      {playingId === audio.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {availableFiles[audio.id.toString()] ? "Play" : "Preview"}
                    </Button>
                    
                    {audio.audioUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(audio.audioUrl, audio.id)}
                        className="flex items-center gap-1"
                        title="Download audio file"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    )}
                  </>
                )}
                
                {audio.status === 'pending' && (
                  <div className="flex items-center gap-1 text-yellow-600 text-sm">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    Processing...
                  </div>
                )}
              </div>
            </div>
            
            {/* Audio URL Display */}
            <div className="mt-2 text-xs text-gray-400 font-mono bg-gray-50 p-2 rounded">
              <strong>Audio URL:</strong> {audio.audioUrl}
              {availableFiles[audio.id.toString()] && (
                <Badge className="ml-2 bg-green-100 text-green-800">Local file available</Badge>
              )}
            </div>
            
            {index < audioFiles.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
        
        
        {/* Pagination Controls */}
        {total > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex} to {endIndex} of {total} audio files
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 30, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={pageSize.toString()}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}