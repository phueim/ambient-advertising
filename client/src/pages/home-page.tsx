import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Music, Upload, Headphones, Play } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome, {user?.username || "User"}!</h1>
        <p className="text-gray-600">
          Manage your music, playlists, and jingle requests from this dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Music className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Create and manage your custom playlists for your business.
            </p>
            <Link href="/playlist">
              <Button variant="outline" size="sm" className="w-full">
                Manage Playlists
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Play className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Pick 'N' Play</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Search and select music to add to your custom playlists.
            </p>
            <Link href="/playlist">
              <Button variant="outline" size="sm" className="w-full">
                Pick Music
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Upload className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Upload Jingles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Upload your jingles and voice overs for approval and use.
            </p>
            <Link href="/upload-jingle">
              <Button variant="outline" size="sm" className="w-full">
                Upload Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Headphones className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Request Jingles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Request custom jingles and voice overs from our team.
            </p>
            <Link href="/request-jingle">
              <Button variant="outline" size="sm" className="w-full">
                Make Request
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              No recent uploads found. 
              <Link href="/upload-jingle">
                <Button variant="link" className="p-0 h-auto ml-1">
                  Upload your first jingle now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              No recent requests found. 
              <Link href="/request-jingle">
                <Button variant="link" className="p-0 h-auto ml-1">
                  Make your first request
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
