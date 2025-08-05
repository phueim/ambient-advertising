import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Target, 
  Plus,
  Volume2,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Advertising {
  id: number;
  ruleId: string;
  advertiserId: number;
  audioFile: string | null;
  status: string;
  createdAt: string;
  advertiserName?: string;
  ruleName?: string;
}

interface ConditionRule {
  id: number;
  ruleId: string;
  messageTemplate: string;
  isActive: boolean;
}

interface Advertiser {
  id: number;
  name: string;
  displayName: string;
  status: string;
}

interface Audio {
  id: number;
  text: string;
  variables?: any;
  audioUrl: string | null;
  voiceType: string;
  duration: number | null;
  status: string;
  generatedAt: string;
  synthesizedAt: string | null;
}

export function AdvertisingManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdvertising, setSelectedAdvertising] = useState<Advertising | null>(null);
  const [newAdvertising, setNewAdvertising] = useState({
    ruleId: "",
    advertiserId: "",
    audioFile: "none",
    status: "Pending"
  });
  const [editAdvertising, setEditAdvertising] = useState({
    ruleId: "",
    advertiserId: "",
    audioFile: "none",
    status: "Pending"
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch advertising data
  const { data: advertisings, isLoading, refetch } = useQuery<Advertising[]>({
    queryKey: ["/api/v1/advertising"],
    refetchInterval: 60000, // 1 minute
  });

  // Fetch rules for dropdown
  const { data: rules } = useQuery<ConditionRule[]>({
    queryKey: ["/api/v1/condition-rules"],
  });

  // Fetch advertisers for dropdown
  const { data: advertisers } = useQuery<Advertiser[]>({
    queryKey: ["/api/v1/advertisers"],
  });

  // Fetch audio files for dropdown
  const { data: audioFiles } = useQuery<Audio[]>({
    queryKey: ["/api/v1/audio?getAll=true"],
  });

  // Create advertising mutation
  const createAdvertising = useMutation({
    mutationFn: async (advertisingData: typeof newAdvertising) => {
      await apiRequest("/api/v1/advertising", {
        method: "POST",
        body: JSON.stringify({
          ...advertisingData,
          advertiserId: parseInt(advertisingData.advertiserId),
          audioFile: advertisingData.audioFile === "none" ? null : advertisingData.audioFile
        }),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Advertising Created",
        description: "New advertising campaign has been added successfully.",
      });
      // Force immediate refetch
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/v1/advertising"] });
      setIsCreateDialogOpen(false);
      setNewAdvertising({ ruleId: "", advertiserId: "", audioFile: "none", status: "Pending" });
    },
    onError: (error) => {
      toast({
        title: "❌ Failed to Create Advertising",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Edit advertising mutation
  const updateAdvertising = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof editAdvertising }) => {
      await apiRequest(`/api/v1/advertising/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...data,
          advertiserId: parseInt(data.advertiserId),
          audioFile: data.audioFile === "none" ? null : data.audioFile
        }),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Advertising Updated",
        description: "Advertising campaign has been updated successfully.",
      });
      // Force immediate refetch
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/v1/advertising"] });
      setIsEditDialogOpen(false);
      setSelectedAdvertising(null);
    },
    onError: (error) => {
      toast({
        title: "❌ Failed to Update Advertising",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete advertising mutation
  const deleteAdvertising = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/v1/advertising/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: async (data, variables) => {
      toast({
        title: "✅ Advertising Deleted",
        description: "Advertising campaign has been deleted successfully.",
      });
      
      // Multiple refresh strategies to ensure data updates
      // Strategy 1: Direct refetch for immediate update
      await refetch();
      
      // Strategy 2: Invalidate queries to mark cache as stale
      await queryClient.invalidateQueries({ queryKey: ["/api/v1/advertising"] });
      
      // Strategy 3: Reset queries to force completely fresh data
      queryClient.resetQueries({ queryKey: ["/api/v1/advertising"] });
      
      setIsDeleteDialogOpen(false);
      setSelectedAdvertising(null);
    },
    onError: (error) => {
      toast({
        title: "❌ Failed to Delete Advertising",
        description: error.message || "Unable to delete advertising. Please check if it has associated data and try again.",
        variant: "destructive",
      });
    },
  });



  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Done":
        return <Badge className="bg-green-100 text-green-800">Done</Badge>;
      case "Failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAdvertiserName = (advertiserId: number) => {
    const advertiser = advertisers?.find(a => a.id === advertiserId);
    return advertiser?.displayName || `ID: ${advertiserId}`;
  };

  const getRuleName = (ruleId: string) => {
    const rule = rules?.find(r => r.ruleId === ruleId);
    return rule ? ruleId : `Rule: ${ruleId}`;
  };

  const handleEdit = (advertising: Advertising) => {
    setSelectedAdvertising(advertising);
    setEditAdvertising({
      ruleId: advertising.ruleId,
      advertiserId: advertising.advertiserId.toString(),
      audioFile: advertising.audioFile || "none",
      status: advertising.status
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (advertising: Advertising) => {
    setSelectedAdvertising(advertising);
    setIsDeleteDialogOpen(true);
  };

  // Pagination logic
  const totalItems = advertisings?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAdvertisings = advertisings?.slice(startIndex, endIndex);

  // Reset to first page when data changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Advertising Management
            <Badge variant="secondary" className="ml-2">
              {advertisings?.length || 0} Campaigns
            </Badge>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Advertising
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Advertising Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ruleId">Rule *</Label>
                  <Select
                    value={newAdvertising.ruleId}
                    onValueChange={(value) => setNewAdvertising(prev => ({ ...prev, ruleId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rule" />
                    </SelectTrigger>
                    <SelectContent>
                      {rules?.map((rule) => (
                        <SelectItem key={rule.ruleId} value={rule.ruleId}>
                          {rule.ruleId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="advertiserId">Advertiser *</Label>
                  <Select
                    value={newAdvertising.advertiserId}
                    onValueChange={(value) => setNewAdvertising(prev => ({ ...prev, advertiserId: value }))}
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
                  <Label htmlFor="audioFile">Audio File</Label>
                  <Select
                    value={newAdvertising.audioFile}
                    onValueChange={(value) => setNewAdvertising(prev => ({ ...prev, audioFile: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audio file (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No audio file</SelectItem>
                      {audioFiles?.filter(audio => audio.status === 'completed' && audio.audioUrl).map((audio) => (
                        <SelectItem key={audio.id} value={audio.audioUrl!}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {audio.text.length > 50 ? `${audio.text.substring(0, 50)}...` : audio.text}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {audio.voiceType} voice • {audio.duration ? `${audio.duration}s` : 'Unknown duration'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newAdvertising.status}
                    onValueChange={(value) => setNewAdvertising(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createAdvertising.mutate(newAdvertising)}
                    disabled={createAdvertising.isPending || !newAdvertising.ruleId || !newAdvertising.advertiserId}
                  >
                    {createAdvertising.isPending ? "Creating..." : "Create Advertising"}
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
              <TableHead>Rule</TableHead>
              <TableHead>Advertiser</TableHead>
              <TableHead>Audio File</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading advertising campaigns...
                </TableCell>
              </TableRow>
            ) : advertisings?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No advertising campaigns found</p>
                    <p className="text-sm">Create your first advertising campaign to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedAdvertisings?.map((advertising) => (
                <TableRow key={advertising.id}>
                  <TableCell className="font-medium">{getRuleName(advertising.ruleId)}</TableCell>
                  <TableCell>{getAdvertiserName(advertising.advertiserId)}</TableCell>
                  <TableCell>
                    {advertising.audioFile ? (
                      <div className="flex items-center">
                        <Volume2 className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="truncate max-w-xs">{advertising.audioFile}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">No audio file</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(advertising.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(advertising)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(advertising)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} campaigns
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Advertising Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editRuleId">Rule *</Label>
              <Select
                value={editAdvertising.ruleId}
                onValueChange={(value) => setEditAdvertising(prev => ({ ...prev, ruleId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rule" />
                </SelectTrigger>
                <SelectContent>
                  {rules?.map((rule) => (
                    <SelectItem key={rule.ruleId} value={rule.ruleId}>
                      {rule.ruleId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editAdvertiserId">Advertiser *</Label>
              <Select
                value={editAdvertising.advertiserId}
                onValueChange={(value) => setEditAdvertising(prev => ({ ...prev, advertiserId: value }))}
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
              <Label htmlFor="editAudioFile">Audio File</Label>
              <Select
                value={editAdvertising.audioFile}
                onValueChange={(value) => setEditAdvertising(prev => ({ ...prev, audioFile: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audio file (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No audio file</SelectItem>
                  {audioFiles?.filter(audio => audio.status === 'completed' && audio.audioUrl).map((audio) => (
                    <SelectItem key={audio.id} value={audio.audioUrl!}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {audio.text.length > 50 ? `${audio.text.substring(0, 50)}...` : audio.text}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {audio.voiceType} voice • {audio.duration ? `${audio.duration}s` : 'Unknown duration'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editStatus">Status</Label>
              <Select
                value={editAdvertising.status}
                onValueChange={(value) => setEditAdvertising(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedAdvertising && updateAdvertising.mutate({ 
                  id: selectedAdvertising.id, 
                  data: editAdvertising 
                })}
                disabled={updateAdvertising.isPending || !editAdvertising.ruleId || !editAdvertising.advertiserId}
              >
                {updateAdvertising.isPending ? "Updating..." : "Update Advertising"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the advertising campaign
              {selectedAdvertising && ` "${getRuleName(selectedAdvertising.ruleId)}" for ${getAdvertiserName(selectedAdvertising.advertiserId)}`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedAdvertising && deleteAdvertising.mutate(selectedAdvertising.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteAdvertising.isPending}
            >
              {deleteAdvertising.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}