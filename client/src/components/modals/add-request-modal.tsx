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
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddRequestModal({ isOpen, onClose }: AddRequestModalProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a request title",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await apiRequest("POST", "/api/jingle-requests", {
        title,
        status: "Submitted"
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/jingle-requests"] });
      toast({
        title: "Success",
        description: "Your request has been submitted"
      });
      
      setTitle('');
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your request",
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
          <DialogTitle className="text-xl font-semibold">
            New Jingle/Voiceover Request
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="requestTitle">Request Title</Label>
            <Input
              id="requestTitle"
              placeholder="Enter a title for your request"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <p className="text-sm text-gray-500">
            After submission, our team will review your request and get back to you with pricing and additional information.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
