import Layout from "@/components/common/Layout";
import PlaylistEditor from "@/components/playlist/PlaylistEditor";
import TimeSlotScheduler from "@/components/playlist/TimeSlotScheduler";
import SongList from "@/components/playlist/SongList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function PlaylistPage() {
  const [showTimeSlotDialog, setShowTimeSlotDialog] = useState(false);
  const [selectedPlaylistType, setSelectedPlaylistType] = useState("single-playlist");

  return (
    <Layout
      title="Live Streaming for Fiverr Pvt Ltd (Demo)"
      subtitle="Select your ideal choice of music"
      tip="Tip: search for new music with pick N play mode."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Playlist */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <RadioGroup 
              value={selectedPlaylistType} 
              onValueChange={setSelectedPlaylistType}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single-playlist" id="single-playlist" />
                <Label htmlFor="single-playlist" className="text-lg font-medium">Single Playlist</Label>
              </div>
            </RadioGroup>
          </div>
          <p className="text-sm text-blue-500 mb-4">Make quick changes here.</p>
          
          <div className="space-y-4">
            <Select disabled={selectedPlaylistType !== "single-playlist"} defaultValue="chinese-pop">
              <SelectTrigger className={`w-full p-2 ${selectedPlaylistType === "single-playlist" ? "bg-primary text-white" : "bg-gray-100"}`}>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chinese-pop">Chinese Pop</SelectItem>
                <SelectItem value="dance">Dance</SelectItem>
                <SelectItem value="hip-hop">Hip Hop</SelectItem>
                <SelectItem value="rock">Rock</SelectItem>
              </SelectContent>
            </Select>
            
            <Select disabled={selectedPlaylistType !== "single-playlist"} defaultValue="dance">
              <SelectTrigger className={`w-full p-2 ${selectedPlaylistType === "single-playlist" ? "bg-primary text-white" : "bg-gray-100"}`}>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dance">Dance</SelectItem>
                <SelectItem value="chinese-pop">Chinese Pop</SelectItem>
                <SelectItem value="hip-hop">Hip Hop</SelectItem>
                <SelectItem value="rock">Rock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
        
        {/* Playlist to Edit */}
        <PlaylistEditor />
        
        {/* Master Box */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <RadioGroup 
              value={selectedPlaylistType} 
              onValueChange={setSelectedPlaylistType}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="master-box" id="master-box" />
                <Label htmlFor="master-box" className="text-lg font-medium">Master Box</Label>
              </div>
            </RadioGroup>
          </div>
          <p className="text-sm text-blue-500 mb-4">Replicate another location Playlist.</p>
          
          <Select 
            disabled={selectedPlaylistType !== "master-box"} 
            defaultValue="none"
          >
            <SelectTrigger className={`w-full p-2 ${selectedPlaylistType === "master-box" ? "bg-primary text-white" : "bg-gray-100"}`}>
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="location1">Location 1</SelectItem>
              <SelectItem value="location2">Location 2</SelectItem>
            </SelectContent>
          </Select>
        </Card>
        
        {/* Time Slot */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <RadioGroup 
              value={selectedPlaylistType} 
              onValueChange={setSelectedPlaylistType}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="time-slot" id="time-slot" />
                <Label htmlFor="time-slot" className="text-lg font-medium">Time Slot</Label>
              </div>
            </RadioGroup>
          </div>
          <p className="text-sm text-blue-500 mb-4">Select playlist to play at different times of day.</p>
          
          <div className="mt-4">
            <div className="bg-gray-100 p-2 rounded-md flex justify-between items-center">
              <div className="text-sm font-medium">Playlists</div>
              <div className="text-sm font-medium bg-primary text-white px-2 py-1 rounded">Time</div>
            </div>
            
            <div className="mt-2 space-y-2">
              {[
                { name: "Instrumental", altName: "Pop Vocal" },
                { name: "English pop", altName: "Hip Hop" }
              ].map((playlist, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 mr-2" 
                      disabled={selectedPlaylistType !== "time-slot"}
                    />
                    <span>{playlist.name}</span>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 mr-2" 
                      disabled={selectedPlaylistType !== "time-slot"}
                    />
                    <span>{playlist.altName}</span>
                  </div>
                  <div>
                    <button 
                      disabled={selectedPlaylistType !== "time-slot"}
                      onClick={() => setShowTimeSlotDialog(true)}
                      className={`${selectedPlaylistType === "time-slot" ? "text-gray-500" : "text-gray-300"}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      
      {/* Search Available Songs Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="bg-sidebar text-white p-3 rounded-md mb-4">
          <h2 className="font-medium">Search Available Songs</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Song title:</Label>
            <Input className="w-full" />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Genre:</Label>
            <Input className="w-full" />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Language:</Label>
            <Input className="w-full" />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Song type:</Label>
            <div className="flex space-x-2">
              <Button className="flex-1 bg-primary text-white">Search</Button>
              <Button variant="outline" className="flex-1">Reset</Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Show:</span>
            <Select defaultValue="6">
              <SelectTrigger className="w-16 h-8">
                <SelectValue placeholder="6" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm mr-2">Pages:</span>
            <div className="flex space-x-1">
              <Button variant="outline" size="icon" className="w-6 h-6 p-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button variant="default" size="icon" className="w-6 h-6 p-0 bg-primary">1</Button>
              <Button variant="outline" size="icon" className="w-6 h-6 p-0">2</Button>
              <Button variant="outline" size="icon" className="w-6 h-6 p-0">3</Button>
              <Button variant="outline" size="icon" className="w-6 h-6 p-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
            <Button className="ml-2 bg-primary text-white py-1 px-2 text-sm">Add Selected</Button>
          </div>
        </div>
        
        <SongList />
      </div>
      
      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="outline" className="px-6">Back</Button>
        <Button className="bg-primary text-white px-6">Update</Button>
      </div>

      {/* Time Slot Dialog */}
      <Dialog open={showTimeSlotDialog} onOpenChange={setShowTimeSlotDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="bg-sidebar text-white p-3 -mt-4 -mx-4 rounded-t-lg">
              <DialogTitle className="text-center">TimeSlot Schedule</DialogTitle>
            </div>
          </DialogHeader>
          <TimeSlotScheduler 
            onClose={() => setShowTimeSlotDialog(false)}
            onUpdate={() => {
              // Handle update functionality
              setShowTimeSlotDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
