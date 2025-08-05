import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import {
  Home,
  Briefcase,
  Music,
  PlayCircle,
  Upload,
  FileAudio,
  HelpCircle,
  Settings,
  Contact,
  Menu,
  LogOut,
  ChevronDown,
  ChevronRight,
  Zap,
  BarChart3,
  FileText,
  Volume2,
  Target,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import useaLogo from "@/assets/usea-logo.png";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const [ambientAdOpen, setAmbientAdOpen] = useState(false);

  const navItems = [
    {
      title: "Quick Start",
      href: "/",
      icon: <Home className="mr-3 h-5 w-5" />,
    },
    {
      title: "My Brands",
      href: "/brands",
      icon: <Briefcase className="mr-3 h-5 w-5" />,
    },
    {
      title: "Brand Fit Music",
      href: "/discover",
      icon: <Music className="mr-3 h-5 w-5" />,
    },
    {
      title: "Pick 'N' Play",
      href: "/pick-n-play",
      icon: <PlayCircle className="mr-3 h-5 w-5" />,
    },
    {
      title: "Upload Audio",
      href: "/upload-jingle",
      icon: <Upload className="mr-3 h-5 w-5" />,
    },
    {
      title: "Request Audio",
      href: "/request-jingle",
      icon: <FileAudio className="mr-3 h-5 w-5" />,
    },
  ];

  const ambientAdItems = [
    {
      title: "Advertisers",
      href: "/advertisers",
      icon: <Briefcase className="mr-3 h-4 w-4" />,
    },
    {
      title: "Contracts",
      href: "/contracts", 
      icon: <FileText className="mr-3 h-4 w-4" />,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="mr-3 h-4 w-4" />,
    },
    {
      title: "Rules",
      href: "/rules",
      icon: <Zap className="mr-3 h-4 w-4" />,
    },
    {
      title: "Government Data",
      href: "/government-data",
      icon: <Database className="mr-3 h-4 w-4" />,
    },
    {
      title: "Advertising",
      href: "/advertising",
      icon: <Target className="mr-3 h-4 w-4" />,
    },
    {
      title: "Audio Preview",
      href: "/audio",
      icon: <Volume2 className="mr-3 h-4 w-4" />,
    },
  ];

  // Check if any ambient ad route is active
  const isAmbientAdRouteActive = ambientAdItems.some(item => item.href === location);

  const bottomNavItems = [
    {
      title: "Help",
      href: "/help",
      icon: <HelpCircle className="mr-3 h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="mr-3 h-5 w-5" />,
    },
    {
      title: "Contact",
      href: "/contact",
      icon: <Contact className="mr-3 h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 w-72 h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-transform shadow-lg shadow-sidebar-accent/20 overflow-hidden lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo & brand */}
        <div className="p-4 border-b border-sidebar-border flex flex-col items-center">
          <div className="w-32 h-auto">
            <img src={useaLogo} alt="USEA Logo" className="w-full h-auto" />
          </div>
          <div className="h-0.5 w-12 bg-gradient-to-r from-secondary/90 to-secondary/60 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Main navigation */}
        <div className="flex-1 px-2 py-3 overflow-y-auto scrollbar-hide">
          <SidebarNav items={navItems} currentPath={location} />
          
          {/* Ambient Advertising Dropdown */}
          <div className="mt-4 px-2">
            <button
              onClick={() => setAmbientAdOpen(!ambientAdOpen)}
              className={cn(
                "flex items-center justify-between w-full px-4 py-3 hover:bg-sidebar-accent/80 rounded-lg transition-all duration-200 font-medium",
                (isAmbientAdRouteActive || ambientAdOpen) 
                  ? "bg-gradient-to-r from-primary/90 to-primary/70 text-white shadow-md" 
                  : "text-sidebar-foreground/90 hover:text-white"
              )}
            >
              <div className="flex items-center">
                <Zap className={cn(
                  "mr-3 h-5 w-5",
                  (isAmbientAdRouteActive || ambientAdOpen) ? "text-white" : "text-sidebar-foreground/90"
                )} />
                <span>Ambient Advertising</span>
              </div>
              {ambientAdOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {/* Dropdown Items */}
            {ambientAdOpen && (
              <div className="mt-2 ml-4 space-y-1">
                {ambientAdItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center px-4 py-2 hover:bg-sidebar-accent/60 rounded-md transition-all duration-200 text-sm",
                        location === item.href 
                          ? "bg-sidebar-accent text-white" 
                          : "text-sidebar-foreground/80 hover:text-white"
                      )}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="px-2 py-3 border-t border-sidebar-border">
          <SidebarNav items={bottomNavItems} currentPath={location} />
          <div className="mt-3 px-2">
            <Button 
              variant="outline" 
              className="w-full bg-sidebar-accent text-sidebar-foreground h-9"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
