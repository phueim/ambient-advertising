import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Edit,
  CreditCard,
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Advertiser {
  id: number;
  name: string;
  displayName: string;
  creditBalance: string;
  spentAmount: string;
  budgetCap: string;
  status: string;
  createdAt: string;
}

interface ConditionRule {
  id: number;
  ruleId: string;
  advertiserId?: number;
  priority: number;
  conditions: any;
  isActive: boolean;
  createdAt: string;
}

export function AdvertiserManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAdvertiser, setEditingAdvertiser] = useState<Advertiser | null>(null);
  const [newAdvertiser, setNewAdvertiser] = useState({
    name: "",
    displayName: "",
    businessType: "Restaurant" as const,
    budgetCap: "1000"
  });
  const [selectedRulesForCreate, setSelectedRulesForCreate] = useState<string[]>([]);
  const [selectedRulesForEdit, setSelectedRulesForEdit] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch advertisers
  const { data: advertisers, isLoading, refetch } = useQuery<Advertiser[]>({
    queryKey: ["/api/v1/advertisers"],
  });

  // Fetch all condition rules
  const { data: allRules, isLoading: rulesLoading } = useQuery<ConditionRule[]>({
    queryKey: ["/api/v1/condition-rules"],
    staleTime: 30000
  });

  // Create advertiser mutation
  const createAdvertiser = useMutation({
    mutationFn: async (advertiserData: typeof newAdvertiser) => {
      try {
        // Frontend validation 1: Basic field validation
        if (!advertiserData.name?.trim()) {
          throw new Error("Internal name is required");
        }
        if (!advertiserData.displayName?.trim()) {
          throw new Error("Display name is required");
        }
        if (!advertiserData.budgetCap || parseFloat(advertiserData.budgetCap) <= 0) {
          throw new Error("Budget cap must be greater than 0");
        }

        // Frontend validation 2: Internal name and display name cannot be the same
        if (advertiserData.name.toLowerCase() === advertiserData.displayName.toLowerCase()) {
          throw new Error("Internal name and display name cannot be the same");
        }
        
        // Frontend validation 3: Check for duplicate internal names
        const existingByName = advertisers?.find(adv => 
          adv.name.toLowerCase() === advertiserData.name.toLowerCase()
        );
        if (existingByName) {
          throw new Error("An advertiser with this internal name already exists");
        }
        
        // Frontend validation 4: Check for duplicate display names
        const existingByDisplayName = advertisers?.find(adv => 
          adv.displayName.toLowerCase() === advertiserData.displayName.toLowerCase()
        );
        if (existingByDisplayName) {
          throw new Error("An advertiser with this display name already exists");
        }
        
        // Make API call
        const result = await apiRequest("/api/v1/advertisers", {
          method: "POST",
          body: JSON.stringify({
            ...advertiserData,
            creditBalance: advertiserData.budgetCap, // Start with full budget as credits
            spentAmount: "0.00",
            status: "active",
            assignedRules: selectedRulesForCreate
          }),
          headers: { "Content-Type": "application/json" }
        });
        
        return result;
      } catch (error) {
        // Log error for debugging
        console.error("Create advertiser error:", error);
        // Re-throw to trigger onError
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "✅ Advertiser Created",
        description: "New advertiser has been added successfully.",
        variant: "default",
      });
      // Force immediate refetch
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/v1/advertisers"] });
      setIsCreateDialogOpen(false);
      setNewAdvertiser({ name: "", displayName: "", businessType: "Restaurant", budgetCap: "1000" });
      setSelectedRulesForCreate([]);
    },
    onError: (error: Error) => {
      console.error("Create advertiser onError:", error);
      toast({
        title: "❌ Failed to Create Advertiser",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update advertiser mutation
  const updateAdvertiser = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Advertiser> }) => {
      const currentAdvertiser = advertisers?.find(adv => adv.id === id);
      if (!currentAdvertiser) {
        throw new Error("Advertiser not found");
      }
      
      // Determine final values after update
      const finalName = updates.name || currentAdvertiser.name;
      const finalDisplayName = updates.displayName || currentAdvertiser.displayName;
      
      // Frontend validation 1: Internal name and display name cannot be the same
      if (finalName.toLowerCase() === finalDisplayName.toLowerCase()) {
        throw new Error("Internal name and display name cannot be the same");
      }
      
      // Frontend validation 2: Check for duplicate internal names (if name is being updated)
      if (updates.name && updates.name !== currentAdvertiser.name) {
        const duplicateByName = advertisers?.find(adv => 
          adv.id !== id && adv.name.toLowerCase() === updates.name!.toLowerCase()
        );
        if (duplicateByName) {
          throw new Error("An advertiser with this internal name already exists");
        }
      }
      
      // Frontend validation 3: Check for duplicate display names (if display name is being updated)
      if (updates.displayName && updates.displayName !== currentAdvertiser.displayName) {
        const duplicateByDisplayName = advertisers?.find(adv => 
          adv.id !== id && adv.displayName.toLowerCase() === updates.displayName!.toLowerCase()
        );
        if (duplicateByDisplayName) {
          throw new Error("An advertiser with this display name already exists");
        }
      }
      
      await apiRequest(`/api/v1/advertisers/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...updates,
          assignedRules: selectedRulesForEdit
        }),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Advertiser Updated",
        description: "Advertiser has been updated successfully.",
        variant: "default",
      });
      // Force immediate refetch
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/v1/advertisers"] });
      setIsEditDialogOpen(false);
      setEditingAdvertiser(null);
      setSelectedRulesForEdit([]);
    },
    onError: (error: Error) => {
      console.error("Update advertiser onError:", error);
      toast({
        title: "❌ Failed to Update Advertiser",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete advertiser mutation
  const deleteAdvertiser = useMutation({
    mutationFn: async (id: number) => {
      const result = await apiRequest(`/api/v1/advertisers/${id}`, {
        method: "DELETE",
      });
      return result;
    },
    onSuccess: async (data, variables) => {
      toast({
        title: "✅ Advertiser Deleted",
        description: "Advertiser has been deleted successfully.",
        variant: "default",
      });
      
      // Multiple refresh strategies to ensure data updates
      // Strategy 1: Direct refetch for immediate update
      await refetch();
      
      // Strategy 2: Invalidate queries to mark cache as stale
      await queryClient.invalidateQueries({ queryKey: ["/api/v1/advertisers"] });
      
      // Strategy 3: Reset queries to force completely fresh data
      queryClient.resetQueries({ queryKey: ["/api/v1/advertisers"] });
    },
    onError: (error: Error) => {
      console.error("Delete advertiser onError:", error);
      toast({
        title: "❌ Failed to Delete Advertiser",
        description: error.message || "Unable to delete advertiser. Please check if it has associated data and try again.",
        variant: "destructive",
      });
    },
  });

  // Handle delete with explicit refresh
  const handleDeleteAdvertiser = async (id: number) => {
    try {
      await deleteAdvertiser.mutateAsync(id);
      // Additional safety refresh after a short delay
      setTimeout(() => {
        refetch();
      }, 200);
    } catch (error) {
      // Error is already handled in the mutation onError callback
    }
  };

  const formatCurrency = (amount: string) => {
    return `$${Math.round(parseFloat(amount))}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
      case "Inactive":
        return <Badge variant="destructive" className="bg-red-600 text-white">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCreditStatusBadge = (creditStatus: string) => {
    switch (creditStatus) {
      case "Sufficient":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Sufficient</Badge>;
      case "Low":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low</Badge>;
      case "Insufficient":
        return <Badge variant="destructive">Insufficient</Badge>;
      default:
        return <Badge variant="outline">{creditStatus}</Badge>;
    }
  };

  const getBusinessTypeBadge = (businessType: string) => {
    switch (businessType) {
      case "Restaurant":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">🍽️ Restaurant</Badge>;
      case "Gym":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">💪 Gym</Badge>;
      case "Mall":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">🏬 Mall</Badge>;
      case "Fast Food":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">🍔 Fast Food</Badge>;
      case "Coffee shop":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">☕ Coffee shop</Badge>;
      default:
        return <Badge variant="outline">{businessType}</Badge>;
    }
  };

  const calculateCreditStatus = (creditBalance: string, budgetCap: string): string => {
    const balance = parseFloat(creditBalance);
    
    if (balance <= 0) return "Insufficient";
    if (balance < 100) return "Low"; // Below $100 is considered low
    return "Sufficient";
  };

  // Component to display assigned rules
  const AssignedRules = ({ advertiserId }: { advertiserId: number }) => {
    const { data: rules, isLoading: rulesLoading } = useQuery<any[]>({
      queryKey: [`/api/v1/advertisers/${advertiserId}/condition-rules`],
      staleTime: 30000
    });

    if (rulesLoading) {
      return <div className="text-sm text-muted-foreground">Loading...</div>;
    }

    if (!rules || rules.length === 0) {
      return <div className="text-sm text-muted-foreground">No rules assigned</div>;
    }

    return (
      <div className="flex flex-wrap gap-1 max-w-xs">
        {rules.slice(0, 3).map((rule) => (
          <Badge key={rule.id} variant="outline" className="text-xs">
            {rule.ruleId}
          </Badge>
        ))}
        {rules.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{rules.length - 3} more
          </Badge>
        )}
      </div>
    );
  };

  const getUtilizationPercentage = (spent: string, budget: string) => {
    const spentAmount = parseFloat(spent);
    const budgetAmount = parseFloat(budget);
    return budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
  };

  const totalBudget = advertisers?.reduce((sum, adv) => sum + parseFloat(adv.budgetCap), 0) || 0;
  const totalSpent = advertisers?.reduce((sum, adv) => sum + parseFloat(adv.spentAmount), 0) || 0;
  const totalCredits = advertisers?.reduce((sum, adv) => sum + parseFloat(adv.creditBalance), 0) || 0;

  // Pagination logic
  const totalItems = advertisers?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAdvertisers = advertisers?.slice(startIndex, endIndex);

  // Reset to first page when data changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Advertiser Management
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Advertiser
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Create New Advertiser</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-1">
                <div className="space-y-4 pb-4">
                <div>
                  <Label htmlFor="name">Internal Name</Label>
                  <Input
                    id="name"
                    value={newAdvertiser.name}
                    onChange={(e) => setNewAdvertiser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., tourism_australia"
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={newAdvertiser.displayName}
                    onChange={(e) => setNewAdvertiser(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="e.g., Tourism Australia"
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={newAdvertiser.businessType}
                    onValueChange={(value) => setNewAdvertiser(prev => ({ ...prev, businessType: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Restaurant">🍽️ Restaurant</SelectItem>
                      <SelectItem value="Gym">💪 Gym</SelectItem>
                      <SelectItem value="Mall">🏬 Mall</SelectItem>
                      <SelectItem value="Fast Food">🍔 Fast Food</SelectItem>
                      <SelectItem value="Coffee shop">☕ Coffee shop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budgetCap">Budget Cap ($)</Label>
                  <Input
                    id="budgetCap"
                    type="number"
                    min="0"
                    step="1"
                    value={newAdvertiser.budgetCap}
                    onChange={(e) => setNewAdvertiser(prev => ({ ...prev, budgetCap: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Assign Condition Rules</Label>
                  <ScrollArea className="h-32 border rounded-md p-2">
                    {rulesLoading ? (
                      <div className="text-sm text-muted-foreground">Loading rules...</div>
                    ) : allRules?.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No rules available</div>
                    ) : (
                      <div className="space-y-2">
                        {allRules?.map((rule) => (
                          <div key={rule.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`rule-${rule.id}`}
                              checked={selectedRulesForCreate.includes(rule.ruleId)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedRulesForCreate(prev => [...prev, rule.ruleId]);
                                } else {
                                  setSelectedRulesForCreate(prev => prev.filter(id => id !== rule.ruleId));
                                }
                              }}
                            />
                            <Label htmlFor={`rule-${rule.id}`} className="text-sm">
                              {rule.ruleId} (Priority: {rule.priority})
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select condition rules to assign to this advertiser
                  </p>
                </div>
                </div>
              </div>
              
              {/* Fixed action buttons at bottom */}
              <div className="flex justify-end space-x-2 pt-4 border-t bg-white flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createAdvertiser.mutate(newAdvertiser)}
                  disabled={createAdvertiser.isPending || !newAdvertiser.name || !newAdvertiser.displayName}
                >
                  Create Advertiser
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Advertiser Dialog */}
          {editingAdvertiser && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Edit Advertiser: {editingAdvertiser.displayName}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-1">
                  <div className="space-y-4 pb-4">
                  <div>
                    <Label htmlFor="editName">Internal Name</Label>
                    <Input
                      id="editName"
                      value={editingAdvertiser.name}
                      onChange={(e) => setEditingAdvertiser(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                      placeholder="e.g., tourism_australia"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editDisplayName">Display Name</Label>
                    <Input
                      id="editDisplayName"
                      value={editingAdvertiser.displayName}
                      onChange={(e) => setEditingAdvertiser(prev => prev ? ({ ...prev, displayName: e.target.value }) : null)}
                      placeholder="e.g., Tourism Australia"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editBusinessType">Business Type</Label>
                    <Select
                      value={(editingAdvertiser as any).businessType || "Restaurant"}
                      onValueChange={(value) => setEditingAdvertiser(prev => prev ? ({ ...prev, businessType: value } as any) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Restaurant">🍽️ Restaurant</SelectItem>
                        <SelectItem value="Gym">💪 Gym</SelectItem>
                        <SelectItem value="Mall">🏬 Mall</SelectItem>
                        <SelectItem value="Fast Food">🍔 Fast Food</SelectItem>
                        <SelectItem value="Coffee shop">☕ Coffee shop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editBudgetCap">Budget Cap ($)</Label>
                    <Input
                      id="editBudgetCap"
                      type="number"
                      min="0"
                      step="1"
                      value={editingAdvertiser.budgetCap}
                      onChange={(e) => setEditingAdvertiser(prev => prev ? ({ ...prev, budgetCap: e.target.value }) : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCreditBalance">Credit Balance ($)</Label>
                    <Input
                      id="editCreditBalance"
                      type="number"
                      min="0"
                      step="1"
                      value={editingAdvertiser.creditBalance}
                      onChange={(e) => setEditingAdvertiser(prev => prev ? ({ ...prev, creditBalance: e.target.value }) : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editStatus">Status</Label>
                    <Select
                      value={editingAdvertiser.status}
                      onValueChange={(value) => setEditingAdvertiser(prev => prev ? ({ ...prev, status: value }) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editCreditStatus">Credit Status</Label>
                    <Input
                      id="editCreditStatus"
                      value={(editingAdvertiser as any).creditStatus || 
                        calculateCreditStatus(editingAdvertiser.creditBalance, editingAdvertiser.budgetCap)}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Credit status is automatically calculated based on balance and budget.
                    </p>
                  </div>
                  <div>
                    <Label>Assign Condition Rules</Label>
                    <ScrollArea className="h-32 border rounded-md p-2">
                      {rulesLoading ? (
                        <div className="text-sm text-muted-foreground">Loading rules...</div>
                      ) : allRules?.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No rules available</div>
                      ) : (
                        <div className="space-y-2">
                          {allRules?.map((rule) => (
                            <div key={rule.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-rule-${rule.id}`}
                                checked={selectedRulesForEdit.includes(rule.ruleId)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedRulesForEdit(prev => [...prev, rule.ruleId]);
                                  } else {
                                    setSelectedRulesForEdit(prev => prev.filter(id => id !== rule.ruleId));
                                  }
                                }}
                              />
                              <Label htmlFor={`edit-rule-${rule.id}`} className="text-sm">
                                {rule.ruleId} (Priority: {rule.priority})
                                {rule.advertiserId === editingAdvertiser?.id && (
                                  <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select condition rules to assign to this advertiser
                    </p>
                  </div>
                  </div>
                </div>
                
                {/* Fixed action buttons at bottom */}
                <div className="flex justify-end space-x-2 pt-4 border-t bg-white flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingAdvertiser(null);
                      setSelectedRulesForEdit([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (editingAdvertiser) {
                        updateAdvertiser.mutate({
                          id: editingAdvertiser.id,
                          updates: {
                            name: editingAdvertiser.name,
                            displayName: editingAdvertiser.displayName,
                            businessType: (editingAdvertiser as any).businessType,
                            budgetCap: editingAdvertiser.budgetCap,
                            creditBalance: editingAdvertiser.creditBalance,
                            status: editingAdvertiser.status
                          }
                        });
                      }
                    }}
                    disabled={updateAdvertiser.isPending || !editingAdvertiser.name || !editingAdvertiser.displayName}
                  >
                    {updateAdvertiser.isPending ? "Updating..." : "Update Advertiser"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget.toString())}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSpent.toString())}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Credits</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCredits.toString())}</p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Advertisers</p>
                <p className="text-2xl font-bold">
                  {advertisers?.filter(adv => adv.status === "Active").length || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Advertisers Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advertiser</TableHead>
                <TableHead>Business Type</TableHead>
                <TableHead>Assigned Rules</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credit Status</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    Loading advertisers...
                  </TableCell>
                </TableRow>
              ) : advertisers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    No advertisers found. Create your first advertiser to get started.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAdvertisers?.map((advertiser) => {
                  const utilization = getUtilizationPercentage(advertiser.spentAmount, advertiser.budgetCap);
                  const creditBalance = parseFloat(advertiser.creditBalance);
                  const isLowCredits = creditBalance < 50; // Warning if less than $50

                  return (
                    <TableRow key={advertiser.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{advertiser.displayName}</div>
                          <div className="text-sm text-muted-foreground">{advertiser.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getBusinessTypeBadge((advertiser as any).businessType || "Restaurant")}
                      </TableCell>
                      <TableCell>
                        <AssignedRules advertiserId={advertiser.id} />
                      </TableCell>
                      <TableCell>{getStatusBadge(advertiser.status)}</TableCell>
                      <TableCell>
                        {getCreditStatusBadge(
                          (advertiser as any).creditStatus || 
                          calculateCreditStatus(advertiser.creditBalance, advertiser.budgetCap)
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {formatCurrency(advertiser.creditBalance)}
                          {isLowCredits && (
                            <AlertCircle className="w-4 h-4 ml-1 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(advertiser.spentAmount)}</TableCell>
                      <TableCell>{formatCurrency(advertiser.budgetCap)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                utilization > 90 ? "bg-red-500" : 
                                utilization > 70 ? "bg-yellow-500" : "bg-green-500"
                              }`}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {utilization.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingAdvertiser(advertiser);
                              // Load current rules for this advertiser
                              const currentRules = allRules?.filter(rule => rule.advertiserId === advertiser.id).map(rule => rule.ruleId) || [];
                              setSelectedRulesForEdit(currentRules);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Advertiser</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{advertiser.displayName}"? This action cannot be undone and will remove all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAdvertiser(advertiser.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {deleteAdvertiser.isPending ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} advertisers
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 30, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={pageSize.toString()}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}