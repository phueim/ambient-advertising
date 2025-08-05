import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Jingle } from "@shared/schema";
import { Edit, Plus, Music } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function UploadedJinglesList() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const { data: jingles, isLoading } = useQuery<Jingle[]>({
    queryKey: ["/api/jingles"],
    enabled: !!user,
  });
  
  const columns = [
    {
      accessorKey: "title" as keyof Jingle,
      header: "Message Title",
      cell: (value: string, row: Jingle) => (
        <div className="flex items-center">
          <Music className="text-primary mr-2 h-4 w-4" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt" as keyof Jingle,
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
      accessorKey: "status" as keyof Jingle,
      header: "Status",
      cell: (value: string) => {
        let badgeVariant:
          | "default"
          | "secondary"
          | "destructive"
          | "outline" = "secondary";
        
        if (value === "Approved") {
          badgeVariant = "default";
        } else if (value === "Rejected") {
          badgeVariant = "destructive";
        } else {
          badgeVariant = "secondary";
        }
        
        return (
          <Badge variant={badgeVariant}>
            {value || "Pending Approval"}
          </Badge>
        );
      },
    },
  ];
  
  const handleEdit = (jingle: Jingle) => {
    console.log("Edit jingle:", jingle);
    // In a real application, you'd navigate to an edit page or open a modal
  };
  
  const handleAdd = () => {
    // In a real application, you'd navigate to an upload page or open a modal
    // For this example, we'll just scroll to the upload form
    const uploadForm = document.getElementById("upload-form");
    if (uploadForm) {
      uploadForm.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Uploaded Jingles</CardTitle>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable
          data={jingles || []}
          columns={columns}
          searchable
          searchPlaceholder="Search jingles..."
          pagination
          pageSize={5}
          actions={[
            {
              label: "Edit",
              icon: <Edit className="h-4 w-4 mr-1" />,
              onClick: handleEdit,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
