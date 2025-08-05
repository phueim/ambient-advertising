import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimeSlotSchedulerProps {
  onClose: () => void;
  onUpdate: () => void;
}

export default function TimeSlotScheduler({ onClose, onUpdate }: TimeSlotSchedulerProps) {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState("08/01/1988");
  const [endDate, setEndDate] = useState("08/01/1988");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");

  const handleUpdate = () => {
    toast({
      title: "Time slot updated",
      description: `Schedule updated with ${frequency} frequency`,
    });
    onUpdate();
  };

  return (
    <div className="p-6 pt-2">
      <div className="text-sm text-gray-600 mb-1">My playlist for demo Fiverr Pte Ltd</div>
      <div className="text-xl font-semibold mb-6">Daily Instrumental - Pop Vocal</div>
      
      <div className="space-y-4 mb-6">
        <div>
          <Label className="font-medium mb-2">Starts at:</Label>
          <div className="flex items-center">
            <Input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-grow"
            />
            <Button variant="outline" size="icon" className="ml-1">
              <Calendar className="h-5 w-5 text-gray-500" />
            </Button>
            <div className="ml-2 flex space-x-1">
              <Button variant="outline" size="icon" className="p-1 h-8 w-8">
                -
              </Button>
              <Button variant="outline" size="icon" className="p-1 h-8 w-8">
                +
              </Button>
            </div>
            <Button variant="outline" size="icon" className="ml-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
          </div>
        </div>
        
        <div>
          <Label className="font-medium mb-2">Stops after:</Label>
          <div className="flex items-center">
            <Input
              type="text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-grow"
            />
            <Button variant="outline" size="icon" className="ml-1">
              <Calendar className="h-5 w-5 text-gray-500" />
            </Button>
            <div className="ml-2 flex space-x-1">
              <Button variant="outline" size="icon" className="p-1 h-8 w-8">
                -
              </Button>
              <Button variant="outline" size="icon" className="p-1 h-8 w-8">
                +
              </Button>
            </div>
            <Button variant="outline" size="icon" className="ml-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
          </div>
        </div>
        
        <div>
          <Label className="font-medium mb-2">Frequency:</Label>
          <RadioGroup
            value={frequency}
            onValueChange={(value) => setFrequency(value as "daily" | "weekly")}
            className="flex items-center space-x-8"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily">Daily</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly">Weekly</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <Button 
          className="w-1/2 bg-primary hover:bg-primary/90"
          onClick={handleUpdate}
        >
          Update
        </Button>
        <Button 
          className="w-1/2 bg-primary hover:bg-primary/90"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
