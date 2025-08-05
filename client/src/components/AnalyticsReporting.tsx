import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Zap, 
  DollarSign,
  Eye,
  Clock,
  Download,
  Calendar,
  Filter,
  Target,
  Thermometer,
  Cloud
} from "lucide-react";

interface AdTrigger {
  id: number;
  advertiserId: number;
  ruleId: string;
  locationId: number;
  cost: string;
  weatherData: any;
  status: string;
  timestamp: string;
  advertiserName?: string;
  locationName?: string;
}

interface SystemHealth {
  status: string;
  services: Array<{
    service: string;
    status: string;
    lastCheck: string;
    responseTime: number;
  }>;
}

interface Advertiser {
  id: number;
  displayName: string;
  spentAmount: string;
  budgetCap: string;
}

export function AnalyticsReporting() {
  const [timeFilter, setTimeFilter] = useState("24h");
  const [advertiserFilter, setAdvertiserFilter] = useState("all");

  // Fetch data
  const { data: triggers } = useQuery<AdTrigger[]>({
    queryKey: ["/api/triggers"],
    refetchInterval: 300000, // 5 minutes
  });

  const { data: systemHealth } = useQuery<SystemHealth>({
    queryKey: ["/api/health"],
    refetchInterval: 300000, // 5 minutes
  });

  const { data: advertisers } = useQuery<Advertiser[]>({
    queryKey: ["/api/v1/advertisers"],
  });

  // Calculate analytics
  const getFilteredTriggers = () => {
    if (!triggers) return [];
    
    const now = new Date();
    const timeThresholds = {
      "1h": 1 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };
    
    const threshold = timeThresholds[timeFilter as keyof typeof timeThresholds] || timeThresholds["24h"];
    const cutoff = new Date(now.getTime() - threshold);
    
    return triggers.filter(trigger => {
      const triggerDate = new Date(trigger.timestamp);
      const withinTime = triggerDate >= cutoff;
      const matchesAdvertiser = advertiserFilter === "all" || trigger.advertiserId.toString() === advertiserFilter;
      return withinTime && matchesAdvertiser;
    });
  };

  const getTriggersByRule = () => {
    const filtered = getFilteredTriggers();
    const ruleMap = new Map<string, { count: number; revenue: number; advertiser: string }>();
    
    filtered.forEach(trigger => {
      const existing = ruleMap.get(trigger.ruleId) || { count: 0, revenue: 0, advertiser: "" };
      ruleMap.set(trigger.ruleId, {
        count: existing.count + 1,
        revenue: existing.revenue + parseFloat(trigger.cost),
        advertiser: trigger.advertiserName || `Advertiser ${trigger.advertiserId}`
      });
    });
    
    return Array.from(ruleMap.entries()).map(([ruleId, data]) => ({
      ruleId,
      ...data
    })).sort((a, b) => b.count - a.count);
  };

  const getWeatherConditionAnalytics = () => {
    const filtered = getFilteredTriggers();
    const conditionMap = new Map<string, number>();
    
    filtered.forEach(trigger => {
      const condition = trigger.weatherData?.condition || "Unknown";
      conditionMap.set(condition, (conditionMap.get(condition) || 0) + 1);
    });
    
    return Array.from(conditionMap.entries()).map(([condition, count]) => ({
      condition,
      count
    })).sort((a, b) => b.count - a.count);
  };

  const getPerformanceMetrics = () => {
    const filtered = getFilteredTriggers();
    const totalTriggers = filtered.length;
    const totalRevenue = filtered.reduce((sum, t) => sum + parseFloat(t.cost), 0);
    const avgResponseTime = systemHealth?.services.reduce((sum, s) => sum + s.responseTime, 0) / (systemHealth?.services.length || 1) || 0;
    const successRate = filtered.filter(t => t.status === "played").length / Math.max(totalTriggers, 1) * 100;
    
    return {
      totalTriggers,
      totalRevenue,
      avgResponseTime,
      successRate
    };
  };

  const getHourlyTriggerData = () => {
    const filtered = getFilteredTriggers();
    const hourlyMap = new Map<number, number>();
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, 0);
    }
    
    filtered.forEach(trigger => {
      const hour = new Date(trigger.timestamp).getHours();
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
    });
    
    return Array.from(hourlyMap.entries()).map(([hour, count]) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count
    }));
  };

  const filteredTriggers = getFilteredTriggers();
  const triggersByRule = getTriggersByRule();
  const weatherAnalytics = getWeatherConditionAnalytics();
  const metrics = getPerformanceMetrics();
  const hourlyData = getHourlyTriggerData();

  const getWeatherIcon = (condition: string) => {
    if (condition.toLowerCase().includes('rain')) return '🌧️';
    if (condition.toLowerCase().includes('cloud')) return '☁️';
    if (condition.toLowerCase().includes('sun')) return '☀️';
    return '🌤️';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Analytics & Reporting
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export Report
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <Select value={advertiserFilter} onValueChange={setAdvertiserFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Advertisers</SelectItem>
                  {advertisers?.map((advertiser) => (
                    <SelectItem key={advertiser.id} value={advertiser.id.toString()}>
                      {advertiser.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Triggers</p>
                <p className="text-2xl font-bold">{metrics.totalTriggers}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Generated</p>
                <p className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{metrics.avgResponseTime.toFixed(0)}ms</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Rule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Performance by Trigger Rule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule ID</TableHead>
                <TableHead>Advertiser</TableHead>
                <TableHead>Triggers</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Avg per Trigger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {triggersByRule.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No data available for selected time period
                  </TableCell>
                </TableRow>
              ) : (
                triggersByRule.map((rule) => (
                  <TableRow key={rule.ruleId}>
                    <TableCell className="font-medium">{rule.ruleId}</TableCell>
                    <TableCell>{rule.advertiser}</TableCell>
                    <TableCell>{rule.count}</TableCell>
                    <TableCell>${rule.revenue.toFixed(2)}</TableCell>
                    <TableCell>${(rule.revenue / rule.count).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Weather Conditions Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cloud className="w-5 h-5 mr-2" />
            Triggers by Weather Condition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weatherAnalytics.map((item) => (
              <div key={item.condition} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getWeatherIcon(item.condition)}</span>
                    <span className="font-medium">{item.condition}</span>
                  </div>
                  <Badge variant="secondary">{item.count} triggers</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ 
                      width: `${(item.count / Math.max(...weatherAnalytics.map(w => w.count), 1)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hourly Activity Pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            24-Hour Activity Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-2">
            {hourlyData.map((data) => (
              <div key={data.hour} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">{data.hour}</div>
                <div 
                  className="bg-blue-200 rounded-sm mx-auto"
                  style={{
                    height: `${Math.max((data.count / Math.max(...hourlyData.map(h => h.count), 1)) * 60, 4)}px`,
                    width: '20px'
                  }}
                />
                <div className="text-xs mt-1 font-medium">{data.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            System Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemHealth?.services.map((service, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">
                    {service.service.replace("_", " ")}
                  </span>
                  <Badge 
                    variant={service.status === "healthy" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {service.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Response Time: {service.responseTime}ms
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}