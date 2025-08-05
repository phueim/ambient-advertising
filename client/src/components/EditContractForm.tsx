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
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdvertiserContract {
  id: number;
  advertiserId: number;
  templateId: number;
  contractName: string;
  currency: string;
  billingType: string;
  monthlyFixedFee: string;
  perTriggerRate: string;
  minimumGuarantee: string;
  performanceBonusThreshold: string;
  performanceBonusRate: string;
  maxTriggersPerMonth: number;
  monthlyBudget: string;
  currentMonthSpend: string;
  currentMonthTriggers: number;
  startDate: string;
  endDate: string;
  status: string;
}

interface VenueContract {
  id: number;
  venueId: number;
  templateId: number;
  contractName: string;
  currency: string;
  payoutType: string;
  fixedMonthly: string;
  percentageRate: string;
  minimumGuarantee: string;
  performanceBonusThreshold: string;
  performanceBonusRate: string;
  currentMonthRevenue: string;
  currentMonthTriggers: number;
  startDate: string;
  endDate: string;
  status: string;
}

const advertiserContractSchema = z.object({
  contractName: z.string().min(1, "Contract name is required"),
  monthlyFixedFee: z.string().min(1, "Monthly fixed fee is required"),
  perTriggerRate: z.string().min(1, "Per trigger rate is required"),
  minimumGuarantee: z.string().min(1, "Minimum guarantee is required"),
  performanceBonusThreshold: z.string().min(1, "Performance bonus threshold is required"),
  performanceBonusRate: z.string().min(1, "Performance bonus rate is required"),
  maxTriggersPerMonth: z.string().min(1, "Max triggers per month is required"),
  monthlyBudget: z.string().min(1, "Monthly budget is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.string().min(1, "Status is required"),
});

const venueContractSchema = z.object({
  contractName: z.string().min(1, "Contract name is required"),
  fixedMonthly: z.string().min(1, "Fixed monthly payout is required"),
  percentageRate: z.string().min(1, "Percentage rate is required"),
  minimumGuarantee: z.string().min(1, "Minimum guarantee is required"),
  performanceBonusThreshold: z.string().min(1, "Performance bonus threshold is required"),
  performanceBonusRate: z.string().min(1, "Performance bonus rate is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.string().min(1, "Status is required"),
});

interface EditContractFormProps {
  contract: AdvertiserContract | VenueContract;
  type: "advertiser" | "venue";
}

export function EditContractForm({ contract, type }: EditContractFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isAdvertiserContract = (contract: AdvertiserContract | VenueContract): contract is AdvertiserContract => {
    return type === "advertiser";
  };

  const isVenueContract = (contract: AdvertiserContract | VenueContract): contract is VenueContract => {
    return type === "venue";
  };

  // Form for advertiser contracts
  const advertiserForm = useForm<z.infer<typeof advertiserContractSchema>>({
    resolver: zodResolver(advertiserContractSchema),
    defaultValues: isAdvertiserContract(contract) ? {
      contractName: contract.contractName,
      monthlyFixedFee: contract.monthlyFixedFee,
      perTriggerRate: contract.perTriggerRate,
      minimumGuarantee: contract.minimumGuarantee,
      performanceBonusThreshold: contract.performanceBonusThreshold,
      performanceBonusRate: contract.performanceBonusRate,
      maxTriggersPerMonth: contract.maxTriggersPerMonth.toString(),
      monthlyBudget: contract.monthlyBudget,
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: contract.status,
    } : {},
  });

  // Form for venue contracts
  const venueForm = useForm<z.infer<typeof venueContractSchema>>({
    resolver: zodResolver(venueContractSchema),
    defaultValues: isVenueContract(contract) ? {
      contractName: contract.contractName,
      fixedMonthly: contract.fixedMonthly,
      percentageRate: contract.percentageRate,
      minimumGuarantee: contract.minimumGuarantee,
      performanceBonusThreshold: contract.performanceBonusThreshold,
      performanceBonusRate: contract.performanceBonusRate,
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: contract.status,
    } : {},
  });

  // Update advertiser contract mutation
  const updateAdvertiserContract = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/v1/advertiser-contracts/${contract.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      // Force immediate refresh of contract data
      queryClient.invalidateQueries({ queryKey: ["/api/v1/advertiser-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/venue-contracts"] });
      toast({
        title: "✅ Success",
        description: "Advertiser contract updated successfully",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update advertiser contract. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update venue contract mutation
  const updateVenueContract = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/v1/venue-contracts/${contract.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      // Force immediate refresh of contract data
      queryClient.invalidateQueries({ queryKey: ["/api/v1/venue-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/advertiser-contracts"] });
      toast({
        title: "✅ Success",
        description: "Venue contract updated successfully",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update venue contract. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete contract mutation
  const deleteContract = useMutation({
    mutationFn: () => {
      const endpoint = type === "advertiser" 
        ? `/api/v1/advertiser-contracts/${contract.id}`
        : `/api/v1/venue-contracts/${contract.id}`;
      return apiRequest(endpoint, { method: "DELETE" });
    },
    onSuccess: async () => {
      const primaryQueryKey = type === "advertiser" 
        ? ["/api/v1/advertiser-contracts"]
        : ["/api/v1/venue-contracts"];
      const secondaryQueryKey = type === "advertiser"
        ? ["/api/v1/venue-contracts"] 
        : ["/api/v1/advertiser-contracts"];
      
      // Multiple refresh strategies to ensure data updates
      // Strategy 1: Invalidate primary contract type
      await queryClient.invalidateQueries({ queryKey: primaryQueryKey });
      
      // Strategy 2: Invalidate secondary contract type for completeness
      await queryClient.invalidateQueries({ queryKey: secondaryQueryKey });
      
      // Strategy 3: Reset queries to force completely fresh data
      queryClient.resetQueries({ queryKey: primaryQueryKey });
      
      toast({
        title: "✅ Success",
        description: `${type} contract deleted successfully`,
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || `Failed to delete ${type} contract. Please check if it has associated data and try again.`,
        variant: "destructive",
      });
    },
  });

  const onAdvertiserSubmit = (values: z.infer<typeof advertiserContractSchema>) => {
    updateAdvertiserContract.mutate({
      ...values,
      maxTriggersPerMonth: parseInt(values.maxTriggersPerMonth),
    });
  };

  const onVenueSubmit = (values: z.infer<typeof venueContractSchema>) => {
    updateVenueContract.mutate(values);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this ${type} contract? This action cannot be undone.`)) {
      deleteContract.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {type === "advertiser" ? "Advertiser" : "Venue"} Contract</DialogTitle>
          <DialogDescription>
            Update the contract details and terms
          </DialogDescription>
        </DialogHeader>

        {type === "advertiser" && isAdvertiserContract(contract) && (
          <Form {...advertiserForm}>
            <form onSubmit={advertiserForm.handleSubmit(onAdvertiserSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={advertiserForm.control}
                  name="contractName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={advertiserForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={advertiserForm.control}
                  name="monthlyFixedFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Fixed Fee</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={advertiserForm.control}
                  name="perTriggerRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Per Trigger Rate</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={advertiserForm.control}
                  name="minimumGuarantee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Guarantee</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={advertiserForm.control}
                  name="performanceBonusThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Performance Bonus Threshold</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={advertiserForm.control}
                  name="performanceBonusRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Performance Bonus Rate</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={advertiserForm.control}
                  name="maxTriggersPerMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Triggers Per Month</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={advertiserForm.control}
                  name="monthlyBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Budget</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
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
                        <Input {...field} type="date" />
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
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteContract.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Contract
                </Button>
                <div className="space-x-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateAdvertiserContract.isPending}
                  >
                    {updateAdvertiserContract.isPending ? "Updating..." : "Update Contract"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}

        {type === "venue" && isVenueContract(contract) && (
          <Form {...venueForm}>
            <form onSubmit={venueForm.handleSubmit(onVenueSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={venueForm.control}
                  name="contractName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={venueForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={venueForm.control}
                  name="fixedMonthly"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fixed Monthly Payout</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={venueForm.control}
                  name="percentageRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentage Rate (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={venueForm.control}
                  name="minimumGuarantee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Guarantee</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={venueForm.control}
                  name="performanceBonusThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Performance Bonus Threshold</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={venueForm.control}
                  name="performanceBonusRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Performance Bonus Rate</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
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
                        <Input {...field} type="date" />
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
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteContract.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Contract
                </Button>
                <div className="space-x-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateVenueContract.isPending}
                  >
                    {updateVenueContract.isPending ? "Updating..." : "Update Contract"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}