import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const requestFormSchema = z.object({
  requestType: z.string().min(1, "Request type is required"),
  licensingRights: z.string().min(1, "Licensing rights is required"),
  lengthOfMusic: z.string().min(1, "Length of music is required"),
  submissionTimeframe: z.string().min(1, "Submission timeframe is required"),
  requireLyrics: z.string().min(1, "Require lyrics/vocals is required"),
  numberOfWords: z.string().optional(),
  briefOverview: z.string().min(10, "Brief overview must be at least 10 characters"),
  targetAudience: z.string().min(1, "Target audience is required"),
  supportingVideo: z.string().optional(),
  supportingImages: z.array(z.any()).optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

interface RequestFormProps {
  onCancel?: () => void;
}

export function RequestForm({ onCancel }: RequestFormProps) {
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      requestType: "Jingle",
      licensingRights: "1 year",
      lengthOfMusic: "No Preference",
      submissionTimeframe: "21 days",
      requireLyrics: "No Preference",
      numberOfWords: "",
      briefOverview: "",
      targetAudience: "",
      supportingVideo: "",
      supportingImages: [],
      name: "",
      email: "",
      contactNumber: "",
    },
  });
  
  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestFormValues) => {
      // Transform data to match the existing API structure
      const requestData = {
        title: `${data.requestType} Request`,
        type: data.requestType,
        description: `${data.briefOverview}\n\nTarget Audience: ${data.targetAudience}\n\nContact: ${data.name} (${data.email}, ${data.contactNumber})`
      };
      const response = await apiRequest("/api/requests", "POST", requestData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your request has been submitted successfully",
      });
      
      // Reset form
      form.reset();
      
      // Invalidate requests query
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: RequestFormValues) => {
    createRequestMutation.mutate(data);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Jingle/Voiceover</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Jingle">Jingle</SelectItem>
                        <SelectItem value="Voiceover">Voiceover</SelectItem>
                        <SelectItem value="Advertisement">Advertisement</SelectItem>
                        <SelectItem value="Announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licensingRights"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Licensing Rights</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1 year">1 year</SelectItem>
                        <SelectItem value="2 years">2 years</SelectItem>
                        <SelectItem value="3 years">3 years</SelectItem>
                        <SelectItem value="5 years">5 years</SelectItem>
                        <SelectItem value="Unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lengthOfMusic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length of music</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="No Preference">No Preference</SelectItem>
                        <SelectItem value="15 seconds">15 seconds</SelectItem>
                        <SelectItem value="30 seconds">30 seconds</SelectItem>
                        <SelectItem value="45 seconds">45 seconds</SelectItem>
                        <SelectItem value="60 seconds">60 seconds</SelectItem>
                        <SelectItem value="90 seconds">90 seconds</SelectItem>
                        <SelectItem value="2 minutes">2 minutes</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="submissionTimeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission timeframe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="7 days">7 days</SelectItem>
                        <SelectItem value="14 days">14 days</SelectItem>
                        <SelectItem value="21 days">21 days</SelectItem>
                        <SelectItem value="30 days">30 days</SelectItem>
                        <SelectItem value="45 days">45 days</SelectItem>
                        <SelectItem value="60 days">60 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requireLyrics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Require lyrics/vocals?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="No Preference">No Preference</SelectItem>
                        <SelectItem value="Yes - I will provide lyrics">Yes - I will provide lyrics</SelectItem>
                        <SelectItem value="Yes - Please write lyrics">Yes - Please write lyrics</SelectItem>
                        <SelectItem value="No - Instrumental only">No - Instrumental only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfWords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of words</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 50 words" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="briefOverview"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief Overview</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us what your project is about. You may include external links here for reference..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Who will be exposed to this piece of music/sound design/voiceover? (i.e. age group, gender, etc.)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supportingVideo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supporting Video (if any)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share links to external videos. E.g. Youtube, Vimeo, etc."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Supporting Images/Documents (if any)</FormLabel>
                <div className="space-y-2">
                  <Input type="file" multiple accept="image/*,.pdf,.doc,.docx" />
                  <Input type="file" multiple accept="image/*,.pdf,.doc,.docx" />
                  <Input type="file" multiple accept="image/*,.pdf,.doc,.docx" />
                </div>
              </FormItem>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Your Contact Details</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={createRequestMutation.isPending}
                >
                  {createRequestMutation.isPending ? "Submitting..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-gray-400 hover:bg-gray-500 text-white"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Request</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel? All form data will be lost.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Continue Editing
            </Button>
            <Button
              onClick={() => {
                setShowCancelDialog(false);
                form.reset();
                onCancel?.();
              }}
            >
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
