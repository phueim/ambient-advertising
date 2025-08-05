import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Play, 
  Square, 
  RotateCcw, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Server,
  Mic,
  Database,
  Zap
} from "lucide-react";

interface WorkerStatus {
  isRunning: boolean;
  workers: {
    dataIngestion: { isRunning: boolean; intervalMinutes: number };
    voiceSynthesis: { isRunning: boolean; queueLength: number };
    triggerEngine: { isRunning: boolean };
  };
  health: {
    overallStatus: "healthy" | "warning" | "error";
    services: Array<{
      service: string;
      status: string;
      lastCheck: Date;
      responseTime?: number;
      errorMessage?: string;
    }>;
  };
}

export function WorkerControlPanel() {
  const { toast } = useToast();
  const [dataIngestionInterval, setDataIngestionInterval] = useState(5);
  const [triggerEngineInterval, setTriggerEngineInterval] = useState(5);

  // Fetch worker status
  const { data: workerStatus, isLoading } = useQuery<WorkerStatus>({
    queryKey: ["/api/workers/status"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Worker control mutations
  const startWorkers = useMutation({
    mutationFn: async (config: { dataIngestionInterval: number; triggerEngineInterval: number }) => {
      await apiRequest("/api/workers/start", {
        method: "POST",
        body: JSON.stringify(config),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "Workers Started",
        description: "All AI automation workers have been started successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workers/status"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Start Workers",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stopWorkers = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/workers/stop", { method: "POST" });
    },
    onSuccess: () => {
      toast({
        title: "Workers Stopped",
        description: "All AI automation workers have been stopped.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workers/status"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Stop Workers",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const restartWorkers = useMutation({
    mutationFn: async (config: { dataIngestionInterval: number; triggerEngineInterval: number }) => {
      await apiRequest("/api/workers/restart", {
        method: "POST",
        body: JSON.stringify(config),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "Workers Restarted",
        description: "All AI automation workers have been restarted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workers/status"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Restart Workers",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStart = () => {
    startWorkers.mutate({
      dataIngestionInterval,
      triggerEngineInterval
    });
  };

  const handleRestart = () => {
    restartWorkers.mutate({
      dataIngestionInterval,
      triggerEngineInterval
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Healthy</Badge>;
      case "warning":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>;
      case "error":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Error</Badge>;
      case "stopped":
        return <Badge variant="outline"><Square className="w-3 h-3 mr-1" />Stopped</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "data_ingestion":
        return <Database className="w-4 h-4" />;
      case "voice_synthesis":
        return <Mic className="w-4 h-4" />;
      case "trigger_engine":
        return <Zap className="w-4 h-4" />;
      case "worker_manager":
        return <Server className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="w-5 h-5 mr-2" />
            Worker Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading worker status...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Server className="w-5 h-5 mr-2" />
            Worker Control Panel
          </div>
          <div className="flex items-center space-x-2">
            {workerStatus?.health && getStatusBadge(workerStatus.health.overallStatus)}
            {workerStatus?.isRunning ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Play className="w-3 h-3 mr-1" />Running
              </Badge>
            ) : (
              <Badge variant="outline">
                <Square className="w-3 h-3 mr-1" />Stopped
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Control Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataIngestionInterval">Data Ingestion (minutes)</Label>
              <Input
                id="dataIngestionInterval"
                type="number"
                min="1"
                max="60"
                value={dataIngestionInterval}
                onChange={(e) => setDataIngestionInterval(parseInt(e.target.value) || 5)}
              />
            </div>
            <div>
              <Label htmlFor="triggerEngineInterval">Trigger Engine (minutes)</Label>
              <Input
                id="triggerEngineInterval"
                type="number"
                min="1"
                max="60"
                value={triggerEngineInterval}
                onChange={(e) => setTriggerEngineInterval(parseInt(e.target.value) || 5)}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleStart}
              disabled={startWorkers.isPending || workerStatus?.isRunning}
              variant="default"
              size="sm"
            >
              <Play className="w-4 h-4 mr-1" />
              Start Workers
            </Button>
            <Button
              onClick={() => stopWorkers.mutate()}
              disabled={stopWorkers.isPending || !workerStatus?.isRunning}
              variant="outline"
              size="sm"
            >
              <Square className="w-4 h-4 mr-1" />
              Stop Workers
            </Button>
            <Button
              onClick={handleRestart}
              disabled={restartWorkers.isPending}
              variant="secondary"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Restart Workers
            </Button>
          </div>
        </div>

        <Separator />

        {/* Worker Status Section */}
        {workerStatus?.workers && (
          <div className="space-y-4">
            <h4 className="font-medium">Individual Workers</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Data Ingestion</span>
                  </div>
                  {getStatusBadge(workerStatus.workers.dataIngestion.isRunning ? "healthy" : "stopped")}
                </div>
                <p className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Every {workerStatus.workers.dataIngestion.intervalMinutes} minutes
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Mic className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Voice Synthesis</span>
                  </div>
                  {getStatusBadge(workerStatus.workers.voiceSynthesis.isRunning ? "healthy" : "stopped")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Queue: {workerStatus.workers.voiceSynthesis.queueLength} items
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Trigger Engine</span>
                  </div>
                  {getStatusBadge(workerStatus.workers.triggerEngine.isRunning ? "healthy" : "stopped")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Evaluating conditions & triggering ads
                </p>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* System Health Section */}
        {workerStatus?.health?.services && (
          <div className="space-y-4">
            <h4 className="font-medium">System Health</h4>
            <div className="space-y-2">
              {workerStatus.health.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    {getServiceIcon(service.service)}
                    <span className="text-sm font-medium">
                      {service.service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {service.responseTime && (
                      <span className="text-xs text-muted-foreground">
                        {service.responseTime}ms
                      </span>
                    )}
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}