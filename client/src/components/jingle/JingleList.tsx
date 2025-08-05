import { FileAudio, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Jingle {
  id: number;
  title: string;
  date: string;
  status: "Pending Approval" | "Approved";
}

interface JingleListProps {
  jingles: Jingle[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (id: number) => void;
}

export default function JingleList({ jingles, isLoading, onAdd, onEdit }: JingleListProps) {
  // If no jingles provided, use default example jingles
  const displayJingles = jingles.length > 0 ? jingles : [
    { id: 1, title: "My new Jingle Title", date: "08/01/1988", status: "Pending Approval" },
    { id: 2, title: "My new Jingle Title", date: "08/01/1988", status: "Approved" },
    { id: 3, title: "My new Jingle Title", date: "08/01/1988", status: "Pending Approval" },
    { id: 4, title: "My new Jingle Title", date: "08/01/1988", status: "Pending Approval" },
    { id: 5, title: "My new Jingle Title", date: "08/01/1988", status: "Approved" },
    { id: 6, title: "My new Jingle Title", date: "08/01/1988", status: "Pending Approval" },
  ];

  return (
    <Card className="mt-8 p-6">
      <div className="bg-primary text-white p-3 rounded-md flex justify-between items-center mb-4">
        <div className="font-medium">Message Title</div>
        <div className="font-medium">Date</div>
        <div className="font-medium">Status</div>
        <div>
          <Button 
            variant="secondary" 
            size="sm" 
            className="text-primary"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center">Loading jingles...</div>
      ) : (
        <div className="space-y-3">
          {displayJingles.map((jingle) => (
            <div key={jingle.id} className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white mr-2">
                  <FileAudio className="h-4 w-4" />
                </div>
                <span>{jingle.title}</span>
              </div>
              <div>{jingle.date}</div>
              <div className={jingle.status === "Approved" ? "text-green-600" : "text-yellow-600"}>
                {jingle.status}
              </div>
              <Button 
                size="sm"
                onClick={() => onEdit(jingle.id)}
              >
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
