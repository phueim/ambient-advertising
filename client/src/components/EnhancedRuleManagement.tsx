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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Settings, 
  Plus, 
  Edit, 
  Target, 
  Clock,
  Users,
  Calendar,
  Volume2,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  AlertTriangle,
  Zap,
  Music
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

export function EnhancedRuleManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRuleType, setSelectedRuleType] = useState("environmental");
  const [newRule, setNewRule] = useState({
    ruleId: "",
    advertiserId: "",
    priority: "5",
    messageTemplate: "",
    isActive: true,
    ruleType: "environmental",
    conditions: {}
  });

  // Rule templates for different categories
  const ruleTemplates = {
    environmental: {
      name: "Environmental Triggers",
      icon: <Thermometer className="w-5 h-5" />,
      description: "Weather, air quality, and environmental conditions",
      conditions: {
        temperature_c_greater_than: { label: "Temperature above (°C)", type: "number", placeholder: "32" },
        temperature_c_less_than: { label: "Temperature below (°C)", type: "number", placeholder: "20" },
        humidity_percent_above: { label: "Humidity above (%)", type: "number", placeholder: "80" },
        humidity_percent_below: { label: "Humidity below (%)", type: "number", placeholder: "40" },
        weather_condition_contains: { label: "Weather condition", type: "text", placeholder: "rain, sunny, cloudy" },
      }
    },
    temporal: {
      name: "Time-Based Triggers",
      icon: <Clock className="w-5 h-5" />,
      description: "Time of day, day of week, and seasonal triggers",
      conditions: {
        hour_range_start: { label: "Start hour (24h)", type: "number", placeholder: "9" },
        hour_range_end: { label: "End hour (24h)", type: "number", placeholder: "17" },
        day_of_week: { label: "Day of week", type: "select", options: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] },
        is_weekend: { label: "Weekend only", type: "boolean" },
        is_holiday: { label: "Public holidays", type: "boolean" },
      }
    },
    audience: {
      name: "Audience-Based Triggers", 
      icon: <Users className="w-5 h-5" />,
      description: "Demographics, crowd density, and audience targeting",
      conditions: {
        crowd_density: { label: "Crowd density level", type: "select", options: ["low", "medium", "high", "very_high"] },
        target_age_group: { label: "Target age group", type: "select", options: ["18-25", "26-35", "36-45", "46-60", "60+"] },
        target_gender: { label: "Target gender", type: "select", options: ["male", "female", "all"] },
        language_preference: { label: "Language", type: "select", options: ["english", "mandarin", "malay", "tamil"] },
      }
    },
    location: {
      name: "Location-Based Triggers",
      icon: <MapPin className="w-5 h-5" />,
      description: "Store traffic, location events, and proximity triggers",
      conditions: {
        location_type: { label: "Location type", type: "select", options: ["mall", "airport", "office", "hotel", "restaurant"] },
        foot_traffic: { label: "Foot traffic level", type: "select", options: ["low", "medium", "high"] },
        nearby_events: { label: "Nearby events", type: "text", placeholder: "concert, exhibition, sale" },
        distance_from_entrance: { label: "Distance from entrance (m)", type: "number", placeholder: "100" },
      }
    },
    promotional: {
      name: "Promotional Triggers",
      icon: <Zap className="w-5 h-5" />,
      description: "Sales events, promotions, and special offers",
      conditions: {
        promotion_type: { label: "Promotion type", type: "select", options: ["flash_sale", "clearance", "new_arrival", "seasonal", "member_special"] },
        discount_percentage: { label: "Minimum discount (%)", type: "number", placeholder: "20" },
        stock_level: { label: "Stock level trigger", type: "select", options: ["low", "medium", "high", "out_of_stock"] },
        price_range: { label: "Price range", type: "select", options: ["budget", "mid_range", "premium", "luxury"] },
      }
    },
    music: {
      name: "Music Context Triggers",
      icon: <Music className="w-5 h-5" />,
      description: "Background music tempo, genre, and volume-based triggers",
      conditions: {
        music_genre: { label: "Current music genre", type: "select", options: ["pop", "jazz", "classical", "ambient", "upbeat", "relaxing"] },
        music_tempo: { label: "Music tempo", type: "select", options: ["slow", "medium", "fast", "variable"] },
        volume_level: { label: "Volume level", type: "select", options: ["quiet", "moderate", "loud"] },
        track_mood: { label: "Track mood", type: "select", options: ["energetic", "calm", "romantic", "professional", "festive"] },
      }
    }
  };

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
      const cleanConditions = Object.fromEntries(
        Object.entries(ruleData.conditions).filter(([_, value]) => value !== "" && value !== undefined)
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
        title: "Advertising Rule Created",
        description: "New contextual advertising rule has been added successfully.",
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

  const resetForm = () => {
    setNewRule({
      ruleId: "",
      advertiserId: "",
      priority: "5",
      messageTemplate: "",
      isActive: true,
      ruleType: "environmental",
      conditions: {}
    });
  };

  const handleRuleTypeChange = (ruleType: string) => {
    setSelectedRuleType(ruleType);
    setNewRule(prev => ({
      ...prev,
      ruleType,
      conditions: {}
    }));
  };

  const handleConditionChange = (conditionKey: string, value: any) => {
    setNewRule(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [conditionKey]: value
      }
    }));
  };

  const renderConditionInput = (conditionKey: string, config: any) => {
    const value = (newRule.conditions as any)[conditionKey] || "";

    switch (config.type) {
      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleConditionChange(conditionKey, e.target.value)}
            placeholder={config.placeholder}
          />
        );
      case "select":
        return (
          <Select value={value} onValueChange={(val) => handleConditionChange(conditionKey, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1).replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "boolean":
        return (
          <Switch
            checked={value === true || value === "true"}
            onCheckedChange={(checked) => handleConditionChange(conditionKey, checked)}
          />
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleConditionChange(conditionKey, e.target.value)}
            placeholder={config.placeholder}
          />
        );
    }
  };

  const getRuleTypeIcon = (ruleId: string) => {
    if (ruleId.includes("temp") || ruleId.includes("weather") || ruleId.includes("rain")) return "🌡️";
    if (ruleId.includes("time") || ruleId.includes("hour") || ruleId.includes("weekend")) return "⏰";
    if (ruleId.includes("crowd") || ruleId.includes("audience") || ruleId.includes("demo")) return "👥";
    if (ruleId.includes("promo") || ruleId.includes("sale") || ruleId.includes("discount")) return "🏷️";
    if (ruleId.includes("music") || ruleId.includes("tempo") || ruleId.includes("genre")) return "🎵";
    if (ruleId.includes("location") || ruleId.includes("mall") || ruleId.includes("store")) return "📍";
    return "🎯";
  };

  const getConditionSummary = (conditions: any) => {
    const summary: string[] = [];
    Object.entries(conditions).forEach(([key, value]) => {
      if (value) {
        const label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        summary.push(`${label}: ${value}`);
      }
    });
    return summary.length > 0 ? summary.join(", ") : "No conditions set";
  };

  const handleCreateRule = () => {
    if (!newRule.ruleId || !newRule.advertiserId || !newRule.messageTemplate) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Rule ID, Advertiser, and Message Template.",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(newRule.conditions).length === 0) {
      toast({
        title: "No Conditions Set",
        description: "Please set at least one trigger condition.",
        variant: "destructive",
      });
      return;
    }

    createRule.mutate(newRule);
  };

  return (
    <div className="space-y-6">
      {/* Rule Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(ruleTemplates).map(([key, template]) => (
          <Card key={key} className="text-center">
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-2">
                {template.icon}
                <h3 className="font-medium text-sm">{template.name}</h3>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rules Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Contextual Advertising Rules
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Advertising Rule</DialogTitle>
                </DialogHeader>
                
                <Tabs value={selectedRuleType} onValueChange={handleRuleTypeChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    {Object.entries(ruleTemplates).map(([key, template]) => (
                      <TabsTrigger key={key} value={key} className="text-xs">
                        {template.icon}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.entries(ruleTemplates).map(([ruleType, template]) => (
                    <TabsContent key={ruleType} value={ruleType} className="space-y-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          {template.icon}
                          <h3 className="ml-2 font-medium">{template.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ruleId">Rule ID</Label>
                          <Input
                            id="ruleId"
                            value={newRule.ruleId}
                            onChange={(e) => setNewRule(prev => ({ ...prev, ruleId: e.target.value }))}
                            placeholder={`e.g., ${ruleType}_promo_rule`}
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
                        <Label>Trigger Conditions</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          {Object.entries(template.conditions).map(([conditionKey, config]) => (
                            <div key={conditionKey}>
                              <Label htmlFor={conditionKey} className="text-sm">
                                {config.label}
                              </Label>
                              {renderConditionInput(conditionKey, config)}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="messageTemplate">Advertisement Message Template</Label>
                        <Textarea
                          id="messageTemplate"
                          value={newRule.messageTemplate}
                          onChange={(e) => setNewRule(prev => ({ ...prev, messageTemplate: e.target.value }))}
                          placeholder="Your contextual advertisement message template..."
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
                    </TabsContent>
                  ))}
                </Tabs>

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
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
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
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading advertising rules...
                  </TableCell>
                </TableRow>
              ) : rules?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No advertising rules found. Create your first rule to get started.
                  </TableCell>
                </TableRow>
              ) : (
                rules?.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <span className="text-lg">{getRuleTypeIcon(rule.ruleId)}</span>
                    </TableCell>
                    <TableCell className="font-medium">{rule.ruleId}</TableCell>
                    <TableCell>{advertisers?.find(a => a.id === rule.advertiserId)?.displayName || `Advertiser ${rule.advertiserId}`}</TableCell>
                    <TableCell>
                      <Badge variant={rule.priority >= 8 ? "destructive" : rule.priority >= 5 ? "secondary" : "outline"}>
                        {rule.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-muted-foreground truncate">
                        {getConditionSummary(rule.conditions)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? "default" : "outline"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
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
    </div>
  );
}