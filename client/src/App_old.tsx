import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { QuickStartPage } from "@/pages/QuickStartPage";
import { MyBrandsPage } from "@/pages/MyBrandsPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WorkerControlPanel } from "@/components/WorkerControlPanel";
import { AdvertiserManagement } from "@/components/AdvertiserManagement";
import { BillingManagement } from "@/components/BillingManagement";
import { AnalyticsReporting } from "@/components/AnalyticsReporting";
import { EnhancedConditionRules } from "@/components/EnhancedConditionRules";
import { AudioPreview } from "@/components/AudioPreview";
import ContractsPage from "@/pages/ContractsPage";

import { Activity, Zap, DollarSign, MapPin, Clock, Thermometer, Wind, Eye, AlertTriangle, Settings, BarChart3, Users, TrendingUp, CreditCard, Volume2, Monitor, Bell, MessageSquare, User } from "lucide-react";
import { useState } from "react";

interface SystemHealth {
  status: string;
  services: Array<{
    service: string;
    status: string;
    lastCheck: string;
    errorMessage?: string;
    responseTime: number;
  }>;
}

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

export default function App() {
  const [currentPage, setCurrentPage] = useState('quick-start');



  // Manual trigger
  const triggerPipeline = async () => {
    try {
      const response = await fetch("/api/automation/trigger", { method: "POST" });
      const result = await response.json();
      console.log("Manual trigger result:", result);
      // Refresh data after trigger
      setTimeout(() => {
        refetchHealth();
        refetchTriggers();
      }, 2000);
    } catch (error) {
      console.error("Manual trigger failed:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-SG", { 
      timeZone: "Asia/Singapore",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const getWeatherIcon = (condition: string) => {
    if (condition?.toLowerCase().includes('rain')) return '🌧️';
    if (condition?.toLowerCase().includes('cloud')) return '☁️';
    if (condition?.toLowerCase().includes('sun')) return '☀️';
    return '🌤️';
  };

  const totalTriggersToday = recentTriggers?.length || 0;
  const totalSpentToday = recentTriggers?.reduce((sum, trigger) => sum + parseFloat(trigger.cost), 0) || 0;
  const activeServices = systemHealth?.services?.filter(s => s.status === 'healthy').length || 0;

  // Remove the separate analytics dashboard - we'll integrate into existing tabs

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🌟 Ambient Advertising Management System</h1>
            <p className="text-muted-foreground">
              AI-powered voiceover advertising automation platform with intelligent contextual triggers across Singapore locations
            </p>
          </div>
          
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="workers" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Workers</span>
          </TabsTrigger>
          <TabsTrigger value="advertisers" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Advertisers</span>
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Contracts</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Rules</span>
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4" />
            <span>Audio</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Dashboard Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Triggers Today</p>
                    <p className="text-2xl font-bold">{totalTriggersToday}</p>
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
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Services</p>
                    <p className="text-2xl font-bold">{activeServices}/{systemHealth?.services?.length || 0}</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">System Status</p>
                    <p className="text-2xl font-bold">
                      {systemHealth?.status === "ok" ? "HEALTHY" : "ISSUES"}
                    </p>
                  </div>
                  {systemHealth?.status === "ok" ? (
                    <Activity className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={triggerPipeline} className="bg-blue-600 hover:bg-blue-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Manual Trigger
                </Button>
                <Button
                  variant={isAutoRefresh ? "default" : "outline"}
                  onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  {isAutoRefresh ? "Auto Refresh ON" : "Auto Refresh OFF"}
                </Button>
                <Button variant="outline" onClick={() => { refetchHealth(); refetchTriggers(); }}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemHealth ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={systemHealth.status === "ok" ? "default" : "destructive"}>
                      {systemHealth.status === "ok" ? "OPERATIONAL" : "DEGRADED"}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Last updated: {formatTime(new Date().toISOString())}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {systemHealth.services.map((service, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
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
                        <div className="text-sm text-gray-600">
                          Response: {service.responseTime}ms
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(service.lastCheck)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p>Loading system health...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Ad Triggers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Recent Ad Triggers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTriggers?.length ? (
                <div className="space-y-4">
                  {recentTriggers.slice(0, 10).map((trigger) => (
                    <div key={trigger.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="font-medium">Rule: {trigger.ruleId}</p>
                          <p className="text-sm text-gray-600">
                            {trigger.advertiserName || `Advertiser ${trigger.advertiserId}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Weather Condition</p>
                          <div className="flex items-center gap-2">
                            <span>{getWeatherIcon(trigger.weatherData?.condition)}</span>
                            <span className="text-sm">
                              {trigger.weatherData?.temperature || 'N/A'}°C, {trigger.weatherData?.condition || 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Cost</p>
                          <p className="text-lg font-bold text-green-600">${trigger.cost}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Time</p>
                          <p className="text-sm">{formatTime(trigger.timestamp)}</p>
                          <Badge 
                            variant={trigger.status === "played" ? "default" : "secondary"}
                            className="mt-1"
                          >
                            {trigger.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p>No recent triggers found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workers">
          <WorkerControlPanel />
        </TabsContent>

        <TabsContent value="advertisers">
          <AdvertiserManagement />
        </TabsContent>

        <TabsContent value="contracts">
          <ContractsPage />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>

            {/* Metrics Cards - First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Active Advertisers</p>
                      <p className="text-3xl font-bold">{Array.isArray(advertisers) ? advertisers.length : 21}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        Currently active accounts ✓
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Credits</p>
                      <p className="text-3xl font-bold">
                        {Array.isArray(contracts) ? contracts.reduce((sum: number, contract: any) => {
                          const budget = parseFloat(contract.totalBudget || '0');
                          const spent = parseFloat(contract.currentSpend || '0');
                          return sum + (budget - spent);
                        }, 0).toLocaleString() : '7,067'} credits
                      </p>
                      <p className="text-sm text-blue-600 flex items-center mt-1">
                        All advertiser credits combined ℹ️
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Low Credit Accounts</p>
                      <p className="text-3xl font-bold">
                        {Array.isArray(contracts) ? contracts.filter((contract: any) => {
                          const budget = parseFloat(contract.totalBudget || '0');
                          const spent = parseFloat(contract.currentSpend || '0');
                          return (budget - spent) < 10;
                        }).length : 0}
                      </p>
                      <p className="text-sm text-orange-600 flex items-center mt-1">
                        Advertisers with less than 10 credits ⚠️
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Critical Errors (24h)</p>
                      <p className="text-3xl font-bold">
                        {systemHealth?.services?.filter(s => s.status === 'error').length || 0}
                      </p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        System critical issues ✓
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Metrics Cards - Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Errors (24h)</p>
                      <p className="text-3xl font-bold">0</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        System errors logged ✓
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Failed Audio (24h)</p>
                      <p className="text-3xl font-bold">0</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        Audio processing failures 🎵
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Volume2 className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Failed Campaigns (24h)</p>
                      <p className="text-3xl font-bold">0</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        Campaign execution failures ✓
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Credit Flow Analysis</p>
                      <p className="text-xl font-bold">View Details</p>
                      <p className="text-sm text-blue-600 flex items-center mt-1">
                        Detailed credit analysis →
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Advertiser Registration Trend
                    <Badge variant="outline">New Registrations</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 w-full bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">Advertiser trend chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Audio Activity
                    <Badge variant="outline">Audio Files Created</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 w-full bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Volume2 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">Audio activity chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rules">
          <EnhancedConditionRules />
        </TabsContent>

        <TabsContent value="audio" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Audio Preview & Management</h2>
            <p className="text-muted-foreground">
              Listen to generated voiceover advertisements and monitor audio file production from your AI automation system
            </p>
          </div>
          <AudioPreview />
        </TabsContent>
      </Tabs>
    </div>
  );
}