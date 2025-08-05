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
  Target, 
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  ShoppingCart,
  Zap,
  Calendar,
  TrendingUp
} from "lucide-react";

interface ConditionRule {
  id: number;
  ruleId: string;
  advertiserId: number;
  priority: number;
  conditions: any;
  messageTemplate: string;
  isActive: boolean;
  createdAt: string;
}

interface Advertiser {
  id: number;
  displayName: string;
}

function ConditionRulesManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ConditionRule | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("environmental");

  // Rule categories for FMCG, Retail, F&B
  const ruleCategories = {
    environmental: {
      name: "Environmental",
      icon: <Thermometer className="w-4 h-4" />,
      description: "Weather, air quality, seasonal triggers",
      conditions: [
        { key: "temperature_c_greater_than", label: "Temperature above (°C)", type: "number" },
        { key: "temperature_c_less_than", label: "Temperature below (°C)", type: "number" },
        { key: "humidity_percent_above", label: "Humidity above (%)", type: "number" },
        { key: "weather_condition_contains", label: "Weather condition", type: "text" },
        { key: "aqi_above", label: "Air Quality Index above", type: "number" },
      ]
    },
    temporal: {
      name: "Time-Based",
      icon: <Clock className="w-4 h-4" />,
      description: "Time of day, weekends, holidays, rush hours",
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
      description: "Store traffic, location type, crowd density",
      conditions: [
        { key: "location_type", label: "Location type", type: "select", options: ["mall", "airport", "office", "hotel", "restaurant", "supermarket", "pharmacy"] },
        { key: "foot_traffic_level", label: "Foot traffic", type: "select", options: ["low", "medium", "high", "very_high"] },
        { key: "crowd_density", label: "Crowd density", type: "select", options: ["sparse", "moderate", "crowded", "packed"] },
      ]
    },
    promotional: {
      name: "Promotional",
      icon: <Zap className="w-4 h-4" />,
      description: "Sales events, discounts, inventory levels",
      conditions: [
        { key: "promotion_type", label: "Promotion type", type: "select", options: ["flash_sale", "clearance", "new_arrival", "seasonal", "member_special", "buy_one_get_one"] },
        { key: "discount_percentage", label: "Discount % above", type: "number" },
        { key: "stock_level", label: "Stock level", type: "select", options: ["low", "medium", "high", "overstock"] },
        { key: "price_range", label: "Price range", type: "select", options: ["budget", "mid_range", "premium", "luxury"] },
      ]
    },
    demographic: {
      name: "Customer Demographics", 
      icon: <Users className="w-4 h-4" />,
      description: "Age groups, gender, spending patterns",
      conditions: [
        { key: "target_age_group", label: "Target age group", type: "select", options: ["18-25", "26-35", "36-45", "46-60", "60+"] },
        { key: "target_gender", label: "Target gender", type: "select", options: ["male", "female", "all"] },
        { key: "spending_category", label: "Spending category", type: "select", options: ["budget_conscious", "value_seeker", "premium_buyer", "impulse_buyer"] },
      ]
    }
  };
  const [newRule, setNewRule] = useState({
    ruleId: "",
    advertiserId: "",
    priority: "5",
    messageTemplate: "",
    isActive: true,
    ruleCategory: "environmental",
    conditions: {
      // Environmental conditions
      temperature_c_greater_than: "",
      temperature_c_less_than: "",
      humidity_percent_above: "",
      humidity_percent_below: "",
      weather_condition_contains: "",
      aqi_above: "",
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
      // Promotional conditions
      promotion_type: "",
      discount_percentage: "",
      stock_level: "",
      price_range: "",
      // Demographic conditions
      target_age_group: "",
      target_gender: "",
      spending_category: "",
    }
  });

  // Fetch condition rules
  const { data: rules, isLoading } = useQuery<ConditionRule[]>({
    queryKey: ["/api/v1/condition-rules"],
  });

  // Fetch advertisers for dropdown
  const { data: advertisers } = useQuery<Advertiser[]>({
    queryKey: ["/api/v1/advertisers"],
  });

  // Create rule mutation
  const createRule = useMutation({
    mutationFn: async (ruleData: any) => {
      // Clean up conditions object - remove empty values
      const cleanConditions = Object.fromEntries(
        Object.entries(ruleData.conditions).filter(([_, value]) => value !== "")
      );

      const payload = {
        ...ruleData,
        advertiserId: parseInt(ruleData.advertiserId),
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
        title: "Condition Rule Created",
        description: "New condition rule has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/condition-rules"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Rule",
        description: error.message,
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
        title: "Rule Updated",
        description: "Condition rule has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/condition-rules"] });
      setEditingRule(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewRule({
      ruleId: "",
      advertiserId: "",
      priority: "5",
      messageTemplate: "",
      isActive: true,
      ruleCategory: "environmental",
      conditions: {
        // Environmental conditions
        temperature_c_greater_than: "",
        temperature_c_less_than: "",
        humidity_percent_above: "",
        humidity_percent_below: "",
        weather_condition_contains: "",
        aqi_above: "",
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
        // Promotional conditions
        promotion_type: "",
        discount_percentage: "",
        stock_level: "",
        price_range: "",
        // Demographic conditions
        target_age_group: "",
        target_gender: "",
        spending_category: "",
      }
    });
  };

  const handleCreateRule = () => {
    if (!newRule.ruleId || !newRule.advertiserId || !newRule.messageTemplate) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createRule.mutate(newRule);
  };

  const handleToggleActive = (rule: ConditionRule) => {
    updateRule.mutate({
      ruleId: rule.ruleId,
      updates: { isActive: !rule.isActive }
    });
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 8) return <Badge variant="destructive">High</Badge>;
    if (priority >= 5) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  const getConditionSummary = (conditions: any) => {
    const summary = [];
    if (conditions.temperature_c_greater_than) summary.push(`Temp > ${conditions.temperature_c_greater_than}°C`);
    if (conditions.temperature_c_less_than) summary.push(`Temp < ${conditions.temperature_c_less_than}°C`);
    if (conditions.humidity_percent_above) summary.push(`Humidity > ${conditions.humidity_percent_above}%`);
    if (conditions.humidity_percent_below) summary.push(`Humidity < ${conditions.humidity_percent_below}%`);
    if (conditions.weather_condition_contains) summary.push(`Weather: ${conditions.weather_condition_contains}`);
    
    return summary.length > 0 ? summary.join(", ") : "No conditions set";
  };

  const getAdvertiserName = (advertiserId: number) => {
    return advertisers?.find(a => a.id === advertiserId)?.displayName || `Advertiser ${advertiserId}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Condition Rules Management
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Condition Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {/* Rule Category Selection */}
                <div>
                  <Label>Rule Category</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {Object.entries(ruleCategories).map(([key, category]) => (
                      <Button
                        key={key}
                        variant={selectedCategory === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(key);
                          setNewRule(prev => ({ ...prev, ruleCategory: key }));
                        }}
                        className="flex flex-col h-16 text-xs"
                      >
                        {category.icon}
                        <span className="mt-1">{category.name}</span>
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {ruleCategories[selectedCategory].description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ruleId">Rule ID</Label>
                    <Input
                      id="ruleId"
                      value={newRule.ruleId}
                      onChange={(e) => setNewRule(prev => ({ ...prev, ruleId: e.target.value }))}
                      placeholder="e.g., hot_humid_weekend"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority (1-10)</Label>
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

                <div>
                  <Label htmlFor="advertiserId">Advertiser</Label>
                  <Select 
                    value={newRule.advertiserId} 
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, advertiserId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select advertiser" />
                    </SelectTrigger>
                    <SelectContent>
                      {advertisers?.map((advertiser) => (
                        <SelectItem key={advertiser.id} value={advertiser.id.toString()}>
                          {advertiser.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Weather Conditions</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="tempGreater" className="text-sm">Temperature greater than (°C)</Label>
                      <Input
                        id="tempGreater"
                        type="number"
                        value={newRule.conditions.temperature_c_greater_than}
                        onChange={(e) => setNewRule(prev => ({
                          ...prev,
                          conditions: { ...prev.conditions, temperature_c_greater_than: e.target.value }
                        }))}
                        placeholder="e.g., 32"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tempLess" className="text-sm">Temperature less than (°C)</Label>
                      <Input
                        id="tempLess"
                        type="number"
                        value={newRule.conditions.temperature_c_less_than}
                        onChange={(e) => setNewRule(prev => ({
                          ...prev,
                          conditions: { ...prev.conditions, temperature_c_less_than: e.target.value }
                        }))}
                        placeholder="e.g., 20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="humidityAbove" className="text-sm">Humidity above (%)</Label>
                      <Input
                        id="humidityAbove"
                        type="number"
                        value={newRule.conditions.humidity_percent_above}
                        onChange={(e) => setNewRule(prev => ({
                          ...prev,
                          conditions: { ...prev.conditions, humidity_percent_above: e.target.value }
                        }))}
                        placeholder="e.g., 80"
                      />
                    </div>
                    <div>
                      <Label htmlFor="humidityBelow" className="text-sm">Humidity below (%)</Label>
                      <Input
                        id="humidityBelow"  
                        type="number"
                        value={newRule.conditions.humidity_percent_below}
                        onChange={(e) => setNewRule(prev => ({
                          ...prev,
                          conditions: { ...prev.conditions, humidity_percent_below: e.target.value }
                        }))}
                        placeholder="e.g., 40"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="weatherCondition" className="text-sm">Weather condition contains</Label>
                      <Input
                        id="weatherCondition"
                        value={newRule.conditions.weather_condition_contains}
                        onChange={(e) => setNewRule(prev => ({
                          ...prev,
                          conditions: { ...prev.conditions, weather_condition_contains: e.target.value }
                        }))}
                        placeholder="e.g., rain, thunderstorm, cloudy"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="messageTemplate">Message Template</Label>
                  <Textarea
                    id="messageTemplate"
                    value={newRule.messageTemplate}
                    onChange={(e) => setNewRule(prev => ({ ...prev, messageTemplate: e.target.value }))}
                    placeholder="Your ad message template with variables like {temperature_c}, {condition}, etc."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={newRule.isActive}
                    onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Rule is active</Label>
                </div>

                <div className="flex justify-end space-x-2">
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule ID</TableHead>
              <TableHead>Advertiser</TableHead>
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
                  Loading condition rules...
                </TableCell>
              </TableRow>
            ) : rules?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No condition rules found. Create your first rule to get started.
                </TableCell>
              </TableRow>
            ) : (
              rules?.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.ruleId}</TableCell>
                  <TableCell>{getAdvertiserName(rule.advertiserId)}</TableCell>
                  <TableCell>{getPriorityBadge(rule.priority)}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-sm text-muted-foreground truncate">
                      {getConditionSummary(rule.conditions)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => handleToggleActive(rule)}
                        disabled={updateRule.isPending}
                      />
                      <Badge variant={rule.isActive ? "default" : "outline"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}