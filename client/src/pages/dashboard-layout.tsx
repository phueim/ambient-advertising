import { useState } from "react";
import { Outlet, Switch, Route } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import PlaylistEdit from "@/pages/playlist-edit";
import UploadJingle from "@/pages/upload-jingle";
import RequestJingle from "@/pages/request-jingle";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-6 overflow-auto">
          <Switch>
            <Route path="/" component={() => <div>Home Dashboard</div>} />
            <Route path="/brands" component={() => <div>My Brands</div>} />
            <Route path="/discover" component={() => <div>Discover Brand Fit Music</div>} />
            <Route path="/playlist" component={PlaylistEdit} />
            <Route path="/upload-jingle" component={UploadJingle} />
            <Route path="/request-jingle" component={RequestJingle} />
            <Route path="/settings" component={Settings} />
            <Route path="/help" component={() => <div>Help Page</div>} />
            <Route path="/contact" component={() => <div>Contact Page</div>} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}
