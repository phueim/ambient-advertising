import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Thermometer, Wind, AlertTriangle, Clock, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface GovernmentData {
  weather: {
    timestamp: string;
    temperature_c: number;
    humidity_percent: number;
    condition: string;
    uv_index: number;
    alerts?: string[];
  };
  airQuality: {
    timestamp: string;
    aqi: number;
    category: string;
  };
  traffic: {
    timestamp: string;
    incident_type?: string;
    location?: string;
    delay_minutes?: number;
  };

}

interface MatchedRule {
  rule: {
    ruleId: string;
    advertiserId: number;
    priority: number;
    conditions: any;
  };
  advertiser: {
    id: number;
    name: string;
    displayName: string;
    businessType: string;
    status: string;
  };
  priority: number;
  matchedConditions: string[];
  variables: Record<string, any>;
}



export default function GovernmentDataPage() {
  const [governmentData, setGovernmentData] = useState<GovernmentData | null>(null);
  const [matchedRules, setMatchedRules] = useState<MatchedRule[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Auto-refresh functionality removed - manual refresh only

  const fetchGovernmentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/government-data/latest');
      if (!response.ok) {
        throw new Error('Failed to fetch government data');
      }
      
      const data = await response.json();
      setGovernmentData(data.data);
      setMatchedRules(data.matchedRules || []);

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching government data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh functionality completely removed - manual refresh only

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-SG', {
      timeZone: 'Asia/Singapore',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Interval label function removed - no longer needed

  const getTemperatureColor = (temp: number) => {
    if (temp > 35) return "text-red-600";
    if (temp > 32) return "text-orange-500";
    if (temp > 28) return "text-yellow-500";
    return "text-blue-600";
  };

  const getHumidityColor = (humidity: number) => {
    if (humidity > 80) return "text-blue-600";
    if (humidity > 60) return "text-blue-500";
    return "text-gray-600";
  };

  const getAQIColor = (aqi: number) => {
    if (aqi > 100) return "text-red-600";
    if (aqi > 50) return "text-yellow-500";
    return "text-green-600";
  };

  const getRulePriorityColor = (priority: number) => {
    if (priority >= 90) return "bg-red-100 text-red-800";
    if (priority >= 70) return "bg-orange-100 text-orange-800";
    if (priority >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading government data: {error}
          </AlertDescription>
        </Alert>
        <Button onClick={fetchGovernmentData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="h-8 w-8" />
              Government Data
            </h1>
            <p className="text-gray-600 mt-2">
              Live Singapore government data feed with automatic rule matching
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
            </div>
            <Button
              onClick={fetchGovernmentData}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Auto-refresh status bar removed - manual refresh only */}

      {isLoading && !governmentData ? (
        <div className="text-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading government data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Government Data Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Weather Data */}
            {governmentData?.weather && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    Weather
                  </CardTitle>
                  <CardDescription>
                    {formatTimestamp(governmentData.weather.timestamp)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Temperature</span>
                      <span className={`font-semibold ${getTemperatureColor(governmentData.weather.temperature_c)}`}>
                        {governmentData.weather.temperature_c}°C
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Humidity</span>
                      <span className={`font-semibold ${getHumidityColor(governmentData.weather.humidity_percent)}`}>
                        {governmentData.weather.humidity_percent}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Condition</span>
                      <span className="font-semibold text-gray-800">
                        {governmentData.weather.condition}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">UV Index</span>
                      <span className="font-semibold text-gray-800">
                        {governmentData.weather.uv_index}
                      </span>
                    </div>
                    {governmentData.weather.alerts && governmentData.weather.alerts.length > 0 && (
                      <div className="pt-2">
                        <div className="text-sm text-gray-600 mb-1">Alerts</div>
                        {governmentData.weather.alerts.map((alert, idx) => (
                          <Badge key={idx} variant="destructive" className="mr-1 mb-1">
                            {alert}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Air Quality Data */}
            {governmentData?.airQuality && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wind className="h-5 w-5" />
                    Air Quality
                  </CardTitle>
                  <CardDescription>
                    {formatTimestamp(governmentData.airQuality.timestamp)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">AQI</span>
                      <span className={`font-semibold ${getAQIColor(governmentData.airQuality.aqi)}`}>
                        {governmentData.airQuality.aqi}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Category</span>
                      <Badge variant={governmentData.airQuality.aqi > 100 ? "destructive" : 
                        governmentData.airQuality.aqi > 50 ? "secondary" : "default"}>
                        {governmentData.airQuality.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Traffic Data */}
            {governmentData?.traffic && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wind className="h-5 w-5" />
                    Traffic
                  </CardTitle>
                  <CardDescription>
                    {formatTimestamp(governmentData.traffic.timestamp)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {governmentData.traffic.incident_type ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Incident</span>
                          <Badge variant="destructive">
                            {governmentData.traffic.incident_type}
                          </Badge>
                        </div>
                        {governmentData.traffic.location && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Location</span>
                            <span className="font-semibold text-gray-800">
                              {governmentData.traffic.location}
                            </span>
                          </div>
                        )}
                        {governmentData.traffic.delay_minutes && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Delay</span>
                            <span className="font-semibold text-red-600">
                              {governmentData.traffic.delay_minutes} min
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <Badge variant="default">No incidents</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}


          </div>

          <Separator />

          {/* Matched Rules Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Matched Rules
              <Badge variant="secondary">{matchedRules.length}</Badge>
            </h2>
            
            {matchedRules.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500">No rules match the current government data conditions.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Rules will automatically trigger when conditions are met (e.g., temperature &gt; 35°C and humidity &gt; 60%)
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Table Summary View */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Active Rule Matches - Summary</CardTitle>
                    <CardDescription>Advertisers with rules matching current conditions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Advertiser</TableHead>
                          <TableHead>Business Type</TableHead>
                          <TableHead>Rule ID</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Matched Conditions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matchedRules.map((match, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-semibold">{match.advertiser.displayName}</div>
                                <div className="text-sm text-gray-500">{match.advertiser.name}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {match.advertiser.businessType}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{match.rule.ruleId}</TableCell>
                            <TableCell>
                              <Badge className={getRulePriorityColor(match.priority)}>
                                {match.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={match.advertiser.status === 'Active' ? 'default' : 'destructive'}>
                                {match.advertiser.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {match.matchedConditions.slice(0, 2).map((condition, idx) => (
                                  <div key={idx} className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded">
                                    ✓ {condition}
                                  </div>
                                ))}
                                {match.matchedConditions.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{match.matchedConditions.length - 2} more conditions
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

              </>
            )}
          </div>


        </div>
      )}
    </div>
  );
}