import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "lucide-react";

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: any) => void;
  playlistName: string;
  playlistType: string;
}

export function TimeSlotModal({
  isOpen,
  onClose,
  onUpdate,
  playlistName,
  playlistType
}: TimeSlotModalProps) {
  const [startDate, setStartDate] = useState("2023-08-01");
  const [endDate, setEndDate] = useState("2023-08-01");
  const [frequency, setFrequency] = useState("daily");

  const handleUpdate = () => {
    onUpdate({
      startDate,
      endDate,
      frequency
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">TimeSlot Schedule</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm mb-1">My playlist for demo Fiverr Pte Ltd</p>
          <h3 className="text-lg font-bold mb-4">{playlistType} - {playlistName}</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Starts at:</Label>
              <div className="flex space-x-2">
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="flex-grow"
                />
                <Button variant="outline" size="icon">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Stops after:</Label>
              <div className="flex space-x-2">
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="flex-grow"
                />
                <Button variant="outline" size="icon">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Frequency:</Label>
              <RadioGroup defaultValue="daily" value={frequency} onValueChange={setFrequency}>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily">Daily</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Weekly</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="default" onClick={handleUpdate}>Update</Button>
          <Button variant="default" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
