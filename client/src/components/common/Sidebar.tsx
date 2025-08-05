import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  LayoutGrid,
  Music2,
  Play,
  Upload,
  FileUp,
  HelpCircle,
  Settings,
  Phone
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Sidebar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const links = [
    { href: "/dashboard", label: "Quick Start", icon: <Home className="sidebar-icon" /> },
    { href: "/brands", label: "My Brands", icon: <LayoutGrid className="sidebar-icon" /> },
    { href: "/discover", label: "Discover Brand Fit Music", icon: <Music2 className="sidebar-icon" /> },
    { href: "/playlist", label: "Pick 'N' Play", icon: <Play className="sidebar-icon" /> },
    { href: "/upload-jingle", label: "Upload Jingle / Voice over", icon: <Upload className="sidebar-icon" /> },
    { href: "/request-jingle", label: "Request Jingle / Voice over", icon: <FileUp className="sidebar-icon" /> },
  ];

  const bottomLinks = [
    { href: "/help", label: "Help", icon: <HelpCircle className="sidebar-icon" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="sidebar-icon" /> },
    { href: "/contact", label: "Contact", icon: <Phone className="sidebar-icon" /> },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground fixed h-full z-40 md:translate-x-0 transform -translate-x-full transition-transform duration-300 ease-in-out md:transform-none">
      {/* Logo section */}
      <div className="p-4 border-b border-sidebar-border flex flex-col items-center">
        <div className="text-5xl font-bold">U</div>
        <div className="w-8 h-1 bg-primary my-2"></div>
        <div className="text-sm">USEA</div>
      </div>

      {/* Navigation links */}
      <nav className="mt-6">
        {links.map((link) => (
          <Link 
            key={link.href} 
            href={link.href}
            className={`sidebar-link ${isActive(link.href) ? 'active' : ''}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Bottom menu items */}
      <div className="absolute bottom-0 w-full border-t border-sidebar-border">
        {bottomLinks.map((link) => (
          <Link 
            key={link.href} 
            href={link.href}
            className={`sidebar-link ${isActive(link.href) ? 'active' : ''}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
