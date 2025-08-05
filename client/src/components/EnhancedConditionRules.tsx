import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Target, 
  Activity,
  Thermometer,
  Clock,
  MapPin,
  Users,
  ShoppingCart,
  Zap,
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface ConditionRule {
  id: number;
  ruleId: string;
  priority: number;
  conditions: any;
  isActive: boolean;
  createdAt: string;
}

export function EnhancedConditionRules() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ConditionRule | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategories, setEditingCategories] = useState<string[]>(["environmental"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["environmental"]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [newRule, setNewRule] = useState({
    ruleId: "",
    priority: "5",
    isActive: true,
    conditions: {
      // Environmental conditions
      temperature_c_greater_than: "",
      temperature_c_less_than: "",
      humidity_percent_above: "",
      weather_condition_contains: "",
    is_business_hours: false,
    is_peak_hours: false,
    time_category: "",
      // Time-based conditions
      time_of_day_between_start: "",
      time_of_day_between_end: "",
      day_of_week: "",
      is_weekend: false,
      is_holiday: false,
      // Location-based conditions
      location_type: "",
      foot_traffic_level: "",
      crowd_density: "",
    }
  });

  // Rule categories - Only Environmental, Time-Based, and Location-Based are enabled
  const ruleCategories = {
    environmental: {
      name: "Environmental",
      icon: <Thermometer className="w-4 h-4" />,
      description: "Weather, air quality, seasonal triggers for health products, tourism",
      color: "bg-orange-100 text-orange-800",
      conditions: [
        { key: "temperature_c_greater_than", label: "Temperature above (°C)", type: "number", placeholder: "32" },
        { key: "temperature_c_less_than", label: "Temperature below (°C)", type: "number", placeholder: "20" },
        { key: "humidity_percent_above", label: "Humidity above (%)", type: "number", placeholder: "80" },
        { key: "weather_condition_contains", label: "Weather condition", type: "text", placeholder: "rain, sunny, cloudy" },
        { key: "is_weekend", label: "Is Weekend", type: "boolean" },
    { key: "is_business_hours", label: "Is Business Hours", type: "boolean" },
    { key: "is_peak_hours", label: "Is Peak Hours", type: "boolean" },
    { key: "time_category", label: "Time Category", type: "select", options: ["morning", "afternoon", "evening", "night"] },
      ]
    },
    temporal: {
      name: "Time-Based",
      icon: <Clock className="w-4 h-4" />,
      description: "Peak hours, meal times, shopping hours for F&B and retail",
      color: "bg-blue-100 text-blue-800",
      conditions: [
        { key: "time_of_day_between_start", label: "Start time (HH:MM)", type: "time" },
        { key: "time_of_day_between_end", label: "End time (HH:MM)", type: "time" },
        { key: "day_of_week", label: "Day of week", type: "select", options: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] },
        { key: "is_weekend", label: "Weekend only", type: "boolean" },
        { key: "is_holiday", label: "Public holidays", type: "boolean" },
      ]
    },
    location: {
      name: "Location-Based",
      icon: <MapPin className="w-4 h-4" />,
      description: "Store traffic, location type, crowd density for retail optimization",
      color: "bg-green-100 text-green-800",
      conditions: [
        { key: "location_type", label: "Location type", type: "select", options: ["mall", "airport", "office", "hotel", "restaurant", "supermarket", "pharmacy"] },
        { key: "foot_traffic_level", label: "Foot traffic", type: "select", options: ["low", "medium", "high", "very_high"] },
        { key: "crowd_density", label: "Crowd density", type: "select", options: ["sparse", "moderate", "crowded", "packed"] },
      ]
    }
  };

  // Fetch condition rules
  const { data: rules, isLoading, refetch } = useQuery<ConditionRule[]>({
    queryKey: ["/api/v1/condition-rules"],
  });

  // Create rule mutation
  const createRule = useMutation({
    mutationFn: async (ruleData: any) => {
      // Clean up conditions object - remove empty values
      const cleanConditions = Object.fromEntries(
        Object.entries(ruleData.conditions).filter(([_, value]) => 
          value !== "" && value !== false && value !== null && value !== undefined
        )
      );

      const payload = {
        ...ruleData,
        priority: parseInt(ruleData.priority),
        conditions: cleanConditions
      };

      await apiRequest("/api/v1/condition-rules", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Rule Created Successfully",
        description: "New condition rule has been added to the system.",
      });
      // Force immediate refetch
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/v1/condition-rules"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "❌ Failed to Create Rule",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle rule status mutation
  const toggleRuleStatus = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      await apiRequest(`/api/v1/condition-rules/${ruleId}`, {
        method: "PUT",
        body: JSON.stringify({ isActive }),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Rule Status Updated",
        description: "Rule has been successfully updated.",
      });
      // Force immediate refetch
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/v1/condition-rules"] });
    },
    onError: (error) => {
      toast({
        title: "❌ Failed to Update Rule Status",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update rule mutation
  const updateRule = useMutation({
    mutationFn: async ({ ruleId, updates }: { ruleId: string; updates: any }) => {
      await apiRequest(`/api/v1/condition-rules/${ruleId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Rule Updated",
        description: "Condition rule has been updated successfully.",
      });
      // Force immediate refetch
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/v1/condition-rules"] });
      setEditingRule(null);
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "❌ Failed to Update Rule",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete rule mutation
  const deleteRule = useMutation({
    mutationFn: async (ruleId: string) => {
      await apiRequest(`/api/v1/condition-rules/${ruleId}`, {
        method: "DELETE"
      });
    },
    onSuccess: async (data, variables) => {
      toast({
        title: "✅ Rule Deleted",
        description: "Condition rule has been removed from the system.",
      });
      
      // Multiple refresh strategies to ensure data updates
      // Strategy 1: Direct refetch for immediate update
      await refetch();
      
      // Strategy 2: Invalidate queries to mark cache as stale
      await queryClient.invalidateQueries({ queryKey: ["/api/v1/condition-rules"] });
      
      // Strategy 3: Reset queries to force completely fresh data
      queryClient.resetQueries({ queryKey: ["/api/v1/condition-rules"] });
    },
    onError: (error) => {
      toast({
        title: "❌ Failed to Delete Rule",
        description: error.message || "Unable to delete rule. Please check if it has associated data and try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewRule({
      ruleId: "",
      priority: "5",
      isActive: true,
      conditions: {
        // Environmental conditions
        temperature_c_greater_than: "",
        temperature_c_less_than: "",
        humidity_percent_above: "",
        weather_condition_contains: "",
    is_business_hours: false,
    is_peak_hours: false,
    time_category: "",
        // Time-based conditions
        time_of_day_between_start: "",
        time_of_day_between_end: "",
        day_of_week: "",
        is_weekend: false,
        is_holiday: false,
        // Location-based conditions
        location_type: "",
        foot_traffic_level: "",
        crowd_density: "",
      }
    });
    setSelectedCategories(["environmental"]);
  };

  const handleCreateRule = () => {
    // More comprehensive validation
    if (!newRule.ruleId) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in Rule ID.",
        variant: "destructive",
      });
      return;
    }

    // Check if at least one condition is set
    const hasConditions = Object.values(newRule.conditions).some(value => 
      value !== "" && value !== false && value !== null && value !== undefined
    );

    if (!hasConditions) {
      toast({
        title: "Missing Conditions",
        description: "Please set at least one condition for the rule.",
        variant: "destructive",
      });
      return;
    }

    // Add a default advertiserId for testing if missing
    const ruleToCreate = {
      ...newRule,
      advertiserId: 1, // Default to first advertiser for now
    };

    console.log("Creating rule:", ruleToCreate);
    createRule.mutate(ruleToCreate);
  };

  const formatConditions = (conditions: any) => {
    const formatted = Object.entries(conditions)
      .filter(([_, value]) => value !== "" && value !== false && value !== null)
      .map(([key, value]) => {
        const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `${displayKey}: ${value}`;
      })
      .slice(0, 2); // Show only first 2 conditions
    
    return formatted.length > 0 ? formatted.join(', ') : 'No conditions set';
  };

  const getRuleCategories = (conditions: any): Array<keyof typeof ruleCategories> => {
    const categories: Array<keyof typeof ruleCategories> = [];
    
    // Check which category types have conditions
    const hasEnvironmental = !!(conditions.temperature_c_greater_than || conditions.temperature_c_less_than || conditions.humidity_percent_above || conditions.weather_condition_contains || conditions.aqi_above);
    const hasTemporal = !!(conditions.time_of_day_between_start || conditions.time_of_day_between_end || conditions.day_of_week || conditions.is_weekend || conditions.is_holiday);
    const hasLocation = !!(conditions.location_type || conditions.foot_traffic_level || conditions.crowd_density);
    
    if (hasEnvironmental) categories.push('environmental');
    if (hasTemporal) categories.push('temporal');
    if (hasLocation) categories.push('location');
    
    return categories.length > 0 ? categories : ['environmental']; // Default fallback
  };

  // Pagination logic
  const totalItems = rules?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRules = rules?.slice(startIndex, endIndex);

  // Reset to first page when data changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Condition Rules Management
            <Badge variant="secondary" className="ml-2">
              {rules?.length || 0} Rules
            </Badge>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="create-rule-description">
              <DialogHeader>
                <DialogTitle>Create New Condition Rule for Voiceover Advertising</DialogTitle>
                <div id="create-rule-description" className="text-sm text-muted-foreground">
                  Create contextual advertising rules for FMCG, retail, and F&B campaigns
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Rule Category Selection */}
                <div>
                  <Label className="text-base font-medium">Select Rule Categories (Multiple)</Label>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {Object.entries(ruleCategories).map(([key, category]) => (
                      <Button
                        key={key}
                        variant={selectedCategories.includes(key) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedCategories(prev => 
                            prev.includes(key) 
                              ? prev.filter(cat => cat !== key)
                              : [...prev, key]
                          );
                        }}
                        className="flex flex-col h-20 text-xs p-2"
                      >
                        {category.icon}
                        <span className="mt-1 text-center leading-tight">{category.name}</span>
                      </Button>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Selected categories:</strong> {selectedCategories.map(cat => ruleCategories[cat as keyof typeof ruleCategories].name).join(", ") || "None"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You can combine conditions from multiple categories to create complex rules
                    </p>
                  </div>
                </div>

                {/* Basic Rule Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ruleId">Rule ID *</Label>
                    <Input
                      id="ruleId"
                      value={newRule.ruleId}
                      onChange={(e) => setNewRule(prev => ({ ...prev, ruleId: e.target.value }))}
                      placeholder="e.g., lunch_rush_promo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority (1-10) *</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      max="10"
                      value={newRule.priority}
                      onChange={(e) => setNewRule(prev => ({ ...prev, priority: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Dynamic Conditions Based on Selected Categories */}
                <div>
                  <Label className="text-base font-medium">Trigger Conditions</Label>
                  <div className="space-y-6 mt-3">
                    {selectedCategories.map(categoryKey => {
                      const category = ruleCategories[categoryKey as keyof typeof ruleCategories];
                      return (
                        <div key={categoryKey} className="border rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            {category.icon}
                            <h4 className="font-medium ml-2">{category.name}</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {category.conditions.map((condition: any) => (
                              <div key={condition.key} className={condition.type === "text" ? "col-span-2" : "col-span-1"}>
                                <Label htmlFor={condition.key} className="text-sm">{condition.label}</Label>
                                {condition.type === "select" ? (
                                  <Select 
                                    value={(newRule.conditions as any)[condition.key] || ""} 
                                    onValueChange={(value) => setNewRule(prev => ({
                                      ...prev,
                                      conditions: { ...prev.conditions, [condition.key]: value }
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {condition.options?.map((option: any) => (
                                        <SelectItem key={option} value={option}>
                                          {option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, " ")}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : condition.type === "boolean" ? (
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Switch
                                      id={condition.key}
                                      checked={(newRule.conditions as any)[condition.key] === true}
                                      onCheckedChange={(checked) => setNewRule(prev => ({
                                        ...prev,
                                        conditions: { ...prev.conditions, [condition.key]: checked }
                                      }))}
                                    />
                                    <Label htmlFor={condition.key} className="text-sm">Enable this condition</Label>
                                  </div>
                                ) : (
                                  <Input
                                    id={condition.key}
                                    type={condition.type === "time" ? "time" : condition.type}
                                    value={(newRule.conditions as any)[condition.key] || ""}
                                    onChange={(e) => setNewRule(prev => ({
                                      ...prev,
                                      conditions: { ...prev.conditions, [condition.key]: e.target.value }
                                    }))}
                                    placeholder={condition.placeholder || "Enter value"}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>


                {/* Status Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={newRule.isActive}
                    onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Activate rule immediately</Label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRule}
                    disabled={createRule.isPending}
                  >
                    {createRule.isPending ? "Creating..." : "Create Rule"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Rule Dialog */}
          {editingRule && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-rule-description">
                <DialogHeader>
                  <DialogTitle>Edit Rule: {editingRule.ruleId}</DialogTitle>
                  <div id="edit-rule-description" className="text-sm text-muted-foreground">
                    Modify rule settings, category, conditions, and message template
                  </div>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Rule Category Selection */}
                  <div>
                    <Label className="text-base font-medium">Rule Categories (Multiple)</Label>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {Object.entries(ruleCategories).map(([key, category]) => {
                        return (
                          <Button
                            key={key}
                            variant={editingCategories.includes(key) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setEditingCategories(prev => 
                                prev.includes(key) 
                                  ? prev.filter(cat => cat !== key)
                                  : [...prev, key]
                              );
                            }}
                            className="flex flex-col h-20 text-xs p-2"
                          >
                            {category.icon}
                            <span className="mt-1 text-center leading-tight">{category.name}</span>
                          </Button>
                        );
                      })}
                    </div>
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Selected categories:</strong> {editingCategories.map(cat => ruleCategories[cat as keyof typeof ruleCategories].name).join(", ") || "None"}
                      </p>
                    </div>
                  </div>

                  {/* Basic Rule Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editPriority">Priority (1-10)</Label>
                      <Input
                        id="editPriority"
                        type="number"
                        min="1"
                        max="10"
                        value={editingRule.priority}
                        onChange={(e) => setEditingRule(prev => prev ? ({ ...prev, priority: parseInt(e.target.value) }) : null)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="editIsActive"
                        checked={editingRule.isActive}
                        onCheckedChange={(checked) => setEditingRule(prev => prev ? ({ ...prev, isActive: checked }) : null)}
                      />
                      <Label htmlFor="editIsActive">Rule Active</Label>
                    </div>
                  </div>

                  {/* Dynamic Conditions Based on Selected Categories */}
                  <div>
                    <Label className="text-base font-medium">Trigger Conditions</Label>
                    <div className="space-y-6 mt-3">
                      {editingCategories.map(categoryKey => {
                        const category = ruleCategories[categoryKey as keyof typeof ruleCategories];
                        return (
                          <div key={categoryKey} className="border rounded-lg p-4">
                            <div className="flex items-center mb-3">
                              {category.icon}
                              <h4 className="font-medium ml-2">{category.name}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              {category.conditions.map((condition: any) => (
                                <div key={condition.key} className={condition.type === "text" ? "col-span-2" : "col-span-1"}>
                                  <Label htmlFor={condition.key} className="text-sm">{condition.label}</Label>
                                  {condition.type === "select" ? (
                                    <Select 
                                      value={(editingRule.conditions as any)[condition.key] || ""} 
                                      onValueChange={(value) => setEditingRule(prev => prev ? ({
                                        ...prev,
                                        conditions: { ...prev.conditions, [condition.key]: value }
                                      }) : null)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select option" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {condition.options?.map((option: any) => (
                                          <SelectItem key={option} value={option}>
                                            {option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, " ")}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : condition.type === "boolean" ? (
                                    <div className="flex items-center space-x-2 mt-2">
                                      <Switch
                                        id={condition.key}
                                        checked={(editingRule.conditions as any)[condition.key] === true}
                                        onCheckedChange={(checked) => setEditingRule(prev => prev ? ({
                                          ...prev,
                                          conditions: { ...prev.conditions, [condition.key]: checked }
                                        }) : null)}
                                      />
                                      <Label htmlFor={condition.key} className="text-sm">Enable this condition</Label>
                                    </div>
                                  ) : (
                                    <Input
                                      id={condition.key}
                                      type={condition.type === "time" ? "time" : condition.type}
                                      value={(editingRule.conditions as any)[condition.key] || ""}
                                      onChange={(e) => setEditingRule(prev => prev ? ({
                                        ...prev,
                                        conditions: { ...prev.conditions, [condition.key]: e.target.value }
                                      }) : null)}
                                      placeholder={condition.placeholder || "Enter value"}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>


                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditDialogOpen(false);
                        setEditingRule(null);
                        setEditingCategories(["environmental"]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (editingRule) {
                          // Clean up conditions object - remove empty values
                          const cleanConditions = Object.fromEntries(
                            Object.entries(editingRule.conditions).filter(([_, value]) => 
                              value !== "" && value !== false && value !== null && value !== undefined
                            )
                          );

                          updateRule.mutate({
                            ruleId: editingRule.ruleId,
                            updates: {
                              priority: editingRule.priority,
                              isActive: editingRule.isActive,
                              conditions: cleanConditions
                            }
                          });
                        }
                      }}
                      disabled={updateRule.isPending}
                    >
                      {updateRule.isPending ? "Updating..." : "Update Rule"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Conditions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Loading condition rules...
                  </div>
                </TableCell>
              </TableRow>
            ) : rules?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No condition rules found</p>
                    <p className="text-sm">Create your first rule to start triggering voiceover ads</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
                          paginatedRules?.map((rule) => {
              const categoryKeys = getRuleCategories(rule.conditions);
              
              return (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.ruleId}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {categoryKeys.map((categoryKey) => {
                        const category = ruleCategories[categoryKey];
                        return (
                          <Badge key={categoryKey} className={category.color}>
                            <span className="mr-1">{category.icon}</span>
                            {category.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.priority}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-muted-foreground truncate">
                        {formatConditions(rule.conditions)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingRule(rule);
                            setEditingCategories(getRuleCategories(rule.conditions));
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRule.mutate(rule.ruleId)}
                          disabled={deleteRule.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} rules
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

