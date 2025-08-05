import { Home, Building2, Music, Play, Upload, MessageSquare, HelpCircle, Settings, Contact, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const sidebarItems = [
  { id: 'quick-start', label: 'Dashboard', icon: Home },
  { id: 'advertisers', label: 'Advertisers', icon: Building2 },
  { id: 'contracts', label: 'Contracts', icon: Users },
  { id: 'workers', label: 'System Workers', icon: Play },
  { id: 'upload-jingle', label: 'Voice Content', icon: Upload },
  { id: 'analytics', label: 'Analytics', icon: MessageSquare },
];

const bottomItems = [
  { id: 'help', label: 'Help', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'contact', label: 'Contact', icon: Contact },
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded text-black flex items-center justify-center font-bold">
            A
          </div>
          <span className="text-xl font-semibold">AMS</span>
        </div>
        <div className="w-12 h-1 bg-red-600 mt-2"></div>
        <p className="text-xs text-gray-400 mt-1">Ambient Advertising</p>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-800 transition-colors",
                isActive && "bg-red-700 hover:bg-red-600"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Items */}
      <div className="border-t border-gray-700 py-4">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-800 transition-colors",
                isActive && "bg-red-700 hover:bg-red-600"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
        
        {/* Logout */}
        <button className="w-full flex items-center space-x-3 px-4 py-2 mx-2 mt-4 border border-gray-600 rounded hover:bg-gray-800 transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}