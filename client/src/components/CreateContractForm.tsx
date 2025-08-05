import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ContractTemplate {
  id: number;
  name: string;
  tier: string;
  category: string;
  currency: string;
  billingType: string;
  monthlyFixedFee: string;
  perTriggerRate: string;
  minimumGuarantee: string;
  performanceBonusThreshold: string;
  performanceBonusRate: string;
  venuePayoutType: string;
  venueFixedMonthly: string;
  venuePercentageRate: string;
  venueMinimumGuarantee: string;
  venuePerformanceBonusThreshold: string;
  venuePerformanceBonusRate: string;
  maxTriggersPerMonth: number;
  monthlyBudget: string;
  isActive: boolean;
}

interface Advertiser {
  id: number;
  name: string;
  displayName: string;
  type: string;
  country: string;
  city: string;
  isActive: boolean;
  credits: string;
}

interface Venue {
  id: number;
  name: string;
  location: string;
  type: string;
  country: string;
  city: string;
  capacity: number;
  isActive: boolean;
}

const advertiserContractSchema = z.object({
  advertiserId: z.string().min(1, "Please select an advertiser"),
  templateId: z.string().min(1, "Please select a contract template"),
  contractName: z.string().min(1, "Contract name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

const venueContractSchema = z.object({
  venueId: z.string().min(1, "Please select a venue"),
  templateId: z.string().min(1, "Please select a contract template"),
  contractName: z.string().min(1, "Contract name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

interface CreateContractFormProps {
  onSuccess?: () => void;
}

export function CreateContractForm({ onSuccess }: CreateContractFormProps) {
  const [open, setOpen] = useState(false);
  const [contractType, setContractType] = useState<"advertiser" | "venue">("advertiser");
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: contractTemplates = [] } = useQuery<ContractTemplate[]>({
    queryKey: ["/api/v1/contract-templates"],
  });

  const { data: advertisers = [] } = useQuery<Advertiser[]>({
    queryKey: ["/api/v1/advertisers"],
  });

  const { data: venues = [] } = useQuery<Venue[]>({
    queryKey: ["/api/v1/venues"],
  });

  // Forms
  const advertiserForm = useForm<z.infer<typeof advertiserContractSchema>>({
    resolver: zodResolver(advertiserContractSchema),
    defaultValues: {
      advertiserId: "",
      templateId: "",
      contractName: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  const venueForm = useForm<z.infer<typeof venueContractSchema>>({
    resolver: zodResolver(venueContractSchema),
    defaultValues: {
      venueId: "",
      templateId: "",
      contractName: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  // Mutations
  const createAdvertiserContract = useMutation({
    mutationFn: (data: any) => apiRequest("/api/v1/advertiser-contracts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      // Force immediate refresh of all related data
      queryClient.invalidateQueries({ queryKey: ["/api/v1/advertiser-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/venue-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/contract-templates"] });
      
      toast({
        title: "✅ Success",
        description: "Advertiser contract created successfully",
      });
      setOpen(false);
      advertiserForm.reset();
      setSelectedTemplate(null);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to create advertiser contract. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createVenueContract = useMutation({
    mutationFn: (data: any) => apiRequest("/api/v1/venue-contracts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      // Force immediate refresh of all related data
      queryClient.invalidateQueries({ queryKey: ["/api/v1/venue-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/advertiser-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/contract-templates"] });
      
      toast({
        title: "✅ Success",
        description: "Venue contract created successfully",
      });
      setOpen(false);
      venueForm.reset();
      setSelectedTemplate(null);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to create venue contract. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onAdvertiserSubmit = (values: z.infer<typeof advertiserContractSchema>) => {
    createAdvertiserContract.mutate({
      advertiserId: parseInt(values.advertiserId),
      templateId: parseInt(values.templateId),
      contractName: values.contractName,
      startDate: values.startDate,
      endDate: values.endDate,
    });
  };

  const onVenueSubmit = (values: z.infer<typeof venueContractSchema>) => {
    createVenueContract.mutate({
      venueId: parseInt(values.venueId),
      templateId: parseInt(values.templateId),
      contractName: values.contractName,
      startDate: values.startDate,
      endDate: values.endDate,
    });
  };

  const handleTemplateSelect = (templateId: string, form: any) => {
    form.setValue("templateId", templateId);
    const template = contractTemplates.find(t => t.id === parseInt(templateId));
    setSelectedTemplate(template || null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create New Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Contract</DialogTitle>
          <DialogDescription>
            Create a new billing contract for an advertiser or venue partner
          </DialogDescription>
        </DialogHeader>

        <Tabs value={contractType} onValueChange={(value) => setContractType(value as "advertiser" | "venue")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="advertiser" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Advertiser Contract</span>
            </TabsTrigger>
            <TabsTrigger value="venue" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>Venue Contract</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="advertiser" className="space-y-6">
            <Form {...advertiserForm}>
              <form onSubmit={advertiserForm.handleSubmit(onAdvertiserSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={advertiserForm.control}
                    name="advertiserId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Advertiser</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an advertiser" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {advertisers.map((advertiser) => (
                              <SelectItem key={advertiser.id} value={advertiser.id.toString()}>
                                {advertiser.displayName} ({advertiser.name})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={advertiserForm.control}
                    name="contractName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contract name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={advertiserForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={advertiserForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={advertiserForm.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Template</FormLabel>
                      <FormDescription>
                        Choose a template that defines the billing structure and terms
                      </FormDescription>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contractTemplates.map((template) => (
                          <Card 
                            key={template.id} 
                            className={`cursor-pointer transition-colors ${
                              field.value === template.id.toString() 
                                ? 'border-primary bg-primary/5' 
                                : 'hover:border-primary/50'
                            }`}
                            onClick={() => handleTemplateSelect(template.id.toString(), advertiserForm)}
                          >
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">{template.name}</CardTitle>
                              <div className="flex gap-2">
                                <Badge variant="outline">{template.tier}</Badge>
                                <Badge>{template.billingType}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span>Currency:</span>
                                <span className="font-medium">{template.currency}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Monthly:</span>
                                <span className="font-medium">${template.monthlyFixedFee}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Per Trigger:</span>
                                <span className="font-medium">${template.perTriggerRate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Max Triggers:</span>
                                <span className="font-medium">{template.maxTriggersPerMonth.toLocaleString()}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedTemplate && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Selected Template: {selectedTemplate.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Billing Details:</strong>
                        <p>Type: {selectedTemplate.billingType}</p>
                        <p>Currency: {selectedTemplate.currency}</p>
                        <p>Monthly Fee: ${selectedTemplate.monthlyFixedFee}</p>
                        <p>Per Trigger: ${selectedTemplate.perTriggerRate}</p>
                      </div>
                      <div>
                        <strong>Limits & Budget:</strong>
                        <p>Max Triggers: {selectedTemplate.maxTriggersPerMonth.toLocaleString()}/month</p>
                        <p>Monthly Budget: ${selectedTemplate.monthlyBudget}</p>
                        <p>Minimum Guarantee: ${selectedTemplate.minimumGuarantee}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createAdvertiserContract.isPending}
                  >
                    {createAdvertiserContract.isPending ? "Creating..." : "Create Contract"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="venue" className="space-y-6">
            <Form {...venueForm}>
              <form onSubmit={venueForm.handleSubmit(onVenueSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={venueForm.control}
                    name="venueId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a venue" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {venues.map((venue) => (
                              <SelectItem key={venue.id} value={venue.id.toString()}>
                                {venue.name} - {venue.location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={venueForm.control}
                    name="contractName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contract name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={venueForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={venueForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={venueForm.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Template</FormLabel>
                      <FormDescription>
                        Choose a template that defines the payout structure for the venue
                      </FormDescription>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contractTemplates.map((template) => (
                          <Card 
                            key={template.id} 
                            className={`cursor-pointer transition-colors ${
                              field.value === template.id.toString() 
                                ? 'border-primary bg-primary/5' 
                                : 'hover:border-primary/50'
                            }`}
                            onClick={() => handleTemplateSelect(template.id.toString(), venueForm)}
                          >
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">{template.name}</CardTitle>
                              <div className="flex gap-2">
                                <Badge variant="outline">{template.tier}</Badge>
                                <Badge>{template.venuePayoutType}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span>Currency:</span>
                                <span className="font-medium">{template.currency}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Fixed Monthly:</span>
                                <span className="font-medium">${template.venueFixedMonthly}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Percentage:</span>
                                <span className="font-medium">{template.venuePercentageRate}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Min Guarantee:</span>
                                <span className="font-medium">${template.venueMinimumGuarantee}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createVenueContract.isPending}
                  >
                    {createVenueContract.isPending ? "Creating..." : "Create Contract"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}