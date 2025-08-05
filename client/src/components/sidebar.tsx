import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useMemo } from "react";
import {
  Home,
  Briefcase,
  Music,
  Play,
  Upload,
  Headphones,
  HelpCircle,
  Settings,
  Phone,
  Menu,
  X,
  BookOpen
} from "lucide-react";
import useaLogo from "@/assets/usea-logo.png";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();

  const routes = useMemo(() => [
    {
      name: "Quick Start",
      path: "/",
      icon: Home,
    },
    {
      name: "My Brands",
      path: "/brands",
      icon: Briefcase,
    },
    {
      name: "Discover Brand Fit Music",
      path: "/discover",
      icon: Music,
    },
    {
      name: "Pick 'N' Play",
      path: "/pick-n-play",
      icon: Play,
    },
    {
      name: "Upload Jingle / Voice over",
      path: "/upload-jingle",
      icon: Upload,
    },
    {
      name: "Request Jingle / Voice over",
      path: "/request-jingle",
      icon: Headphones,
    },
  ], []);

  const supportRoutes = useMemo(() => [
    {
      name: "Help",
      path: "/help",
      icon: HelpCircle,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
    {
      name: "Contact",
      path: "/contact",
      icon: Phone,
    },
  ], []);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <nav 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-secondary text-white flex-col flex transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center">
              <img src={useaLogo} alt="USEA Logo" className="w-36 mt-2 mb-4" />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-white" 
              onClick={toggleSidebar}
            >
              <X size={24} />
            </Button>
          </div>
          
          <div className="mt-8 flex-grow space-y-1">
            {routes.map(route => (
              <Link href={route.path} key={route.path}>
                <a 
                  className={cn(
                    "flex items-center py-3 px-4 rounded hover:bg-white hover:bg-opacity-10 transition-colors",
                    location === route.path && "border-l-2 border-primary bg-white bg-opacity-10"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  <route.icon className="w-5 h-5 mr-3" />
                  <span>{route.name}</span>
                </a>
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-8 space-y-1">
            {supportRoutes.map(route => (
              <Link href={route.path} key={route.path}>
                <a 
                  className={cn(
                    "flex items-center py-3 px-4 rounded hover:bg-white hover:bg-opacity-10 transition-colors",
                    location === route.path && "border-l-2 border-primary bg-white bg-opacity-10"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  <route.icon className="w-5 h-5 mr-3" />
                  <span>{route.name}</span>
                </a>
              </Link>
            ))}
            
            <button
              className="w-full flex items-center py-3 px-4 rounded hover:bg-white hover:bg-opacity-10 transition-colors text-left"
              onClick={handleLogout}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
