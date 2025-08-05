import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: number;
  playlistName: string;
  timeSlotId?: number;
  initialStartTime?: Date;
  initialEndTime?: Date;
  initialFrequency?: "daily" | "weekly";
}

export function TimeSlotModal({
  isOpen,
  onClose,
  playlistId,
  playlistName,
  timeSlotId,
  initialStartTime = new Date(),
  initialEndTime,
  initialFrequency = "daily"
}: TimeSlotModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(initialStartTime);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndTime);
  const [frequency, setFrequency] = useState<"daily" | "weekly">(initialFrequency);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!startDate) {
      toast({
        title: "Missing information",
        description: "Please select a start date",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        playlistId,
        startTime: startDate.toISOString(),
        endTime: endDate?.toISOString(),
        frequency
      };
      
      if (timeSlotId) {
        await apiRequest("PUT", `/api/timeslots/${timeSlotId}`, payload);
      } else {
        await apiRequest("POST", `/api/playlists/${playlistId}/timeslots`, payload);
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/playlists/${playlistId}/timeslots`] });
      toast({
        title: "Success",
        description: "Time slot has been saved"
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save time slot",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            TimeSlot Schedule
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">My playlist for</p>
          <h3 className="text-xl font-bold">{playlistName}</h3>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <Label className="text-base font-medium mb-1 sm:mb-0 sm:mr-4">Starts at:</Label>
            <div className="flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" className="ml-2">
                <Clock className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <Label className="text-base font-medium mb-1 sm:mb-0 sm:mr-4">Stops after:</Label>
            <div className="flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" className="ml-2">
                <Clock className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-base font-medium mb-3 block">Frequency:</Label>
            <RadioGroup value={frequency} onValueChange={(value) => setFrequency(value as "daily" | "weekly")}>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="frequencyDaily" />
                  <Label htmlFor="frequencyDaily">Daily</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="frequencyWeekly" />
                  <Label htmlFor="frequencyWeekly">Weekly</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button type="submit" disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? "Updating..." : "Update"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
