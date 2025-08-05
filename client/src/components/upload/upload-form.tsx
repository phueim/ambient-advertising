import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Brand } from "@shared/schema";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  language: z.string().min(1, "Language is required"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  repeatType: z.enum(["none", "after", "additional", "specific"]),
  repeatValue: z.number().min(1).optional(),
  brandIds: z.array(z.number()).optional(),
  acceptTerms: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions" }),
});

type FormValues = z.infer<typeof formSchema>;

export function UploadForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  
  // Load brands
  const { data: brands } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
    enabled: !!user,
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "Vocal",
      language: "English",
      repeatType: "none",
      acceptTerms: false,
    },
  });
  
  const uploadJingleMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // In a real app, we would upload the file first and then create the jingle record
      // For this example, we'll just create the jingle record
      
      // Create repeat frequency object based on selection
      let repeatFrequency = null;
      if (data.repeatType !== "none" && data.repeatValue) {
        repeatFrequency = {
          type: data.repeatType,
          value: data.repeatValue,
        };
      }
      
      const jingleData = {
        title: data.title,
        type: data.type,
        language: data.language,
        startDate: data.startDate,
        endDate: data.endDate,
        repeatFrequency,
        brandIds: selectedBrands.length > 0 ? selectedBrands : undefined,
      };
      
      const response = await apiRequest("POST", "/api/jingles", jingleData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Jingle uploaded successfully and awaiting approval",
      });
      
      // Reset the form
      form.reset();
      setFile(null);
      setSelectedBrands([]);
      
      // Invalidate jingles query
      queryClient.invalidateQueries({ queryKey: ["/api/jingles"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload jingle",
        variant: "destructive",
      });
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if the file is an audio file (mp3, wav, etc.)
      if (!selectedFile.type.startsWith("audio/")) {
        toast({
          title: "Invalid file",
          description: "Please select an audio file (MP3, WAV, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        toast({
          title: "File too large",
          description: "Audio file size should not exceed 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  const toggleBrand = (brandId: number) => {
    setSelectedBrands(prev => 
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };
  
  const handleSelectAllBrands = () => {
    if (brands) {
      setSelectedBrands(brands.map(brand => brand.id));
    }
  };
  
  const handleRemoveAllBrands = () => {
    setSelectedBrands([]);
  };
  
  const onSubmit = (data: FormValues) => {
    if (!file) {
      toast({
        title: "Missing file",
        description: "Please select an audio file to upload",
        variant: "destructive",
      });
      return;
    }
    
    uploadJingleMutation.mutate(data);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>New Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Title</FormLabel>
                    <FormControl>
                      <Input placeholder="A Title for Jingle / Voice Over" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Message File (.mp3)</FormLabel>
                <div className="flex">
                  <Input
                    readOnly
                    value={file ? file.name : "No file selected"}
                    className="rounded-r-none"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-l-none"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Select file
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </FormItem>
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select message type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Vocal">Vocal</SelectItem>
                        <SelectItem value="Jingle">Jingle</SelectItem>
                        <SelectItem value="Announcement">Announcement</SelectItem>
                        <SelectItem value="Advertisement">Advertisement</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                        <SelectItem value="Chinese">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel className="block mb-2">Play Schedule</FormLabel>
                
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <Checkbox
                          id="starts-at"
                          checked={!!field.value}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange(new Date());
                            } else {
                              field.onChange(undefined);
                            }
                          }}
                        />
                        <Label htmlFor="starts-at" className="ml-2">Starts at:</Label>
                        <div className="ml-4">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-[180px] justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={!field.value}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "MM/dd/yyyy") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <Checkbox
                          id="stops-after"
                          checked={!!field.value}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange(new Date());
                            } else {
                              field.onChange(undefined);
                            }
                          }}
                        />
                        <Label htmlFor="stops-after" className="ml-2">Stops after:</Label>
                        <div className="ml-4">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-[180px] justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={!field.value}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "MM/dd/yyyy") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                disabled={(date) => {
                                  const startDate = form.getValues("startDate");
                                  return startDate ? date < startDate : false;
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="repeatType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repeat message play (optional)</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="none" id="repeat-none" />
                          <Label htmlFor="repeat-none">None</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="after" id="repeat-after" />
                          <Label htmlFor="repeat-after">Repeat message after every</Label>
                          <Input
                            type="number"
                            className="w-16 ml-2"
                            disabled={field.value !== "after"}
                            {...form.register("repeatValue", { valueAsNumber: true })}
                          />
                          <span>message(s)</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="additional" id="repeat-additional" />
                          <Label htmlFor="repeat-additional">Repeat message additional</Label>
                          <Input
                            type="number"
                            className="w-16 ml-2"
                            disabled={field.value !== "additional"}
                            {...form.register("repeatValue", { valueAsNumber: true })}
                          />
                          <span>time(s)</span>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Location(s) allowed to play this message</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-2 bg-gray-50 rounded-md mb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">{selectedBrands.length} items selected</div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRemoveAllBrands}
                >
                  Remove All
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleSelectAllBrands}
                >
                  Add All
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
            {brands?.length ? (
              brands.map(brand => (
                <div 
                  key={brand.id} 
                  className="p-3 border-b border-gray-200 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleBrand(brand.id)}
                >
                  <span>{brand.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    {selectedBrands.includes(brand.id) ? (
                      <span className="text-red-500">-</span>
                    ) : (
                      <span className="text-green-500">+</span>
                    )}
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">
                No brands available
              </div>
            )}
          </div>
          
          <div className="mt-8">
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="terms"
                      />
                    </FormControl>
                    <Label htmlFor="terms">
                      I accept the <a href="#" className="text-primary hover:underline">Terms and Conditions</a>
                    </Label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="mt-4 flex space-x-4">
            <Button 
              type="submit"
              className="flex-1"
              onClick={form.handleSubmit(onSubmit)}
              disabled={uploadJingleMutation.isPending}
            >
              {uploadJingleMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              className="flex-1"
              onClick={() => {
                form.reset();
                setFile(null);
                setSelectedBrands([]);
              }}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
