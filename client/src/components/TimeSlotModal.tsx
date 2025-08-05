import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    name: string;
    startDate: string;
    endDate: string;
    frequency: string;
  };
  onUpdate: (data: {
    name: string;
    startDate: string;
    endDate: string;
    frequency: string;
  }) => void;
}

const TimeSlotModal = ({ isOpen, onClose, data, onUpdate }: TimeSlotModalProps) => {
  const [formData, setFormData] = useState(data);

  const handleUpdate = () => {
    onUpdate(formData);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="bg-[#1a2234] text-white py-3 px-4 rounded-t-lg text-center text-lg font-semibold">
          TimeSlot Schedule
        </div>
        
        <div className="p-6">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-600">My playlist for demo Fiverr Pte Ltd</div>
            <div className="text-xl font-semibold">{formData.name}</div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="block text-gray-700">Starts at:</Label>
              <div className="flex items-center">
                <Input 
                  type="text" 
                  value={formData.startDate} 
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-32 px-3 py-1 border border-gray-300 rounded-l-md"
                />
                <Button variant="outline" size="icon" className="h-9 rounded-l-none border-l-0">
                  <Calendar className="h-4 w-4" />
                </Button>
                <div className="flex ml-2">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-r-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-l-none border-l-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
                <Button variant="outline" size="icon" className="h-9 ml-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="block text-gray-700">Stops after:</Label>
              <div className="flex items-center">
                <Input 
                  type="text" 
                  value={formData.endDate} 
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-32 px-3 py-1 border border-gray-300 rounded-l-md"
                />
                <Button variant="outline" size="icon" className="h-9 rounded-l-none border-l-0">
                  <Calendar className="h-4 w-4" />
                </Button>
                <div className="flex ml-2">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-r-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-l-none border-l-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
                <Button variant="outline" size="icon" className="h-9 ml-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
            
            <div>
              <div className="mb-2 font-medium">Frequency:</div>
              <RadioGroup 
                value={formData.frequency}
                onValueChange={(value) => setFormData({...formData, frequency: value})}
                className="flex items-center space-x-6"
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
          
          <div className="flex space-x-4 mt-8">
            <Button 
              className="bg-[#ef5350] hover:bg-[#e53935] flex-1"
              onClick={handleUpdate}
            >
              Update
            </Button>
            <Button 
              className="bg-[#ef5350] hover:bg-[#e53935] flex-1"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotModal;
