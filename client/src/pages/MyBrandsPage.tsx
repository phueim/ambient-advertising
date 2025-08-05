import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Edit, 
  Plus,
  BookOpen,
  Wifi,
  WifiOff,
  CircleDot
} from "lucide-react";
import { Link } from "wouter";

// Mock data matching your screenshot
const locations = [
  {
    id: "111",
    code: "SOMERSET (AD965986)",
    description: "FairPrice Finest",
    status: "online" as const,
    playlist: "FairPrice Finest (Masterbox 01 - BUKIT PANJANG PLAZA)"
  },
  {
    id: "112", 
    code: "Ang Mo Kio Ave 6 (AMK712) (A2006974)",
    description: "NTUC FairPrice",
    status: "online" as const,
    playlist: "FairPrice Finest (Masterbox 01 - BUKIT PANJANG PLAZA)"
  },
  {
    id: "113",
    code: "ARTRA (AD997543)",
    description: "FairPrice Finest", 
    status: "online" as const,
    playlist: "FairPrice Finest (Masterbox 01 - BUKIT PANJANG PLAZA)"
  },
  {
    id: "114",
    code: "BEDOK MALL (A4873111)",
    description: "FairPrice Finest",
    status: "online" as const, 
    playlist: "FairPrice Finest (Masterbox 01 - BUKIT PANJANG PLAZA)"
  },
  {
    id: "115",
    code: "BUKIT TIMAH PLAZA (AD964789)",
    description: "FairPrice Finest",
    status: "online" as const,
    playlist: "FairPrice Finest (Masterbox 03 - HOUGANG STREET 21)"
  },
  {
    id: "116",
    code: "Masterbox 01 - BUKIT",
    description: "",
    status: "partial" as const,
    playlist: "Daily English - Uptempo"
  }
];

export default function MyBrandsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline" | "partial">("all");

  // Filter locations based on search and status
  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || location.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    online: locations.filter(l => l.status === "online").length,
    offline: locations.filter(l => l.status === "offline").length, 
    partial: locations.filter(l => l.status === "partial").length,
    total: locations.length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Brands</h1>
            <p className="text-gray-600 text-sm mt-1">
              Overview of what your current locations are playing. Make quick changes or search for playlists.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="text-sm">
              <BookOpen className="w-4 h-4 mr-2" />
              Take Tour
            </Button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="flex items-center space-x-6 mb-4">
          <div className="flex items-center space-x-2">
            <CircleDot className="w-4 h-4 text-green-500" />
            <span className="text-sm">Online ({statusCounts.online})</span>
          </div>
          <div className="flex items-center space-x-2">
            <CircleDot className="w-4 h-4 text-red-500" />
            <span className="text-sm">Offline ({statusCounts.offline})</span>
          </div>
          <div className="flex items-center space-x-2">
            <CircleDot className="w-4 h-4 text-yellow-500" />
            <span className="text-sm">Partial ({statusCounts.partial})</span>
          </div>
          <div className="flex items-center space-x-2">
            <CircleDot className="w-4 h-4 text-blue-500" />
            <span className="text-sm">Total ({statusCounts.total})</span>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search locations or playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {["All", "Online", "Offline", "Partial"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status.toLowerCase() ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status.toLowerCase() as any)}
                  className="text-xs"
                >
                  {status}
                </Button>
              ))}
            </div>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Card>
        <table className="usea-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Description</th>
              <th>Active Playlist</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {filteredLocations.map((location) => (
              <tr key={location.id} className="hover:bg-gray-50">
                <td>
                  <div className="flex items-center space-x-3">
                    <div className={`status-${location.status}`}></div>
                    <span className="font-medium text-sm">{location.code}</span>
                  </div>
                </td>
                <td>
                  <span className="text-sm text-gray-700">{location.description}</span>
                </td>
                <td>
                  <div className="flex items-center space-x-2">
                    <CircleDot className="w-3 h-3 text-green-500" />
                    <span className="text-sm text-gray-700">{location.playlist}</span>
                  </div>
                </td>
                <td>
                  <Link href={`/brands/${location.id}/edit`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}