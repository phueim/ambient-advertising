import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Zap, 
  DollarSign, 
  MapPin, 
  Clock, 
  Thermometer, 
  Wind, 
  Eye, 
  Volume2,
  Music,
  Users,
  TrendingUp,
  Radio,
  Headphones,
  Speaker
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

interface GovernmentData {
  id: number;
  weatherData: any;
  timeBasedData: any;
  timestamp: string;
}

export function LiveDataDashboard() {
  // Fetch live data
  const { data: recentTriggers } = useQuery<AdTrigger[]>({
    queryKey: ["/api/triggers"],
    refetchInterval: 60000, // 1 minute
  });

  const { data: systemHealth } = useQuery<SystemHealth>({
    queryKey: ["/api/health"],
    refetchInterval: 60000, // 1 minute
  });

  const { data: latestData } = useQuery<GovernmentData[]>({
    queryKey: ["/api/government-data/recent"],
    queryFn: () => {
      // Mock data for now - replace with actual API call
      return Promise.resolve([
        {
          id: 1,
          weatherData: {
            temperature_c: 28.5,
            condition: "Partly Cloudy",
            humidity_percent: 75,
            wind_speed_kmh: 15
          },
          timeBasedData: {
            time_category: 'afternoon',
    is_peak_hours: false,
            status: "Moderate"
          },
          timestamp: new Date().toISOString()
        }
      ]);
    },
    refetchInterval: 60000, // 1 minute
  });

  // Calculate metrics
  const totalTriggersToday = recentTriggers?.length || 0;
  const totalSpentToday = recentTriggers?.reduce((sum, trigger) => sum + parseFloat(trigger.cost), 0) || 0;
  const activeServices = systemHealth?.services?.filter(s => s.status === 'healthy').length || 0;
  const avgResponseTime = systemHealth?.services?.reduce((sum, s) => sum + (s.responseTime || 0), 0) / (systemHealth?.services?.length || 1) || 0;

  // Get recent activity (last 6 triggers)
  const recentActivity = recentTriggers?.slice(0, 6) || [];

  // Mock live voiceover system data
  const liveVoiceoverData = {
    currentStatus: "Ready for triggers",
    queuedAds: 3,
    lastTriggered: "2 minutes ago",
    adFrequency: "Every 8 minutes",
    activeLocations: 5,
    totalPlayed: 47
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-SG", { 
      timeZone: "Asia/Singapore",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': case 'played': case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': case 'queued': return 'bg-blue-100 text-blue-800';
      case 'failed': case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTriggerIcon = (ruleId: string) => {
    if (ruleId.includes('weather') || ruleId.includes('rain')) return '🌧️';
    if (ruleId.includes('temp')) return '🌡️';
    if (ruleId.includes('time') || ruleId.includes('hour')) return '⏰';
    if (ruleId.includes('promo') || ruleId.includes('sale')) return '🏷️';
    if (ruleId.includes('music') || ruleId.includes('genre')) return '🎵';
    if (ruleId.includes('crowd') || ruleId.includes('audience')) return '👥';
    return '🎯';
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ads Triggered Today</p>
                <p className="text-2xl font-bold">{totalTriggersToday}</p>
                <p className="text-xs text-green-600">↑ Live updates</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Today</p>
                <p className="text-2xl font-bold">${totalSpentToday.toFixed(2)}</p>
                <p className="text-xs text-green-600">↑ Real-time</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Locations</p>
                <p className="text-2xl font-bold">{liveAudioData.activeLocations}</p>
                <p className="text-xs text-blue-600">🎵 Playing music</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold">{activeServices}/{systemHealth?.services?.length || 0}</p>
                <p className="text-xs text-green-600">Services online</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Voiceover System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Speaker className="w-5 h-5 mr-2" />
              Live Voiceover System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm">System Status</span>
              </div>
              <Badge variant="outline" className="bg-green-50">
                {liveVoiceoverData.currentStatus}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Queued Ads</span>
              </div>
              <span className="text-sm font-medium">{liveVoiceoverData.queuedAds} pending</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4" />
                <span className="text-sm">Ad Frequency</span>
              </div>
              <Badge variant="secondary">{liveVoiceoverData.adFrequency}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Total Played Today</span>
              </div>
              <span className="text-sm font-mono">{liveVoiceoverData.totalPlayed}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Thermometer className="w-5 h-5 mr-2" />
              Live Environmental Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestData?.[0] && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🌡️</span>
                    <span className="text-sm">Temperature</span>
                  </div>
                  <span className="text-lg font-bold">
                    {latestData[0].weatherData.temperature_c}°C
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">☁️</span>
                    <span className="text-sm">Condition</span>
                  </div>
                  <Badge variant="outline">
                    {latestData[0].weatherData.condition}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">💧</span>
                    <span className="text-sm">Humidity</span>
                  </div>
                  <span className="font-medium">
                    {latestData[0].weatherData.humidity_percent}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🌬️</span>
                    <span className="text-sm">Air Quality</span>
                  </div>
                  <Badge 
                    variant="outline" 
                                className={`${latestData[0].airQualityData.is_peak_hours ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}
          >
            {latestData[0].airQualityData.time_category}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Ad Triggers Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Live Advertisement Activity
            </div>
            <Badge variant="outline" className="animate-pulse">
              🔴 Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent advertisement triggers</p>
              <p className="text-sm">Waiting for contextual conditions...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((trigger) => (
                <div key={trigger.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getTriggerIcon(trigger.ruleId)}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{trigger.ruleId}</p>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(trigger.status)}
                        >
                          {trigger.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Location {trigger.locationId} • ${trigger.cost} • {formatTime(trigger.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">${trigger.cost}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(trigger.timestamp).toLocaleDateString("en-SG")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            System Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {systemHealth?.services?.map((service, index) => (
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
                  Response: {service.responseTime}ms
                </div>
                <div className="text-xs text-muted-foreground">
                  Last check: {formatTime(service.lastCheck)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}