import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";
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

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  tier: z.string().min(1, "Tier is required"),
  category: z.string().min(1, "Category is required"),
  currency: z.string().min(1, "Currency is required"),
  billingType: z.string().min(1, "Billing type is required"),
  monthlyFixedFee: z.string().min(1, "Monthly fixed fee is required"),
  perTriggerRate: z.string().min(1, "Per trigger rate is required"),
  minimumGuarantee: z.string().min(1, "Minimum guarantee is required"),
  performanceBonusThreshold: z.string().min(1, "Performance bonus threshold is required"),
  performanceBonusRate: z.string().min(1, "Performance bonus rate is required"),
  venuePayoutType: z.string().min(1, "Venue payout type is required"),
  venueFixedMonthly: z.string().min(1, "Venue fixed monthly is required"),
  venuePercentageRate: z.string().min(1, "Venue percentage rate is required"),
  venueMinimumGuarantee: z.string().min(1, "Venue minimum guarantee is required"),
  venuePerformanceBonusThreshold: z.string().min(1, "Venue performance bonus threshold is required"),
  venuePerformanceBonusRate: z.string().min(1, "Venue performance bonus rate is required"),
  maxTriggersPerMonth: z.string().min(1, "Max triggers per month is required"),
  monthlyBudget: z.string().min(1, "Monthly budget is required"),
  isActive: z.boolean(),
});

interface EditTemplateFormProps {
  template: ContractTemplate;
}

export function EditTemplateForm({ template }: EditTemplateFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template.name,
      tier: template.tier,
      category: template.category,
      currency: template.currency,
      billingType: template.billingType,
      monthlyFixedFee: template.monthlyFixedFee,
      perTriggerRate: template.perTriggerRate,
      minimumGuarantee: template.minimumGuarantee,
      performanceBonusThreshold: template.performanceBonusThreshold,
      performanceBonusRate: template.performanceBonusRate,
      venuePayoutType: template.venuePayoutType,
      venueFixedMonthly: template.venueFixedMonthly,
      venuePercentageRate: template.venuePercentageRate,
      venueMinimumGuarantee: template.venueMinimumGuarantee,
      venuePerformanceBonusThreshold: template.venuePerformanceBonusThreshold,
      venuePerformanceBonusRate: template.venuePerformanceBonusRate,
      maxTriggersPerMonth: template.maxTriggersPerMonth.toString(),
      monthlyBudget: template.monthlyBudget,
      isActive: template.isActive,
    },
  });

  // Update template mutation
  const updateTemplate = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/v1/contract-templates/${template.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/contract-templates"] });
      toast({
        title: "Success",
        description: "Contract template updated successfully",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update contract template",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplate = useMutation({
    mutationFn: () => apiRequest(`/api/v1/contract-templates/${template.id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/contract-templates"] });
      toast({
        title: "Success",
        description: "Contract template deleted successfully",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete contract template",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof templateSchema>) => {
    updateTemplate.mutate({
      ...values,
      maxTriggersPerMonth: parseInt(values.maxTriggersPerMonth),
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this contract template? This action cannot be undone and may affect existing contracts.")) {
      deleteTemplate.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Contract Template</DialogTitle>
          <DialogDescription>
            Update the contract template details and pricing structure
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="advertiser">Advertiser</SelectItem>
                        <SelectItem value="venue">Venue</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SGD">SGD</SelectItem>
                        <SelectItem value="MYR">MYR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly_fixed">Monthly Fixed</SelectItem>
                        <SelectItem value="per_trigger">Per Trigger</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormLabel>Active Template</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Advertiser Billing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Venue Payout</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="venuePayoutType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Payout Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="minimum_guarantee">Minimum Guarantee</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venueFixedMonthly"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Fixed Monthly</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venuePercentageRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Percentage Rate (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venueMinimumGuarantee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Minimum Guarantee</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venuePerformanceBonusThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Performance Bonus Threshold</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venuePerformanceBonusRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Performance Bonus Rate</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteTemplate.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Template
              </Button>
              <div className="space-x-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTemplate.isPending}>
                  {updateTemplate.isPending ? "Updating..." : "Update Template"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}