import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RequestForm } from "@/components/request/request-form";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileAudio, Edit, Plus } from "lucide-react";
import { Request } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function RequestJinglePage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  
  // Load requests
  const { data: requests, isLoading } = useQuery<Request[]>({
    queryKey: ["/api/requests"],
    enabled: !!user,
  });
  
  const columns = [
    {
      accessorKey: "title" as keyof Request,
      header: "Request Type",
      cell: (value: string, row: Request) => (
        <div className="flex items-center">
          <FileAudio className="text-primary mr-2 h-4 w-4" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt" as keyof Request,
      header: "Date",
      cell: (value: string) => (
        <div>
          {value ? (
            formatDistance(new Date(value), new Date(), { addSuffix: true })
          ) : (
            "Unknown date"
          )}
        </div>
      ),
    },
    {
      accessorKey: "status" as keyof Request,
      header: "Status",
      cell: (value: string) => {
        let badgeVariant:
          | "default"
          | "secondary"
          | "destructive"
          | "outline" = "secondary";
        
        if (value === "Completed") {
          badgeVariant = "default";
        } else if (value === "Rejected") {
          badgeVariant = "destructive";
        } else {
          badgeVariant = "secondary";
        }
        
        return (
          <Badge variant={badgeVariant}>
            {value || "Submitted"}
          </Badge>
        );
      },
    },
  ];
  
  const handleViewRequest = (request: Request) => {
    setSelectedRequest(request);
  };
  
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-2">Request Jingle/Voiceover</h1>
      <p className="text-gray-600 mb-6">
        Get the best pricing for jingles and voiceover/marketing messages with us.<br />
        We also offer complimentary insertion of audio messages into your current set-up.<br />
        <span className="text-sm italic">Tip: Click here for a guide to scripts and information on pricing.</span>
      </p>
      
      {showForm ? (
        <div className="mb-8">
          <RequestForm onCancel={() => setShowForm(false)} />
        </div>
      ) : (
        <div className="mb-4">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Request
          </Button>
        </div>
      )}
      
      <Card className={showForm ? 'hidden' : 'block'}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Request History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={requests || []}
            columns={columns}
            searchable
            searchPlaceholder="Search requests..."
            pagination
            pageSize={5}
            actions={[
              {
                label: "View",
                icon: <Edit className="h-4 w-4 mr-1" />,
                onClick: handleViewRequest,
              },
            ]}
          />
        </CardContent>
      </Card>
      
      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                <p className="mt-1">{selectedRequest.title}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Type</h3>
                <p className="mt-1">{selectedRequest.type}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <Badge className="mt-1" variant={
                  selectedRequest.status === "Completed" ? "default" :
                  selectedRequest.status === "Rejected" ? "destructive" : 
                  "secondary"
                }>
                  {selectedRequest.status}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-sm">{selectedRequest.description || "No description provided."}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Requested On</h3>
                <p className="mt-1">
                  {selectedRequest.createdAt 
                    ? new Date(selectedRequest.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : "Unknown date"
                  }
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setSelectedRequest(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
