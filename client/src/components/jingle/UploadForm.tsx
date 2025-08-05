import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const uploadSchema = z.object({
  messageTitle: z.string().min(1, "Title is required"),
  messageFile: z.any().refine((files) => files?.length === 1, "File is required"),
  messageType: z.string().min(1, "Type is required"),
  messageLanguage: z.string().min(1, "Language is required"),
  startsAt: z.boolean().default(true),
  startDate: z.string().min(1, "Start date is required"),
  stopsAfter: z.boolean().default(false),
  stopDate: z.string().optional(),
  repeatType: z.enum(["none", "after-every", "additional", "specific-time"]).default("none"),
  repeatCount: z.number().optional(),
  repeatTimes: z.number().optional(),
  specificTime: z.string().regex(/^([01]\d|2[0-3])[0-5]\d$/, "Use HHMM format (24-hour)").optional(),
  repeatEveryTime: z.string().regex(/^([01]\d|2[0-3])[0-5]\d$/, "Use HHMM format (24-hour)").optional(),
  stopBeforeTime: z.string().regex(/^([01]\d|2[0-3])[0-5]\d$/, "Use HHMM format (24-hour)").optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
  locations: z.array(z.string()).min(1, "Select at least one location"),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

interface UploadFormProps {
  selectedLocations: string[];
  setSelectedLocations: (locations: string[]) => void;
  onSubmit: (data: UploadFormValues) => void;
  isSubmitting: boolean;
}

export default function UploadForm({ selectedLocations, setSelectedLocations, onSubmit, isSubmitting }: UploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      messageTitle: "A Title for Jingle / Voice Over",
      messageType: "vocal",
      messageLanguage: "english",
      startsAt: true,
      startDate: "08/01/1988",
      stopsAfter: false,
      stopDate: "08/01/1988",
      repeatType: "none",
      acceptTerms: true,
      locations: selectedLocations,
    },
  });

  const watchRepeatType = form.watch("repeatType");
  const watchStartsAt = form.watch("startsAt");
  const watchStopsAfter = form.watch("stopsAfter");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      form.setValue("messageFile", files, { shouldValidate: true });
    }
  };

  const handleSubmit = (data: UploadFormValues) => {
    onSubmit(data);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">New Upload</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="messageTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="messageFile"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Message File (.mp3)</FormLabel>
                  <div className="flex">
                    <Input
                      type="text"
                      readOnly
                      disabled
                      placeholder="No file selected"
                      value={selectedFile?.name || ""}
                      className="rounded-r-none"
                    />
                    <label htmlFor="file-upload" className="bg-gray-200 hover:bg-gray-300 text-gray-800 cursor-pointer px-4 rounded-r-md flex items-center">
                      Select file
                      <input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".mp3"
                        onChange={handleFileChange}
                        {...fieldProps}
                      />
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="messageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select message type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="vocal">Vocal</SelectItem>
                      <SelectItem value="instrumental">Instrumental</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="messageLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <Label className="block text-sm font-medium mb-1">Play Schedule</Label>
              
              <div className="space-y-3 mt-2">
                <FormField
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Starts at:</FormLabel>
                      {watchStartsAt && (
                        <div className="flex items-center">
                          <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="w-32" 
                                />
                              </FormControl>
                            )}
                          />
                          <Button variant="outline" size="icon" className="ml-1">
                            <Calendar className="h-5 w-5 text-gray-500" />
                          </Button>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stopsAfter"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Stops after:</FormLabel>
                      {watchStopsAfter && (
                        <div className="flex items-center">
                          <FormField
                            control={form.control}
                            name="stopDate"
                            render={({ field }) => (
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="w-32" 
                                />
                              </FormControl>
                            )}
                          />
                          <Button variant="outline" size="icon" className="ml-1">
                            <Calendar className="h-5 w-5 text-gray-500" />
                          </Button>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <div className="font-medium text-sm mb-2">Repeat message play (optional)</div>
                
                <FormField
                  control={form.control}
                  name="repeatType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-3"
                        >
                          <div className="flex items-center">
                            <RadioGroupItem value="none" id="none" />
                            <Label htmlFor="none" className="ml-2">None</Label>
                          </div>
                          
                          <div className="flex items-center">
                            <RadioGroupItem value="after-every" id="after-every" />
                            <Label htmlFor="after-every" className="ml-2">Repeat every</Label>
                            <FormField
                              control={form.control}
                              name="repeatEveryTime"
                              render={({ field }) => (
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="HHMM"
                                    className="ml-2 w-20"
                                    maxLength={4}
                                    disabled={watchRepeatType !== "after-every"}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                              )}
                            />
                            <span className="ml-1 text-xs text-gray-500">hours</span>
                          </div>
                          
                          <div className="flex items-center">
                            <RadioGroupItem value="additional" id="additional" />
                            <Label htmlFor="additional" className="ml-2">Stop before</Label>
                            <FormField
                              control={form.control}
                              name="stopBeforeTime"
                              render={({ field }) => (
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="HHMM"
                                    className="ml-2 w-20"
                                    maxLength={4}
                                    disabled={watchRepeatType !== "additional"}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                              )}
                            />
                            <span className="ml-1 text-xs text-gray-500">24hr</span>
                          </div>
                          
                          <div className="flex items-center">
                            <RadioGroupItem value="specific-time" id="specific-time" />
                            <Label htmlFor="specific-time" className="ml-2">Play at specific time:</Label>
                            <FormField
                              control={form.control}
                              name="specificTime"
                              render={({ field }) => (
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="HHMM"
                                    className="ml-2 w-20"
                                    maxLength={4}
                                    disabled={watchRepeatType !== "specific-time"}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                              )}
                            />
                            <span className="ml-1 text-xs text-gray-500">24hr</span>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <input type="hidden" {...form.register("locations")} value={selectedLocations} />
            
            <div className="mt-4 md:hidden">
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>
                      I accept the <a href="#" className="text-primary underline">Terms and Conditions</a>
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex space-x-3 mt-4">
                <Button 
                  type="submit" 
                  className="w-1/2 bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Uploading..." : "Upload"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-1/2"
                  onClick={() => form.reset()}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">Location(s) allowed to play this message</h2>
        
        <div className="bg-red-100 text-primary rounded-md px-3 py-2 flex justify-between items-center mb-4">
          <span>{selectedLocations.length} items selected</span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-primary border-primary"
              onClick={() => setSelectedLocations([])}
            >
              Remove All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-primary border-primary"
              onClick={() => setSelectedLocations(["Demo ( Fiverr Pvt Ltd )"])}
            >
              Add All
            </Button>
          </div>
        </div>
        
        <div className="border border-gray-300 rounded-md p-3 mb-6">
          {selectedLocations.length > 0 ? (
            selectedLocations.map((location, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{location}</span>
                <button 
                  className="text-primary"
                  onClick={() => setSelectedLocations(selectedLocations.filter(loc => loc !== location))}
                >
                  -
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-2">No locations selected</div>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 mb-6">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>
                    I accept the <a href="#" className="text-primary underline">Terms and Conditions</a>
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-3">
              <Button 
                type="submit" 
                className="w-1/2 bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Uploading..." : "Upload"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-1/2"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
