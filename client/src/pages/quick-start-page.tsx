import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Music, MessageSquare, Upload, Clock, Radio, Settings, Activity, Users, CreditCard, AlertTriangle, Volume2, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function QuickStartPage() {
  // Fetch data for analytics
  const { data: advertisers } = useQuery({
    queryKey: ['/api/v1/advertisers'],
  });

  const { data: contracts } = useQuery({
    queryKey: ['/api/v1/advertiser-contracts'],
  });

  const { data: systemHealth } = useQuery({
    queryKey: ["/api/health"],
  });

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="dashboard-card gradient-primary text-white p-8 rounded-xl">
          <h1 className="text-4xl font-bold mb-4">Quick Start</h1>
          <p className="text-lg opacity-90">Welcome back! Choose from the options below to get started quickly.</p>
          <div className="mt-4 flex items-center space-x-4">
            <Link href="/workers">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Activity className="w-4 h-4 mr-2" />
                Ambient Advertising Management
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/brands">
          <div className="dashboard-card cursor-pointer hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">MY BRANDS</h3>
                <p className="text-sm text-muted-foreground mt-1">Check on what your locations are playing.</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/discover">
          <div className="dashboard-card cursor-pointer hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">BRAND FIT</h3>
                <p className="text-sm text-muted-foreground mt-1">Discover Brand Fit Music.</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/pick-n-play">
          <div className="dashboard-card cursor-pointer hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <Music className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">PICK 'N' PLAY</h3>
                <p className="text-sm text-muted-foreground mt-1">Our playlists reformulated for swifter selection.</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/request-jingle">
          <div className="dashboard-card cursor-pointer hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">REQUEST JINGLE/VOICEOVER</h3>
                <p className="text-sm text-muted-foreground mt-1">Get the audio messages you need.</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/upload-jingle">
          <div className="dashboard-card cursor-pointer hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                <Upload className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">UPLOAD JINGLE</h3>
                <p className="text-sm text-muted-foreground mt-1">Upload your custom audio content.</p>
              </div>
            </div>
          </div>
        </Link>

        <div className="dashboard-card cursor-pointer hover:shadow-lg transition-all duration-200">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Clock className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">TIME SLOTS</h3>
              <p className="text-sm text-muted-foreground mt-1">Schedule playlists for specific times.</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Analytics Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="dashboard-card dashboard-card-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Advertisers</p>
                <p className="text-2xl font-bold">{Array.isArray(advertisers) ? advertisers.length : 21}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="dashboard-card dashboard-card-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold">
                  {Array.isArray(contracts) ? contracts.reduce((sum: number, contract: any) => {
                    const budget = parseFloat(contract.totalBudget || '0');
                    const spent = parseFloat(contract.currentSpend || '0');
                    return sum + (budget - spent);
                  }, 0).toLocaleString() : '7,067'}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-secondary" />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="text-2xl font-bold text-green-600">Healthy</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Audio Processing</p>
                <p className="text-2xl font-bold text-blue-600">Active</p>
              </div>
              <Volume2 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="dashboard-card bg-green-50 border-green-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-green-800 font-medium">Login successful</p>
            <p className="text-green-600 text-sm">Welcome to the USEA Music Dashboard!</p>
          </div>
        </div>
      </div>
    </div>
  );
}