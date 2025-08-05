import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { AddRequestModal } from "@/components/modals/add-request-modal";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Request } from "@shared/schema";
import { format } from "date-fns";

export default function RequestJingle() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  // Fetch jingle requests
  const { data: requests, isLoading } = useQuery<Request[]>({
    queryKey: ["/api/requests"],
  });

  // Delete request mutation
  const deleteMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return apiRequest("DELETE", `/api/requests/${requestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({
        title: "Success",
        description: "Request has been deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      });
    },
  });

  // Filter requests based on search query
  const filteredRequests = requests?.filter(request =>
    request.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (requestId: number) => {
    if (confirm("Are you sure you want to delete this request?")) {
      deleteMutation.mutate(requestId);
    }
  };

  const formatDate = (dateString: Date) => {
    return format(new Date(dateString), "MM/dd/yyyy");
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-primary/90 to-primary/70 text-white p-6 rounded-xl mb-6 shadow-md">
        <h1 className="text-2xl font-bold mb-2">Request Jingle/Voiceover</h1>
        <p className="text-white/90">Get the best pricing for jingles and voiceover/marketing messages with us.</p>
        <p className="text-white/90 mb-2">We also offer complimentary insertion of audio messages into your current set-up.</p>
        <p className="text-sm bg-white/10 inline-block px-3 py-1 rounded-full">
          Tip: Click here for a guide to scripts and information on pricing
        </p>
      </div>
      
      <Card className="border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary/80 via-secondary/60 to-primary/80"></div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center mb-6">
            <div className="relative flex-grow mb-4 md:mb-0 md:mr-4">
              <Input
                type="text"
                placeholder="Search requests"
                className="pl-10 border-primary/20 focus:border-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-primary/60" />
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Request
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-primary/90 text-white">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Request Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-primary mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading your requests...
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests && filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{request.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{request.createdAt ? formatDate(request.createdAt) : "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="mr-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(request.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        {searchQuery 
                          ? "No requests matching your search" 
                          : "You haven't made any requests yet"}
                        <Button
                          variant="link"
                          onClick={() => setIsAddModalOpen(true)}
                          className="mt-2 text-primary hover:text-primary/90"
                        >
                          Create your first request
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <AddRequestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
